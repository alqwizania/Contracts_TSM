import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_contracts_committee_2026_pha';

function checkAdmin(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && decoded.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function GET(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return Response.json({ error: "جلسة غير صالحة" }, { status: 401 });
  }

  try {
    const users = await sql`
      SELECT id, username, full_name, role, created_at 
      FROM users 
      ORDER BY id ASC
    `;
    return Response.json({ success: true, users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return Response.json({ error: "حدث خطأ أثناء تحميل المستخدمين" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAdmin(request)) {
    return Response.json({ error: "غير مصرح لك بإضافة مستخدمين. يجب أن تكون مديراً للنظام." }, { status: 403 });
  }

  try {
    const { username, password, full_name, role } = await request.json();
    if (!username || !password || !full_name) {
      return Response.json({ error: "يرجى ملء جميع الحقول المطلوبة" }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if username already exists
    const existing = await sql`SELECT id FROM users WHERE username = ${cleanUsername}`;
    if (existing.length > 0) {
      return Response.json({ error: "اسم المستخدم هذا موجود بالفعل" }, { status: 400 });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const userRole = role || 'committee_member';

    await sql`
      INSERT INTO users (username, password_hash, full_name, role)
      VALUES (${cleanUsername}, ${hashed}, ${full_name.trim()}, ${userRole})
    `;

    return Response.json({ success: true, message: "تم إضافة المستخدم بنجاح" });
  } catch (error) {
    console.error("Create User Error:", error);
    return Response.json({ error: "حدث خطأ أثناء إضافة المستخدم" }, { status: 500 });
  }
}
