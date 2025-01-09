import request from 'supertest';
import { expect } from 'chai';
import app from '../app.js'; // Import your Express app
import mongoose from 'mongoose';
import { Chat } from '../src/models/chatModel.js';

describe('Chat API', function() {
  let chatId;
  let messageId;

  this.timeout(20000);

  before(async () => {
    // Connect to the test database
    await mongoose.connect("mongodb+srv://bawq2024:bawq2024@godriver.94a2j.mongodb.net/?retryWrites=true&w=majority&appName=GoDriver");
    console.log("Database is connected");
    // Create a chat for testing
    const chat = await Chat.create({
      participants: ["677d243da8bb6f3c657ce618", "677d24c2a8bb6f3c657ce627"],
      messages: [],
    });
    chatId = chat._id;
  });

  after(async () => {
    // Clean up the database
    await Chat.deleteMany({});
    await mongoose.connection.close();
  });

  

  it('should join a chat', async () => {
    const res = await request(app)
      .post(`/api/v1/chats/${chatId}/join`)
      .send({ userId: '677d243da8bb6f3c657ce618' });
      console.log('Join Chat Response:', res.body);
    expect(res.body).to.have.property('status', 'success');
  });

  it('should send a message', async () => {
    const message = {
      sender: '677d243da8bb6f3c657ce618',
      content: 'Hello, this is a test message!',
    };

    const res = await request(app)
      .post('/api/v1/chats/send')
      .send({ chatId, message });

    expect(res.body).to.have.property('status', 'success');
    messageId = res.body.data.chat.messages[res.body.data.chat.messages.length - 1]._id;
  });

  it('should retrieve chat history', async () => {
    const res = await request(app)
      .get(`/api/v1/chats/${chatId}`);

    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data.chat.messages).to.be.an('array').that.is.not.empty;
  });
});