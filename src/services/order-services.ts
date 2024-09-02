import { Order } from "@/schemas/order";
import { stat } from "fs";
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

     const getOrderById = async (orderNumber: string) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('ORDERS_DB')
               let order = await db.collection('Orders').findOne({ orderNumber: orderNumber })
               console.log(order);
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

     const getSumOfAllOrders = async (): Promise<number | { message: string }> => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!);

          try {
               const db = client.db('ORDERS_DB');
               const result = await db.collection('Orders').aggregate([
                    {
                         $group: {
                              _id: null, // Group all documents together
                              status: {
                                   $ne: 'cancelled'
                              },
                              total: { $sum: '$total' }, // Sum up the 'total' field
                         },
                    },
               ]).toArray();

               const sum = result[0]?.total || 0; // If no documents found, return 0
               return sum;
          } catch (error) {
               return { message: (error as Error).message };
          } finally {
               await client.close();
          }
     };

     const getSumOfLastMonthsOrders = async (months: number): Promise<number | { message: string }> => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!);

          try {
               const db = client.db('ORDERS_DB');
               const result = await db.collection('Orders').aggregate([
                    {
                         $match: {
                              createdAt: {
                                   $gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
                                   $lt: new Date(),
                              },
                              // Match only documents that doesn't have the 'cancelled' status
                              status: {
                                   $ne: 'cancelled'
                              }
                         },
                    },
                    {
                         $group: {
                              _id: null,
                              total: { $sum: '$total' },
                         },
                    },
               ]).toArray();

               const sum = result[0]?.total || 0;
               return sum;
          } catch (error) {
               return { message: (error as Error).message };
          } finally {
               await client.close();
          }
     }

     const getSumOfLastMonthOrders = async (): Promise<number | { message: string }> => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!);

          try {
               const db = client.db('ORDERS_DB');
               const ordersCollection = db.collection('Orders');

               // Get the current date
               const now = new Date();

               // Calculate the start and end of the last month
               const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 1st day of the previous month
               const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999); // Last day of the previous month

               // Aggregation pipeline to filter and sum
               const result = await ordersCollection.aggregate([
                    {
                         $match: {
                              createdAt: {
                                   $gte: startOfLastMonth,
                                   $lte: endOfLastMonth,
                              },
                              // Match only documents that doesn't have the 'cancelled' status
                              status: {
                                   $ne: 'cancelled'
                              }
                         },
                    },
                    {
                         $group: {
                              _id: null, // Group all documents together
                              total: { $sum: '$total' }, // Sum up the 'total' field
                         },
                    },
               ]).toArray();

               const sum = result[0]?.total || 0; // If no documents found, return 0
               return sum;
          } catch (error) {
               return { message: (error as Error).message };
          } finally {
               await client.close();
          }
     };

     const getSumOfCurrentMonthOrders = async (): Promise<number | { message: string }> => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!);

          try {
               const db = client.db('ORDERS_DB');
               const ordersCollection = db.collection('Orders');

               // Get the current date
               const now = new Date();

               // Calculate the start of the current month and the current date/time
               const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1); // 1st day of the current month
               const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of the current month

               // Aggregation pipeline to filter and sum
               const result = await ordersCollection.aggregate([
                    {
                         $match: {
                              createdAt: {
                                   $gte: startOfCurrentMonth,
                                   $lte: endOfCurrentMonth,
                              },
                              // Match only documents that doesn't have the 'cancelled' status
                              status: {
                                   $ne: 'cancelled'
                              }
                         },
                    },
                    {
                         $group: {
                              _id: null, // Group all documents together
                              total: { $sum: '$total' }, // Sum up the 'total' field
                         },
                    },
               ]).toArray();

               const sum = result[0]?.total || 0; // If no documents found, return 0
               return sum;
          } catch (error) {
               return { message: (error as Error).message };
          } finally {
               await client.close();
          }
     };

     const getLastNumberOfOrders = async (numberOfOrders: number) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!);
          try {
               const db = client.db('ORDERS_DB');
               const orders = await db
                    .collection('Orders')
                    .find()
                    .sort({ createdAt: -1 })  // Sort by updatedAt in descending order
                    .limit(numberOfOrders)
                    .toArray();
               return orders;
          } catch (error) {
               return { message: (error as Error).message };
          } finally {
               await client.close();
          }
     };

     const getMonthlyOrderSumsForYear = async (yearOffset: number) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!);
          try {
               const db = client.db('ORDERS_DB');
               const currentYear = new Date().getFullYear();
               const targetYear = currentYear + yearOffset; // If yearOffset is 0, it's the current year; if -1, it's the last year, etc.

               const monthlySums = await db.collection('Orders').aggregate([
                    {
                         $match: {
                              // Match only documents from the target year
                              createdAt: {
                                   $gte: new Date(`${targetYear}-01-01`),
                                   $lt: new Date(`${targetYear + 1}-01-01`)
                              },
                              // Match only documents that doesn't have the 'cancelled' status
                              status: {
                                   $ne: 'cancelled'
                              }
                         }
                    },
                    {
                         $group: {
                              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, // Group by year and month
                              total: { $sum: "$total" } // Calculate the sum of 'total' for each group
                         }
                    },
                    {
                         $sort: { "_id.month": 1 } // Sort by month in ascending order
                    },
                    {
                         $project: {
                              _id: 0, // Exclude the _id field from the output
                              year: "$_id.year",
                              month: "$_id.month",
                              total: 1
                         }
                    },
                    {
                         $group: {
                              _id: "$year",
                              months: { $push: { month: "$month", total: "$total" } }
                         }
                    },
                    {
                         $addFields: {
                              months: {
                                   $map: {
                                        input: { $range: [1, 13] }, // Generate an array [1, 2, ..., 12] for all months
                                        as: "month",
                                        in: {
                                             month: "$$month",
                                             total: {
                                                  $let: {
                                                       vars: {
                                                            foundMonth: {
                                                                 $arrayElemAt: [
                                                                      {
                                                                           $filter: {
                                                                                input: "$months",
                                                                                as: "m",
                                                                                cond: { $eq: ["$$m.month", "$$month"] }
                                                                           }
                                                                      },
                                                                      0
                                                                 ]
                                                            }
                                                       },
                                                       in: { $ifNull: ["$$foundMonth.total", 0] } // If no orders are found for the month, return 0
                                                  }
                                             }
                                        }
                                   }
                              }
                         }
                    },
                    {
                         $unwind: "$months"
                    },
                    {
                         $replaceRoot: { newRoot: "$months" }
                    }
               ]).toArray();

               return monthlySums;
          } catch (error) {
               return { message: (error as Error).message };
          } finally {
               await client.close();
          }
     };


     return {
          getMonthlyOrderSumsForYear,
          getLastNumberOfOrders,
          getSumOfCurrentMonthOrders,
          getSumOfLastMonthOrders,
          getSumOfLastMonthsOrders,
          getSumOfAllOrders,
          getAllOrders,
          getOrdersByPage,
          getOrdersCount,
          getOrderById,

     }
}