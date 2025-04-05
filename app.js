require('dotenv').config();  // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');

// Set up Express app
const app = express();
const server = http.Server(app);

// Import payment routes
const paymentRoute = require('./routes/paymentRoute');

// MongoDB connection URI from environment variables
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set view engine and views folder for ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use payment routes
app.use('/', paymentRoute);

// Start the server
server.listen(3000, () => {
    console.log('Server running on port 3000');
});
