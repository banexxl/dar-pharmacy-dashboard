import ClientPage from './client-page';
import { customerServices } from '@/services/user-services';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const clients = await customerServices().getAllCustomers();
  return <ClientPage allClients={JSON.parse(JSON.stringify(clients))} />;
}
