import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

type User = {
     _id: any;
     email: string;
     // other user properties
};

type GetUserByEmailResult = User | null;

export const userServices = () => {

     const getUsersByPage = async (page: number, limit: any) => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          const parsedLimit = parseInt(limit, 10); // Parse limit as an integer

          if (isNaN(parsedLimit) || parsedLimit <= 0) {
               // Handle the case when the parsed limit is not a valid positive integer
               return [];
          }

          try {
               const skip = page * limit;
               const database = client.db('ACCOUNTS_DB');
               const collection = database.collection('Users');
               const users = await collection
                    .find({})
                    .skip(skip)
                    .limit(parsedLimit)
                    .toArray();
               return users;
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close();
          }
     }

     const getUserByEmailAndRole = async (email: string, role: string): Promise<GetUserByEmailResult> => {

          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();
               const database = client.db('ACCOUNTS_DB');
               const collection = await database.collection('Accounts').find({ email: email, role: role }).toArray();
               const user = collection[0] as User;
               return user;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return null; // Return false or handle the error accordingly
          } finally {
               await client.close(); // Ensure the client is closed after operation
          }
     }

     const getUsersCount = async () => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();
               const database = client.db('ACCOUNTS_DB');
               const collection = await database.collection('users').find({}).toArray();
               return collection.length;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return 0; // Return false or handle the error accordingly
          } finally {
               await client.close(); // Ensure the client is closed after operation
          }
     }

     const getAllUsers = async () => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();
               const database = client.db('ACCOUNTS_DB');
               const collection = await database.collection('Users').find({}).toArray();
               return collection;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return 0; // Return false or handle the error accordingly
          } finally {
               await client.close(); // Ensure the client is closed after operation
          }
     }

     const getUsersActiveInWeek = async (weekOffset: number) => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();
               const database = client.db('ACCOUNTS_DB');

               // Get current date
               const now = new Date();

               // Calculate the start and end of the target week
               const startOfWeek = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - now.getDay() + weekOffset * 7 // Calculate the start of the week with the offset
               );
               const endOfWeek = new Date(startOfWeek);
               endOfWeek.setDate(startOfWeek.getDate() + 7); // End of the week is 7 days after the start

               // Fetch users whose 'emailVerified' date is within the date range
               const activeUsers = await database.collection('Users').find({
                    emailVerified: {
                         $gte: startOfWeek,
                         $lt: endOfWeek
                    }
               }).toArray();

               return activeUsers; // Return the count of active users
          } catch (error: any) {
               console.error('Error while fetching active users count:', error);
               return 0; // Handle the error accordingly
          } finally {
               await client.close(); // Ensure the client is closed after operation
          }
     };


     return {
          getUsersActiveInWeek,
          getAllUsers,
          getUsersByPage,
          getUserByEmailAndRole,
          getUsersCount
     }
}