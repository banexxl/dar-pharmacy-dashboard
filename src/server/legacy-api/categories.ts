import { generateSlug } from '@/utils/generate-slug';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { supabase } from '@/services/supabase-browser';

// ─── Table names ────────────────────────────────────────────────────────────────
const MAIN_TABLE = 'main_categories';
const MID_TABLE = 'mid_categories';
const SUB_TABLE = 'sub_categories';

// ─── Helpers ────────────────────────────────────────────────────────────────────
type CategoryLevel = 'main' | 'mid' | 'sub';

const resolveTable = (level: CategoryLevel) => {
     switch (level) {
          case 'main': return MAIN_TABLE;
          case 'mid': return MID_TABLE;
          case 'sub': return SUB_TABLE;
     }
};

// ─── Handler ────────────────────────────────────────────────────────────────────
export default async function handler(request: NextApiRequest, response: NextApiResponse) {
     try {
          const level = (request.query.level || request.body?.level) as CategoryLevel | undefined;

          // ── GET: Fetch categories ──────────────────────────────────────────────
          if (request.method === 'GET') {
               // Fetch all three levels and return them grouped
               const [mainResult, midResult, subResult] = await Promise.all([
                    supabase.from(MAIN_TABLE).select('*').order('label', { ascending: true }),
                    supabase.from(MID_TABLE).select('*').order('label', { ascending: true }),
                    supabase.from(SUB_TABLE).select('*').order('label', { ascending: true }),
               ]);

               if (mainResult.error || midResult.error || subResult.error) {
                    return response.status(500).json({
                         error: 'Failed to fetch categories.',
                         details: mainResult.error || midResult.error || subResult.error,
                    });
               }

               return response.status(200).json({
                    message: 'Categories fetched!',
                    data: {
                         main: mainResult.data ?? [],
                         mid: midResult.data ?? [],
                         sub: subResult.data ?? [],
                    },
               });
          }

          // All mutating operations require a level
          if (!level || !['main', 'mid', 'sub'].includes(level)) {
               return response.status(400).json({ error: 'Missing or invalid "level" (main | mid | sub).' });
          }

          const table = resolveTable(level);

          // ── POST: Create category ─────────────────────────────────────────────
          if (request.method === 'POST') {
               const { label, main_category_id, mid_category_id } = request.body;

               if (!label || typeof label !== 'string' || !label.trim()) {
                    return response.status(400).json({ error: 'Missing label.' });
               }

               const value = generateSlug(label.trim());

               const insertPayload: Record<string, unknown> = { label: label.trim(), value };

               if (level === 'mid') {
                    if (!main_category_id) {
                         return response.status(400).json({ error: 'Missing main_category_id for mid category.' });
                    }
                    insertPayload.main_category_id = main_category_id;
               }

               if (level === 'sub') {
                    if (!mid_category_id) {
                         return response.status(400).json({ error: 'Missing mid_category_id for sub category.' });
                    }
                    insertPayload.mid_category_id = mid_category_id;
               }

               const { data: created, error } = await supabase
                    .from(table)
                    .insert(insertPayload)
                    .select('*')
                    .single();

               if (error) {
                    return response.status(500).json({ error: 'Failed to create category.', details: error });
               }

               return response.status(200).json({ message: 'Category created!', data: created });
          }

          // ── PUT: Update category ──────────────────────────────────────────────
          if (request.method === 'PUT') {
               const { id, label } = request.body;

               if (!id) {
                    return response.status(400).json({ error: 'Missing id.' });
               }

               const updatePayload: Record<string, string> = {};

               if (typeof label === 'string' && label.trim()) {
                    updatePayload.label = label.trim();
                    updatePayload.value = generateSlug(label.trim());
               }

               if (Object.keys(updatePayload).length === 0) {
                    return response.status(400).json({ error: 'No fields to update.' });
               }

               const { data: updated, error } = await supabase
                    .from(table)
                    .update(updatePayload)
                    .eq('id', id)
                    .select('*')
                    .maybeSingle();

               if (error) {
                    return response.status(500).json({ error: 'Failed to update category.', details: error });
               }

               if (!updated) {
                    return response.status(404).json({ error: 'Category not found.' });
               }

               return response.status(200).json({ message: 'Category updated!', data: updated });
          }

          // ── DELETE: Delete category ────────────────────────────────────────────
          if (request.method === 'DELETE') {
               const { id } = request.body;

               if (!id) {
                    return response.status(400).json({ error: 'Missing id.' });
               }

               const { data: deletedRows, error } = await supabase
                    .from(table)
                    .delete()
                    .eq('id', id)
                    .select('id');

               if (error) {
                    return response.status(500).json({ error: 'Failed to delete category.', details: error });
               }

               if (!deletedRows || deletedRows.length === 0) {
                    return response.status(404).json({ error: 'Category not found.' });
               }

               return response.status(200).json({ message: 'Category deleted!' });
          }

          return response.status(405).json({ error: 'Method not allowed!' });
     } catch (error) {
          return response.status(500).json({ error: 'Internal server error!' });
     }
}
