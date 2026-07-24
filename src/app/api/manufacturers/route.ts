import handler from '@/server/legacy-api/manufacturers';
import { adaptNextApi } from '@/server/adapt-next-api';

const route = adaptNextApi(handler);
export { route as GET, route as POST, route as PUT, route as DELETE };
