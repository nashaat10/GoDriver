import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "User",
    required: true,
  },
  content:{
    type: String,
    required: true,
  },
  timestamp:{
    type : Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  }
})

const chatSchema = new mongoose.Schema(
  {
    participants:[
      {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true,
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps : true,
  }
)

export const Chat = mongoose.model("Chat", chatSchema);
   export const Message = mongoose.model("Message", messageSchema);