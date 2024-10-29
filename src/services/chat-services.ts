import { MongoClient, ObjectId } from 'mongodb';

export const ChatService = () => {
     const client = new MongoClient(process.env.MONGODB_URI!);

     const getContacts = async (query: string) => {
          const db = client.db('ACCOUNTS_DB');
          const collection = db.collection('Accounts');
          const filter = query ? { name: { $regex: query, $options: 'i' } } : {};
          return await collection.find(filter).toArray();
     };

     const getThreads = async () => {
          const db = client.db('CHAT_DB'); // Use your actual chat database name
          const collection = db.collection('threads');
          return await collection.find({}).toArray();
     };

     const getThreadById = async (threadId: string) => {
          const db = client.db('CHAT_DB');
          const collection = db.collection('threads');
          return await collection.findOne({ _id: new ObjectId(threadId) });
     };

     const markThreadAsSeen = async (threadId: string) => {
          const db = client.db('CHAT_DB');
          const collection = db.collection('threads');
          await collection.updateOne({ _id: new ObjectId(threadId) }, { $set: { unreadCount: 0 } });
          return true;
     };

     const addMessage = async (threadId: string | undefined, recipientIds: string[] | undefined, body: string) => {
          const db = client.db('CHAT_DB');
          const threadsCollection = db.collection('threads');
          let thread;

          if (threadId) {
               thread = await threadsCollection.findOne({ _id: new ObjectId(threadId) });
               if (!thread) throw new Error('Invalid thread ID');
          } else if (recipientIds) {
               thread = await threadsCollection.findOne({ participantIds: { $all: recipientIds } });
               if (!thread) {
                    const newThread = {
                         participantIds: recipientIds,
                         messages: [],
                         unreadCount: 0,
                         createdAt: new Date(),
                    };
                    const result = await threadsCollection.insertOne(newThread);
                    threadId = result.insertedId.toString();
               }
          } else {
               throw new Error('Thread ID or recipient IDs must be provided');
          }

          const message = {
               body,
               createdAt: new Date(),
               authorId: 'mockUserId', // Replace with actual user ID
               attachments: [],
          };

          await threadsCollection.updateOne(
               { _id: new ObjectId(threadId) },
               { $push: { messages: message } as any }
          );

          return { threadId, message };
     };

     return {
          getContacts,
          getThreads,
          getThreadById,
          markThreadAsSeen,
          addMessage,
     };
};
