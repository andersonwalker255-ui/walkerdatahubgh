import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore('data');
    const products = await store.get('products', { type: 'json' }) || [];

    const url = new URL(req.url);
    const network = url.searchParams.get('network');
    let filtered = products;
    if (network) {
      filtered = products.filter(p => p.network === network);
    }

    return new Response(JSON.stringify({ products: filtered }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[products]', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};