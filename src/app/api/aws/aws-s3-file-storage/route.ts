import handler from '@/server/legacy-api/aws-s3-file-storage';
import { adaptNextApi } from '@/server/adapt-next-api';

export const runtime = 'nodejs';
const route = adaptNextApi(handler);
export { route as GET, route as POST, route as PUT, route as DELETE };
