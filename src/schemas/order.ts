import { IProduct } from "@/sections/products/products-table";
import { ICustomer } from "./customer";

export type Order = {
     _id: string;
     number: string;
     createdAt: Date;
     customer: ICustomer;
     items: IProduct[];
     paymentMethod: string;
     total: number;
     status: string;
     logs: {
          _id: string;
          message: string;
          createdAt: string;
     }[];
}