import HomeClient from './home-client';
import { ordersServices } from '@/services/order-services';
import { productsServices } from '@/services/product-services';
import { userServices } from '@/services/user-services';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const values = await Promise.all([
    ordersServices().getSumOfLastMonthsOrders(1),
    ordersServices().getSumOfLastMonthOrders(),
    ordersServices().getSumOfCurrentMonthOrders(),
    productsServices().getLastNumberOfProducts(5),
    ordersServices().getLastNumberOfOrders(6),
    ordersServices().getMonthlyOrderSumsForYear(0),
    ordersServices().getMonthlyOrderSumsForYear(-1),
    userServices().getUsersActiveInWeek(0),
    userServices().getUsersActiveInWeek(-1),
  ]);

  const data = JSON.parse(JSON.stringify(values));
  return <HomeClient
    sumOfLastMonthsOrders={data[0]}
    sumOfLastMonthOrders={data[1]}
    sumForCurrentMonth={data[2]}
    lastNProducts={data[3]}
    lastNOrders={data[4]}
    monthlySumForCurrentYear={data[5]}
    monthlySumForLastYear={data[6]}
    usersActiveThisWeek={data[7]}
    usersActiveLastWeek={data[8]}
  />;
}
