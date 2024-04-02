// This file defines the User model using Mongoose schema for MongoDB.
// It includes the schema for user documents, specifying the structure 
// and constraints for username, email, and password fields.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);