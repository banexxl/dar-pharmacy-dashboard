import { createClient, SupabaseClient } from '@supabase/supabase-js';

type RowRecord = Record<string, any> & {
     id?: string | number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
     throw new Error('Missing Supabase environment variables.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
     auth: {
          autoRefreshToken: false,
          persistSession: false,
     },
});

const supabaseServiceRoleKey = process.env.NEXT_SUPABASE_SECRET_KEY;

export const supabaseAdmin: SupabaseClient | null = supabaseServiceRoleKey
     ? createClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: {
               autoRefreshToken: false,
               persistSession: false,
          },
     })
     : null;

const isMissingRelationError = (error: any) => {
     return error?.code === '42P01' || /does not exist/i.test(error?.message ?? '');
};

export const fetchRows = async <T extends RowRecord>(tableNames: string[], orderBy?: { column: string; ascending?: boolean }) => {
     let lastError: any = null;

     for (const tableName of tableNames) {
          let query = supabase.from(tableName).select('*');

          if (orderBy) {
               query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
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

     return [] as T[];
};

export const fetchSingleRow = async <T extends RowRecord>(tableNames: string[], column: string, value: string | number) => {
     let lastError: any = null;

     for (const tableName of tableNames) {
          const { data, error } = await supabase
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

export const asDate = (value: any) => {
     if (value instanceof Date) {
          return value;
     }

     if (typeof value === 'string' || typeof value === 'number') {
          return new Date(value);
     }

     return new Date(NaN);
};