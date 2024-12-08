import mongoose from 'mongoose';

// Create the Task schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A task must have a title'],
  },
  description: {
    type: String,
    required: [true, 'A task must have a description'],
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
    required: [true, 'A task must have a due date'],
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (Manager)
    required: [true, 'A task must have a manager'],
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (Driver)
    required: [true, 'A task must have a driver'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Task model
const Task = mongoose.model('Task', taskSchema);

export default Task;
