import type { Attachment, Board, CheckItem, Checklist, Column, Comment, Member, Task } from 'src/schemas/kanban';
import { createResourceId } from 'src/utils/create-resource-id';
import { MongoClient, ObjectId } from 'mongodb';

// Initialize MongoDB client
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('kanbanDB'); // Replace 'kanbanDB' with your database name
const boardCollection = db.collection('boards'); // Replace 'boards' with your collection name


// Kanban Service Functions
export const KanbanService = () => {

     const getAllBoards = async (): Promise<Board[]> => {
          const client = new MongoClient(process.env.MONGODB_URI!);
          const db = client.db('KANBAN_DB');
          const result = await db.collection('Board').find().toArray();

          // Type checking and conversion to Board[]
          const boards: Board[] = result.map((board: any) => ({
               _id: board._id.toHexString(), // Assuming `_id` is derived from MongoDB's `_id`
               title: board.title as string, // Cast and validate these types based on your schema
               members: board.members as Member[], // Cast and validate these types based on your schema
               columns: board.columns as Column[], // Cast and validate these types based on your schema
               tasks: board.tasks as Task[], // Cast and validate these types based on your schema
               // Include other properties of the `Board` type here...
          }));

          return boards;
     }

     const getBoard = async (boardId: string): Promise<Board | null> => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               const db = client.db('KANBAN_DB');
               const result = await db.collection('Board').findOne({ _id: new ObjectId(boardId) });

               // Return null if no board is found
               if (!result) return null;

               // Type checking and conversion to Board
               const board: Board = {
                    _id: result._id.toHexString(), // Assuming `_id` is derived from MongoDB's `_id`
                    title: result.title as string, // Cast and validate these types based on your schemas
                    members: result.members as Member[], // Cast and validate these types based on your schema
                    columns: result.columns as Column[], // Cast and validate these types based on your schema
                    tasks: result.tasks as Task[], // Cast and validate these types based on your schema
                    // Include other properties of the `Board` type here...
               };

               return board;
          } catch (err) {
               console.error('Failed to fetch board:', err);
               return null; // Handle any errors by returning null
          } finally {
               await client.close();
          }
     };

     const addBoard = async (name: string) => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const db = client.db('KANBAN_DB');
          const result = await db.collection('Board').insertOne(
               {
                    name,
                    members: [],
                    columns: [],
                    tasks: [],
               },
          );
          return result
     }

     const deleteBoard = async (boardId: string) => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const db = client.db('KANBAN_DB');
          const result = await db.collection('Board').deleteOne({ _id: new ObjectId(boardId) })
          return result
     }

     const createColumn = async (boardId: string, name: string) => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const db = client.db('KANBAN_DB');
          const result = await db.collection('Board').insertOne(
               {
                    columns: [
                         {
                              taskIds: [],
                              name,
                         },
                    ],
               },
          );
          return result
     };

     const updateColumn = async (boardId: string, columnId: string, update: Partial<Column>): Promise<Column> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const db = client.db('KANBAN_DB');
          const result = await db.collection('Columns').findOneAndUpdate(
               { _id: new ObjectId(boardId), 'columns._id': columnId },
               { $set: { 'columns.$': update } },
               { returnDocument: 'after' }
          );
          if (!result!.value) throw new Error('Column not found');
          return result!.value;
     };

     const clearColumn = async (boardId: string, columnId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const column = board.columns.find((c: Column) => c._id === columnId);
          if (!column) throw new Error('Column not found');

          await boardCollection.updateOne(
               { _id: new ObjectId(boardId) },
               { $set: { tasks: board.tasks.filter((task: Task) => task.columnId !== columnId) } }
          );
          column.taskIds = [];
          return true;
     };

     const deleteColumn = async (boardId: string, columnId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const column = board.columns.find((c: Column) => c._id === columnId);
          if (!column) throw new Error('Column not found');

          await boardCollection.updateOne(
               { _id: new ObjectId(boardId) },
               {
                    $set: { tasks: board.tasks.filter((task: Task) => task.columnId !== columnId) },
                    $pull: { columns: { _id: columnId } } as any,
               }
          );

          return true;
     };

     const getTask = async (taskId: string): Promise<Task> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const db = client.db('KANBAN_DB');
          const result = await db.collection('Tasks').findOne({ _id: new ObjectId(taskId) })

          if (!result) throw new Error('Task not found');

          // Type checking and conversion to Task
          const task: Task = {
               _id: result._id.toHexString(), // Assuming `_id` is derived from MongoDB's `_id`
               assigneesIds: result.assigneesIds as string[], // Cast and validate these types based on your schema
               attachments: result.attachments as Attachment[], // Cast and validate these types based on your schema
               authorId: result.authorId as string, // Cast and validate these types based on your schema
               checklists: result.checklists as Checklist[], // Cast and validate these types based on your schema
               columnId: result.columnId as string, // Cast and validate these types based on your schema
               comments: result.comments as Comment[], // Cast and validate these types based on your schema
               description: result.description as string, // Cast and validate these types based on your schema
               due: result.due as Date, // Cast and validate these types based on your schema
               isSubscribed: result.isSubscribed as boolean, // Cast and validate these types based on your schema
               labels: result.labels as string[], // Cast and validate these types based on your schema
               name: result.name as string, // Cast and validate these types based on your schema
               // Include other properties of the `Task` type here...
          };

          return task;
     }

     const createTask = async (boardId: string, columnId: string, name: string, userId: string): Promise<Task> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const column = board.columns.find((c: Column) => c._id === columnId);
          if (!column) throw new Error('Column not found');

          const task: Task = {
               _id: createResourceId(),
               assigneesIds: [],
               attachments: [],
               authorId: userId,
               checklists: [],
               columnId,
               comments: [],
               description: null,
               due: null,
               isSubscribed: false,
               labels: [],
               name,
          };

          await boardCollection.updateOne(
               { _id: new ObjectId(boardId) },
               { $push: { tasks: task }, $addToSet: { 'columns.$[column].taskIds': task._id } } as any, // Workaround for TypeScript error
               { arrayFilters: [{ 'column._id': columnId }] }
          );

          return task;
     };

     const updateTask = async (boardId: string, taskId: string, update: Partial<Task>): Promise<Task> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const result = await boardCollection.findOneAndUpdate(
               { _id: new ObjectId(boardId), 'tasks._id': taskId },
               { $set: { 'tasks.$': update } },
               { returnDocument: 'after' }
          );
          if (!result!.value) throw new Error('Task not found');
          return result!.value;
     };

     const moveTask = async (boardId: string, taskId: string, position: number, columnId?: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          const sourceColumn = board.columns.find((c: Column) => c._id === task.columnId);
          if (!sourceColumn) throw new Error('Source column not found');

          sourceColumn.taskIds = sourceColumn.taskIds.filter((_id: any) => _id !== taskId);

          if (columnId) {
               const destinationColumn = board.columns.find((c: Column) => c._id === columnId);
               if (!destinationColumn) throw new Error('Destination column not found');
               destinationColumn.taskIds.splice(position, 0, task._id);
               task.columnId = columnId;
          } else {
               sourceColumn.taskIds.splice(position, 0, task._id);
          }

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });

          return true;
     };

     const deleteTask = async (boardId: string, taskId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          const column = board.columns.find((c: Column) => c._id === task.columnId);
          if (column) column.taskIds = column.taskIds.filter((_id: any) => _id !== taskId);

          await boardCollection.updateOne(
               { _id: new ObjectId(boardId) },
               { $pull: { tasks: { _id: taskId }, columns: { taskIds: taskId } } } as any // Workaround for TypeScript error
          );

          return true;
     };

     const getCommentsByTask = async (taskId: string): Promise<Comment[]> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const db = client.db('KANBAN_DB');
          const result = await db.collection('Comments').find({ taskId: taskId }).toArray();

          // Type checking and conversion to Comment[]
          const comments: Comment[] = result.map((comment: any) => ({
               _id: comment._id.toHexString(), // Assuming `_id` is derived from MongoDB's `_id`
               authorId: comment.authorId as string, // Cast and validate these types based on your schema
               createdAt: comment.createdAt as Date, // Cast and validate these types based on your schema
               message: comment.message as string, // Cast and validate these types based on your schema
               // Include other properties of the `Comment` type here...
          }));

          return comments;
     }

     const addComment = async (boardId: string, taskId: string, message: string, userId: string): Promise<Comment> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          const comment: Comment = {
               _id: createResourceId(),
               authorId: userId,
               createdAt: new Date(),
               message,
          };

          task.comments.push(comment);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });

          return comment;
     };

     const updateComment = async (boardId: string, taskId: string, commentId: string, update: Comment): Promise<Comment> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          const comment = task.comments.find((c: Comment) => c._id === commentId);
          if (!comment) throw new Error('Comment not found');

          Object.assign(comment, update);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });

          return comment;
     }

     const deleteComment = async (boardId: string, taskId: string, commentId: string) => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          task.comments = task.comments.filter((c: Comment) => c._id !== commentId);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });
     }

     const addChecklist = async (boardId: string, taskId: string, name: string): Promise<Checklist> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          const checklist: Checklist = {
               _id: createResourceId(),
               name,
               checkItems: [],
          };

          task.checklists.push(checklist);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });

          return checklist;
     };

     const updateChecklist = async (boardId: string, taskId: string, checklistId: string, update: Partial<Checklist>): Promise<Checklist> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          const checklist = task.checklists.find((c: Checklist) => c._id === checklistId);
          if (!checklist) throw new Error('Checklist not found');

          Object.assign(checklist, update);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });

          return checklist;
     };

     const deleteChecklist = async (boardId: string, taskId: string, checklistId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          task.checklists = task.checklists.filter((c: Checklist) => c._id !== checklistId);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });

          return true;
     };

     const addCheckItem = async (boardId: string, taskId: string, checklistId: string, name: string): Promise<CheckItem> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          const checklist = task.checklists.find((c: Checklist) => c._id === checklistId);
          if (!checklist) throw new Error('Checklist not found');

          const checkItem: CheckItem = {
               _id: createResourceId(),
               name,
               state: 'incomplete',
          };

          checklist.checkItems.push(checkItem);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });

          return checkItem;
     };

     const updateCheckItem = async (boardId: string, taskId: string, checklistId: string, checkItemId: string, update: Partial<CheckItem>): Promise<CheckItem> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          const checklist = task.checklists.find((c: Checklist) => c._id === checklistId);
          if (!checklist) throw new Error('Checklist not found');

          const checkItem = checklist.checkItems.find((ci: CheckItem) => ci._id === checkItemId);
          if (!checkItem) throw new Error('Check item not found');

          Object.assign(checkItem, update);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });

          return checkItem;
     };

     const deleteCheckItem = async (boardId: string, taskId: string, checklistId: string, checkItemId: string): Promise<boolean> => {
          const client = new MongoClient(process.env.MONGODB_URI!)
          const board = await boardCollection.findOne({ _id: new ObjectId(boardId) });
          if (!board) throw new Error('Board not found');

          const task = board.tasks.find((t: Task) => t._id === taskId);
          if (!task) throw new Error('Task not found');

          const checklist = task.checklists.find((c: Checklist) => c._id === checklistId);
          if (!checklist) throw new Error('Checklist not found');

          checklist.checkItems = checklist.checkItems.filter((ci: CheckItem) => ci._id !== checkItemId);

          await boardCollection.updateOne({ _id: new ObjectId(boardId) }, { $set: board });

          return true;
     };

     return {
          getAllBoards,
          getBoard,
          addBoard,
          deleteBoard,
          createColumn,
          updateColumn,
          clearColumn,
          deleteColumn,
          getTask,
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
