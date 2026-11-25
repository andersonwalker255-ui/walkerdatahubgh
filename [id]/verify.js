// functions/api/orders/[id]/verify.js
// netlify/functions/api/orders/[id]/verify.js

exports.handler = async (event, context) => {
  // 1. Get the order ID from the URL
  const orderId = context.params.id;
  
  // 2. Get the Paystack reference from the frontend (sent in the body)
  const { reference } = JSON.parse(event.body || '{}');

  if (!reference) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing payment reference" }) };
  }

  try {
    // 3. Ask Paystack: "Did this reference actually pay?"
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // 4. Check the response from Paystack
    if (data.status && data.data.status === 'success') {
      
      // 🚨 SECURITY CHECK: Verify the amount matches your expected price
      // For example, if the bundle is GH₵4.20, Paystack sends 420 (pesewas).
      // You should fetch the order from your database, check the amount matches.
      // If it doesn't match, do not give them the bundle!
      
      // ✅ SUCCESS! Update your database here.
      // Example (if using a simple JSON file or Supabase):
      // await updateOrderStatus(orderId, 'PAID');
      // await deliverBundle(orderId); // Trigger your data delivery API

      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'PAID', message: 'Payment verified' })
      };
    } else {
      // ❌ FAILED! The payment didn't go through.
      // Update your database here.
      // await updateOrderStatus(orderId, 'FAILED');

      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'FAILED', message: 'Payment not successful' })
      };
    }

  } catch (error) {
    console.error("Paystack verification error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Verification failed", details: error.message })
    };
  }
};