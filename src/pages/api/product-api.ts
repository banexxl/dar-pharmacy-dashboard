import { MongoClient, ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { UTApi } from 'uploadthing/server';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!, {});
     const dbProducts = mongoClient.db('DAR_DB').collection('Products');

     try {
          if (request.method === 'GET') {
               const allProducts = await dbProducts.find({}).toArray();
               return response.status(200).json({ message: 'Products found!', data: allProducts });
          } else if (request.method === 'POST') {
               const newProduct = {
                    ...request.body,
                    updatedAt: new Date() // Set updatedAt to the current date and time
               };
               await dbProducts.insertOne(newProduct);
               return response.status(200).json({ message: 'Product successfully added!' });
          } else if (request.method === 'DELETE') {
               try {
                    const newUrl = request.body.imageID.substring(request.body.imageID.lastIndexOf('/') + 1);
                    const utapi = new UTApi();
                    await utapi.deleteFiles(newUrl);

                    await dbProducts.deleteOne({ _id: new ObjectId(request.body.currentProductID) });
                    return response.status(200).json({ message: 'Product successfully deleted!' });
               } catch (error) {
                    return response.status(500).json({ error: 'Error deleting product.' });
               }
          } else if (request.method === 'PUT') {
               try {
                    await dbProducts.findOneAndUpdate(
                         { _id: new ObjectId(request.body._id) },
                         {
                              $set: {
                                   bestSeller: request.body.bestSeller,
                                   description: request.body.description,
                                   discount: request.body.discount,
                                   discountAmount: request.body.discountAmount,
                                   availableStock: request.body.availableStock,
                                   imageURL: request.body.imageURL,
                                   ingredients: request.body.ingredients,
                                   instructions: request.body.instructions,
                                   mainCategory: request.body.mainCategory,
                                   manufacturer: request.body.manufacturer,
                                   manufacturerURL: request.body.manufacturerURL,
                                   midCategory: request.body.midCategory,
                                   name: request.body.name,
                                   newArrival: request.body.newArrival,
                                   isActive: request.body.isActive,
                                   price: request.body.price,
                                   quantity: request.body.quantity,
                                   quantityUnit: request.body.quantityUnit,
                                   subCategory: request.body.subCategory,
                                   warning: request.body.warning,
                                   updatedAt: new Date() // Update the updatedAt field to the current date and time
                              }
                         }
                    );
                    return response.status(200).json({ message: 'Product successfully updated!' });
               } catch (error) {
                    return response.status(500).json({ error: 'Error updating product.' });
               }
          } else {
               return response.status(405).json({ error: 'Method not allowed!' });
          }
     } catch (error) {
          return response.status(500).json({ error: 'Internal server error!' });
     } finally {
          await mongoClient.close();
     }
}
