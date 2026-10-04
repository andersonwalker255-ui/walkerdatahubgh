import { supabase } from './_utils/supabase.js';

export async function GET(req) {
  try {
    const { count: bundleCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: delivered } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PAID');

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
}