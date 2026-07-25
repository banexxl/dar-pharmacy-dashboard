import { Product } from "./product";
import { Customer } from "./customer";

export type PaymentMethod = 'credit card' | 'paypal' | 'cash' | 'check' | 'cash-on-delivery';

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
     id: string;
     order_number: string;
     created_at: Date;
     customer: Customer;
     items: ICartItem[];
     payment_method: PaymentMethod;
     total: number;
     status: OrderStatus;
}

export default interface ICartItem extends Product {
     count: number;
}

export interface OrderDetailsProps {
     onApprove: () => void;
     onEdit: () => void;
     onReject: () => void;
     order: Order;
}