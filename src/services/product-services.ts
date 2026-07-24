import { fetchRows } from '@/services/supabase';
import { Product, hydrateProducts } from '../schemas/product';

const sortByUpdatedAtDesc = (products: Product[]) => {
     return [...products].sort((left, right) => {
          const leftDate = new Date(left.updated_at ?? left.updatedAt ?? 0).getTime();
          const rightDate = new Date(right.updated_at ?? right.updatedAt ?? 0).getTime();

          return rightDate - leftDate;
     });
};

const toLowerText = (value: unknown) => String(value ?? '').toLowerCase();

export const productsServices = () => {
     const getProductsByPage = async (page: any, limit: any) => {
          const parsedLimit = parseInt(limit, 10);

          if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
               return [];
          }

          try {
               const skip = page * parsedLimit;
               const products = hydrateProducts(await fetchRows<Product>(['products']));

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
               const products = hydrateProducts(await fetchRows<Product>(['products']));
               return products.filter((product) => Boolean(product.display_on_home ?? product.displayOnHome));
          } catch (error) {
               return { message: error };
          }
     };

     const getProductById = async (id: string) => {
          try {
               const products = hydrateProducts(await fetchRows<Product>(['products']));
               const product = products.find((item) => String(item.id) === id);
               return product ?? null;
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByManufacturer = async (manufacturer: string) => {
          try {
               const products = hydrateProducts(await fetchRows<Product>(['products']));
               return products.filter((product) => product.manufacturer_id === manufacturer || product.manufacturer === manufacturer);
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByNameAndOrManufacturer = async (searchTerm: string) => {
          try {
               const products = hydrateProducts(await fetchRows<Product>(['products']));
               const searchTerms = searchTerm.split(' ').map((term) => term.trim()).filter(Boolean).map(toLowerText);

               return products.filter((product) => {
                    const name = toLowerText(product.name);
                    const manufacturer = toLowerText(product.manufacturer ?? product.manufacturer_id);

                    return searchTerms.some((term) => name.includes(term) || manufacturer.includes(term));
               });
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByDiscount = async () => {
          try {
               const products = hydrateProducts(await fetchRows<Product>(['products']));
               return products.filter((product) => Boolean(product.discount));
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByMainCategory = async (mainCategory: string) => {
          try {
               const products = hydrateProducts(await fetchRows<Product>(['products']));
               return products.filter((product) => (product.main_category ?? product.mainCategory) === mainCategory);
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByMainCategoryMidCategory = async (mainCategory: string, midCategory: string) => {
          try {
               const products = hydrateProducts(await fetchRows<Product>(['products']));
               return products
                    .filter((product) => (product.main_category ?? product.mainCategory) === mainCategory && (product.mid_category ?? product.midCategory) === midCategory)
                    ;
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByMainCategoryMidCategorySubCategory = async (mainCategory: string, midCategory: string, subCategory: string) => {
          try {
               const products = hydrateProducts(await fetchRows<Product>(['products']));
               return products
                    .filter((product) => (product.main_category ?? product.mainCategory) === mainCategory && (product.mid_category ?? product.midCategory) === midCategory && (product.sub_category ?? product.subCategory) === subCategory)
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
               const products = await fetchRows<Product>(['products']);
               return hydrateProducts(products);
          } catch (error) {
               return { message: error };
          }
     };

     const getLastNumberOfProducts = async (numberOfProducts: number) => {
          try {
               const products = hydrateProducts(await fetchRows<Product>(['products']));
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