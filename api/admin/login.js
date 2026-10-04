export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { password } = await req.json();

    // Check against an environment variable, NOT a hardcoded string
    if (password !== process.env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    // In a real production app, you should return a JWT here.
    // For simplicity, we return a success flag. 
    // The frontend should store this and send it with admin requests.
    return new Response(JSON.stringify({ 
      status: 'success', 
      token: process.env.ADMIN_SECRET_TOKEN // Send a secret token to the frontend
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Login failed' }), { status: 500 });
  }
};