import { generateSlug } from '@/utils/generate-slug';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { supabaseBrowser as supabase } from '@/services/supabase-browser';
import { Product } from '@/schemas/product';

const PRODUCT_TABLE_CANDIDATES = ['products'];

const isMissingRelationError = (error: any) => {
     return error?.code === '42P01' || /does not exist/i.test(error?.message ?? '');
};

const toNumberOrNull = (value: unknown) => {
     if (value === '' || value === null || value === undefined) {
          return null;
     }

     const parsedValue = typeof value === 'number' ? value : Number(value);
     return Number.isNaN(parsedValue) ? null : parsedValue;
};

const mapProductPayload = (payload: Record<string, any>): Partial<Product> => ({
     id: payload.id,
     name: payload.name,
     slug: payload.slug,
     description: payload.description ?? null,
     main_category: payload.main_category ?? null,
     mid_category: payload.mid_category ?? null,
     sub_category: payload.sub_category ?? null,
     available_stock: toNumberOrNull(payload.available_stock) ?? 0,
     ingredients: payload.ingredients ?? null,
     instructions: payload.instructions ?? null,
     warning: payload.warning ?? null,
     quantity: toNumberOrNull(payload.quantity),
     quantity_unit: payload.quantity_unit ?? null,
     manufacturer_id: payload.manufacturer_id ?? null,
     image_url: payload.image_url ?? null,
     media_urls: Array.isArray(payload.media_urls) ? payload.media_urls : [],
     price: toNumberOrNull(payload.price) ?? 0,
     new_arrival: Boolean(payload.new_arrival),
     best_seller: Boolean(payload.best_seller),
     discount: Boolean(payload.discount),
     discount_amount: toNumberOrNull(payload.discount_amount) ?? 0,
     is_active: payload.is_active ?? true,
     promoting: Boolean(payload.promoting),
     promotion_text: payload.promotion_text ?? null,
     display_on_home: Boolean(payload.display_on_home),
     created_at: payload.created_at,
     updated_at: payload.updated_at ?? new Date().toISOString(),
});

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

     try {

          if (request.method === 'GET') {
               const { data: allProducts, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('updated_at', { ascending: false });

               if (error) {
                    return response.status(500).json({ error: 'Failed to fetch products.' });
               }

               return response.status(200).json({ message: 'Products found!', data: allProducts ?? [] });
          } else if (request.method === 'POST') {
               const slug = generateSlug(request.body.name);
               const newProduct = mapProductPayload({
                    ...request.body,
                    slug,
               });

               const { data, error } = await supabase
                    .from('products')
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
                         .from('products')
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
                    const updatePayload = mapProductPayload({
                         ...request.body,
                         slug,
                    });

                    let updateResult = await supabase
                         .from('products')
                         .update(updatePayload)
                         .eq('id', rawId)
                         .select('*')
                         .single();

                    if ((!updateResult.data || updateResult.error) && request.body.slug) {
                         updateResult = await supabase
                              .from('products')
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

                    await response.revalidate('/artikli');
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
