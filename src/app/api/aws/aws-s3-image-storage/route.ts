import handler from '@/server/legacy-api/aws-s3-image-storage';
import { adaptNextApi } from '@/server/adapt-next-api';

export const runtime = 'nodejs';
const route = adaptNextApi(handler);
export { route as POST, route as DELETE };
