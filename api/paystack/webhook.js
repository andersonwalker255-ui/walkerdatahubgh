import crypto from 'crypto';
import { supabase } from '../_utils/supabase.js';

export async function POST(req) {
  try {
    const body = await req.text();

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (hash !== req.headers.get('x-paystack-signature')) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const { reference, metadata, amount } = event.data;
      const orderId = metadata.orderId;
      const phone = metadata.phone;
      const network = metadata.network;

      if (orderId) {
        await supabase
          .from('orders')
          .update({ status: 'PAID', reference, paid_at: new Date().toISOString() })
          .eq('id', orderId);

        try {
          console.log(`[vendor] Delivering to ${phone} on ${network}`);
          await supabase
            .from('orders')
            .update({ status: 'DELIVERED' })
            .eq('id', orderId);
        } catch (deliveryError) {
          await supabase
            .from('orders')
            .update({ status: 'FAILED_DELIVERY' })
            .eq('id', orderId);
        }
      }
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[webhook]', error);
    return new Response('Webhook Error', { status: 500 });
  }
}