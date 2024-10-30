import { Contact } from '@/schemas/chat';
import { MongoClient, ObjectId } from 'mongodb';

export const ChatService = () => {
     const client = new MongoClient(process.env.MONGODB_URI!);

     const getContacts = async (searchQuery: string): Promise<Contact[]> => {
          const database = client.db('ACCOUNTS_DB');
          const accountsCollection = database.collection('Accounts');
          const searchFilter = searchQuery ? { name: { $regex: searchQuery, $options: 'i' } } : {};
          const contactList = await accountsCollection.find(searchFilter).toArray();
          return contactList.map((contact) => ({
               id: contact._id.toString(),
               avatar: contact.avatar,
               isActive: contact.isActive,
               lastActivity: contact.lastActivity,
               name: contact.name,
          })) as Contact[];
     };


     const getThreads = async () => {
          const db = client.db('DAR_DB'); // Use your actual chat database name
          const collection = db.collection('Threads');
          return await collection.find({}).toArray();
     };

     const getThreadById = async (threadId: string) => {
          const db = client.db('DAR_DB');
          const collection = db.collection('Threads');
          return await collection.findOne({ _id: new ObjectId(threadId) });
     };

     const markThreadAsSeen = async (threadId: string) => {
          const db = client.db('DAR_DB');
          const collection = db.collection('Threads');
          await collection.updateOne({ _id: new ObjectId(threadId) }, { $set: { unreadCount: 0 } });
          return true;
     };

     const addMessage = async (threadId: string | undefined, recipientIds: string[] | undefined, body: string) => {
          const db = client.db('DAR_DB');
          const threadsCollection = db.collection('Threads');
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

     const getParticipants = async (threadId: string) => {
          const db = client.db('DAR_DB');
          const threadsCollection = db.collection('Threads');
          const thread = await threadsCollection.findOne({ _id: new ObjectId(threadId) });
          if (!thread) throw new Error('Invalid thread ID');
          return thread.participantIds;
     };

     return {
          getContacts,
          getThreads,
          getThreadById,
          markThreadAsSeen,
          addMessage,
          getParticipants
     };
};
