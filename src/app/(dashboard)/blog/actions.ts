'use server';

import { createSupabaseServerClient } from '@/services/supabase-server';
import { revalidatePath } from 'next/cache';

type ActionResult = {
     success: boolean;
     error?: string;
     data?: any;
};

export interface BlogPost {
     id: string;
     title: string;
     slug: string;
     excerpt: string;
     content: string;
     cover_image: string | null;
     author: string;
     category: string;
     reading_time_minutes: number;
     is_published: boolean;
     featured: boolean;
     views_count: number;
     published_at: string | null;
     created_at: string;
     updated_at: string;
}

export type BlogPayload = {
     title: string;
     slug: string;
     excerpt: string;
     content: string;
     cover_image: string | null;
     author: string;
     category: string;
     reading_time_minutes: number;
     is_published: boolean;
     featured: boolean;
     published_at?: string | null;
};

// ------------------------------------------------
// Fetch all blogs
// ------------------------------------------------
export async function getBlogs(): Promise<ActionResult> {
     try {
          const supabase = await createSupabaseServerClient();

          const { data, error } = await supabase
               .from('blogs')
               .select('*')
               .order('published_at', { ascending: false, nullsFirst: false });

          if (error) {
               return { success: false, error: error.message };
          }

          return { success: true, data: data as BlogPost[] };
     } catch (error) {
          return {
               success: false,
               error: error instanceof Error ? error.message : 'Failed to fetch blogs.',
          };
     }
}

// ------------------------------------------------
// Fetch single blog by ID
// ------------------------------------------------
export async function getBlogById(id: string): Promise<ActionResult> {
     try {
          const supabase = await createSupabaseServerClient();

          const { data, error } = await supabase
               .from('blogs')
               .select('*')
               .eq('id', id)
               .single();

          if (error) {
               return { success: false, error: error.message };
          }

          return { success: true, data: data as BlogPost };
     } catch (error) {
          return {
               success: false,
               error: error instanceof Error ? error.message : 'Failed to fetch blog.',
          };
     }
}

// ------------------------------------------------
// Create blog
// ------------------------------------------------
export async function createBlog(payload: BlogPayload): Promise<ActionResult> {
     try {
          const supabase = await createSupabaseServerClient();

          const { data, error } = await supabase
               .from('blogs')
               .insert(payload)
               .select()
               .single();

          if (error) {
               if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    return { success: false, error: 'Slug već postoji. Izmenite slug.' };
               }
               return { success: false, error: error.message };
          }

          revalidatePath('/blog');
          return { success: true, data };
     } catch (error) {
          return {
               success: false,
               error: error instanceof Error ? error.message : 'Failed to create blog.',
          };
     }
}

// ------------------------------------------------
// Update blog
// ------------------------------------------------
export async function updateBlog(id: string, payload: BlogPayload): Promise<ActionResult> {
     try {
          const supabase = await createSupabaseServerClient();

          const { data, error } = await supabase
               .from('blogs')
               .update(payload)
               .eq('id', id)
               .select()
               .single();

          if (error) {
               if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    return { success: false, error: 'Slug već postoji. Izmenite slug.' };
               }
               return { success: false, error: error.message };
          }

          revalidatePath('/blog');
          return { success: true, data };
     } catch (error) {
          return {
               success: false,
               error: error instanceof Error ? error.message : 'Failed to update blog.',
          };
     }
}

// ------------------------------------------------
// Delete blog
// ------------------------------------------------
export async function deleteBlog(id: string): Promise<ActionResult> {
     try {
          const supabase = await createSupabaseServerClient();

          const { error } = await supabase
               .from('blogs')
               .delete()
               .eq('id', id);

          if (error) {
               return { success: false, error: error.message };
          }

          revalidatePath('/blog');
          return { success: true };
     } catch (error) {
          return {
               success: false,
               error: error instanceof Error ? error.message : 'Failed to delete blog.',
          };
     }
}

// ------------------------------------------------
// Toggle publish
// ------------------------------------------------
export async function toggleBlogPublish(id: string, currentlyPublished: boolean, publishedAt: string | null): Promise<ActionResult> {
     try {
          const supabase = await createSupabaseServerClient();

          const newPublished = !currentlyPublished;
          const updateData: Record<string, any> = { is_published: newPublished };

          if (newPublished && !publishedAt) {
               updateData.published_at = new Date().toISOString();
          }

          const { data, error } = await supabase
               .from('blogs')
               .update(updateData)
               .eq('id', id)
               .select()
               .single();

          if (error) {
               return { success: false, error: error.message };
          }

          revalidatePath('/blog');
          return { success: true, data };
     } catch (error) {
          return {
               success: false,
               error: error instanceof Error ? error.message : 'Failed to toggle publish.',
          };
     }
}

// ------------------------------------------------
// Toggle featured
// ------------------------------------------------
export async function toggleBlogFeatured(id: string, currentlyFeatured: boolean): Promise<ActionResult> {
     try {
          const supabase = await createSupabaseServerClient();

          const { data, error } = await supabase
               .from('blogs')
               .update({ featured: !currentlyFeatured })
               .eq('id', id)
               .select()
               .single();

          if (error) {
               return { success: false, error: error.message };
          }

          revalidatePath('/blog');
          return { success: true, data };
     } catch (error) {
          return {
               success: false,
               error: error instanceof Error ? error.message : 'Failed to toggle featured.',
          };
     }
}
