import { generateSlug } from '@/utils/generate-slug';
import { MongoClient, ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!, {});
     const dbProducts = mongoClient.db('DAR_DB').collection('Products');

     try {
          if (request.method === 'GET') {
               const allProducts = await dbProducts.find({}).toArray();
               return response.status(200).json({ message: 'Products found!', data: allProducts });
          } else if (request.method === 'POST') {
               const slug = generateSlug(request.body.name);
               const newProduct = {
                    ...request.body,
                    displayOnHome: Boolean(request.body.displayOnHome),
                    slug: slug,
                    updatedAt: new Date() // Set updatedAt to the current date and time
               };
               await dbProducts.insertOne(newProduct);
               return response.status(200).json({ message: 'Product successfully added!' });
          } else if (request.method === 'DELETE') {
               try {
                    const newUrl = request.body.imageID.substring(request.body.imageID.lastIndexOf('/') + 1);
                    await dbProducts.deleteOne({ _id: new ObjectId(request.body.currentProductID) });
                    return response.status(200).json({ message: 'Product successfully deleted!' });
               } catch (error) {
                    return response.status(500).json({ error: 'Error deleting product.' });
               }
          } else if (request.method === 'PUT') {
               const slug = generateSlug(request.body.name);
               const rawId = request.body._id;
               const idFilter = ObjectId.isValid(rawId)
                    ? { $or: [{ _id: new ObjectId(rawId) }, { _id: rawId }] }
                    : { _id: rawId };
               try {
                    const updatePayload = {
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
                         displayOnHome: Boolean(request.body.displayOnHome),
                         price: request.body.price,
                         quantity: request.body.quantity,
                         quantityUnit: request.body.quantityUnit,
                         subCategory: request.body.subCategory,
                         warning: request.body.warning,
                         updatedAt: new Date(), // Update the updatedAt field to the current date and time
                         promotionText: request.body.promotionText,
                         promoting: request.body.promoting,
                         slug: slug
                    };

                    let updateResult = await dbProducts.updateOne(idFilter, { $set: updatePayload });

                    if (updateResult.matchedCount === 0 && request.body.slug) {
                         updateResult = await dbProducts.updateOne(
                              { slug: request.body.slug },
                              { $set: updatePayload }
                         );
                    }

                    if (updateResult.matchedCount === 0) {
                         return response.status(404).json({ error: 'Product not found.' });
                    }

                    const updatedProduct = await dbProducts.findOne(idFilter);
                    const responseProduct = updatedProduct || (request.body.slug ? await dbProducts.findOne({ slug: request.body.slug }) : null);
                    await response.revalidate('/dashboard/artikli');
                    return response.status(200).json({ message: 'Product successfully updated!', data: responseProduct });
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