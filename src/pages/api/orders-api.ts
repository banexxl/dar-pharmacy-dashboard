import { MongoClient, ObjectId, Collection } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next/types';

type Logs = {
     id: ObjectId;
     message: string;
     createdAt: Date;
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
     // Ensure the method is PUT
     if (request.method !== 'PUT') {
          return response.status(405).json({ message: 'Only PUT requests are allowed' });
     }

     const { orderNumber, address, country, city, status } = request.body;

     console.log('request.body:', request.body);


     if (!status || !address || !country || !city) {
          return response.status(400).json({ message: 'Status, address, country, and city are required' });
     }

     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!, {});

     try {
          const db = mongoClient.db('ORDERS_DB');
          const ordersCollection = db.collection('Orders');

          // Create a new log entry
          const logEntry = {
               status: status,
               message: `Order location updated to ${address}, ${city}, ${country}`,
               createdAt: new Date(),
          };

          // Update the order's location and add a log entry using $set and $push operators
          const result = await ordersCollection.updateOne(
               { orderNumber: orderNumber },
               {
                    $set: { 'customer.streetAddress': address, 'customer.city': city, 'customer.country': country, 'status': status },
                    $push: { logs: logEntry } as any,
               }
          )

          if (result.modifiedCount === 0) {
               return response.status(404).json({ message: 'Order not found or not updated' });
          }

          return response.status(200).json({ message: 'Order updated successfully' });
     } catch (error: any) {
          console.error('Error updating order:', error);
          return response.status(500).json({ message: 'Internal server error' });
     } finally {
          await mongoClient.close();
     }
}
