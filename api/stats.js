import { supabase } from '../_utils/supabase.js';

export default async (req, context) => {
  try {
    const { count: bundleCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) throw productsError;

    const { count: delivered, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PAID');

    if (ordersError) throw ordersError;

    return new Response(JSON.stringify({
      bundleCount: bundleCount || 0,
      delivered: delivered || 0
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[stats]', error);
    return new Response(JSON.stringify({ bundleCount: 0, delivered: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};