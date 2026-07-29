'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/services/supabase-server';

type ActionResult = {
     success: boolean;
     error?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_SUPABASE_SECRET_KEY;

const getSupabaseAdminClient = () => {
     if (!supabaseUrl || !serviceRoleKey) {
          throw new Error('Missing Supabase service-role configuration.');
     }

     return createClient(supabaseUrl, serviceRoleKey, {
          auth: {
               autoRefreshToken: false,
               persistSession: false,
               detectSessionInUrl: false,
               flowType: 'implicit',
          },
     });
};

const authorizeAdmin = async (): Promise<ActionResult> => {
     const supabase = await createSupabaseServerClient();

     const {
          data: { user },
          error,
     } = await supabase.auth.getUser();

     if (error || !user) {
          return {
               success: false,
               error: 'You must be authenticated.',
          };
     }

     const supabaseAdmin = getSupabaseAdminClient();

     const { data: admin, error: adminError } = await supabaseAdmin
          .from('admins')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

     if (adminError) {
          console.error('[authorizeAdmin]', adminError);

          return {
               success: false,
               error: 'Unable to verify administrator permissions.',
          };
     }

     if (!admin) {
          return {
               success: false,
               error: 'You do not have permission to perform this action.',
          };
     }

     return {
          success: true,
     };
};

const getCustomerAuthUserId = async (
     customerId: string
): Promise<{
     userId: string | null;
     email: string | null;
     error?: string;
}> => {
     const supabaseAdmin = getSupabaseAdminClient();

     const { data, error } = await supabaseAdmin
          .from('customers')
          .select('user_id, email')
          .eq('id', customerId)
          .maybeSingle();

     if (error) {
          console.error('[getCustomerAuthUserId]', error);

          return {
               userId: null,
               email: null,
               error: error.message,
          };
     }

     if (!data?.user_id) {
          return {
               userId: null,
               email: data?.email ?? null,
               error: 'Customer or linked Auth user was not found.',
          };
     }

     return {
          userId: data.user_id,
          email: data.email ?? null,
     };
};

export const banCustomer = async (
     customerId: string
): Promise<ActionResult> => {
     try {
          const authorization = await authorizeAdmin();

          if (!authorization.success) {
               return authorization;
          }

          const customer = await getCustomerAuthUserId(customerId);

          if (!customer.userId) {
               return {
                    success: false,
                    error:
                         customer.error ??
                         'Customer is not linked to an Auth user.',
               };
          }

          const supabaseAdmin = getSupabaseAdminClient();

          const {
               data: { user },
               error: getUserError,
          } = await supabaseAdmin.auth.admin.getUserById(
               customer.userId
          );

          if (getUserError || !user) {
               return {
                    success: false,
                    error:
                         getUserError?.message ??
                         'Auth user was not found.',
               };
          }

          const {
               data: authData,
               error: authError,
          } = await supabaseAdmin.auth.admin.updateUserById(
               customer.userId,
               {
                    // Effectively an indefinite ban.
                    ban_duration: '876000h',

                    app_metadata: {
                         ...user.app_metadata,
                         banned: true,
                         ban_reason:
                              'Account disabled by administrator',
                    },
               }
          );

          if (authError) {
               console.error(
                    '[banCustomer] Auth update failed:',
                    authError
               );

               return {
                    success: false,
                    error: authError.message,
               };
          }

          const bannedUntil =
               authData.user?.banned_until ??
               null;

          const {
               data: updatedCustomer,
               error: customerError,
          } = await supabaseAdmin
               .from('customers')
               .update({
                    is_banned: true,
                    banned_until: bannedUntil,
                    updated_at: new Date().toISOString(),
               })
               .eq('id', customerId)
               .eq('user_id', customer.userId)
               .select('id')
               .maybeSingle();

          if (customerError || !updatedCustomer) {
               console.error(
                    '[banCustomer] Customer synchronization failed:',
                    customerError
               );

               return {
                    success: false,
                    error:
                         customerError?.message ??
                         'Auth user was banned, but the customer record could not be updated.',
               };
          }

          revalidatePath('/klijenti');

          return {
               success: true,
          };
     } catch (error) {
          console.error('[banCustomer]', error);

          return {
               success: false,
               error:
                    error instanceof Error
                         ? error.message
                         : 'Unable to ban customer.',
          };
     }
};

export const unbanCustomer = async (
     customerId: string
): Promise<ActionResult> => {
     try {
          const authorization = await authorizeAdmin();

          if (!authorization.success) {
               return authorization;
          }

          const customer = await getCustomerAuthUserId(customerId);

          if (!customer.userId) {
               return {
                    success: false,
                    error:
                         customer.error ??
                         'Customer is not linked to an Auth user.',
               };
          }

          const supabaseAdmin = getSupabaseAdminClient();

          const {
               data: { user },
               error: getUserError,
          } = await supabaseAdmin.auth.admin.getUserById(
               customer.userId
          );

          if (getUserError || !user) {
               return {
                    success: false,
                    error:
                         getUserError?.message ??
                         'Auth user was not found.',
               };
          }

          const {
               error: authError,
          } = await supabaseAdmin.auth.admin.updateUserById(
               customer.userId,
               {
                    ban_duration: 'none',

                    app_metadata: {
                         ...user.app_metadata,
                         banned: false,
                         ban_reason: null,
                    },
               }
          );

          if (authError) {
               console.error(
                    '[unbanCustomer] Auth update failed:',
                    authError
               );

               return {
                    success: false,
                    error: authError.message,
               };
          }

          const {
               data: updatedCustomer,
               error: customerError,
          } = await supabaseAdmin
               .from('customers')
               .update({
                    is_banned: false,
                    banned_until: null,
                    updated_at: new Date().toISOString(),
               })
               .eq('id', customerId)
               .eq('user_id', customer.userId)
               .select('id')
               .maybeSingle();

          if (customerError || !updatedCustomer) {
               console.error(
                    '[unbanCustomer] Customer synchronization failed:',
                    customerError
               );

               return {
                    success: false,
                    error:
                         customerError?.message ??
                         'Auth user was unbanned, but the customer record could not be updated.',
               };
          }

          revalidatePath('/klijenti');

          return {
               success: true,
          };
     } catch (error) {
          console.error('[unbanCustomer]', error);

          return {
               success: false,
               error:
                    error instanceof Error
                         ? error.message
                         : 'Unable to unban customer.',
          };
     }
};

export const sendCustomerPasswordReset = async (
     customerId: string
): Promise<ActionResult> => {
     try {
          const authorization = await authorizeAdmin();

          if (!authorization.success) {
               return authorization;
          }

          const customer = await getCustomerAuthUserId(customerId);

          if (!customer.email) {
               return {
                    success: false,
                    error: 'Customer does not have an email address.',
               };
          }

          const baseUrl =
               process.env.NEXT_PUBLIC_BASE_URL ??
               process.env.NEXT_PUBLIC_SITE_URL;

          if (!baseUrl) {
               return {
                    success: false,
                    error: 'Application base URL is not configured.',
               };
          }

          const supabaseAdmin = getSupabaseAdminClient();

          const { error } =
               await supabaseAdmin.auth.resetPasswordForEmail(
                    customer.email,
                    {
                         redirectTo: `${baseUrl}/auth/reset-password`,
                    }
               );

          if (error) {
               console.error('[sendCustomerPasswordReset]', error);

               return {
                    success: false,
                    error: error.message,
               };
          }

          return {
               success: true,
          };
     } catch (error) {
          console.error('[sendCustomerPasswordReset]', error);

          return {
               success: false,
               error:
                    error instanceof Error
                         ? error.message
                         : 'Unable to send password reset email.',
          };
     }
};

export const deleteCustomer = async (
     customerId: string
): Promise<ActionResult> => {
     try {
          const authorization = await authorizeAdmin();

          if (!authorization.success) {
               return authorization;
          }

          const customer = await getCustomerAuthUserId(customerId);

          if (!customer.userId) {
               return {
                    success: false,
                    error: customer.error,
               };
          }

          const supabaseAdmin = getSupabaseAdminClient();

          /*
           * customers.user_id should use ON DELETE CASCADE.
           * Deleting auth.users will then delete public.customers.
           */
          // customers.user_id should use ON DELETE CASCADE.
          // Deleting auth.users will then delete public.customers.
          const { error } =
               await supabaseAdmin.auth.admin.deleteUser(
                    customer.userId
               );

          if (error) {
               console.error('[deleteCustomer]', error);

               return {
                    success: false,
                    error: error.message,
               };
          }

          revalidatePath('/klijenti');

          return {
               success: true,
          };
     } catch (error) {
          console.error('[deleteCustomer]', error);

          return {
               success: false,
               error:
                    error instanceof Error
                         ? error.message
                         : 'Unable to delete customer.',
          };
     }
};