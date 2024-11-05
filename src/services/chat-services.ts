import { Contact, Message, Thread } from '@/schemas/chat';
import { createResourceId } from '@/utils/create-resource-id';
import { id } from 'date-fns/locale';
import { MongoClient, ObjectId } from 'mongodb';

export const ChatService = () => {
     const getContact = async (searchQuery: string): Promise<Contact[]> => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          const database = client.db('ACCOUNTS_DB');
          const accountsCollection = database.collection('Accounts');
          const searchFilter = searchQuery ? { name: { $regex: searchQuery, $options: 'i' } } : {};
          const contactList = await accountsCollection.find(searchFilter).toArray();

          return contactList.map((contact) => ({
               _id: contact._id.toString(),
               avatar: contact.avatar,
               isActive: contact.isActive,
               lastActivity: contact.lastActivity,
               name: contact.name,
          })) as Contact[];

     };

     const getAllContacts = async (): Promise<Contact[]> => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          const database = client.db('ACCOUNTS_DB');
          const accountsCollection = database.collection('Accounts');
          const contactList = await accountsCollection.find().toArray();
          return contactList.map((contact) => ({
               _id: contact._id.toString(),
               avatar: contact.avatar,
               isActive: contact.isActive,
               lastActivity: contact.lastActivity,
               name: contact.name,
          })) as Contact[];
     };

     const getThreads = async (): Promise<Thread[]> => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          const db = client.db('DAR_DB'); // Use your actual chat database name
          const collection = db.collection('Threads');
          const threads = await collection.find().toArray();
          return threads.map((thread: any) => ({
               _id: thread._id.toString(),
               messages: thread.messages,
               participantIds: thread.participantIds,
               participants: thread.participants,
               unreadCount: thread.unreadCount,
               type: thread.type
          }))
     }

     const getThreadById = async (threadId: string) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          const db = client.db('DAR_DB');
          const collection = db.collection('Threads');
          const thread = await collection.findOne({ _id: new ObjectId(threadId) });
          if (!thread) {
               //return not found
               return null;
          }
          return thread;
     };

     const markThreadAsSeen = async (threadId: string) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          const db = client.db('DAR_DB');
          const collection = db.collection('Threads');
          const response = await collection.updateOne({ _id: new ObjectId(threadId) }, { $set: { unreadCount: 0 } });
          if (response.modifiedCount === 0) return false;
          return true;
     };

     const addMessage = async (
          senderId: string,
          threadId: string,
          recipientIds: string[],
          body: string
     ) => {
          console.log(senderId, threadId, recipientIds, body);

          // Establish a MongoDB client connection
          const client = await MongoClient.connect(process.env.MONGODB_URI!);
          const db = client.db('DAR_DB');
          const threadsCollection = db.collection('Threads');
          const dbAccounts = client.db('ACCOUNTS_DB');
          const accountsCollection = dbAccounts.collection('Accounts');

          let thread;

          // Check if `threadId` is provided and find the thread
          if (threadId) {
               thread = await threadsCollection.findOne({ _id: new ObjectId(threadId) });
               if (!thread) throw new Error('Invalid thread ID');
          }

          // If `threadId` is not provided or no thread was found, check `recipientIds` to find or create a thread
          if (!thread) {
               const type = recipientIds.length === 1 ? 'ONE_TO_ONE' : 'GROUP';
               const newThread = {
                    participantIds: recipientIds.concat([senderId]),
                    messages: [],
                    unreadCount: 0,
                    participants: [],
                    type,
                    participantsReadMessage: [], // Initialize empty
               };

               const result = await threadsCollection.insertOne(newThread);
               threadId = result.insertedId.toString();
               thread = { _id: result.insertedId.toString(), ...newThread };
          }

          // Fetch participant details from the `Accounts` collection
          const participantIds = thread.participantIds;
          const participants = await accountsCollection
               .find({ _id: { $in: participantIds.map((id: string) => new ObjectId(id)) } })
               .toArray();

          // Construct the message object
          const message: Message = {
               id: createResourceId(),
               body,
               createdAt: new Date().toISOString(),
               authorId: senderId,
               attachments: [],
               contentType: 'text',
          };

          // Update the thread by adding the new message
          await threadsCollection.updateOne(
               { _id: new ObjectId(thread._id) },
               {
                    $push: { messages: message } as any,
                    $set: {
                         // Update `participantsReadMessage` to only contain the recipients
                         participantsReadMessage: recipientIds || [],
                         participants, // Add participants array to the thread
                    },
               }
          );

          // Close the MongoDB client connection
          await client.close();

          return { threadId: thread._id!.toString(), message };
     };

     const getParticipants = async (threadId: string) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          const db = client.db('DAR_DB');
          const threadsCollection = db.collection('Threads');
          const thread = await threadsCollection.findOne({ _id: new ObjectId(threadId) });
          if (!thread) throw new Error('Invalid thread ID');
          return thread.participantIds;
     };

     return {
          getContact,
          getThreads,
          getThreadById,
          markThreadAsSeen,
          addMessage,
          getParticipants,
          getAllContacts
     };
};
