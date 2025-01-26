// import { getIO, logRoomMembers } from '../config/socket.js';
// import Chat from '../models/chatModel.js';
// import Message from '../models/message.js';
// import User from '../models/user.js';
// // import logger from '../utils/logger.js';
// import { verifyToken } from '../utils/auth.js';

// export const setupChatHandlers = () => {
//   const io = getIO();

//   io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
//       const decoded = verifyToken(token);
//       const user = await User.findById(decoded.id);
//       if (!user) throw new Error('User not found');
//       socket.user = user;
//       next();
//     } catch (error) {
//       next(new Error('Authentication error'));
//     }
//   });

//   io.on('connection', (socket) => {
//     console.log('Client connected to chat with ID:', socket.id);
//     console.log('Authenticated User:', socket.user?.email);

//     if (socket.user) {
//       socket.join(`user_${socket.user.id}`);
//       console.log(`User ${socket.user.email} joined their personal room`);
//     }

//     socket.on('joinChat', async (chatId) => {
//       try {
//         const chat = await Chat.findById(chatId);
//         if (!chat) {
//           socket.emit('error', { message: 'Chat not found' });
//           return;
//         }

//         if (!chat.participants.includes(socket.user.id)) {
//           socket.emit('error', { message: 'Not authorized to join this chat' });
//           return;
//         }

//         socket.join(`chat_${chatId}`);
//         console.log(`User ${socket.user.email} joined chat: ${chatId}`);
//         logRoomMembers(`chat_${chatId}`);

//         socket.emit('chatJoined', { chatId });
//       } catch (error) {
//         logger.error('Error joining chat:', error);
//         socket.emit('error', { message: 'Failed to join chat' });
//       }
//     });

//     socket.on('typing', ({ chatId }) => {
//       console.log(`User ${socket.user.email} typing in chat ${chatId}`);
//       socket.to(`chat_${chatId}`).emit('userTyping', {
//         chatId,
//         userId: socket.user.id,
//         userName: socket.user.name
//       });
//     });

//     socket.on('stopTyping', ({ chatId }) => {
//       socket.to(`chat_${chatId}`).emit('userStoppedTyping', {
//         chatId,
//         userId: socket.user.id
//       });
//     });

//     socket.on('markAsRead', async ({ messageId }) => {
//       try {
//         const message = await Message.findById(messageId);
//         if (message) {
//           const readBy = { user: socket.user.id, readAt: new Date() };
//           if (!message.readBy.some(r => r.user.toString() === socket.user.id)) {
//             message.readBy.push(readBy);
//             message.deliveryStatus = 'read';
//             await message.save();
            
//             io.to(`chat_${message.chat}`).emit('messageRead', {
//               messageId,
//               userId: socket.user.id,
//               readAt: readBy.readAt
//             });
//           }
//         }
//       } catch (error) {
//         logger.error('Error marking message as read:', error);
//         socket.emit('error', { message: 'Failed to mark message as read' });
//       }
//     });


//     socket.on('message-reaction', async ({ messageId, emoji }) => {
//       try {
//         const message = await Message.findById(messageId);
//         const existingReaction = message.reactions.find(
//           r => r.user.toString() === userId.toString()
//         );

//         if (existingReaction) {
//           existingReaction.emoji = emoji;
//         } else {
//           message.reactions.push({ user: userId, emoji });
//         }

//         await message.save();
//         io.to(message.chat.toString()).emit('reaction-updated', {
//           messageId,
//           reactions: message.reactions
//         });
//       } catch (error) {
//         logger.error('Reaction error:', error);
//       }
//     });



//     socket.on('disconnect', () => {
//       console.log(`Client disconnected: ${socket.user?.email}`);
//     });
//   });
// };












// // import { getIO, logRoomMembers } from '../config/socket.js';
// // import Chat from '../models/chatModel.js';
// // import Message from '../models/message.js';
// // // import logger from '../utils/logger.js';

// // export const setupChatHandlers = () => {
// //   const io = getIO();

// //   io.on('connection', (socket) => {
// //     console.log('Client connected to chat with ID:', socket.id);
// //     console.log('Authenticated User:', socket.user?.email);

// //     if (socket.user) {
// //       socket.join(`user_${socket.user.id}`);
// //       console.log(`User ${socket.user.email} joined their personal room`);
// //     }

// //     socket.on('joinChat', async (chatId) => {
// //       try {
// //         const chat = await Chat.findById(chatId);
// //         if (!chat) {
// //           socket.emit('error', { message: 'Chat not found' });
// //           return;
// //         }

// //         if (!chat.participants.includes(socket.user.id)) {
// //           socket.emit('error', { message: 'Not authorized to join this chat' });
// //           return;
// //         }

// //         socket.join(`chat_${chatId}`);
// //         console.log(`User ${socket.user.email} joined chat: ${chatId}`);
// //         logRoomMembers(`chat_${chatId}`);

// //         socket.emit('chatJoined', { chatId });
// //       } catch (error) {
// //         logger.error('Error joining chat:', error);
// //         socket.emit('error', { message: 'Failed to join chat' });
// //       }
// //     });

// //     socket.on('typing', ({ chatId }) => {
// //       console.log(`User ${socket.user.email} typing in chat ${chatId}`);
// //       socket.to(`chat_${chatId}`).emit('userTyping', {
// //         chatId,
// //         userId: socket.user.id,
// //         userName: socket.user.name
// //       });
// //     });

// //     socket.on('stopTyping', ({ chatId }) => {
// //       socket.to(`chat_${chatId}`).emit('userStoppedTyping', {
// //         chatId,
// //         userId: socket.user.id
// //       });
// //     });

// //     socket.on('markAsRead', async ({ messageId }) => {
// //       try {
// //         const message = await Message.findById(messageId);
// //         if (message) {
// //           const readBy = { user: socket.user.id, readAt: new Date() };
// //           if (!message.readBy.some(r => r.user.toString() === socket.user.id)) {
// //             message.readBy.push(readBy);
// //             message.deliveryStatus = 'read';
// //             await message.save();
            
// //             io.to(`chat_${message.chat}`).emit('messageRead', {
// //               messageId,
// //               userId: socket.user.id,
// //               readAt: readBy.readAt
// //             });
// //           }
// //         }
// //       } catch (error) {
// //         logger.error('Error marking message as read:', error);
// //         socket.emit('error', { message: 'Failed to mark message as read' });
// //       }
// //     });

// //     socket.on('disconnect', () => {
// //       console.log(`Client disconnected: ${socket.user?.email}`);
// //     });
// //   });
// // };


//////////////////////////////////////////////////////////////////////////////////////////

// API Endpoints for Frontend (Flutter)
// 1. Create a Message
// Method: POST

// Endpoint: /api/messages

// Headers:

// Authorization: Bearer <token>

// Body:

// json
// Copy
// {
//   "chatId": "<chatId>",
//   "content": "Hello, this is a message",
//   "replyTo": "<messageId>", // Optional
//   "attachments": [file1, file2] // Optional, max 10 files
// }
// Response:

// json
// Copy
// {
//   "status": "success",
//   "data": {
//     "message": {
//       "_id": "<messageId>",
//       "chat": "<chatId>",
//       "sender": {
//         "_id": "<userId>",
//         "name": "John Doe",
//         "email": "john@example.com",
//         "profilePicture": "url_to_profile_picture"
//       },
//       "content": "Hello, this is a message",
//       "attachments": [
//         {
//           "url": "https://cloudinary.com/secure_url",
//           "public_id": "cloudinary_public_id",
//           "fileType": "image/jpeg"
//         }
//       ],
//       "replyTo": "<messageId>", // Optional
//       "timestamp": "2023-10-01T12:00:00.000Z"
//     }
//   }
// }
// 2. Get Message History
// Method: GET

// Endpoint: /api/messages/:chatId

// Headers:

// Authorization: Bearer <token>

// Query Parameters:

// before: (Optional) Fetch messages before this timestamp (e.g., 2023-10-01T12:00:00.000Z)

// limit: (Optional) Number of messages to fetch (default: 50)

// Response:

// json
// Copy
// {
//   "status": "success",
//   "data": {
//     "messages": [
//       {
//         "_id": "<messageId>",
//         "chat": "<chatId>",
//         "sender": {
//           "_id": "<userId>",
//           "name": "John Doe",
//           "email": "john@example.com",
//           "profilePicture": "url_to_profile_picture"
//         },
//         "content": "Hello, this is a message",
//         "attachments": [
//           {
//             "url": "https://cloudinary.com/secure_url",
//             "public_id": "cloudinary_public_id",
//             "fileType": "image/jpeg"
//           }
//         ],
//         "replyTo": "<messageId>", // Optional
//         "timestamp": "2023-10-01T12:00:00.000Z"
//       }
//     ]
//   }
// }
// 3. Delete a Message
// Method: DELETE

// Endpoint: /api/messages/:messageId

// Headers:

// Authorization: Bearer <token>

// Response:

// json
// Copy
// {
//   "status": "success",
//   "data": null
// }
// Socket.IO Events for Frontend (Flutter)
// 1. Connect to Socket.IO
// URL: ws://your-server-url

// Headers:

// Authorization: Bearer <token>

// Example:

// dart
// Copy
// socket = IO.io('ws://your-server-url', <String, dynamic>{
//   'transports': ['websocket'],
//   'autoConnect': true,
//   'extraHeaders': {'Authorization': 'Bearer $token'},
// });

// 2. Listen for Events
// Event Name	Description	Data Format

// "newMessage"	Emitted when a new message is sent in a chat the user is part of.	json { "chatId": "<chatId>", "message": { /* message object */ } }

// "messageDeleted"	Emitted when a message is deleted in a chat the user is part of.	json { "messageId": "<messageId>" }

// "userTyping"	Emitted when a user starts typing in a chat.	json { "userId": "<userId>", "chatId": "<chatId>", "isTyping": true }

// "userStoppedTyping"	Emitted when a user stops typing in a chat.	json { "userId": "<userId>", "chatId": "<chatId>", "isTyping": false }

// "messageRead"	Emitted when a message is read by a user.	json { "messageId": "<messageId>", "userId": "<userId>" }

// "newChat"	Emitted when a new chat is created involving the user.	json { "chat": { /* chat object */ } }

// "userOnline"	Emitted when a user comes online.	json { "userId": "<userId>" }

// "userOffline"	Emitted when a user goes offline.	json { "userId": "<userId>", "lastSeen": "2023-10-01T12:00:00.000Z" }

// 3. Emit Events

// Event Name	Description	Data Format

// "joinChat"	Join a specific chat room.	json { "chatId": "<chatId>" }

// "message"	Send a new message.	json { "chatId": "<chatId>", "content": "Hello", "attachments": [] }

// "typing"	Indicate that the user is typing.	json { "chatId": "<chatId>" }

// "stopTyping"	Indicate that the user has stopped typing.	json { "chatId": "<chatId>" }

// "markAsRead"	Mark a message as read.	json { "messageId": "<messageId>", "chatId": "<chatId>" }


// Example Flutter Implementation

// 1. Connect to Socket.IO

// dart
// Copy

// import 'package:socket_io_client/socket_io_client.dart' as IO;

// IO.Socket socket;

// void connectSocket(String token) {
//   socket = IO.io('ws://your-server-url', <String, dynamic>{
//     'transports': ['websocket'],
//     'autoConnect': true,
//     'extraHeaders': {'Authorization': 'Bearer $token'},
//   });

//   socket.onConnect((_) {
//     print('Connected to socket');
//   });

//   socket.onDisconnect((_) {
//     print('Disconnected from socket');
//   });

//   // Listen for new messages
//   socket.on('newMessage', (data) {
//     print('New message received: $data');
//   });

//   // Listen for typing indicators
//   socket.on('userTyping', (data) {
//     print('User is typing: $data');
//   });
// }


// 2. Send a Message
// dart
// Copy
// void sendMessage(String chatId, String content) {
//   socket.emit('message', {
//     'chatId': chatId,
//     'content': content,
//     'attachments': [], // Add file URLs if needed
//   });

// }
// 3. Join a Chat Room
// dart
// Copy
// void joinChat(String chatId) {
//   socket.emit('joinChat', {
//     'chatId': chatId,
//   });
// }
// 4. Mark a Message as Read
// dart
// Copy
// void markAsRead(String messageId, String chatId) {
//   socket.emit('markAsRead', {
//     'messageId': messageId,
//     'chatId': chatId,
//   });
// }
// Notes for Frontend Developer

// Socket.IO Library: Use the socket_io_client package in Flutter to connect to the Socket.IO server.

// yaml
// Copy
// dependencies:
//   socket_io_client: ^2.0.0
// File Upload: When sending attachments, ensure the files are uploaded to Cloudinary first, and then include the URLs in the attachments array.

// Error Handling: Handle errors for both API requests and Socket.IO events gracefully.

// Testing: Test the endpoints and Socket.IO events using tools like Postman or a Flutter app.


// Frontend Implementation (Flutter)
// 1. Create a Chatroom
// To create a chatroom, call the POST /api/chats endpoint.

// dart
// Copy
// import 'package:http/http.dart' as http;
// import 'dart:convert';

// Future<void> createChatroom(List<String> participants, String type, String name) async {
//   final url = Uri.parse('http://your-server-url/api/chats');
//   final token = 'your_jwt_token';

//   final response = await http.post(
//     url,
//     headers: {
//       'Authorization': 'Bearer $token',
//       'Content-Type': 'application/json',
//     },
//     body: jsonEncode({
//       'participants': participants,
//       'type': type,
//       'name': name,
//     }),
//   );

//   if (response.statusCode == 201) {
//     final data = jsonDecode(response.body);
//     print('Chatroom created: ${data['data']['chat']}');
//   } else {
//     print('Failed to create chatroom: ${response.body}');
//   }
// }
