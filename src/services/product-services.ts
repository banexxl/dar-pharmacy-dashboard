import 'server-only';

import { fetchRows } from '@/services/supabase-browser';
import { Product } from '../schemas/product';

type Manufacturer = {
     id?: string | number;
     value?: string | null;
     name?: string | null;
     url?: string | null;
};

const sortByUpdatedAtDesc = (products: Product[]) => {
     return [...products].sort((left, right) => {
          const leftDate = new Date(left.updated_at ?? 0).getTime();
          const rightDate = new Date(right.updated_at ?? 0).getTime();

          return rightDate - leftDate;
     });
};

const toLowerText = (value: unknown) => String(value ?? '').toLowerCase();

const normalizeKey = (value: unknown) => String(value ?? '').trim().toLowerCase();

const enrichProductsWithManufacturers = (products: Product[], manufacturers: Manufacturer[]) => {
     const manufacturersById = new Map<string, Manufacturer>();
     const manufacturersByValue = new Map<string, Manufacturer>();
     const manufacturersByName = new Map<string, Manufacturer>();
     const manufacturersByUrl = new Map<string, Manufacturer>();

     manufacturers.forEach((manufacturer) => {
          const normalizedId = normalizeKey(manufacturer.id);
          const normalizedValue = normalizeKey(manufacturer.value);
          const normalizedName = normalizeKey(manufacturer.name);
          const normalizedUrl = normalizeKey(manufacturer.url);

          if (normalizedId) {
               manufacturersById.set(normalizedId, manufacturer);
          }

          if (normalizedValue) {
               manufacturersByValue.set(normalizedValue, manufacturer);
          }

          if (normalizedName) {
               manufacturersByName.set(normalizedName, manufacturer);
          }

          if (normalizedUrl) {
               manufacturersByUrl.set(normalizedUrl, manufacturer);
          }
     });

     return products.map((product) => {
          const lookupKeys = [
               normalizeKey(product.manufacturer_id),
               normalizeKey(product.manufacturer_value),
               normalizeKey(product.manufacturer_name),
               normalizeKey(product.manufacturer_url)
          ].filter(Boolean);

          const matchedManufacturer = lookupKeys
               .map((key) => {
                    return (
                         manufacturersById.get(key) ||
                         manufacturersByValue.get(key) ||
                         manufacturersByUrl.get(key) ||
                         manufacturersByName.get(key)
                    );
               })
               .find(Boolean);

          if (!matchedManufacturer) {
               return product;
          }

          return {
               ...product,
               manufacturer_name: matchedManufacturer.name ?? product.manufacturer_name ?? null,
               manufacturer_value: matchedManufacturer.value ?? product.manufacturer_value ?? null,
               manufacturer_url: matchedManufacturer.url ?? product.manufacturer_url ?? null,
          };
     });
};

export const productsServices = () => {
     const fetchProductsWithManufacturers = async () => {
          const [products, manufacturers] = await Promise.all([
               fetchRows<Product>(['products']),
               fetchRows<Manufacturer>(['manufacturers'], { column: 'name', ascending: true })
          ]);

          return enrichProductsWithManufacturers(products, manufacturers);
     };

     const getProductsByPage = async (page: any, limit: any) => {
          const parsedLimit = parseInt(limit, 10);

          if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
               return [];
          }

          try {
               const skip = page * parsedLimit;
               const products = await fetchProductsWithManufacturers();

               return sortByUpdatedAtDesc(products).slice(skip, skip + parsedLimit);
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsCount = async () => {
          try {
               const products = await fetchRows<Product>(['products']);
               return products.length;
          } catch (error) {
               console.error('Error while fetching count:', error);
               return -1;
          }
     };

     const getProductsForHomePage = async () => {
          try {
               const products = await fetchProductsWithManufacturers();
               return products.filter((product) => Boolean(product.display_on_home));
          } catch (error) {
               return { message: error };
          }
     };

     const getProductById = async (id: string) => {
          try {
               const products = await fetchProductsWithManufacturers();
               const product = products.find((item) => String(item.id) === id);
               return product ?? null;
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByManufacturer = async (manufacturer: string) => {
          try {
               const products = await fetchProductsWithManufacturers();
               return products.filter((product) => product.manufacturer_id === manufacturer || product.manufacturer_name === manufacturer || product.manufacturer_value === manufacturer);
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByNameAndOrManufacturer = async (searchTerm: string) => {
          try {
               const products = await fetchProductsWithManufacturers();
               const searchTerms = searchTerm.split(' ').map((term) => term.trim()).filter(Boolean).map(toLowerText);

               return products.filter((product) => {
                    const name = toLowerText(product.name);
                    const manufacturer = toLowerText(product.manufacturer_name ?? product.manufacturer_id);

                    return searchTerms.some((term) => name.includes(term) || manufacturer.includes(term));
               });
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByDiscount = async () => {
          try {
               const products = await fetchProductsWithManufacturers();
               return products.filter((product) => Boolean(product.discount));
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByMainCategory = async (mainCategory: string) => {
          try {
               const products = await fetchProductsWithManufacturers();
               return products.filter((product) => product.main_category === mainCategory);
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByMainCategoryMidCategory = async (mainCategory: string, midCategory: string) => {
          try {
               const products = await fetchProductsWithManufacturers();
               return products
                    .filter((product) => product.main_category === mainCategory && product.mid_category === midCategory)
                    ;
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByMainCategoryMidCategorySubCategory = async (mainCategory: string, midCategory: string, subCategory: string) => {
          try {
               const products = await fetchProductsWithManufacturers();
               return products
                    .filter((product) => product.main_category === mainCategory && product.mid_category === midCategory && product.sub_category === subCategory)
                    ;
          } catch (error) {
               return { message: error };
          }
     };

     const getAllManufacturers = async () => {
          try {
               const manufacturers = await fetchRows<Record<string, any>>(['manufacturers'], { column: 'name', ascending: true });
               return manufacturers;
          } catch (error) {
               return { message: error };
          }
     };

     const getAllProducts = async () => {
          try {
               return await fetchProductsWithManufacturers();
          } catch (error) {
               return { message: error };
          }
     };

     const getLastNumberOfProducts = async (numberOfProducts: number) => {
          try {
               const products = await fetchProductsWithManufacturers();
               return sortByUpdatedAtDesc(products).slice(0, numberOfProducts);
          } catch (error) {
               return { message: (error as Error).message };
          }
     };

     return {
          getLastNumberOfProducts,
          getAllProducts,
          getProductsByPage,
          getProductsCount,
          getProductsForHomePage,
          getProductById,
          getProductsByNameAndOrManufacturer,
          getProductsByManufacturer,
          getProductsByDiscount,
          getProductsByMainCategory,
          getProductsByMainCategoryMidCategory,
          getProductsByMainCategoryMidCategorySubCategory,
          getAllManufacturers,
     };
};