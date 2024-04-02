const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const cors = require('cors');

const app = express();

// Import user and todo models
const User = require('./models/user');
const Todo = require('./models/Todo');

// MongoDB settings
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mongotodos.hzzpzwa.mongodb.net/?retryWrites=true&w=majority&appName=mongoTodos`;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('Client'));
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// Connect to MongoDB
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));


//******************************************************************* */

// static pages and APIs

// Serve the registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client/html/RegisterUser.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client/html/LoginUser.html'));
});

// Serve the todos page for logged-in users, or redirect to login
app.get('/todos', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'Client/html/todosUser.html'));
    } else {
        res.redirect('/login');
    }
});

// Register a new user
app.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });

        res.json({ redirect: '/login' });
        await user.save();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
});

// Log in a user
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid password.' });
        }
        // Save user details in the session
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.email = user.email;

        res.json({ redirect: '/todos' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
});

// Provide user info for the logged-in user
app.get('/user-info', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    res.json({ username: req.session.username, email: req.session.email });
});

// Log out a user
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});


// Add a new todo for the logged-in user
app.post('/todos', async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.session.userId;
        const todo = new Todo({ content, userId });
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding todo' });
    }
});

// Update a todo's completion status or content
app.put('/todos/:id', async (req, res) => {
    const { completed, content } = req.body;
    try {
        const update = {};
        if (completed !== undefined) update.completed = completed;
        if (content) update.content = content;
        const todo = await Todo.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating todo' });
    }
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting todo' });
    }
});


// Get todos for the logged-in user
app.get('/api/todos', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    try {
        const userId = req.session.userId;
        const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting todos' });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
