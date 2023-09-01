import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

export const productsServices = () => {

          const getAllProducts = async () => {
                    const client = await MongoClient.connect(process.env.MONGODB_URI)

                    try {
                              const db = client.db('DAR_DB')
                              let data = await db.collection('Products').find({}).toArray()
                              return data
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          const getProductsForHomePage = async () => {

                    const client = await MongoClient.connect(process.env.MONGODB_URI)

                    try {
                              const db = client.db('DAR_DB')
                              let data = await db.collection('Products').find().toArray()
                              return data
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          const getAllLogos = async () => {

                    const client = await MongoClient.connect(process.env.MONGODB_URI)

                    try {
                              const db = client.db('DAR_DB')
                              let data = await db.collection('LogoURLs').find().toArray()
                              return data
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          const getProductById = async (_id) => {
                    const client = await MongoClient.connect(process.env.MONGODB_URI)
                    try {
                              const db = client.db('DAR_DB')
                              let product = await db.collection('Products').findOne({ _id: new ObjectId(_id) })
                              return product
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          const getProductsByManufacturer = async (manufacturer) => {
                    const client = await MongoClient.connect(process.env.MONGODB_URI)
                    try {
                              const db = client.db('DAR_DB')
                              let products = await db.collection('Products').find({ "manufacturer": `${ manufacturer }` }).toArray()
                              return products
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          const getProductsByNameAndOrManufacturer = async (searchTerm) => {

                    const searchTermArray = searchTerm.split(" ")

                    const client = await MongoClient.connect(process.env.MONGODB_URI)
                    try {
                              const db = client.db('DAR_DB')
                              let products = await db.collection('Products')
                                        .find({
                                                  $or: [
                                                            { "name": { $regex: `${ searchTermArray[0] }`, $options: 'i' } },
                                                            { "manufacturer": { $regex: `${ searchTermArray[0] }`, $options: 'i' } },
                                                            { "name": { $regex: `${ searchTermArray[1] }`, $options: 'i' } },
                                                            { "manufacturer": { $regex: `${ searchTermArray[1] }`, $options: 'i' } },
                                                  ]
                                        }
                                        ).toArray()

                              return products
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          const getProductsByDiscount = async () => {
                    const client = await MongoClient.connect(process.env.MONGODB_URI)
                    try {
                              const db = client.db('DAR_DB')
                              let products = await db.collection('Products').find({ discount: true }).toArray()

                              return products
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          const getProductsByMainCategory = async (mainCategory) => {

                    const client = await MongoClient.connect(process.env.MONGODB_URI)
                    try {
                              const db = client.db('DAR_DB')
                              let products = await db.collection('Products').find({ mainCategory: `${ mainCategory }` }).toArray()
                              return products
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          const getProductsByMainCategoryMidCategory = async (mainCategory, midCategory) => {

                    const client = await MongoClient.connect(process.env.MONGODB_URI)
                    try {
                              const db = client.db('DAR_DB')
                              let products = await db.collection('Products').find({ mainCategory: mainCategory, midCategory: midCategory }).toArray()
                              return products
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          const getProductsByMainCategoryMidCategorySubCategory = async (mainCategory, midCategory, subCategory) => {
                    const client = await MongoClient.connect(process.env.MONGODB_URI)
                    try {
                              const db = client.db('DAR_DB')
                              let products = await db.collection('Products').find({ mainCategory: mainCategory, midCategory: midCategory, subCategory: subCategory }).toArray()
                              return products
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          const getAllManufacturers = async () => {
                    const client = await MongoClient.connect(process.env.MONGODB_URI)

                    try {
                              await client.connect();
                              const db = client.db('DAR_DB');
                              const productsCollection = db.collection('Products');

                              const manufacturers = await new Promise((resolve, reject) => {
                                        productsCollection.distinct("manufacturer", (error, manufacturers) => {
                                                  if (error) {
                                                            reject(error);
                                                  } else {
                                                            resolve(manufacturers);
                                                  }
                                        });
                              });
                              return manufacturers;
                    } catch (error) {
                              return { message: error };
                    } finally {
                              client.close();
                    }
          }


          return {
                    getAllProducts,
                    getProductsForHomePage,
                    getProductById,
                    getProductsByNameAndOrManufacturer,
                    getProductsByManufacturer,
                    getProductsByDiscount,
                    getProductsByMainCategory,
                    getProductsByMainCategoryMidCategory,
                    getProductsByMainCategoryMidCategorySubCategory,
                    getAllLogos,
                    getAllManufacturers
          }
}