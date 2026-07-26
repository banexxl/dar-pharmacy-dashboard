import { createSupabaseServerClient } from "@/services/supabase-server";

export type ErrorType = {
     code: string;
     details: string;
     hint?: string;
     message?: string;
}

export async function checkIfAdmin(email: string): Promise<{ success: boolean; error?: ErrorType }> {

     try {
          const supabase = await createSupabaseServerClient();

          const { data } = await supabase
               .from('admins')
               .select('email')
               .eq('email', email)
               .single();

          if (data?.email) {
               return {
                    success: true,
                    error: null
               };
          }
          return {
               success: false,
               error: {
                    code: 'UserNotFound',
                    details: 'Admin not found',
                    message: 'Admin not found',
                    hint: 'Please contact support.',
               },
          };
     } catch (error) {
          return {
               success: false,
               error: {
                    code: 'ServerError',
                    details: 'An error occurred while checking user permission',
                    message: 'An error occurred while checking user permission',
                    hint: 'Please try again later.',
               },
          };
     }
}