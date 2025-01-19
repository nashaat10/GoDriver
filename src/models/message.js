import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: String,
    formattedText: {
      type: String,
      required: function() {
        return !this.attachments || this.attachments.length === 0;
      }
    },
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      index: Number
    }]
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document']
    },
    key: String,
    url: String,
    originalname: String,
    mimetype: String,
    size: Number,
    metadata: {
      width: Number,
      height: Number,
      duration: Number
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: Date
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deliveryStatus: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, {
  timestamps: true
});

messageSchema.index({ 'content.text': 'text' });
messageSchema.index({ chat: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);