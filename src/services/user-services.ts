import 'server-only';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.NEXT_SUPABASE_SECRET_KEY;

export type UserProfile = {
     id: string;
     email: string | null;
     full_name: string;
     avatar_url: string | null;

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

type AuthUserRecord = {
     id: string;
     email: string | null;
     phone: string | null;
     email_confirmed_at: string | null;
     created_at: string;
     updated_at: string;
     raw_user_meta_data?: Record<string, any> | null;
     user_metadata?: Record<string, any> | null;
};

const getUserMetadata = (user: AuthUserRecord) => user.raw_user_meta_data ?? user.user_metadata ?? {};

const mapAuthUserToProfile = (user: AuthUserRecord): UserProfile => ({
     id: user.id,
     email: user.email,
     full_name: String(getUserMetadata(user).full_name ?? getUserMetadata(user).name ?? ''),
     avatar_url: getUserMetadata(user).avatar_url ?? getUserMetadata(user).picture ?? null,
     email_verified_at: user.email_confirmed_at,
     phone_number: user.phone,
     street_address: getUserMetadata(user).street_address ?? null,
     city: getUserMetadata(user).city ?? null,
     province_state: getUserMetadata(user).province_state ?? getUserMetadata(user).state ?? null,
     country: getUserMetadata(user).country ?? null,
     zip_postal_code: getUserMetadata(user).zip_postal_code ?? null,
     should_create_account: Boolean(getUserMetadata(user).should_create_account ?? false),
     created_at: user.created_at,
     updated_at: user.updated_at,
     raw_user_meta_data: getUserMetadata(user),
});

const getSupabaseAdminClient = (): SupabaseClient => {
     if (!supabaseUrl || !supabaseSecretKey) {
          throw new Error('NEXT_SUPABASE_SECRET_KEY is required to read auth.users.');
     }

     return createClient(supabaseUrl, supabaseSecretKey, {
          auth: {
               autoRefreshToken: false,
               persistSession: false,
          },
          global: {
               headers: {
                    Authorization: `Bearer ${supabaseSecretKey}`,
               },
          },
     });
};

const fetchAuthUsersPage = async (page: number, perPage: number): Promise<AuthUserRecord[]> => {
     const supabaseAdmin = getSupabaseAdminClient();
     const { data, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
     });

     if (error) {
          throw error;
     }

     return (data?.users ?? []) as AuthUserRecord[];
};

const fetchAuthUsers = async (): Promise<AuthUserRecord[]> => {
     const perPage = 1000;
     const users: AuthUserRecord[] = [];
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

export const userServices = () => {

     const getUsersByPage = async (page: number, limit: any) => {
          const parsedLimit = parseInt(limit, 10); // Parse limit as an integer

          if (isNaN(parsedLimit) || parsedLimit <= 0) {
               // Handle the case when the parsed limit is not a valid positive integer
               return [];
          }

          try {
               const skip = page * parsedLimit;
               const currentPage = Math.floor(skip / parsedLimit) + 1;
               const users = await fetchAuthUsersPage(currentPage, parsedLimit);
               return users.map(mapAuthUserToProfile);
          } catch (error) {
               return { message: error }
          }
     }

     const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
          try {
               const users = await fetchAuthUsers();
               const user = users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
               return user ? mapAuthUserToProfile(user) : null;
          } catch (error: any) {
               console.error('Error while fetching user by email:', error);
               return null;
          }
     }

     const getUsersCount = async () => {
          try {
               const users = await fetchAuthUsers();
               return users.length;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return 0; // Return false or handle the error accordingly
          }
     }

     const getAllUsers = async () => {
          try {
               const users = await fetchAuthUsers();
               return users.map(mapAuthUserToProfile);
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return 0; // Return false or handle the error accordingly
          }
     }

     const getUsersActiveInWeek = async (weekOffset: number) => {
          try {
               const now = new Date();

               const startOfWeek = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - now.getDay() + weekOffset * 7 // Calculate the start of the week with the offset
               );
               const endOfWeek = new Date(startOfWeek);
               endOfWeek.setDate(startOfWeek.getDate() + 7); // End of the week is 7 days after the start

               const users = await fetchAuthUsers();

               return users
                    .filter((user) => {
                         const emailVerified = user.email_confirmed_at ? new Date(user.email_confirmed_at) : new Date(NaN);

                         return !Number.isNaN(emailVerified.getTime()) && emailVerified >= startOfWeek && emailVerified < endOfWeek;
                    })
                    .map(mapAuthUserToProfile);
          } catch (error: any) {
               console.error('Error while fetching active users count:', error);
               return 0; // Handle the error accordingly
          }
     };


     return {
          getUsersActiveInWeek,
          getAllUsers,
          getUsersByPage,
          getUserByEmail,
          getUsersCount
     }
}