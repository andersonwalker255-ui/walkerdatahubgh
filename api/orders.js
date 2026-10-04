import { supabase } from '../_utils/supabase.js';

export default async (req, context) => {
  // POST: Create a new order (before Paystack)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { customerPhone, network, productId, productName, totalGHS } = body;

      if (!customerPhone || !network || !productId || !totalGHS) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          id: orderId,
          reference: orderId,
          phone: customerPhone,
          customer_phone: customerPhone,
          network: network,
          product_id: productId,
          product_name: productName,
          amount: totalGHS,
          total_ghs: totalGHS,
          status: 'PENDING',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ status: 'success', order: data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('[orders POST]', err);
      return new Response(JSON.stringify({ error: 'Failed to create order: ' + err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // GET: Fetch orders by phone
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const phone = url.searchParams.get('phone');

    if (!phone) {
      return new Response(JSON.stringify({ error: 'Phone number is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ status: 'success', orders: data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('[orders GET]', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
};