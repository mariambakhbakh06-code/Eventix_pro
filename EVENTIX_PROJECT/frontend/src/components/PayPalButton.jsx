import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

function PayPalButton({ amount, onSuccess, onError }) {
    
    const createOrder = async () => {
        try {
            // Call your backend to create the order
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    currency: 'USD',
                    description: 'EVENTIX Ticket'
                })
            });
            
            const data = await response.json();
            return data.orderId; // Return the order ID to PayPal
            
        } catch (error) {
            console.error('Failed to create order:', error);
            if (onError) onError(error);
        }
    };
    
    const onApprove = async (data, actions) => {
        try {
            // Payment was approved! Now capture it on your backend
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Payment successful!
                if (onSuccess) onSuccess(result);
            } else {
                if (onError) onError(result);
            }
            
        } catch (error) {
            console.error('Failed to capture order:', error);
            if (onError) onError(error);
        }
    };
    
    return (
        <PayPalScriptProvider options={{ 
            "client-id": "YOUR_SANDBOX_CLIENT_ID", // Same as Express backend
            "currency": "USD",
            "intent": "capture"
        }}>
            <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                onError={(err) => {
                    console.error('PayPal Error:', err);
                    if (onError) onError(err);
                }}
            />
        </PayPalScriptProvider>
    );
}

export default PayPalButton;