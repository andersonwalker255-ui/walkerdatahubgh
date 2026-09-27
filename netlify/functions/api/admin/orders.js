import { getStore } from '@netlify/blobs';
import jwt from 'jsonwebtoken';

export default async (req, context) => {
  // Verify JWT
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const token = auth.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }

  try {
    const store = getStore('data');
    const orders = await store.get('orders', { type: 'json' }) || [];
    return new Response(JSON.stringify({ orders }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[admin/orders]', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), { status: 500 });
  }
};