import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

type User = {
     _id: any;
     email: string;
     // other user properties
};

type GetUserByEmailResult = User | null;

export const userServices = () => {

     const getAllUsers = async () => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const db = client.db('DAR_DB')
               let data = await db.collection('Admins').find({}).toArray()
               return data
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getUserByEmail = async (email: string): Promise<GetUserByEmailResult> => {

          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();
               const database = client.db('DAR_DB');
               const collection = await database.collection('Admins').find({ email: email }).toArray();
               const user = collection[0] as User;
               return user;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return null; // Return false or handle the error accordingly
          } finally {
               await client.close(); // Ensure the client is closed after operation
          }
     }

     return {
          getAllUsers,
          getUserByEmail
     }
}