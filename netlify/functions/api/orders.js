import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { customerPhone, network, productId, productName, totalGHS } = body;

    if (!customerPhone || !network || !productId || !totalGHS) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const store = getStore('data');
    // Read current products to validate stock
    const products = await store.get('products', { type: 'json' }) || [];
    const product = products.find(p => p.id === productId);
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }
    if (product.stock <= 0) {
      return new Response(JSON.stringify({ error: 'Out of stock' }), { status: 400 });
    }

    // Create order
    const order = {
      id: 'ord_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      customerPhone,
      network,
      productId,
      productName,
      totalGHS,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // Read existing orders
    const orders = await store.get('orders', { type: 'json' }) || [];
    orders.push(order);
    await store.set('orders', JSON.stringify(orders));

    // (Do NOT reduce stock here – reduce only after payment verification)

    return new Response(JSON.stringify({ orderId: order.id, status: 'PENDING' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[orders]', error);
    return new Response(JSON.stringify({ error: 'Failed to create order' }), { status: 500 });
  }
};