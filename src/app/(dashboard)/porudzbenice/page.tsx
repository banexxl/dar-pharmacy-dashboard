import ClientPage from './client-page';
import { ordersServices } from '@/services/order-services';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const orders = await ordersServices().getAllOrders();
  return <ClientPage allOrders={JSON.parse(JSON.stringify(orders))} />;
}
