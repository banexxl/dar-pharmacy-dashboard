import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

type RowRecord = Record<string, unknown> & {
     id?: string | number;
};

const supabaseUrl =
     process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabasePublishableKey =
     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
     throw new Error(
          'Missing public Supabase environment variables.'
     );
}

export const supabaseBrowser: SupabaseClient =
     createBrowserClient(
          supabaseUrl,
          supabasePublishableKey
     );

/*
 * Optional alias if existing files import:
 *
 * import { supabase } from '@/services/supabase-browser';
 */
export const supabase = supabaseBrowser;

const isMissingRelationError = (error: unknown) => {
     if (
          typeof error !== 'object' ||
          error === null
     ) {
          return false;
     }

     const candidate = error as {
          code?: string;
          message?: string;
     };

     return (
          candidate.code === '42P01' ||
          /does not exist/i.test(candidate.message ?? '')
     );
};

export const fetchRows = async <
     T extends RowRecord
>(
     tableNames: string[],
     orderBy?: {
          column: string;
          ascending?: boolean;
     }
): Promise<T[]> => {
     let lastError: unknown = null;

     for (const tableName of tableNames) {
          let query = supabaseBrowser
               .from(tableName)
               .select('*');

          if (orderBy) {
               query = query.order(orderBy.column, {
                    ascending:
                         orderBy.ascending ?? true,
               });
          }

          const { data, error } = await query;

          if (!error) {
               return (data ?? []) as T[];
          }

          lastError = error;

          if (!isMissingRelationError(error)) {
               break;
          }
     }

     if (lastError) {
          throw lastError;
     }

     return [];
};

export const fetchSingleRow = async <
     T extends RowRecord
>(
     tableNames: string[],
     column: string,
     value: string | number
): Promise<T | null> => {
     let lastError: unknown = null;

     for (const tableName of tableNames) {
          const { data, error } =
               await supabaseBrowser
                    .from(tableName)
                    .select('*')
                    .eq(column, value)
                    .limit(1)
                    .maybeSingle();

          if (!error) {
               return (data ?? null) as T | null;
          }

          lastError = error;

          if (!isMissingRelationError(error)) {
               break;
          }
     }

     if (lastError) {
          throw lastError;
     }

     return null;
};

export const asDate = (
     value: unknown
): Date => {
     if (value instanceof Date) {
          return value;
     }

     if (
          typeof value === 'string' ||
          typeof value === 'number'
     ) {
          return new Date(value);
     }

     return new Date(Number.NaN);
};