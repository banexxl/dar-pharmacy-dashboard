import ClientPage from './client-page';
import { userServices } from '@/services/user-services';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const clients = await userServices().getAllUsers();
  return <ClientPage allClients={JSON.parse(JSON.stringify(clients))} />;
}
