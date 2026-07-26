import type { Customer } from './customer';
import type { Product } from './product';

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
     description: string | null;
     main_category: string | null;
     mid_category: string | null;
     sub_category: string | null;
     ingredients: string | null;
     instructions: string | null;
     warning: string | null;
     quantity: number | null;
     quantity_unit: string | null;
     manufacturer: string | null;
     manufacturer_value: string | null;
     image_url: string | null;
     media_urls: string[];
     unit_price: number;
     count: number;
     discount: boolean;
     discount_amount: number;
     final_unit_price: number;
     line_total: number;
     product_snapshot: Partial<Product> | null;
     created_at: string;
};

export type Order = {
     id: string;
     order_number: string;
     customer_id: string;
     payment_method: PaymentMethod;
     payment_status: PaymentStatus;
     order_status: OrderStatus;
     transaction_number: string | null;
     total: number;
     created_at: string;
     updated_at: string;

     // Relations returned by the Supabase query
     customer: Customer;
     order_items: OrderItem[];
};

export interface OrderDetailsProps {
     onApprove: () => void;
     onEdit: () => void;
     onReject: () => void;
     order: Order;
}