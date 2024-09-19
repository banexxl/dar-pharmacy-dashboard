import type { Board, CheckItem, Checklist, Column, Comment, Member, Task } from 'src/schemas/kanban';
import { MongoClient, ObjectId } from 'mongodb';
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
               // Assume that MongoDB returns the correct structure and directly return it as Board[]
               return boardResults as Board[];
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
          const db = client.db('KANBAN_DB');

          try {
               await client.connect();
               const result = await db.collection('Boards').insertOne({
                    title,
                    members: [], // Empty members array on board creation
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

     const createColumn = async (boardId: string, name: string) => {
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
                                   id: createResourceId(),
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
                    { _id: new ObjectId(boardId), 'columns.id': columnId }, // Match the board and column
                    { $set: { 'columns.$.name': name } }, // Update only the matched column's name
                    { returnDocument: 'after' } // Return the updated document after the operation
               );

               if (!result) throw new Error('Column not found');

               // Return the updated column
               const updatedColumn = result.columns.find((c: Column) => c.id!.toString() === columnId);
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
               const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the column
               const column = board.columns.find((c: Column) => c.id!.toString() === columnId);
               if (!column) throw new Error('Column not found');

               // Remove all tasks associated with the column
               await db.collection('Tasks').deleteMany({ columnId });

               // Update the board to clear tasks in the column
               const updateResult = await boardCollection.updateOne(
                    { id: new ObjectId(boardId), 'columns.id': columnId },
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

     const deleteColumn = async (boardId: string, columnId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Fetch the board
               const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the column
               const column = board.columns.find((c: Column) => c.id!.toString() === columnId);
               if (!column) throw new Error('Column not found');

               // Remove all tasks associated with the column
               await db.collection('Tasks').deleteMany({ columnId });

               // Remove the column from the board
               const updateResult = await boardCollection.updateOne(
                    { id: new ObjectId(boardId) },
                    {
                         $pull: { columns: { id: columnId } } as any, // Remove the column
                    }
               );

               return true;
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
                    id: result._id.toString(), // Convert ObjectId to string
                    createdBy: result.author, // Assuming these fields exist in the DB
                    assignedTo: result.assignedTo,
                    attachments: result.attachments,
                    checklists: result.checklists,
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

     const createTask = async (boardId: string, columnId: string, name: string, createdBy: string): Promise<any> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Find the board by ID
               const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the column in the board
               const column = board.columns.find((c: Column) => c.id!.toString() === columnId);
               if (!column) throw new Error('Column not found');

               // Create the task object (without manually assigning id)
               const task: Task = {
                    id: createResourceId(),
                    assignedTo: [],
                    attachments: [],
                    createdBy: createdBy,
                    checklists: [],
                    columnId,
                    comments: [],
                    description: null,
                    due: null,
                    isSubscribed: false,
                    labels: [],
                    name,
               };

               // Update the board to add the new task and associate it with the column
               await boardCollection.updateOne(
                    { _id: new ObjectId(boardId) },
                    {
                         $push: { tasks: task } as any,  // Add the task to the board's tasks array
                         $addToSet: { 'columns.$[column].taskIds': task.id! }  // Add the task ID to the column's taskIds
                    },
                    { arrayFilters: [{ 'column.id': columnId }] }  // Match the correct column
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

               // Find and update the task within the board's tasks array
               const result = await boardCollection.findOneAndUpdate(
                    { id: new ObjectId(boardId), 'tasks.id': taskId },
                    { $set: { 'tasks.$': update } }, // Update the task with the provided values
                    { returnDocument: 'after' }
               );

               if (!result!.value) throw new Error('Task not found');
               return result!.value.tasks.find((t: Task) => t.id!.toString() === taskId); // Return the updated task
          } finally {
               await client.close();
          }
     };

     const moveTask = async (boardId: string, taskId: string, position: number, columnId?: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Fetch the board
               const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the task to move
               const task = board.tasks.find((t: Task) => t.id!.toString() === taskId);
               if (!task) throw new Error('Task not found');

               // Find the source column
               const sourceColumn = board.columns.find((c: Column) => c.id === task.columnId);
               if (!sourceColumn) throw new Error('Source column not found');

               // Remove task ID from the source column's task list
               sourceColumn.taskIds = sourceColumn.taskIds.filter((id: any) => id !== taskId);

               if (columnId) {
                    // Move task to the new column
                    const destinationColumn = board.columns.find((c: Column) => c.id!.toString() === columnId);
                    if (!destinationColumn) throw new Error('Destination column not found');
                    destinationColumn.taskIds.splice(position, 0, task.id); // Insert task at new position
                    task.columnId = columnId; // Update task's column ID
               } else {
                    // Reposition within the same column
                    sourceColumn.taskIds.splice(position, 0, task.id);
               }

               // Update the board in the database
               await boardCollection.updateOne({ id: new ObjectId(boardId) }, { $set: board });

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
               const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the task to delete
               const task = board.tasks.find((t: Task) => t.id!.toString() === taskId);
               if (!task) throw new Error('Task not found');

               // Find the column associated with the task
               const column = board.columns.find((c: Column) => c.id === task.columnId);
               if (column) {
                    // Remove the task ID from the column's taskIds array
                    column.taskIds = column.taskIds.filter((id: any) => id !== taskId);
               }

               // Remove the task from the board and update it
               await boardCollection.updateOne(
                    { id: new ObjectId(boardId) },
                    {
                         $pull: { tasks: { id: taskId }, 'columns.$[].taskIds': taskId } // Remove task from board and column
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
               id: comment.id.toHexString(), // Assuming `id` is an ObjectId
               authorId: comment.authorId as string,
               createdAt: comment.createdAt as Date,
               message: comment.message as string,
               // Include other properties of the `Comment` type here...
          }));

          await client.close(); // Close connection
          return comments;
     };

     const addComment = async (boardId: string, taskId: string, message: string, userId: string): Promise<Comment | null> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');

          try {
               await client.connect();

               // Fetch the board by its ID
               const board = await db.collection('Boards').findOne({ id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the task within the board
               const task = board.tasks.find((t: Task) => t.id === taskId);
               if (!task) throw new Error('Task not found');

               // Create a new comment (without manually adding an id)
               const comment: Comment = {
                    authorId: userId,
                    createdAt: new Date(),
                    message,
               };

               // Add the comment to the task
               task.comments.push(comment);

               // Update the board with the new comment
               await db.collection('Boards').updateOne(
                    { id: new ObjectId(boardId), "tasks.id": new ObjectId(taskId) },
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

          const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t.id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          const comment = task.comments.find((c: Comment) => c.id!.toString() === commentId);
          if (!comment) throw new Error('Comment not found');

          Object.assign(comment, update);

          await boardCollection.updateOne({ id: new ObjectId(boardId) }, { $set: board });
          await client.close(); // Close connection

          return comment;
     };

     const deleteComment = async (boardId: string, taskId: string, commentId: string): Promise<void> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect(); // Ensure connection to MongoDB

          const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t.id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          task.comments = task.comments.filter((c: Comment) => c.id!.toString() !== commentId);

          await boardCollection.updateOne({ id: new ObjectId(boardId) }, { $set: board });
          await client.close(); // Close connection
     };

     const addChecklist = async (boardId: string, taskId: string, name: string): Promise<Checklist> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Find the board by ID
               const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the task within the board
               const task = board.tasks.find((t: Task) => t.id === taskId);
               if (!task) throw new Error('Task not found');

               // Create a new checklist object
               const checklist: Checklist = {
                    id: createResourceId(),  // Let MongoDB generate the id for the checklist
                    name,
                    checkItems: [],       // Empty checklist by default
               };

               // Push the checklist to the task
               task.checklists.push(checklist);

               // Update the board to add the checklist to the task
               await boardCollection.updateOne(
                    { id: new ObjectId(boardId), "tasks.id": new ObjectId(taskId) },
                    { $push: { "tasks.$.checklists": checklist } as any } // Add checklist to the task
               );

               return checklist;
          } finally {
               await client.close(); // Ensure the client connection is closed
          }
     };

     const updateChecklist = async (boardId: string, taskId: string, checklistId: string, update: Partial<Checklist>): Promise<Checklist> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect(); // Ensure connection to MongoDB

          const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t.id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          const checklist = task.checklists.find((c: Checklist) => c.id!.toString() === checklistId);
          if (!checklist) throw new Error('Checklist not found');

          Object.assign(checklist, update);

          await boardCollection.updateOne({ id: new ObjectId(boardId) }, { $set: board });
          await client.close(); // Close connection

          return checklist;
     };

     const deleteChecklist = async (boardId: string, taskId: string, checklistId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect(); // Ensure connection to MongoDB

          const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t.id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          task.checklists = task.checklists.filter((c: Checklist) => c.id!.toString() !== checklistId);

          await boardCollection.updateOne({ id: new ObjectId(boardId) }, { $set: board });
          await client.close(); // Close connection

          return true;
     };

     const addCheckItem = async (boardId: string, taskId: string, checklistId: string, name: string): Promise<CheckItem> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const boardCollection = db.collection('Boards');

          try {
               await client.connect();

               // Find the board by ID
               const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
               if (!board) throw new Error('Board not found');

               // Find the task within the board
               const task = board.tasks.find((t: Task) => t.id === taskId);
               if (!task) throw new Error('Task not found');

               // Find the checklist within the task
               const checklist = task.checklists.find((c: Checklist) => c.id!.toString() === checklistId);
               if (!checklist) throw new Error('Checklist not found');

               // Create the new check item
               const checkItem: CheckItem = {
                    id: createResourceId(),  // Let MongoDB generate the ID
                    name,
                    state: 'incomplete',
               };

               // Push the check item directly to the checklist's checkItems array
               await boardCollection.updateOne(
                    { id: new ObjectId(boardId), "tasks.id": new ObjectId(taskId), "tasks.checklists.id": new ObjectId(checklistId) },
                    { $push: { "tasks.$[task].checklists.$[checklist].checkItems": checkItem } as any },
                    {
                         arrayFilters: [
                              { "task.id": new ObjectId(taskId) },
                              { "checklist.id": new ObjectId(checklistId) }
                         ]
                    }
               );

               return checkItem;
          } finally {
               await client.close(); // Ensure the client connection is closed
          }
     };


     const updateCheckItem = async (boardId: string, taskId: string, checklistId: string, checkItemId: string, update: Partial<CheckItem>): Promise<CheckItem> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect(); // Ensure connection to MongoDB

          const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t.id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          const checklist = task.checklists.find((c: Checklist) => c.id!.toString() === checklistId);
          if (!checklist) throw new Error('Checklist not found');

          const checkItem = checklist.checkItems.find((ci: CheckItem) => ci.id!.toString() === checkItemId);
          if (!checkItem) throw new Error('Check item not found');

          Object.assign(checkItem, update);

          await boardCollection.updateOne({ id: new ObjectId(boardId) }, { $set: board });
          await client.close(); // Close connection

          return checkItem;
     };

     const deleteCheckItem = async (boardId: string, taskId: string, checklistId: string, checkItemId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          await client.connect(); // Ensure connection to MongoDB

          const board = await boardCollection.findOne({ id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t.id!.toString() === taskId);
          if (!task) throw new Error('Task not found');

          const checklist = task.checklists.find((c: Checklist) => c.id!.toString() === checklistId);
          if (!checklist) throw new Error('Checklist not found');

          checklist.checkItems = checklist.checkItems.filter((ci: CheckItem) => ci.id!.toString() !== checkItemId);

          await boardCollection.updateOne({ id: new ObjectId(boardId) }, { $set: board });
          await client.close(); // Close connection

          return true;
     };

     return {
          getAllBoards,
          getBoard,
          addBoard,
          deleteBoard,
          getColumnsByBoards,
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
          addChecklist,
          updateChecklist,
          deleteChecklist,
          addCheckItem,
          updateCheckItem,
          deleteCheckItem
     };
};
