import { IProduct } from "@/sections/products/products-table";
import { ICustomer } from "./customer";
import { error, indigo, info, success } from "@/theme/colors";
import { JSX } from "react";

export type PaymentMethod = 'credit card' | 'paypal' | 'cash' | 'check' | 'cash-on-delivery';

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
     _id: string;
     orderNumber: string;
     createdAt: Date;
     customer: ICustomer;
     items: ICartItem[];
     paymentMethod: PaymentMethod;
     total: number;
     status: OrderStatus;
     logs: {
          _id: string;
          message: string;
          createdAt: string;
     }[];
}

export default interface ICartItem extends IProduct {
     count: number;
}

export interface ICart {
     cartItems: ICartItem[],
     children?: JSX.IntrinsicElements
}

export interface OrderDetailsProps {
     onApprove: () => void;
     onEdit: () => void;
     onReject: () => void;
     order: Order;
}