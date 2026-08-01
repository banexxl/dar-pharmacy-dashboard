import BlogClientPage from './client-page';
import { getBlogs } from './actions';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const result = await getBlogs();
  const blogs = result.success ? result.data : [];

  return <BlogClientPage initialBlogs={blogs} />;
}
