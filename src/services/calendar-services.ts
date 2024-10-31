import { CalendarEvent } from "@/schemas/calendar";
import { MongoClient, ObjectId } from "mongodb"

export const CalendarServices = () => {

     const addCalendarEvent = async (data: CalendarEvent) => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const database = client.db('DAR_DB');
               const collection = database.collection('Calendar');
               const result = await collection.insertOne({
                    ...data,
                    start: new Date(data.start),
                    end: new Date(data.end),
                    _id: new ObjectId(data._id)
               });
               return result
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close()
          }
     }

     const updateCalendarEvent = async (_id: string, data: CalendarEvent) => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const database = client.db('DAR_DB');
               const collection = database.collection('Calendar');
               const result = await collection.updateOne({ _id: new ObjectId(_id) }, {
                    $set: {
                         ...data,
                         start: new Date(data.start),
                         end: new Date(data.end)
                    }
               });

               return result
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close()
          }
     }

     const deleteCalendarEvent = async (_id: string) => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const database = client.db('DAR_DB');
               const collection = database.collection('Calendar');
               const result = await collection.deleteOne({ _id: new ObjectId(_id) });
               return result
          } catch (error) {
               return { message: error }
          }
          finally {
               await client.close()
          }
     }

     const getCalendarEvents = async () => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const database = client.db('DAR_DB');
               const collection = database.collection('Calendar');
               const result = await collection.find().toArray();
               return result
          } catch (error) {
               return { status: false, message: error }
          }
          finally {
               await client.close()
          }

     }

     return {
          addCalendarEvent,
          updateCalendarEvent,
          deleteCalendarEvent,
          getCalendarEvents
     }
}