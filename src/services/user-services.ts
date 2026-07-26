import 'server-only';

import {
     createClient,
     type SupabaseClient,
     type User as SupabaseAuthUser,
} from '@supabase/supabase-js';
import type { Customer } from '@/schemas/customer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.NEXT_SUPABASE_SECRET_KEY;

const getSupabaseAdminClient = (): SupabaseClient => {
     if (!supabaseUrl || !supabaseSecretKey) {
          throw new Error(
               'NEXT_PUBLIC_SUPABASE_URL and NEXT_SUPABASE_SECRET_KEY are required.'
          );
     }

     return createClient(supabaseUrl, supabaseSecretKey, {
          auth: {
               autoRefreshToken: false,
               persistSession: false,
          },
     });
};

const createFullAddress = (
     streetAddress: string | null,
     city: string | null
): string => {
     return [streetAddress, city]
          .map((value) => value?.trim())
          .filter(Boolean)
          .join(', ');
};

const fetchAuthUsersPage = async (
     page: number,
     perPage: number
): Promise<SupabaseAuthUser[]> => {
     const supabaseAdmin = getSupabaseAdminClient();

     const { data, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
     });

     if (error) {
          throw error;
     }

     return data.users ?? [];
};

const fetchAllAuthUsers = async (): Promise<SupabaseAuthUser[]> => {
     const perPage = 1000;
     const authUsers: SupabaseAuthUser[] = [];

     let page = 1;

     while (true) {
          const batch = await fetchAuthUsersPage(page, perPage);

          authUsers.push(...batch);

          if (batch.length < perPage) {
               break;
          }

          page += 1;
     }

     return authUsers;
};

const fetchAllCustomers = async (): Promise<Customer[]> => {
     const supabaseAdmin = getSupabaseAdminClient();

     const { data, error } = await supabaseAdmin
          .from('customers')
          .select(`
               id,
               user_id,
               email,
               full_name,
               avatar,
               gender,
               phone_number,
               street_address,
               city,
               province_state,
               country,
               zip_postal_code,
               is_banned,
               banned_until,
               created_at,
               updated_at,
               orders:orders!orders_customer_id_fkey(count)
          `)
          .order('created_at', {
               ascending: false,
          });

     if (error) {
          throw error;
     }

     return (data ?? []) as Customer[];
};

const mapCustomer = (
     customer: Customer,
     authUser: SupabaseAuthUser
): Customer => {
     const metadata = authUser.user_metadata ?? {};

     const streetAddress =
          customer.street_address ??
          metadata.street_address ??
          null;

     const city =
          customer.city ??
          metadata.city ??
          null;

     return {
          id: customer.id,
          user_id: authUser.id,

          email:
               customer.email ??
               authUser.email ??
               null,

          full_name:
               customer.full_name ??
               metadata.full_name ??
               metadata.name ??
               '',

          avatar:
               customer.avatar ??
               metadata.avatar_url ??
               metadata.picture ??
               null,

          gender:
               customer.gender ??
               metadata.gender ??
               null,

          phone_number:
               customer.phone_number ??
               authUser.phone ??
               null,

          street_address: streetAddress,
          city,

          province_state:
               customer.province_state ??
               metadata.province_state ??
               metadata.state ??
               null,

          country:
               customer.country ??
               metadata.country ??
               null,

          zip_postal_code:
               customer.zip_postal_code ??
               metadata.zip_postal_code ??
               null,

          orders: customer.orders ?? [],

          created_at: customer.created_at,
          updated_at: customer.updated_at,

          is_banned: customer.is_banned,
          banned_until: customer.banned_until,
     };
};

/**
 * Returns customers whose user_id still exists in auth.users.
 */
const fetchVerifiedCustomers = async (): Promise<Customer[]> => {
     const [Customers, authUsers] = await Promise.all([
          fetchAllCustomers(),
          fetchAllAuthUsers(),
     ]);

     const authUsersById = new Map<string, SupabaseAuthUser>(
          authUsers.map((authUser) => [
               authUser.id,
               authUser,
          ])
     );

     return Customers.flatMap((customer) => {
          if (!customer.user_id) {
               return [];
          }

          const authUser = authUsersById.get(customer.user_id);

          if (!authUser) {
               return [];
          }

          return [
               mapCustomer(customer, authUser),
          ];
     });
};

export const customerServices = () => {
     const getCustomersByPage = async (
          page: number,
          limit: number | string
     ): Promise<Customer[]> => {
          const parsedPage = Number(page);
          const parsedLimit = Number(limit);

          if (
               !Number.isInteger(parsedPage) ||
               parsedPage < 0 ||
               !Number.isInteger(parsedLimit) ||
               parsedLimit <= 0
          ) {
               return [];
          }

          try {
               const customers = await fetchVerifiedCustomers();

               const start = parsedPage * parsedLimit;
               const end = start + parsedLimit;

               return customers.slice(start, end);
          } catch (error) {
               console.error(
                    'Error while fetching customers by page:',
                    error
               );

               return [];
          }
     };

     const getCustomerByEmail = async (
          email: string
     ): Promise<Customer | null> => {
          try {
               const normalizedEmail = email
                    .trim()
                    .toLowerCase();

               const customers = await fetchVerifiedCustomers();

               return (
                    customers.find(
                         (customer) =>
                              customer.email
                                   ?.trim()
                                   .toLowerCase() === normalizedEmail
                    ) ?? null
               );
          } catch (error) {
               console.error(
                    'Error while fetching customer by email:',
                    error
               );

               return null;
          }
     };

     const getCustomersCount = async (): Promise<number> => {
          try {
               const customers = await fetchVerifiedCustomers();

               return customers.length;
          } catch (error) {
               console.error(
                    'Error while fetching customers count:',
                    error
               );

               return 0;
          }
     };

     const getAllCustomers = async (): Promise<Customer[]> => {
          try {
               return await fetchVerifiedCustomers();
          } catch (error) {
               console.error(
                    'Error while fetching customers:',
                    error
               );

               return [];
          }
     };

     const getCustomersCreatedInWeek = async (
          weekOffset: number
     ): Promise<Customer[]> => {
          try {
               const now = new Date();

               const startOfWeek = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() -
                    now.getDay() +
                    weekOffset * 7
               );

               startOfWeek.setHours(0, 0, 0, 0);

               const endOfWeek = new Date(startOfWeek);
               endOfWeek.setDate(
                    startOfWeek.getDate() + 7
               );

               const customers = await fetchVerifiedCustomers();

               return customers.filter((customer) => {
                    const createdAt = new Date(
                         customer.created_at
                    );

                    return (
                         !Number.isNaN(createdAt.getTime()) &&
                         createdAt >= startOfWeek &&
                         createdAt < endOfWeek
                    );
               });
          } catch (error) {
               console.error(
                    'Error while fetching customers created in week:',
                    error
               );

               return [];
          }
     };

     return {
          getCustomersCreatedInWeek,
          getAllCustomers,
          getCustomersByPage,
          getCustomerByEmail,
          getCustomersCount,
     };
};