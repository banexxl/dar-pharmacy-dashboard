export type Customer = {
     id: string;
     user_id: string;

     email: string | null;
     full_name: string;
     avatar: string | null;
     gender: string | null;

     phone_number: string | null;

     street_address: string | null;
     city: string | null;
     province_state: string | null;
     country: string | null;
     zip_postal_code: string | null;

     orders: Array<{
          count: number;
     }>;

     created_at: string;
     updated_at: string;

};