import { sql } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_contracts_committee_2026_pha';

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const targetId = parseInt(resolvedParams.id, 10);

  if (isNaN(targetId)) {
    return Response.json({ error: "معرف غير صالح" }, { status: 400 });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  let loggedInUser = null;
  try {
    const token = authHeader.split(' ')[1];
    loggedInUser = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return Response.json({ error: "جلسة غير صالحة" }, { status: 401 });
  }

  if (!loggedInUser || loggedInUser.role !== 'admin') {
    return Response.json({ error: "غير مصرح لك بحذف المستخدمين. يجب أن تكون مديراً للنظام." }, { status: 403 });
  }

  try {
    const users = await sql`SELECT id, username FROM users WHERE id = ${targetId}`;
    if (users.length === 0) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const userToDelete = users[0];

    if (userToDelete.username === 'admin') {
      return Response.json({ error: "لا يمكن حذف مدير النظام الأساسي (admin)" }, { status: 400 });
    }

    if (userToDelete.id === loggedInUser.id) {
      return Response.json({ error: "لا يمكن حذف حسابك الذي تسجل به الدخول حالياً" }, { status: 400 });
    }

    await sql`DELETE FROM users WHERE id = ${targetId}`;

    return Response.json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return Response.json({ error: "حدث خطأ أثناء حذف المستخدم" }, { status: 500 });
  }
}
