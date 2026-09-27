// netlify/functions/api/orders/[id].js

const { supabase } = require('../_utils/supabase');

exports.handler = async (event, context) => {
  // 1. Get the order ID from the URL (e.g., /api/orders/ord_12345)
  const orderId = context.params.id;

  try {
    // 2. Fetch the order from the database
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    // 3. Return the order details to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: data.id,
        status: data.status,
        customerPhone: data.customer_phone,
        productName: data.product_name,
        totalGHS: data.total_ghs,
        createdAt: data.created_at
      })
    };
  } catch (error) {
    console.error('Get order error:', error);
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Order not found' })
    };
  }
};