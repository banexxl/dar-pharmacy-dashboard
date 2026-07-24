import ClientPage from './client-page';
import { productsServices } from '@/services/product-services';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [products, manufacturers] = await Promise.all([
    productsServices().getAllProducts(),
    productsServices().getAllManufacturers(),
  ]);

  return <ClientPage
    allProducts={JSON.parse(JSON.stringify(products))}
    allManufacturers={JSON.parse(JSON.stringify(manufacturers))}
  />;
}
