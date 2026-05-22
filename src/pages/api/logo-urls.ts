import { MongoClient, ObjectId } from 'mongodb';
import { generateSlug } from '@/utils/generate-slug';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!, {});
     const logoCollection = mongoClient.db('DAR_DB').collection('LogoURLs');

     try {
          if (request.method === 'GET') {
               const allLogos = await logoCollection.find({}).toArray();
               return response.status(200).json({ message: 'Logos found!', data: allLogos });
          }

          if (request.method === 'POST') {
               const { name, value, url } = request.body;
               if (!name) {
                    return response.status(400).json({ error: 'Missing name.' });
               }

               const finalValue = value || generateSlug(name);
               const insertResult = await logoCollection.insertOne({
                    name,
                    value: finalValue,
                    url: url || ''
               });
               const createdLogo = await logoCollection.findOne({ _id: insertResult.insertedId });
               return response.status(200).json({ message: 'Logo successfully created!', data: createdLogo });
          }

          if (request.method === 'PUT') {
               const { _id, name, value, url } = request.body;
               if (!_id) {
                    return response.status(400).json({ error: 'Missing _id.' });
               }

               const updatePayload: Record<string, string> = {};
               if (typeof name === 'string') updatePayload.name = name;
               if (typeof value === 'string') updatePayload.value = value;
               if (typeof url === 'string') updatePayload.url = url;

               if (Object.keys(updatePayload).length === 0) {
                    return response.status(400).json({ error: 'No fields to update.' });
               }

               const updateResult = await logoCollection.updateOne(
                    { _id: new ObjectId(_id) },
                    { $set: updatePayload }
               );

               if (updateResult.matchedCount === 0) {
                    return response.status(404).json({ error: 'Logo not found.' });
               }

               const updatedLogo = await logoCollection.findOne({ _id: new ObjectId(_id) });
               return response.status(200).json({ message: 'Logo successfully updated!', data: updatedLogo });
          }

          if (request.method === 'DELETE') {
               const { _id } = request.body;
               if (!_id) {
                    return response.status(400).json({ error: 'Missing _id.' });
               }

               const deleteResult = await logoCollection.deleteOne({ _id: new ObjectId(_id) });
               if (deleteResult.deletedCount === 0) {
                    return response.status(404).json({ error: 'Logo not found.' });
               }

               return response.status(200).json({ message: 'Logo successfully deleted!' });
          }

          return response.status(405).json({ error: 'Method not allowed!' });
     } catch (error) {
          return response.status(500).json({ error: 'Internal server error!' });
     } finally {
          await mongoClient.close();
     }
}