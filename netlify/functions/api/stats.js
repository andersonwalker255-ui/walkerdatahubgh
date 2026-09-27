import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore('data');
    const products = await store.get('products', { type: 'json' }) || [];
    const orders = await store.get('orders', { type: 'json' }) || [];
    const delivered = orders.filter(o => o.status === 'PAID').length;

    return new Response(JSON.stringify({
      bundleCount: products.length,
      delivered
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[stats]', error);
    return new Response(JSON.stringify({ error: 'Failed to get stats' }), { status: 500 });
  }
};