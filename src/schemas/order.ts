import type { Customer } from './customer';

export type PaymentMethod =
     | 'credit card'
     | 'paypal'
     | 'cash'
     | 'check'
     | 'cash-on-delivery';

export type PaymentStatus =
     | 'pending'
     | 'paid'
     | 'failed'
     | 'refunded'
     | 'cancelled';

export type OrderStatus =
     | 'pending'
     | 'shipped'
     | 'delivered'
     | 'cancelled';

export type OrderItem = {
     id: string;
     order_id: string;
     product_id: string | null;
     name: string;
     slug: string | null;
     description: string | null;
     main_category: string | null;
     mid_category: string | null;
     sub_category: string | null;
     ingredients: string | null;
     instructions: string | null;
     warning: string | null;
     quantity: number | null;
     quantity_unit: string | null;
     manufacturer_id: string | null;
     manufacturer_name: string | null;
     manufacturer_value: string | null;
     image_url: string | null;
     media_urls: string[];
     unit_price: number;
     count: number;
     discount: boolean;
     discount_amount: number;
     final_unit_price: number;
     is_active: boolean;
     new_arrival: boolean;
     best_seller: boolean;
     promoting: boolean;
     promotion_text: string | null;
     created_at: string;
};

export type Order = {
     id: string;
     order_number: string;
     customer_id: string | null;
     payment_method: PaymentMethod;
     payment_status: PaymentStatus;
     order_status: OrderStatus;
     transaction_number: string | null;
     total: number;
     created_at: string;
     updated_at: string;
     archived: boolean;

     // Contact & address (stored directly on the order)
     full_name: string | null;
     phone_number: string | null;
     email: string | null;
     street_address: string | null;
     city: string | null;
     province_state: string | null;
     country: string | null;
     zip_postal_code: string | null;

     // Relations returned by the Supabase query
     customer?: Customer | null;
     order_items: OrderItem[];
};

export interface OrderDetailsProps {
     onApprove: () => void;
     onEdit: () => void;
     onReject: () => void;
     order: Order;
}
