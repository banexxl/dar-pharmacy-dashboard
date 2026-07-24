import ClientPage from './client-page';
import { ordersServices } from '@/services/order-services';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await ordersServices().getOrderById(orderId);
  return <ClientPage {...JSON.parse(JSON.stringify(order))} />;
}
