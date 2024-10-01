import type { Board, CheckItem, Checklist, Column, Comment, Member, Task } from 'src/schemas/kanban';
import { MongoClient, ObjectId, UpdateResult } from 'mongodb';
import { createResourceId } from '@/utils/create-resource-id';
// Initialize MongoDB client
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('KANBAN_DB');
const boardCollection = db.collection('Boards');

const isBoard = (obj: any): obj is Board => {
     return obj && typeof obj._id === 'object' && typeof obj.title === 'string';
}

// Kanban Service Functions
export const KanbanService = () => {

     const getAllBoards = async (): Promise<Board[]> => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               const db = client.db('KANBAN_DB');

               // Fetch all boards
               const boardResults = await db.collection('Boards').find({}).toArray();

               if (!boardResults || !Array.isArray(boardResults)) {
                    throw new Error('Failed to fetch boards');
               }

               // Map MongoDB results to Board type
               const boards: Board[] = boardResults.map((board: any) => ({
                    _id: board._id,  // Convert ObjectId to string if needed
                    title: board.title,
                    members: board.members || [],
                    columns: board.columns || [],
                    tasks: board.tasks || [],
               }));

               return boards;
          } catch (err) {
               console.error('Error fetching boards:', err);
               return [];
          } finally {
               await client.close();
          }
     };

     const getBoard = async (boardId: string): Promise<Board | null> => {

          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               const db = client.db('KANBAN_DB');

               // Fetch the board by its ID
               const boardResult = await db.collection('Boards').findOne({ _id: new ObjectId(boardId) });

               if (!boardResult) return null; // Return null if no board is found
               //check type of boardResult
               if (!boardResult || typeof boardResult._id === 'undefined' || typeof boardResult.title !== 'string') {
                    throw new Error('Board not found');
               }
               if (!isBoard(boardResult)) {
                    throw new Error('Object not of type Board');
               }
               return boardResult as Board; // Return the board object
          } catch (err) {
               console.error('Failed to fetch board:', err);
               return null;
          } finally {
               await client.close();
          }
     };

     const addBoard = async (title: string) => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();

               const kanbanDb = client.db('KANBAN_DB');
               const accountsDb = client.db('ACCOUNTS_DB');

               // Fetch members from the Accounts collection
               const members = await accountsDb.collection('Accounts').find().toArray();

               // Convert members to the desired format if needed
               const boardMembers = members.map((member) => ({
                    _id: member._id,
                    name: member.name,
                    email: member.email,
                    role: member.role, // Customize as per your member schema
                    avatar: member.avatar,
               }));

               // Insert a new board into the Boards collection with members
               const result = await kanbanDb.collection('Boards').insertOne({
                    title,
                    members: boardMembers, // Add fetched members to the board
                    columns: [], // Empty columns array on board creation
               });

               return result;
          } catch (err) {
               console.error('Error adding board:', err);
               throw err;
          } finally {
               await client.close();
          }
     };

     const deleteBoard = async (boardId: string) => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');

          try {
               await client.connect();

               // Step 1: Find the board in the 'Boards' collection
               const board = await db.collection('Boards').findOne({ _id: new ObjectId(boardId) });

               if (!board) {
                    throw new Error('Board not found');
               }

               // Step 2: Create a new object for the history collection (with a new ID)
               const { _id, ...boardDataWithoutId } = board; // Exclude the old _id field

               // Step 3: Insert the board into 'Boards_history' with a new ID
               await db.collection('Boards_history').insertOne({
                    ...boardDataWithoutId,
                    originalBoardId: _id, // Keep track of the original board ID for reference
                    movedToHistoryAt: new Date(), // Track when the board was moved to history
               });

               // Step 4: Delete the board from 'Boards' after successful copy
               const deleteResult = await db.collection('Boards').deleteOne({ _id: new ObjectId(boardId) });

               return deleteResult;
          } catch (err) {
               console.error('Error deleting board:', err);
               throw err;
          } finally {
               await client.close();
          }
     };

     const getAllMembers = async (): Promise<Member[]> => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();

               const db = client.db('ACCOUNTS_DB');
               const members = await db.collection('Accounts').find().toArray();

               // Map the documents to match the Member interface
               const mappedMembers: Member[] = members.map((member: any) => ({
                    _id: member._id.toString(), // Convert ObjectId to string
                    avatar: member.avatar || null, // Set default avatar value if missing
                    email: member.email,
                    role: member.role, // Assuming role is 'admin' | 'user'
                    name: member.name
               }));

               return mappedMembers;
          } catch (err) {
               console.error('Error fetching members:', err);
               return [];
          } finally {
               await client.close();
          }
     };


     const getColumnsByBoards = async (boardId: string): Promise<Column[]> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');

          try {
               await client.connect();

               // Fetch the board by its ID
               const board = await db.collection('Boards').findOne({ _id: new ObjectId(boardId) });

               if (!board) throw new Error('Board not found');

               return board.columns;
          } catch (err) {
               console.error('Error fetching columns:', err);
               return [];
          } finally {
               await client.close();
          }
     }

     const createColumn = async (boardId: string, columnId: string, name: string) => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect(); // Connect to the database

               // Check if the board exists
               const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });

               if (!board) {
                    throw new Error('Board not found'); // Throw an error if the board is not found
               }

               // Step 2: Update the board to include the full column object
               const boardUpdateResult = await boardCollection.updateOne(
                    { _id: new ObjectId(boardId) },
                    {
                         $push: {
                              columns: {
                                   _id: columnId, // Generate a new column ID
                                   name,
                                   taskIds: []
                              }
                         } as any
                    } // Push the full column object to the board
               );
               return { boardUpdateResult }; // Return both results for reference

          } catch (err) {
               console.error('Error creating column:', err);
               throw new Error('Error creating column');
          } finally {
               await client.close(); // Ensure to close the MongoClient
          }
     };

     const updateColumn = async (boardId: string, columnId: string, name: string): Promise<Column> => {
          try {
               await client.connect();
               const boardCollection = db.collection('Boards'); // Assuming you have the db object defined elsewhere

               const result = await boardCollection.findOneAndUpdate(
                    { _id: new ObjectId(boardId), 'columns._id': columnId }, // Match the board and column
                    { $set: { 'columns.$.name': name } }, // Update only the matched column's name
                    { returnDocument: 'after' } // Return the updated document after the operation
               );

               if (!result) throw new Error('Column not found');

               // Return the updated column
               const updatedColumn = result.columns.find((c: Column) => c._id!.toString() === columnId);
               if (!updatedColumn) throw new Error('Updated column not found');

               return updatedColumn;
          } catch (err) {
               console.error('Error updating column:', err);
               throw err;
          } finally {
               await client.close();
          }
     };

     const clearColumn = async (boardId: string, columnId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Fetch the board
               const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the column
               const column = board.columns.find((c: Column) => c._id!.toString() === columnId);
               if (!column) throw new Error('Column not found');

               // Update the board to clear tasks in the column
               const updateResult = await boardCollection.updateOne(
                    { _id: new ObjectId(boardId), 'columns._id': columnId },
                    { $set: { 'columns.$.tasks': [] } } // Clear tasks in the column
               );
               return true;
          } catch (err) {
               console.error('Error clearing column:', err);
               throw err;
          } finally {
               await client.close();
          }
     };

     const deleteColumn = async (params: any): Promise<boolean> => {
          const paramsData = JSON.parse(params);
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Fetch the board
               const board = await boardCollection.findOne({ _id: ObjectId.createFromHexString(paramsData.boardId) });
               if (!board) throw new Error('Board not found');
               // Find the column
               const column = board.columns.find((c: Column) => c._id!.toString() === paramsData.columnId);
               if (!column) throw new Error('Column not found');

               // Remove all tasks associated with the column
               const updatedTasks = board.tasks.filter((task: Task) => task.columnId !== paramsData.columnId);

               // Update the board with the new tasks array (without the tasks from the deleted column)
               await boardCollection.updateOne(
                    { _id: paramsData.boardId },
                    { $set: { tasks: updatedTasks } }
               );

               // Remove the column from the board
               const updateResult = await boardCollection.updateOne(
                    { _id: ObjectId.createFromHexString(paramsData.boardId) },
                    {
                         $pull: { columns: { _id: paramsData.columnId } as any } // Remove the column
                    }
               );

               return updateResult.modifiedCount > 0;
          } catch (err) {
               console.error('Error deleting column:', err);
               throw err;
          } finally {
               await client.close();
          }
     };

     const getTask = async (taskId: string): Promise<Task | null> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');

          try {
               await client.connect();

               // Find the task by its ID
               const result = await db.collection('Tasks').findOne({ _id: new ObjectId(taskId) });

               if (!result) throw new Error('Task not found');

               // Manually map the MongoDB document to your Task interface
               const task: Task = {
                    _id: result._id.toString(), // Convert ObjectId to string
                    createdBy: result.author, // Assuming these fields exist in the DB
                    assignedTo: result.assignedTo,
                    attachments: result.attachments,
                    checklist: result.checklist,
                    columnId: result.columnId,
                    comments: result.comments,
                    description: result.description || null,
                    due: result.due ? new Date(result.due) : null, // Convert to Date
                    isSubscribed: result.isSubscribed,
                    labels: result.labels,
                    name: result.name,
               };

               return task;
          } catch (err) {
               console.error('Error fetching task:', err);
               return null;
          } finally {
               await client.close();
          }
     };

     const getTasksFromBoard = async (boardId: string): Promise<Task[]> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');

          try {
               await client.connect();

               // Fetch the board by its ID
               const board = await db.collection('Boards').findOne({ _id: new ObjectId(boardId) });

               if (!board) throw new Error('Board not found');

               return board.tasks;
          } catch (err) {
               console.error('Error fetching tasks:', err);
               return [];
          } finally {
               await client.close();
          }
     }

     const createTask = async (boardId: string, columnId: string, name: string, createdByEmail: string): Promise<any> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          const dbAccounts = client.db('ACCOUNTS_DB');
          const accountsCollection = dbAccounts.collection('Accounts');

          const createdByObject = await accountsCollection.findOne({ email: createdByEmail });

          try {
               await client.connect();

               // Find the board by ID
               const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the column in the board
               const column = board.columns.find((c: Column) => c._id!.toString() === columnId);
               if (!column) throw new Error('Column not found');

               // Create the task object (without manually assigning id)
               const task: Task = {
                    _id: createResourceId(),
                    assignedTo: [],
                    attachments: [],
                    createdBy: createdByObject as unknown as Member,
                    checklist: {} as Checklist,
                    columnId,
                    comments: [],
                    description: null,
                    due: new Date(),
                    isSubscribed: false,
                    labels: [],
                    name,
               };

               // Update the board to add the new task and associate it with the column
               await boardCollection.updateOne(
                    { _id: new ObjectId(boardId) },
                    {
                         $push: { tasks: task } as any,  // Add the task to the board's tasks array
                         $addToSet: { 'columns.$[column].taskIds': task._id! }  // Add the task ID to the column's taskIds
                    },
                    { arrayFilters: [{ 'column._id': columnId }] }  // Match the correct column
               );

               return task;
          } finally {
               await client.close();
          }
     };

     const updateTask = async (boardId: string, taskId: string, update: Partial<Task>): Promise<Task> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Prepare the update object based on the properties present in the update argument
               const taskUpdate: any = {};

               if (update.name !== undefined) taskUpdate['tasks.$.name'] = update.name;
               if (update.assignedTo !== undefined) taskUpdate['tasks.$.assignedTo'] = update.assignedTo;
               if (update.attachments !== undefined) taskUpdate['tasks.$.attachments'] = update.attachments;
               if (update.checklist !== undefined) taskUpdate['tasks.$.checklist'] = update.checklist;
               if (update.columnId !== undefined) taskUpdate['tasks.$.columnId'] = update.columnId;
               if (update.comments !== undefined) taskUpdate['tasks.$.comments'] = update.comments;
               if (update.description !== undefined) taskUpdate['tasks.$.description'] = update.description;
               if (update.due !== undefined) {
                    // Check if due is not null before converting it to Date
                    taskUpdate['tasks.$.due'] = update.due ? new Date(update.due) : null;
               }
               if (update.isSubscribed !== undefined) taskUpdate['tasks.$.isSubscribed'] = update.isSubscribed;
               if (update.labels !== undefined) taskUpdate['tasks.$.labels'] = update.labels;

               // Ensure that at least one property is being updated
               if (Object.keys(taskUpdate).length === 0) {
                    throw new Error('No valid fields to update');
               }

               // Find and update the task within the board's tasks array
               const result = await boardCollection.findOneAndUpdate(
                    { _id: new ObjectId(boardId), 'tasks._id': taskId },
                    { $set: taskUpdate }, // Update only the provided fields
                    { returnDocument: 'after' }
               );
               if (!result) throw new Error('Task not found');

               // Return the updated task
               return result!.tasks.find((t: Task) => t._id!.toString() === taskId);
          } finally {
               await client.close();
          }
     };

     const moveTask = async (
          boardId: string,
          sourceColumnId: string,
          destinationColumnId: string | null,
          taskId: string,
          position: number
     ): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Fetch the board
               const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the task to move
               const task = board.tasks.find((t: Task) => t._id === taskId);
               if (!task) throw new Error('Task not found');

               // Find the source column
               const sourceColumn = board.columns.find((c: Column) => c._id === sourceColumnId);
               if (!sourceColumn) throw new Error('Source column not found');

               // Remove task ID from the source column's task list
               sourceColumn.taskIds = sourceColumn.taskIds.filter((_id: string) => _id !== taskId);

               if (destinationColumnId) {
                    // Moving to a different column
                    const destinationColumn = board.columns.find((c: Column) => c._id === destinationColumnId);
                    if (!destinationColumn) throw new Error('Destination column not found');

                    // Insert task ID into the destination column at the new position
                    destinationColumn.taskIds.splice(position, 0, taskId);

                    // Update the task's column ID
                    task.columnId = destinationColumnId;
               } else {
                    // Repositioning within the same column
                    sourceColumn.taskIds.splice(position, 0, taskId);
               }

               // Update the board in the database
               await boardCollection.updateOne(
                    { _id: new ObjectId(boardId) },
                    { $set: { columns: board.columns, tasks: board.tasks } }
               );

               return true;
          } finally {
               await client.close();
          }
     };

     const deleteTask = async (boardId: string, taskId: string): Promise<boolean> => {

          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Fetch the board
               const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the task to delete
               const task = board.tasks.find((t: Task) => t._id!.toString() === taskId);
               if (!task) throw new Error('Task not found');

               // Find the column associated with the task
               const column = board.columns.find((c: Column) => c._id === task.columnId);
               if (column) {
                    // Remove the task ID from the column's taskIds array
                    column.taskIds = column.taskIds.filter((_id: any) => _id !== taskId);
               }

               // Remove the task from the board and update it
               await boardCollection.updateOne(
                    { _id: new ObjectId(boardId) },
                    {
                         $pull: { tasks: { _id: taskId }, 'columns.$[].taskIds': taskId } // Remove task from board and column
                    } as any
               );

               return true;
          } finally {
               await client.close();
          }
     };

     const getCommentsByTask = async (taskId: string): Promise<Comment[]> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect(); // Ensure connection to MongoDB
          const db = client.db('KANBAN_DB');

          const result = await db.collection('Comments').find({ taskId: taskId }).toArray();

          // Type checking and conversion to Comment[]
          const comments: Comment[] = result.map((comment: any) => ({
               _id: comment._id.toHexString(), // Assuming `id` is an ObjectId
               authorId: comment.authorId as string,
               createdAt: comment.createdAt as Date,
               message: comment.message as string,
               // Include other properties of the `Comment` type here...
          }));

          await client.close(); // Close connection
          return comments;
     };

     const addComment = async (boardId: string, taskId: string, message: string, userName: string): Promise<Comment | null> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');

          try {
               await client.connect();

               // Fetch the board by its ID
               const board = await db.collection('Boards').findOne({ _id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the task within the board
               const task = board.tasks.find((t: Task) => t._id === taskId);
               if (!task) throw new Error('Task not found');

               // Create a new comment (without manually adding an id)
               const comment: Comment = {
                    _id: createResourceId(),
                    authorId: userName,
                    createdAt: new Date(),
                    message,
               };

               // Add the comment to the task
               task.comments.push(comment);

               // Update the board with the new comment
               await db.collection('Boards').updateOne(
                    { _id: new ObjectId(boardId), "tasks._id": taskId },
                    { $push: { "tasks.$.comments": comment } as any }
               );

               return comment;  // Return the new comment
          } catch (err) {
               console.error('Error adding comment:', err);
               return null;  // Return null in case of an error
          } finally {
               await client.close();  // Ensure the client connection is closed
          }
     };

     const updateComment = async (boardId: string, taskId: string, commentId: string, update: Partial<Comment>): Promise<Comment> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect(); // Ensure connection to MongoDB

          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          const comment = task.comments.find((c: Comment) => c._id!.toString() === commentId);
          if (!comment) throw new Error('Comment not found');

          Object.assign(comment, update);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });
          await client.close(); // Close connection

          return comment;
     };

     const deleteComment = async (boardId: string, taskId: string, commentId: string): Promise<void> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect(); // Ensure connection to MongoDB

          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          task.comments = task.comments.filter((c: Comment) => c._id!.toString() !== commentId);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });
          await client.close(); // Close connection
     };

     const updateOrCreateChecklist = async (taskId: string, update: Partial<Checklist>): Promise<{ message: string; updated: boolean }> => {

          const client = new MongoClient(process.env.MONGODB_URI!);
          await client.connect(); // Ensure connection to MongoDB

          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          // Find the board that contains the task
          const board = await boardCollection.findOne({ "tasks._id": taskId });
          if (!board) throw new Error('Board not found');

          // Find the task that contains the checklist
          const task = board.tasks.find((t: Task) => t._id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          let checklist = task.checklist;

          let response: { message: string; updated: boolean };

          if (Object.keys(checklist) && Object.keys(checklist).length > 0) {
               // Checklist found, selectively update the checklist based on the provided update fields
               if (update.name) {
                    task.checklist.name = update.name; // Update only the name if it's provided
               }

               if (update.checkItems) {
                    task.checklist.checkItems = update.checkItems; // Update only the checkItems if they're provided
               }

               response = {
                    message: 'Checklist updated successfully',
                    updated: true
               };
          } else {
               // Checklist not found, create a new checklist
               checklist = { _id: createResourceId(), checkItems: [], name: update.name }; // Default name if none provided
               if (update.checkItems) {
                    checklist.checkItems = update.checkItems; // Add checkItems if provided
               }

               task.checklist = checklist; // Assign new checklist to task

               response = {
                    message: 'New checklist created successfully',
                    updated: false
               };
          }


          // Update the board with the modified task (whether checklist was updated or newly created)
          await boardCollection.updateOne(
               { _id: new ObjectId(board._id), "tasks._id": taskId },
               { $set: { "tasks.$.checklist": task.checklist } }
          );

          await client.close(); // Close the MongoDB connection

          return response; // Return the message, updated flag, and checklist
     };

     const deleteChecklist = async (taskId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          await client.connect(); // Ensure connection to MongoDB

          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          // Find the board that contains the task
          const board = await boardCollection.findOne({ "tasks._id": taskId });
          if (!board) throw new Error('Board not found');

          // Find the task that contains the checklist
          const task = board.tasks.find((t: Task) => t._id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          const emptyChecklist = task.checklist = {
               _id: '',
               name: '',
               checkItems: []
          }

          // Update the board in MongoDB with the modified task (without the deleted checklist)
          await boardCollection.updateOne(
               { _id: new ObjectId(board._id), "tasks._id": taskId },
               { $set: { "tasks.$.checklist": emptyChecklist } }
          );

          await client.close(); // Close the MongoDB connection

          return true; // Return true to indicate successful deletion
     };

     const addCheckItem = async (boardId: string, taskId: string, checkItem: CheckItem): Promise<UpdateResult> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Find the board by ID
               const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the task within the board
               const task = board.tasks.find((t: Task) => t._id!.toString() === taskId);
               if (!task) throw new Error('Task not found');
               // Push the provided checkItem object to the checklist's checkItems array
               const response = await boardCollection.updateOne(
                    { _id: new ObjectId(boardId), "tasks._id": taskId },
                    { $push: { "tasks.$[task].checklist.checkItems": checkItem } as any },
                    {
                         arrayFilters: [{ "task._id": taskId }]
                    }
               );

               return response;
          } finally {
               await client.close(); // Ensure the client connection is closed
          }
     };

     const updateCheckItem = async (boardId: string, taskId: string, checkItemId: string, update: Partial<CheckItem>): Promise<CheckItem> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          await client.connect(); // Ensure connection to MongoDB
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          const checkItem = task.checklist.checkItems.find((ci: CheckItem) => ci._id!.toString() === checkItemId);
          if (!checkItem) throw new Error('CheckItem not found');

          // Update the checkItem properties with the provided updates
          Object.assign(checkItem, update);

          // Update the board in the database
          await boardCollection.updateOne(
               { _id: new ObjectId(boardId), "tasks._id": taskId },
               { $set: { "tasks.$.checklist.checkItems": task.checklist.checkItems } }
          );

          await client.close(); // Close connection

          return checkItem; // Return the updated checkItem
     };

     const deleteCheckItem = async (boardId: string, taskId: string, checkItemId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          await client.connect(); // Ensure connection to MongoDB

          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          const initialLength = task.checklist.checkItems.length;

          // Filter out the checklist item by checkItemId
          task.checklist.checkItems = task.checklist.checkItems.filter((ci: CheckItem) => ci._id!.toString() !== checkItemId);

          // Check if the length of the checklist items changed, indicating that an item was deleted
          const itemDeleted = task.checklist.checkItems.length < initialLength;
          if (itemDeleted) {
               // Save the updated task in the database
               await boardCollection.updateOne(
                    { _id: new ObjectId(boardId), "tasks._id": taskId },
                    { $set: { "tasks.$.checklist.checkItems": task.checklist.checkItems } }
               );
          }

          await client.close(); // Close connection

          return itemDeleted;
     };


     return {
          getAllBoards,
          getBoard,
          addBoard,
          deleteBoard,
          getColumnsByBoards,
          getAllMembers,
          createColumn,
          updateColumn,
          clearColumn,
          deleteColumn,
          getTask,
          getTasksFromBoard,
          createTask,
          updateTask,
          moveTask,
          deleteTask,
          addComment,
          getCommentsByTask,
          updateComment,
          deleteComment,
          updateOrCreateChecklist,
          deleteChecklist,
          addCheckItem,
          updateCheckItem,
          deleteCheckItem
     };
};
