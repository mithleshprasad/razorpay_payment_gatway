const Razorpay = require('razorpay');
const Order = require('../models/order');  // Import the Order model
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

// Handle Razorpay Webhook for Payment Status
const handleWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; // You should set this in your .env
        const crypto = require('crypto');
        
        const receivedSignature = req.headers['x-razorpay-signature'];
        const generatedSignature = crypto.createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        // Verify the signature to ensure the request is coming from Razorpay
        if (receivedSignature === generatedSignature) {
            const { event, payload } = req.body;

            // Extract order details from the webhook payload
            const orderId = payload.payment.entity.order_id;
            const paymentStatus = payload.payment.entity.status;

            // Update the order status in the database
            const order = await Order.findOne({ order_id: orderId });
            if (order) {
                if (paymentStatus === 'captured') {
                    order.status = 'Success';
                } else if (paymentStatus === 'failed') {
                    order.status = 'Failed';
                } else if (paymentStatus === 'pending') {
                    order.status = 'Pending';
                }

                await order.save();
            }

            res.status(200).send({ success: true, msg: 'Webhook received and processed' });
        } else {
            res.status(400).send({ success: false, msg: 'Invalid signature' });
        }
    } catch (error) {
        console.log('Error handling webhook:', error.message);
        res.status(500).send({ success: false, msg: 'Error processing webhook' });
    }
};

// Render product page
const renderProductPage = async (req, res) => {
    try {
        res.render('product');
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, msg: 'Error rendering product page' });
    }
};

// Create Razorpay order
const createOrder = async (req, res) => {
    try {
        const amount = req.body.amount * 100; // Convert to paise
        const options = {
            amount: amount,  // Amount in paise
            currency: 'INR',
            receipt: 'order_receipt_' + new Date().getTime(),
        };

        razorpayInstance.orders.create(options, async (err, order) => {
            if (err) {
                return res.status(400).send({ success: false, msg: 'Error creating Razorpay order' });
            }

            // Save the order to MongoDB
            const orderData = new Order({
                order_id: order.id,
                amount: amount,
                currency: 'INR',
                product_name: req.body.name,
                description: req.body.description,
                contact: "7519024625",
                customer_name: "Mithlesh Prasad",
                email: "technomithlesh@gmail.com",
                receipt: order.receipt,
                status: 'Pending',  // Initial status is pending
            });

            try {
                await orderData.save();  // Save to MongoDB
                res.status(200).send({
                    success: true,
                    msg: 'Order created and saved in DB',
                    order_id: order.id,
                    amount: amount,
                    key_id: RAZORPAY_ID_KEY,
                    product_name: req.body.name,
                    description: req.body.description,
                    contact: "7519024625",
                    customer_name: "Mithlesh Prasad",
                    email: "technomithlesh@gmail.com"
                });
            } catch (dbError) {
                console.log('Error saving to DB:', dbError.message);
                res.status(500).send({ success: false, msg: 'Error saving order to database' });
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send({ success: false, msg: 'Internal Server Error' });
    }
};

module.exports = {
    renderProductPage,
    createOrder,
    handleWebhook  // Export the webhook handler
};
