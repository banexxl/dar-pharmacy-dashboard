import { notFound } from 'next/navigation';
import ClientPage from './client-page';
import { productsServices } from '@/services/product-services';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const [product, manufacturers] = await Promise.all([
    productsServices().getProductById(productId),
    productsServices().getAllManufacturers(),
  ]);

  if (!product || (product as any).message) {
    notFound();
  }

  return (
    <ClientPage
      product={JSON.parse(JSON.stringify(product))}
      allManufacturers={JSON.parse(JSON.stringify(manufacturers))}
    />
  );
}
