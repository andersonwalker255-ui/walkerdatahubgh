import axios from 'axios';

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, phone, network, amount, email } = body;

    if (!orderId || !phone || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const amountInPesewas = Math.round(amount * 100);

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email || `${phone}@walkerdatahubgh.com`,
        amount: amountInPesewas,
        currency: 'GHS',
        metadata: { orderId, phone, network }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return new Response(JSON.stringify({
      status: 'success',
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
      data: response.data.data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[paystack/initialize]', error.response?.data || error.message);
    return new Response(JSON.stringify({
      error: error.response?.data?.message || 'Failed to initialize payment'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}