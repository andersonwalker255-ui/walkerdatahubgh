import { supabase } from '../_utils/supabase.js';

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_TOKEN}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ status: 'success', orders: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[admin/orders]', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}