// CheckoutPage.jsx
import React, { useState } from 'react';
import PayPalButton from './PayPalButton'; // The component we built earlier

function CheckoutPage() {
    // In a real app, this cart total would come from a Cart context or state
    const cartTotal = 25.00; 

    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');

    const handlePaymentSuccess = (paymentResult) => {
        console.log('Payment worked!', paymentResult);
        // Here you would show a success message and clear the cart
        alert(`Thank you ${customerName}! Your tickets are on their way.`);
    };

    const handlePaymentError = (error) => {
        console.error('Payment failed', error);
        alert('Payment failed. Please try again.');
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1>Checkout</h1>
            
            {/* Order Summary Section */}
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <h2>Your Order</h2>
                <p>General Admission Ticket x 1: ${cartTotal}</p>
                <hr />
                <p><strong>Total: ${cartTotal} USD</strong></p>
            </div>

            {/* Customer Info Form */}
            <div style={{ marginBottom: '20px' }}>
                <label>Full Name:</label>
                <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                
                <label>Email:</label>
                <input 
                    type="email" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px' }}
                />
            </div>

            {/* Payment Section - PayPal Button lives here */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <h3>Payment Method</h3>
                <PayPalButton 
                    amount={cartTotal}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                />
            </div>
        </div>
    );
}

export default CheckoutPage;