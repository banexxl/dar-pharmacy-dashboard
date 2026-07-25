import { generateSlug } from '@/utils/generate-slug';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { supabase } from '@/services/supabase-browser';

const MANUFACTURER_TABLE_CANDIDATES = ['manufacturers'];

const isMissingRelationError = (error: any) => {
     return error?.code === '42P01' || /does not exist/i.test(error?.message ?? '');
};

const getManufacturersTableName = async () => {
     for (const tableName of MANUFACTURER_TABLE_CANDIDATES) {
          const { error } = await supabase.from(tableName).select('id', { head: true, count: 'exact' }).limit(1);

          if (!error) {
               return tableName;
          }

          if (!isMissingRelationError(error)) {
               throw error;
          }
     }

     throw new Error('Manufacturers table was not found in Supabase.');
};

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
     try {
          const manufacturersTable = await getManufacturersTableName();

          if (request.method === 'GET') {
               const { data: manufacturers, error } = await supabase
                    .from(manufacturersTable)
                    .select('*')
                    .order('name', { ascending: true });

               if (error) {
                    return response.status(500).json({ error: 'Failed to fetch manufacturers.' });
               }

               return response.status(200).json({ message: 'Manufacturers found!', data: manufacturers });
          }

          if (request.method === 'POST') {
               const { name, value, url } = request.body;
               if (!name) {
                    return response.status(400).json({ error: 'Missing name.' });
               }

               const finalValue = value || generateSlug(name);
               const { data: createdManufacturer, error } = await supabase
                    .from(manufacturersTable)
                    .insert({
                         name,
                         value: finalValue,
                         url: url || ''
                    })
                    .select('*')
                    .single();

               if (error) {
                    return response.status(500).json({ error: 'Failed to create manufacturer.' });
               }

               return response.status(200).json({ message: 'Manufacturer successfully created!', data: createdManufacturer });
          }

          if (request.method === 'PUT') {
               const { id, name, value, url } = request.body;
               if (!id) {
                    return response.status(400).json({ error: 'Missing id.' });
               }

               const updatePayload: Record<string, string> = {};
               if (typeof name === 'string') updatePayload.name = name;
               if (typeof value === 'string') updatePayload.value = value;
               if (typeof url === 'string') updatePayload.url = url;

               if (Object.keys(updatePayload).length === 0) {
                    return response.status(400).json({ error: 'No fields to update.' });
               }

               const { data: updatedManufacturer, error } = await supabase
                    .from(manufacturersTable)
                    .update(updatePayload)
                    .eq('id', id)
                    .select('*')
                    .maybeSingle();

               if (error) {
                    return response.status(500).json({ error: 'Failed to update manufacturer.' });
               }

               if (!updatedManufacturer) {
                    return response.status(404).json({ error: 'Manufacturer not found.' });
               }

               return response.status(200).json({ message: 'Manufacturer successfully updated!', data: updatedManufacturer });
          }

          if (request.method === 'DELETE') {
               const { id } = request.body;
               if (!id) {
                    return response.status(400).json({ error: 'Missing id.' });
               }

               const { data: deletedRows, error } = await supabase
                    .from(manufacturersTable)
                    .delete()
                    .eq('id', id)
                    .select('id');

               if (error) {
                    return response.status(500).json({ error: 'Failed to delete manufacturer.' });
               }

               if (!deletedRows || deletedRows.length === 0) {
                    return response.status(404).json({ error: 'Manufacturer not found.' });
               }

               return response.status(200).json({ message: 'Manufacturer successfully deleted!' });
          }

          return response.status(405).json({ error: 'Method not allowed!' });
     } catch (error) {
          return response.status(500).json({ error: 'Internal server error!' });
     }
}
