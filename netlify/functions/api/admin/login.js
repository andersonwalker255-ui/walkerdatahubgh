import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { password } = await req.json();
    if (!password) {
      return new Response(JSON.stringify({ error: 'Password required' }), { status: 400 });
    }

    const hashed = process.env.ADMIN_PASSWORD_HASH;
    if (!hashed) {
      console.error('ADMIN_PASSWORD_HASH not set');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    const valid = await bcrypt.compare(password, hashed);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[admin/login]', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), { status: 500 });
  }
};