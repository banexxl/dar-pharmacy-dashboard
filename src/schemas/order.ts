import { IProduct } from "@/sections/products/products-table";
import { ICustomer } from "./customer";

export type PaymentMethod = 'credit card' | 'paypal' | 'cash' | 'check' | 'cash-on-delivery';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export type Order = {
     _id: string;
     orderNumber: string;
     createdAt: Date;
     customer: ICustomer;
     items: IProduct[];
     paymentMethod: PaymentMethod;
     total: number;
     status: OrderStatus;
     logs: {
          _id: string;
          message: string;
          createdAt: string;
     }[];
}