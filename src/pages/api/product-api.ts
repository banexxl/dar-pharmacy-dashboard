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
                              //const idsToDelete = request.body.selected.map((_id: any) => new ObjectId(_id))
                              console.log(request.body);
                              try {
                                        await dbProducts.deleteOne({ _id: new ObjectId(request.body) })
                                        return response.status(200).json({ message: 'Product successfully deleted!' });
                              } catch (error) {
                                        console.log(error);
                              }
                    }
                    else if (request.method === 'PUT') {
                              //const idsToDelete = request.body.selected.map((_id: any) => new ObjectId(_id))
                              console.log(request.body);
                              try {
                                        await dbProducts.findOneAndUpdate({ _id: new ObjectId(request.body._id) },
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
                                                                      midCategory: request.body.midCategory,
                                                                      name: request.body.name,
                                                                      newArrival: request.body.newArrival,
                                                                      price: request.body.price,
                                                                      quantity: request.body.quantity,
                                                                      subCategory: request.body.subCategory,
                                                                      warning: request.body.warning
                                                            }
                                                  })
                                        return response.status(200).json({ message: 'Product successfully updated!' });
                              } catch (error) {
                                        console.log(error);
                              }
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


