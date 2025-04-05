const express = require('express');
const paymentRoute = express.Router();

// Import controller
const paymentController = require('../controllers/paymentController');

// Define routes
paymentRoute.get('/', paymentController.renderProductPage);  // Route to show product page
paymentRoute.post('/createOrder', paymentController.createOrder);  // Route to create Razorpay order

// Webhook to handle payment status
paymentRoute.post('/webhook', paymentController.handleWebhook);  // Webhook route

module.exports = paymentRoute;
