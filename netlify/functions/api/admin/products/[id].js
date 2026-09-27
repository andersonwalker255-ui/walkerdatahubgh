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

  if (req.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { id } = context.params; // Netlify path param
    const { stock } = await req.json();
    if (stock === undefined || isNaN(stock) || stock < 0) {
      return new Response(JSON.stringify({ error: 'Invalid stock value' }), { status: 400 });
    }

    const store = getStore('data');
    const products = await store.get('products', { type: 'json' }) || [];
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    products[productIndex].stock = Number(stock);
    await store.set('products', JSON.stringify(products));

    return new Response(JSON.stringify({ success: true, product: products[productIndex] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[admin/products/[id]]', error);
    return new Response(JSON.stringify({ error: 'Failed to update stock' }), { status: 500 });
  }
};