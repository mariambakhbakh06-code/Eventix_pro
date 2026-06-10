const express = require('express');
const router = express.Router();
const axios = require('axios');

// Your sandbox credentials
const CLIENT_ID = 'AQf0VPszk-PUWp8Kvjaz-50K7xUX2jVJzgO1fWXThUBCcuVVnR1y5rmEA-uc-rx5Azr_eFtjA4ma08KC';
const CLIENT_SECRET = 'EPpOmDOm86HLHK_JVNtoj7wBLU5aGKdReYRQM8Enq1G65OxNu23ArISMu0uW3cOb-hjoZPIgvi8efIyR';
const BASE_URL = 'https://api-m.sandbox.paypal.com'; // Use 'https://api-m.paypal.com' for live

// Helper: Get PayPal access token
async function getPayPalAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
        `${BASE_URL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    
    return response.data.access_token;
}

// Endpoint 1: Create an order (called from React)
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'USD', description } = req.body;
        
        const accessToken = await getPayPalAccessToken();
        
        const response = await axios.post(
            `${BASE_URL}/v2/checkout/orders`,
            {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency,
                        value: amount
                    },
                    description: description || 'EVENTIX Ticket Purchase'
                }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Send the order ID back to React
        res.json({ orderId: response.data.id });
        
    } catch (error) {
        console.error('Error creating order:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Endpoint 2: Capture payment (called from React after approval)
router.post('/capture-order', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const accessToken = await getPayPalAccessToken();
        
        const response = await axios.post(
            `${BASE_URL}/v2/checkout/orders/${orderId}/capture`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Payment successful! Update your database here
        const captureData = response.data;
        
        // TODO: Save to your database
        // - Mark tickets as paid
        // - Store transaction ID
        // - Send confirmation email
        
        // Also trigger your Zoho Flow webhook here if needed
        // await axios.post('YOUR_ZOHO_WEBHOOK_URL', captureData);
        
        res.json({ 
            success: true, 
            transactionId: captureData.purchase_units[0].payments.captures[0].id,
            captureData: captureData
        });
        
    } catch (error) {
        console.error('Error capturing order:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to capture payment' });
    }
});

module.exports = router;