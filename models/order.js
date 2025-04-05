const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    order_id: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    product_name: { type: String, required: true },
    description: { type: String, required: true },
    contact: { type: String, required: true },
    customer_name: { type: String, required: true },
    email: { type: String, required: true },
    receipt: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },  // Add status field
    created_at: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
