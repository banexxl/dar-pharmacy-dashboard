import 'server-only';

import { Order } from '@/schemas/order';
import { asDate, fetchRows, supabase } from './supabase-browser';
import { Customer } from '@/schemas/customer';

export type OrderWithClient = Order & {
     client: Customer | null;
};

const sortOrdersByCreatedAtDesc = (orders: Order[]) => {
     return [...orders].sort((left, right) => {
          const leftDate = asDate(left.created_at).getTime();
          const rightDate = asDate(right.created_at).getTime();

          return rightDate - leftDate;
     });
};

const isCancelled = (order: Order) => order.order_status === 'cancelled';

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
               const orders = await fetchRows<Order>(['orders']);

               return sortOrdersByCreatedAtDesc(orders).slice(skip, skip + parsedLimit);
          } catch (error) {
               return { message: error };
          }
     };

     const getOrdersCount = async () => {
          try {
               const orders = await fetchRows<Order>(['orders']);
               return orders.length;
          } catch (error) {
               console.error('Error while fetching count:', error);
               return -1;
          }
     };

     const getOrderById = async (orderNumber: string) => {
          try {
               const orders = await fetchRows<Order>(['orders']);
               const order = orders.find((item) => item.order_number === orderNumber);
               return order ?? null;
          } catch (error) {
               return { message: error };
          }
     };


     const getAllOrders = async (): Promise<OrderWithClient[]> => {
          try {
               const { data, error } = await supabase
                    .from('orders')
                    .select(`
                    *,
                    customer:customers!orders_customer_id_fkey (
                         id,
                         user_id,
                         full_name,
                         email,
                         phone_number,
                         street_address,
                         city,
                         province_state,
                         zip_postal_code,
                         country,
                         created_at
                    )
               `)
                    .order('created_at', {
                         ascending: false,
                    });

               if (error) {
                    throw error;
               }

               return (data ?? []) as OrderWithClient[];
          } catch (error) {
               console.error('Failed to fetch orders with clients:', error);
               return [];
          }
     };

     const getSumOfAllOrders = async (): Promise<number | { message: string }> => {
          try {
               const orders = await fetchRows<Order>(['orders']);
               return orders.filter((order) => !isCancelled(order)).reduce((sum, order) => sum + Number(order.total ?? 0), 0);
          } catch (error) {
               return { message: (error as Error).message };
          }
     };

     const getSumOfLastMonthsOrders = async (months: number): Promise<number | { message: string }> => {
          try {
               const orders = await fetchRows<Order>(['orders']);
               const startDate = new Date(new Date().setMonth(new Date().getMonth() - months));
               const endDate = new Date();

               return orders
                    .filter((order) => !isCancelled(order))
                    .filter((order) => isInDateRange(order.created_at, startDate, endDate))
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
               const orders = await fetchRows<Order>(['orders']);

               return orders
                    .filter((order) => !isCancelled(order))
                    .filter((order) => isInDateRange(order.created_at, startOfLastMonth, endOfLastMonth))
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
               const orders = await fetchRows<Order>(['orders']);

               return orders
                    .filter((order) => !isCancelled(order))
                    .filter((order) => isInDateRange(order.created_at, startOfCurrentMonth, endOfCurrentMonth))
                    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
          } catch (error) {
               return { message: (error as Error).message };
          }
     };

     const getLastNumberOfOrders = async (
          numberOfOrders: number
     ): Promise<Order[]> => {
          try {
               const orders = await getAllOrders();

               if (!Array.isArray(orders)) {
                    return [];
               }

               return sortOrdersByCreatedAtDesc(orders)
                    .slice(0, numberOfOrders);
          } catch (error) {
               console.error('Failed to fetch latest orders:', error);
               return [];
          }
     };

     const getMonthlyOrderSumsForYear = async (yearOffset: number) => {
          try {
               const currentYear = new Date().getFullYear();
               const targetYear = currentYear + yearOffset;
               const startOfYear = new Date(`${targetYear}-01-01T00:00:00.000Z`);
               const startOfNextYear = new Date(`${targetYear + 1}-01-01T00:00:00.000Z`);
               const orders = await fetchRows<Order>(['orders']);
               const monthlyTotals = new Map<number, number>();

               for (const order of orders) {
                    if (isCancelled(order)) {
                         continue;
                    }

                    const createdAt = asDate(order.created_at);

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