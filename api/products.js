import { supabase } from '../_utils/supabase.js';

export default async (req, context) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(req.url);
    const network = url.searchParams.get('network');

    // NOTE: aliasing price_ghs as priceGHS to match frontend expectations
    let query = supabase.from('products').select('id, network, name, priceGHS:price_ghs, stock');
    if (network) query = query.eq('network', network);

    const { data, error } = await query;
    if (error) throw error;

    return new Response(JSON.stringify({ status: 'success', products: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[products]', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};