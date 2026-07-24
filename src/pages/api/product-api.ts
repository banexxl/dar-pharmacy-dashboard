import { generateSlug } from '@/utils/generate-slug';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { supabase } from '@/services/supabase';

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
                    .order('updatedAt', { ascending: false });

               if (error) {
                    return response.status(500).json({ error: 'Failed to fetch products.' });
               }

               return response.status(200).json({ message: 'Products found!', data: allProducts });
          } else if (request.method === 'POST') {
               const slug = generateSlug(request.body.name);
               const newProduct = {
                    ...request.body,
                    displayOnHome: Boolean(request.body.displayOnHome),
                    slug: slug,
                    updatedAt: new Date() // Set updatedAt to the current date and time
               };

               const { data, error } = await supabase
                    .from(productsTable)
                    .insert(newProduct)
                    .select('*')
                    .single();

               if (error) {
                    return response.status(500).json({ error: 'Failed to add product.' });
               }

               return response.status(200).json({ message: 'Product successfully added!', data });
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
               const rawId = request.body.id ?? request.body._id;

               try {
                    const updatePayload = {
                         bestSeller: request.body.bestSeller,
                         description: request.body.description,
                         discount: request.body.discount,
                         discountAmount: request.body.discountAmount,
                         availableStock: request.body.availableStock,
                         imageURL: request.body.imageURL,
                         ingredients: request.body.ingredients,
                         instructions: request.body.instructions,
                         mainCategory: request.body.mainCategory,
                         manufacturer: request.body.manufacturer,
                         manufacturerURL: request.body.manufacturerURL,
                         midCategory: request.body.midCategory,
                         name: request.body.name,
                         newArrival: request.body.newArrival,
                         isActive: request.body.isActive,
                         displayOnHome: Boolean(request.body.displayOnHome),
                         price: request.body.price,
                         quantity: request.body.quantity,
                         quantityUnit: request.body.quantityUnit,
                         subCategory: request.body.subCategory,
                         warning: request.body.warning,
                         updatedAt: new Date(), // Update the updatedAt field to the current date and time
                         promotionText: request.body.promotionText,
                         promoting: request.body.promoting,
                         slug: slug
                    };

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
                    return response.status(200).json({ message: 'Product successfully updated!', data: updateResult.data });
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