import 'server-only';

import { Order } from '@/schemas/order';
import { Customer } from '@/schemas/customer';
import {
     asDate,
     fetchRows,
     supabase,
} from './supabase-browser';

export type OrderWithCustomer = Order & {
     customer: Customer | null;
};

const sortOrdersByCreatedAtDesc = <T extends Order>(
     orders: T[]
): T[] => {
     return [...orders].sort((left, right) => {
          const leftDate = asDate(
               left.created_at
          ).getTime();

          const rightDate = asDate(
               right.created_at
          ).getTime();

          return rightDate - leftDate;
     });
};

const isCancelled = (order: Order) =>
     order.order_status === 'cancelled';

const isInDateRange = (
     value: unknown,
     start: Date,
     end: Date
) => {
     const date = asDate(value);

     return date >= start && date < end;
};

const getErrorMessage = (error: unknown): string => {
     return error instanceof Error
          ? error.message
          : 'Došlo je do greške.';
};

export const ordersServices = () => {
     /*
      * Supabase performs a left join here.
      *
      * When orders.customer_id contains a valid customer ID,
      * the customer object is returned.
      *
      * When customer_id is null, customer will be null.
      */
     const fetchOrdersWithCustomers = async (): Promise<
          OrderWithCustomer[]
     > => {
          const { data, error } = await supabase
               .from('orders')
               .select(`
                    *,
                    customer:customers!orders_customer_id_fkey (
                         *
                    )
               `)
               .order('created_at', {
                    ascending: false,
               });

          if (error) {
               throw error;
          }

          return (data ?? []) as OrderWithCustomer[];
     };

     const getOrdersByPage = async (
          page: number | string,
          limit: number | string
     ): Promise<
          OrderWithCustomer[] | { message: string }
     > => {
          const parsedPage = Number(page);
          const parsedLimit = Number(limit);

          if (
               !Number.isInteger(parsedLimit) ||
               parsedLimit <= 0
          ) {
               return [];
          }

          const safePage =
               Number.isInteger(parsedPage) &&
                    parsedPage >= 0
                    ? parsedPage
                    : 0;

          try {
               const skip =
                    safePage * parsedLimit;

               const orders =
                    await fetchOrdersWithCustomers();

               return sortOrdersByCreatedAtDesc(
                    orders
               ).slice(
                    skip,
                    skip + parsedLimit
               );
          } catch (error) {
               return {
                    message: getErrorMessage(error),
               };
          }
     };

     const getOrdersCount =
          async (): Promise<number> => {
               try {
                    const { count, error } =
                         await supabase
                              .from('orders')
                              .select('id', {
                                   count: 'exact',
                                   head: true,
                              });

                    if (error) {
                         throw error;
                    }

                    return count ?? 0;
               } catch (error) {
                    console.error(
                         'Error while fetching order count:',
                         error
                    );

                    return -1;
               }
          };

     const getOrderById = async (
          orderNumber: string
     ): Promise<
          | OrderWithCustomer
          | null
          | { message: string }
     > => {
          try {
               const { data, error } =
                    await supabase
                         .from('orders')
                         .select(`
                              *,
                              customer:customers!orders_customer_id_fkey (
                                   *
                              )
                         `)
                         .eq(
                              'order_number',
                              orderNumber
                         )
                         .maybeSingle();

               if (error) {
                    throw error;
               }

               return data as OrderWithCustomer | null;
          } catch (error) {
               return {
                    message: getErrorMessage(error),
               };
          }
     };

     const getAllOrders =
          async (): Promise<
               OrderWithCustomer[]
          > => {
               try {
                    return await fetchOrdersWithCustomers();
               } catch (error) {
                    console.error(
                         'Failed to fetch orders with customers:',
                         error
                    );

                    return [];
               }
          };

     const getSumOfAllOrders = async (): Promise<
          number | { message: string }
     > => {
          try {
               const orders =
                    await fetchRows<Order>([
                         'orders',
                    ]);

               return orders
                    .filter(
                         (order) =>
                              !isCancelled(order)
                    )
                    .reduce(
                         (sum, order) =>
                              sum +
                              Number(
                                   order.total ?? 0
                              ),
                         0
                    );
          } catch (error) {
               return {
                    message: getErrorMessage(error),
               };
          }
     };

     const getSumOfLastMonthsOrders = async (
          months: number
     ): Promise<
          number | { message: string }
     > => {
          try {
               const orders =
                    await fetchRows<Order>([
                         'orders',
                    ]);

               const now = new Date();

               const startDate = new Date(
                    now.getFullYear(),
                    now.getMonth() - months,
                    now.getDate(),
                    now.getHours(),
                    now.getMinutes(),
                    now.getSeconds(),
                    now.getMilliseconds()
               );

               return orders
                    .filter(
                         (order) =>
                              !isCancelled(order)
                    )
                    .filter((order) =>
                         isInDateRange(
                              order.created_at,
                              startDate,
                              now
                         )
                    )
                    .reduce(
                         (sum, order) =>
                              sum +
                              Number(
                                   order.total ?? 0
                              ),
                         0
                    );
          } catch (error) {
               return {
                    message: getErrorMessage(error),
               };
          }
     };

     const getSumOfLastMonthOrders =
          async (): Promise<
               number | { message: string }
          > => {
               try {
                    const now = new Date();

                    const startOfLastMonth =
                         new Date(
                              now.getFullYear(),
                              now.getMonth() - 1,
                              1
                         );

                    // Exclusive upper boundary:
                    // first moment of the current month.
                    const startOfCurrentMonth =
                         new Date(
                              now.getFullYear(),
                              now.getMonth(),
                              1
                         );

                    const orders =
                         await fetchRows<Order>([
                              'orders',
                         ]);

                    return orders
                         .filter(
                              (order) =>
                                   !isCancelled(
                                        order
                                   )
                         )
                         .filter((order) =>
                              isInDateRange(
                                   order.created_at,
                                   startOfLastMonth,
                                   startOfCurrentMonth
                              )
                         )
                         .reduce(
                              (sum, order) =>
                                   sum +
                                   Number(
                                        order.total ??
                                        0
                                   ),
                              0
                         );
               } catch (error) {
                    return {
                         message:
                              getErrorMessage(
                                   error
                              ),
                    };
               }
          };

     const getSumOfCurrentMonthOrders =
          async (): Promise<
               number | { message: string }
          > => {
               try {
                    const now = new Date();

                    const startOfCurrentMonth =
                         new Date(
                              now.getFullYear(),
                              now.getMonth(),
                              1
                         );

                    const startOfNextMonth =
                         new Date(
                              now.getFullYear(),
                              now.getMonth() + 1,
                              1
                         );

                    const orders =
                         await fetchRows<Order>([
                              'orders',
                         ]);

                    return orders
                         .filter(
                              (order) =>
                                   !isCancelled(
                                        order
                                   )
                         )
                         .filter((order) =>
                              isInDateRange(
                                   order.created_at,
                                   startOfCurrentMonth,
                                   startOfNextMonth
                              )
                         )
                         .reduce(
                              (sum, order) =>
                                   sum +
                                   Number(
                                        order.total ??
                                        0
                                   ),
                              0
                         );
               } catch (error) {
                    return {
                         message:
                              getErrorMessage(
                                   error
                              ),
                    };
               }
          };

     const getLastNumberOfOrders = async (
          numberOfOrders: number
     ): Promise<OrderWithCustomer[]> => {
          if (
               !Number.isInteger(numberOfOrders) ||
               numberOfOrders <= 0
          ) {
               return [];
          }

          try {
               const orders =
                    await fetchOrdersWithCustomers();

               return sortOrdersByCreatedAtDesc(
                    orders
               ).slice(0, numberOfOrders);
          } catch (error) {
               console.error(
                    'Failed to fetch latest orders:',
                    error
               );

               return [];
          }
     };

     const getMonthlyOrderSumsForYear = async (
          yearOffset: number
     ) => {
          try {
               const currentYear =
                    new Date().getFullYear();

               const targetYear =
                    currentYear + yearOffset;

               const startOfYear = new Date(
                    `${targetYear}-01-01T00:00:00.000Z`
               );

               const startOfNextYear = new Date(
                    `${targetYear + 1}-01-01T00:00:00.000Z`
               );

               const orders =
                    await fetchRows<Order>([
                         'orders',
                    ]);

               const monthlyTotals = new Map<
                    number,
                    number
               >();

               for (const order of orders) {
                    if (isCancelled(order)) {
                         continue;
                    }

                    const createdAt = asDate(
                         order.created_at
                    );

                    if (
                         Number.isNaN(
                              createdAt.getTime()
                         ) ||
                         createdAt < startOfYear ||
                         createdAt >=
                         startOfNextYear
                    ) {
                         continue;
                    }

                    const month =
                         createdAt.getUTCMonth() + 1;

                    monthlyTotals.set(
                         month,
                         (monthlyTotals.get(
                              month
                         ) ?? 0) +
                         Number(
                              order.total ?? 0
                         )
                    );
               }

               return Array.from(
                    { length: 12 },
                    (_, index) => ({
                         month: index + 1,
                         total:
                              monthlyTotals.get(
                                   index + 1
                              ) ?? 0,
                    })
               );
          } catch (error) {
               return {
                    message: getErrorMessage(error),
               };
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