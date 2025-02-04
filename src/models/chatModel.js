import mongoose from "mongoose";

// const messageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   content: {
//     type: String,
//     required: true,
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now,
//   },
//   readBy: [
//     {
//       user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       readAt: Date,
//     },
//   ],
// });

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },
    name: {
      type: String,
      required: function () {
        return this.type === "group";
      },
      uniuqe: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
chatSchema.index({ participants: 1 });
export default mongoose.model("Chat", chatSchema);

//     POST /api/chats
// Headers: { "Authorization": "Bearer {token}" }
// Body: {
//   "participants": [string],  // Array of user IDs
//   "type": "private" | "group",
//   "name": string  // Required for group chats
// }

/*

     POST /api/auth/login
     Body: { "email": string, "password": string }


          POST /api/chats
     Headers: { "Authorization": "Bearer {token}" }
     Body: {
       "participants": [string],  // Array of user IDs
       "type": "private" | "group",
       "name": string  // Required for group chats
     }

     GET /api/chats
     Headers: { "Authorization": "Bearer {token}" }


          GET /api/chats/:chatId
     Headers: { "Authorization": "Bearer {token}" }


          POST /api/messages
     Headers: { "Authorization": "Bearer {token}" }
     Body: {
       "chatId": string,
       "content": string,
       "attachments": [File],  // Optional
       "replyTo": string  // Optional, message ID being replied to
     }



          DELETE /api/messages/:messageId
     Headers: { "Authorization": "Bearer {token}" }


     
### WebSocket Events




Connect to WebSocket server with token authentication.
URL: ws://your-server-url
Headers: { "Authorization": "Bearer {token}" }
Events to Listen For
newMessage: Receive new messages in a chat.
messageDeleted: Notification when a message is deleted.
userTyping: Notification when a user is typing.
userStoppedTyping: Notification when a user stops typing.
messageRead: Notification when a message is read.
newChat: Notification when a new chat is created.
userOnline: Notification when a user comes online.
userOffline: Notification when a user goes offline.




Events to Emit
joinChat: Join a specific chat room.
message: Send a new message.
typing: Indicate user is typing.
stopTyping: Indicate user stopped typing.
markAsRead: Mark messages as read.

*/
