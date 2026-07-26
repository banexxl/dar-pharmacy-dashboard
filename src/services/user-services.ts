import 'server-only';

import {
     createClient,
     type SupabaseClient,
     type User as SupabaseAuthUser,
} from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.NEXT_SUPABASE_SECRET_KEY;

export type User = {
     id: string;
     user_id: string;

     email: string | null;
     full_name: string;
     avatar_url: string | null;
     gender: string | null;

     email_verified_at: string | null;
     phone_number: string | null;

     street_address: string | null;
     city: string | null;
     province_state: string | null;
     country: string | null;
     zip_postal_code: string | null;

     should_create_account: boolean;

     created_at: string;
     updated_at: string;

     raw_user_meta_data: Record<string, any>;
};

export type Admin = {
     id: string;
     name: string;
     email: string;
     created_at: string;
};

type CustomerRecord = {
     id: string;
     user_id: string | null;

     email: string | null;
     full_name: string | null;
     avatar?: string | null;
     avatar_url?: string | null;
     gender?: string | null;

     phone_number: string | null;
     street_address: string | null;
     city: string | null;
     province_state: string | null;
     country: string | null;
     zip_postal_code: string | null;

     should_create_account?: boolean | null;

     created_at: string;
     updated_at: string;
};

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
     const users: SupabaseAuthUser[] = [];
     let page = 1;

     while (true) {
          const batch = await fetchAuthUsersPage(page, perPage);

          users.push(...batch);

          if (batch.length < perPage) {
               break;
          }

          page += 1;
     }

     return users;
};

const fetchAllCustomers = async (): Promise<CustomerRecord[]> => {
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
               created_at,
               updated_at
          `)
          .order('created_at', { ascending: false });

     if (error) {
          throw error;
     }

     return (data ?? []) as CustomerRecord[];
};

const mapCustomerToUser = (
     customer: CustomerRecord,
     authUser: SupabaseAuthUser
): User => {
     const metadata = authUser.user_metadata ?? {};

     return {
          // Customer table primary key
          id: customer.id,

          // Foreign key referencing auth.users.id
          user_id: authUser.id,

          email: customer.email ?? authUser.email ?? null,

          full_name:
               customer.full_name ??
               metadata.full_name ??
               metadata.name ??
               '',

          avatar_url:
               customer.avatar ??
               customer.avatar_url ??
               metadata.avatar_url ??
               metadata.picture ??
               null,

          gender:
               customer.gender ??
               metadata.gender ??
               null,

          email_verified_at:
               authUser.email_confirmed_at ??
               null,

          phone_number:
               customer.phone_number ??
               authUser.phone ??
               null,

          street_address:
               customer.street_address ??
               metadata.street_address ??
               null,

          city:
               customer.city ??
               metadata.city ??
               null,

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

          should_create_account:
               customer.should_create_account ??
               Boolean(metadata.should_create_account ?? false),

          created_at: customer.created_at,
          updated_at: customer.updated_at,

          raw_user_meta_data: metadata,
     };
};

/**
 * Loads customers and keeps only those whose user_id exists in auth.users.
 */
const fetchVerifiedCustomers = async (): Promise<User[]> => {
     const [customers, authUsers] = await Promise.all([
          fetchAllCustomers(),
          fetchAllAuthUsers(),
     ]);

     const authUsersById = new Map(
          authUsers.map((authUser) => [
               authUser.id,
               authUser,
          ])
     );

     return customers.flatMap((customer) => {
          if (!customer.user_id) {
               return [];
          }

          const authUser = authUsersById.get(customer.user_id);

          if (!authUser) {
               return [];
          }

          return [
               mapCustomerToUser(customer, authUser),
          ];
     });
};

export const userServices = () => {
     const getUsersByPage = async (
          page: number,
          limit: number | string
     ): Promise<User[]> => {
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
               const users = await fetchVerifiedCustomers();
               const start = parsedPage * parsedLimit;
               const end = start + parsedLimit;

               return users.slice(start, end);
          } catch (error) {
               console.error('Error while fetching customers by page:', error);
               return [];
          }
     };

     const getUserByEmail = async (
          email: string
     ): Promise<User | null> => {
          try {
               const normalizedEmail = email.trim().toLowerCase();
               const users = await fetchVerifiedCustomers();

               return (
                    users.find(
                         (user) =>
                              user.email?.trim().toLowerCase() ===
                              normalizedEmail
                    ) ?? null
               );
          } catch (error) {
               console.error('Error while fetching customer by email:', error);
               return null;
          }
     };

     const getUsersCount = async (): Promise<number> => {
          try {
               const users = await fetchVerifiedCustomers();
               return users.length;
          } catch (error) {
               console.error('Error while fetching customers count:', error);
               return 0;
          }
     };

     const getAllUsers = async (): Promise<User[]> => {
          try {
               return await fetchVerifiedCustomers();
          } catch (error) {
               console.error('Error while fetching customers:', error);
               return [];
          }
     };

     const getUsersActiveInWeek = async (
          weekOffset: number
     ): Promise<User[]> => {
          try {
               const now = new Date();

               const startOfWeek = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - now.getDay() + weekOffset * 7
               );

               startOfWeek.setHours(0, 0, 0, 0);

               const endOfWeek = new Date(startOfWeek);
               endOfWeek.setDate(startOfWeek.getDate() + 7);

               const users = await fetchVerifiedCustomers();

               return users.filter((user) => {
                    if (!user.email_verified_at) {
                         return false;
                    }

                    const verifiedAt = new Date(
                         user.email_verified_at
                    );

                    return (
                         !Number.isNaN(verifiedAt.getTime()) &&
                         verifiedAt >= startOfWeek &&
                         verifiedAt < endOfWeek
                    );
               });
          } catch (error) {
               console.error(
                    'Error while fetching customers active in week:',
                    error
               );

               return [];
          }
     };

     return {
          getUsersActiveInWeek,
          getAllUsers,
          getUsersByPage,
          getUserByEmail,
          getUsersCount,
     };
};