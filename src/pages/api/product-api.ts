import { MongoClient, ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

          // const mongoClient = await clientPromise;
          const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!, {})
          const dbProducts = mongoClient.db('DAR_DB').collection('Products')

          try {
                    if (request.method === 'GET') {

                              // const page = parseInt(request.query.page as string) // Explicit casting to string
                              // const rowsPerPage = parseInt(request.query.rowsPerPage as string)
                              // const sortBy = request.query.sortBy as string | undefined; // Explicit casting to string or undefined
                              // const sortDir = request.query.sortDir as string | undefined; // Explicit casting to string or undefined
                              // const skip = page * rowsPerPage
                              // const sortOrder = sortDir === 'desc' ? -1 : 1; // Descending (-1) or Ascending (1)

                              // const allTenants = await dbTenants
                              //           .find({})
                              //           .limit(rowsPerPage)
                              //           .sort({ sortBy: sortOrder })
                              //           .skip(skip)
                              //           .toArray();

                              // const totalCount = allTenants.length

                              // return response.status(200).json({ message: 'Customers found!', data: allTenants, totalCount });

                    } else if (request.method === 'POST') {
                              const newProduct = request.body
                              await dbProducts.insertOne(newProduct)
                              return response.status(200).json({ message: 'Product successfully added!' });
                    }
                    else if (request.method === 'DELETE') {
                              const idsToDelete = request.body.selected.map((_id: any) => new ObjectId(_id))
                              console.log(idsToDelete);

                              await dbProducts.deleteMany({ _id: { $in: idsToDelete } })
                              return response.status(200).json({ message: 'Product successfully deleted!' });
                    }
                    else {
                              return response.status(405).json({ error: 'Method not allowed!' });
                    }
          } catch (error) {
                    return response.status(500).json({ error: 'Internal server error!' });
          } finally {
                    await mongoClient.close();
          }
}


