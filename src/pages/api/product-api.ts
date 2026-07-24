import { generateSlug } from '@/utils/generate-slug';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { supabase } from '@/services/supabase';
import { hydrateProduct, hydrateProducts, normalizeProductInput } from '../../schemas/product';

const PRODUCT_TABLE_CANDIDATES = ['products'];

const isMissingRelationError = (error: any) => {
     return error?.code === '42P01' || /does not exist/i.test(error?.message ?? '');
};

const getProductsTableName = async () => {
     for (const tableName of PRODUCT_TABLE_CANDIDATES) {
          const { error } = await supabase.from(tableName).select('id', { head: true, count: 'exact' }).limit(1);

          if (!error) {
               return tableName;
          }

          if (!isMissingRelationError(error)) {
               throw error;
          }
     }

     throw new Error('Products table was not found in Supabase.');
};

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
     try {
          const productsTable = await getProductsTableName();

          if (request.method === 'GET') {
               const { data: allProducts, error } = await supabase
                    .from(productsTable)
                    .select('*')
                    .order('updated_at', { ascending: false });

               if (error) {
                    return response.status(500).json({ error: 'Failed to fetch products.' });
               }

               return response.status(200).json({ message: 'Products found!', data: hydrateProducts((allProducts ?? []) as any) });
          } else if (request.method === 'POST') {
               const slug = generateSlug(request.body.name);
               const newProduct = normalizeProductInput({
                    ...request.body,
                    slug,
               });

               const { data, error } = await supabase
                    .from(productsTable)
                    .insert(newProduct)
                    .select('*')
                    .single();

               if (error) {
                    return response.status(500).json({ error: 'Failed to add product.' });
               }

               return response.status(200).json({ message: 'Product successfully added!', data: hydrateProduct(data as any) });
          } else if (request.method === 'DELETE') {
               try {
                    const currentProductID = request.body.currentProductID;

                    const { data, error } = await supabase
                         .from(productsTable)
                         .delete()
                         .eq('id', currentProductID)
                         .select('id');

                    if (error) {
                         return response.status(500).json({ error: 'Error deleting product.' });
                    }

                    if (!data || data.length === 0) {
                         return response.status(404).json({ error: 'Product not found.' });
                    }

                    return response.status(200).json({ message: 'Product successfully deleted!' });
               } catch (error) {
                    return response.status(500).json({ error: 'Error deleting product.' });
               }
          } else if (request.method === 'PUT') {
               const slug = generateSlug(request.body.name);
               const rawId = request.body.id;

               try {
                    const updatePayload = normalizeProductInput({
                         ...request.body,
                         slug,
                    });

                    let updateResult = await supabase
                         .from(productsTable)
                         .update(updatePayload)
                         .eq('id', rawId)
                         .select('*')
                         .maybeSingle();

                    if ((!updateResult.data || updateResult.error) && request.body.slug) {
                         updateResult = await supabase
                              .from(productsTable)
                              .update(updatePayload)
                              .eq('slug', request.body.slug)
                              .select('*')
                              .maybeSingle();
                    }

                    if (updateResult.error) {
                         return response.status(500).json({ error: 'Error updating product.' });
                    }

                    if (!updateResult.data) {
                         return response.status(404).json({ error: 'Product not found.' });
                    }

                    await response.revalidate('/dashboard/artikli');
                    return response.status(200).json({ message: 'Product successfully updated!', data: hydrateProduct(updateResult.data as any) });
               } catch (error) {
                    return response.status(500).json({ error: 'Error updating product.' });
               }
          } else {
               return response.status(405).json({ error: 'Method not allowed!' });
          }
     } catch (error) {
          return response.status(500).json({ error: 'Internal server error!' });
     }
}