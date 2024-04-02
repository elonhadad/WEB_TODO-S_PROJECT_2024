// This file defines the Todo model using Mongoose schema for MongoDB.
// It sets up the schema for todo documents, which includes the structure and constraints for fields such as userId (referencing the User model),
// content of the todo item, its completion status, and creation date.

const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Todo', todoSchema);
