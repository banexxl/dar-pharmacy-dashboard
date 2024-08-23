import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

export const ordersServices = () => {

     const getOrdersByPage = async (page: any, limit: any) => {

          const client = new MongoClient(process.env.MONGODB_URI!)
          const db = client.db('ORDERS_DB');
          const parsedLimit = parseInt(limit, 10); // Parse limit as an integer

          if (isNaN(parsedLimit) || parsedLimit <= 0) {
               // Handle the case when the parsed limit is not a valid positive integer
               return [];
          }

          try {
               const skip = page * parsedLimit;
               const data = await db.collection('Orders')
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

     const getOrdersCount = async () => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();
               const database = client.db('ORDERS_DB');
               const collection = database.collection('Orders');

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

     const getOrderById = async (_id: string) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('ORDERS_DB')
               let order = await db.collection('Orders').findOne({ _id: new ObjectId(_id) })
               return order
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getAllOrders = async () => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const db = client.db('ORDERS_DB')
               let orders = await db.collection('Orders').find().toArray()
               return orders
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }


     return {
          getAllOrders,
          getOrdersByPage,
          getOrdersCount,
          getOrderById,

     }
}