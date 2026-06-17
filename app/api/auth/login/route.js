import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_contracts_committee_2026_pha';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return Response.json({ error: "يرجى إدخال اسم المستخدم وكلمة المرور" }, { status: 400 });
    }

    // Query user
    const users = await sql`SELECT * FROM users WHERE username = ${username.trim().toLowerCase()}`;
    
    if (users.length === 0) {
      return Response.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const user = users[0];
    
    // Verify password
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return Response.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        full_name: user.full_name, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Exclude password hash from response
    const { password_hash, ...userResponse } = user;

    return Response.json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error("Login API Error:", error);
    return Response.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 });
  }
}
