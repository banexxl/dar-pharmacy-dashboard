import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

export const productsServices = () => {

     const getProductsByPage = async (page: any, limit: any) => {

          const client = new MongoClient(process.env.MONGODB_URI!)
          const db = client.db('DAR_DB');
          const parsedLimit = parseInt(limit, 10); // Parse limit as an integer

          if (isNaN(parsedLimit) || parsedLimit <= 0) {
               // Handle the case when the parsed limit is not a valid positive integer
               return [];
          }

          try {
               const skip = page * parsedLimit;
               const data = await db.collection('Products')
                    .find({})
                    .skip(skip)
                    .limit(parsedLimit)
                    .toArray();
               return data;
          } catch (error) {
               return { message: error };
          } finally {
               await client.close();
          }
     };

     const getProductsCount = async () => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();
               const database = client.db('DAR_DB');
               const collection = database.collection('Products');

               // Use countDocuments to get the count of all documents in the collection
               const count = await collection.countDocuments();

               return count;
          } catch (error) {
               console.error('Error while fetching count:', error);
               return -1; // Return -1 or handle the error accordingly
          } finally {
               await client.close();
          }
     }

     const getProductsForHomePage = async () => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const db = client.db('DAR_DB')
               let data = await db.collection('Products').find({ displayOnHome: true }).toArray()
               return data
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getProductById = async (_id: string) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('DAR_DB')
               let product = await db.collection('Products').findOne({ _id: new ObjectId(_id) })
               return product
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getProductsByManufacturer = async (manufacturer: string) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('DAR_DB')
               let products = await db.collection('Products').find({ "manufacturer": `${manufacturer}` }).toArray()
               return products
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getProductsByNameAndOrManufacturer = async (searchTerm: string) => {

          const searchTermArray = searchTerm.split(" ")

          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('DAR_DB')
               let products = await db.collection('Products')
                    .find({
                         $or: [
                              { "name": { $regex: `${searchTermArray[0]}`, $options: 'i' } },
                              { "manufacturer": { $regex: `${searchTermArray[0]}`, $options: 'i' } },
                              { "name": { $regex: `${searchTermArray[1]}`, $options: 'i' } },
                              { "manufacturer": { $regex: `${searchTermArray[1]}`, $options: 'i' } },
                         ]
                    }
                    ).toArray()

               return products
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getProductsByDiscount = async () => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('DAR_DB')
               let products = await db.collection('Products').find({ discount: true }).toArray()

               return products
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getProductsByMainCategory = async (mainCategory: string) => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('DAR_DB')
               let products = await db.collection('Products').find({ mainCategory: `${mainCategory}` }).toArray()
               return products
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getProductsByMainCategoryMidCategory = async (mainCategory: string, midCategory: string) => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('DAR_DB')
               let products = await db.collection('Products').find({ mainCategory: mainCategory, midCategory: midCategory }).toArray()
               return products
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getProductsByMainCategoryMidCategorySubCategory = async (mainCategory: string, midCategory: string, subCategory: string) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('DAR_DB')
               let products = await db.collection('Products').find({ mainCategory: mainCategory, midCategory: midCategory, subCategory: subCategory }).toArray()
               return products
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getAllManufacturers = async () => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const db = client.db('DAR_DB');
               const manufacturers = await db
                    .collection('Manufacturers')
                    .find()
                    .sort({ name: 1 })
                    .toArray();
               return manufacturers;
          } catch (error) {
               return { message: error };
          } finally {
               await client.close();
          }
     }

     const getAllProducts = async () => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const db = client.db('DAR_DB')
               let products = await db.collection('Products').find().toArray()
               return products
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getLastNumberOfProducts = async (numberOfProducts: number) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!);
          try {
               const db = client.db('DAR_DB');
               const products = await db
                    .collection('Products')
                    .find()
                    .sort({ updatedAt: -1 })  // Sort by updatedAt in descending order
                    .limit(numberOfProducts)
                    .toArray();
               return products;
          } catch (error) {
               return { message: (error as Error).message };
          } finally {
               await client.close();
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
          getAllManufacturers
     }
}