import 'server-only';

import { Order } from '@/schemas/order';
import { asDate, fetchRows } from './supabase';

type OrderRecord = Record<string, any> & {
     id?: string;
     orderNumber?: string;
     createdAt?: string | Date;
     customer?: Record<string, any>;
     paymentMethod?: Order['paymentMethod'];
     status?: Order['status'];
     total?: number;
     items?: any[];
     logs?: any[];
};

const sortOrdersByCreatedAtDesc = (orders: OrderRecord[]) => {
     return [...orders].sort((left, right) => {
          const leftDate = asDate(left.createdAt).getTime();
          const rightDate = asDate(right.createdAt).getTime();

          return rightDate - leftDate;
     });
};

const isCancelled = (order: OrderRecord) => order.status === 'cancelled';

const isInDateRange = (value: any, start: Date, end: Date) => {
     const date = asDate(value);
     return date >= start && date < end;
};

export const ordersServices = () => {
     const getOrdersByPage = async (page: any, limit: any) => {
          const parsedLimit = parseInt(limit, 10);

          if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
               return [];
          }

          try {
               const skip = page * parsedLimit;
               const orders = await fetchRows<OrderRecord>(['orders']);

               return sortOrdersByCreatedAtDesc(orders).slice(skip, skip + parsedLimit);
          } catch (error) {
               return { message: error };
          }
     };

     const getOrdersCount = async () => {
          try {
               const orders = await fetchRows<OrderRecord>(['orders']);
               return orders.length;
          } catch (error) {
               console.error('Error while fetching count:', error);
               return -1;
          }
     };

     const getOrderById = async (orderNumber: string) => {
          try {
               const orders = await fetchRows<OrderRecord>(['orders']);
               const order = orders.find((item) => item.orderNumber === orderNumber);
               return order ?? null;
          } catch (error) {
               return { message: error };
          }
     };

     const getAllOrders = async () => {
          try {
               const orders = await fetchRows<OrderRecord>(['orders']);
               return orders;
          } catch (error) {
               return { message: error };
          }
     };

     const getSumOfAllOrders = async (): Promise<number | { message: string }> => {
          try {
               const orders = await fetchRows<OrderRecord>(['orders']);
               return orders.filter((order) => !isCancelled(order)).reduce((sum, order) => sum + Number(order.total ?? 0), 0);
          } catch (error) {
               return { message: (error as Error).message };
          }
     };

     const getSumOfLastMonthsOrders = async (months: number): Promise<number | { message: string }> => {
          try {
               const orders = await fetchRows<OrderRecord>(['orders']);
               const startDate = new Date(new Date().setMonth(new Date().getMonth() - months));
               const endDate = new Date();

               return orders
                    .filter((order) => !isCancelled(order))
                    .filter((order) => isInDateRange(order.createdAt, startDate, endDate))
                    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
          } catch (error) {
               return { message: (error as Error).message };
          }
     };

     const getSumOfLastMonthOrders = async (): Promise<number | { message: string }> => {
          try {
               const now = new Date();
               const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
               const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
               const orders = await fetchRows<OrderRecord>(['orders']);

               return orders
                    .filter((order) => !isCancelled(order))
                    .filter((order) => isInDateRange(order.createdAt, startOfLastMonth, endOfLastMonth))
                    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
          } catch (error) {
               return { message: (error as Error).message };
          }
     };

     const getSumOfCurrentMonthOrders = async (): Promise<number | { message: string }> => {
          try {
               const now = new Date();
               const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
               const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
               const orders = await fetchRows<OrderRecord>(['orders']);

               return orders
                    .filter((order) => !isCancelled(order))
                    .filter((order) => isInDateRange(order.createdAt, startOfCurrentMonth, endOfCurrentMonth))
                    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
          } catch (error) {
               return { message: (error as Error).message };
          }
     };

     const getLastNumberOfOrders = async (numberOfOrders: number) => {
          try {
               const orders = await fetchRows<OrderRecord>(['orders']);
               return sortOrdersByCreatedAtDesc(orders).slice(0, numberOfOrders);
          } catch (error) {
               return { message: (error as Error).message };
          }
     };

     const getMonthlyOrderSumsForYear = async (yearOffset: number) => {
          try {
               const currentYear = new Date().getFullYear();
               const targetYear = currentYear + yearOffset;
               const startOfYear = new Date(`${targetYear}-01-01T00:00:00.000Z`);
               const startOfNextYear = new Date(`${targetYear + 1}-01-01T00:00:00.000Z`);
               const orders = await fetchRows<OrderRecord>(['orders']);
               const monthlyTotals = new Map<number, number>();

               for (const order of orders) {
                    if (isCancelled(order)) {
                         continue;
                    }

                    const createdAt = asDate(order.createdAt);

                    if (Number.isNaN(createdAt.getTime()) || createdAt < startOfYear || createdAt >= startOfNextYear) {
                         continue;
                    }

                    const month = createdAt.getMonth() + 1;
                    monthlyTotals.set(month, (monthlyTotals.get(month) ?? 0) + Number(order.total ?? 0));
               }

               return Array.from({ length: 12 }, (_, index) => ({
                    month: index + 1,
                    total: monthlyTotals.get(index + 1) ?? 0,
               }));
          } catch (error) {
               return { message: (error as Error).message };
          }
     };

     return {
          getMonthlyOrderSumsForYear,
          getLastNumberOfOrders,
          getSumOfCurrentMonthOrders,
          getSumOfLastMonthOrders,
          getSumOfLastMonthsOrders,
          getSumOfAllOrders,
          getAllOrders,
          getOrdersByPage,
          getOrdersCount,
          getOrderById,
     };
};