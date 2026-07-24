import { fetchRows } from '@/services/supabase';

type ProductRecord = Record<string, any> & {
     id?: string;
     displayOnHome?: boolean;
     discount?: boolean;
     manufacturer?: string;
     mainCategory?: string;
     midCategory?: string;
     subCategory?: string;
     updatedAt?: string | Date;
     name?: string;
};

const sortByUpdatedAtDesc = (products: ProductRecord[]) => {
     return [...products].sort((left, right) => {
          const leftDate = new Date(left.updatedAt ?? 0).getTime();
          const rightDate = new Date(right.updatedAt ?? 0).getTime();

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
               const products = await fetchRows<ProductRecord>(['products']);

               return sortByUpdatedAtDesc(products).slice(skip, skip + parsedLimit);
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsCount = async () => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
               return products.length;
          } catch (error) {
               console.error('Error while fetching count:', error);
               return -1;
          }
     };

     const getProductsForHomePage = async () => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
               return products.filter((product) => Boolean(product.displayOnHome));
          } catch (error) {
               return { message: error };
          }
     };

     const getProductById = async (id: string) => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
               const product = products.find((item) => String(item.id) === id);
               return product ?? null;
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByManufacturer = async (manufacturer: string) => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
               return products.filter((product) => product.manufacturer === manufacturer);
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByNameAndOrManufacturer = async (searchTerm: string) => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
               const searchTerms = searchTerm.split(' ').map((term) => term.trim()).filter(Boolean).map(toLowerText);

               return products.filter((product) => {
                    const name = toLowerText(product.name);
                    const manufacturer = toLowerText(product.manufacturer);

                    return searchTerms.some((term) => name.includes(term) || manufacturer.includes(term));
               });
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByDiscount = async () => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
               return products.filter((product) => Boolean(product.discount));
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByMainCategory = async (mainCategory: string) => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
               return products.filter((product) => product.mainCategory === mainCategory);
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByMainCategoryMidCategory = async (mainCategory: string, midCategory: string) => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
               return products
                    .filter((product) => product.mainCategory === mainCategory && product.midCategory === midCategory)
                    ;
          } catch (error) {
               return { message: error };
          }
     };

     const getProductsByMainCategoryMidCategorySubCategory = async (mainCategory: string, midCategory: string, subCategory: string) => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
               return products
                    .filter((product) => product.mainCategory === mainCategory && product.midCategory === midCategory && product.subCategory === subCategory)
                    ;
          } catch (error) {
               return { message: error };
          }
     };

     const getAllManufacturers = async () => {
          try {
               const manufacturers = await fetchRows<ProductRecord>(['manufacturers'], { column: 'name', ascending: true });
               return manufacturers;
          } catch (error) {
               return { message: error };
          }
     };

     const getAllProducts = async () => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
               return products;
          } catch (error) {
               return { message: error };
          }
     };

     const getLastNumberOfProducts = async (numberOfProducts: number) => {
          try {
               const products = await fetchRows<ProductRecord>(['products']);
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