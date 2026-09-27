// netlify/functions/api/paystack/initialize.js
// netlify/functions/api/paystack/initialize.js

exports.handler = async (event) => {
  // 1. Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 2. Get the data sent from your website
    // Notice we added orderId here so we can link the payment to the order
    const { email, amount, bundle_name, orderId } = JSON.parse(event.body);

    // 3. Check if we have everything we need
    if (!email || !amount || !orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Please provide an email, amount, and orderId." }),
      };
    }

    // 4. Talk to Paystack securely
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      // THIS IS WHERE THAT BLOCK OF CODE GOES
      body: JSON.stringify({
        email: email, // Customer's email
        amount: amount, // Amount in Pesewas (e.g., GH₵4.20 = 420)
        currency: "GHS",
        channels: ["mobile_money"], // Forces the Mobile Money prompt
        reference: orderId, // <-- IMPORTANT: Links this payment to your order
        metadata: {
          bundle_name: bundle_name, // Saves the bundle name in Paystack records
        },
        callback_url: "https://walkerdatahubgh.netlify.app/payment-success", // Where to send them after payment
      }),
    });

    const data = await response.json();

    // 5. Send Paystack's response back to your website
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    // 6. If something breaks, log it and tell the website
    console.error("Paystack Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Payment initialization failed." }),
    };
  }
};