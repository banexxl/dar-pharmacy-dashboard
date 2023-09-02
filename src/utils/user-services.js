import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

export const userServices = () => {

          const getAllUsers = async () => {
                    const client = await MongoClient.connect(process.env.MONGODB_PROD_USERS_URI)

                    try {
                              const db = client.db('ProdUsers')
                              let data = await db.collection('users').find({}).toArray()
                              return data
                    } catch (error) {
                              return { message: error.message }
                    }
                    finally {
                              await client.close();
                    }
          }

          return {
                    getAllUsers,
          }
}