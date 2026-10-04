import { supabase } from '../../_utils/supabase.js';

export async function GET(req) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const orderId = parts[parts.length - 1];

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Order ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ status: 'success', order: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Order not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}