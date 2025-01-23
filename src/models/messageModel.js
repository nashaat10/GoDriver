import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      text: String,
      formattedText: {
        type: String,
        required: function () {
          return !this.attachments || this.attachments.length === 0;
        },
      },
      mentions: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          index: Number,
        },
      ],
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "video", "audio", "document"],
        },
        key: String,
        url: String,
        originalname: String,
        mimetype: String,
        size: Number,
        metadata: {
          width: Number,
          height: Number,
          duration: Number,
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deliveryStatus: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [
      {
        user: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        readAt: Date,
      },
    ],
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reaction: String,
      },
    ],
    editHistory: [
      {
        editedAt: Date,
        editedContent: String,
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
