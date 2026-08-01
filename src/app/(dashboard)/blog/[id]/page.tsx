import BlogFormClient from './blog-form-client';
import { getBlogById } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let initialData = null;
  if (id !== 'new') {
    const result = await getBlogById(id);
    initialData = result.success ? result.data : null;
  }

  return <BlogFormClient id={id} initialData={initialData} />;
}
