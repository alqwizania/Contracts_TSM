import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_contracts_committee_2026_pha';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: "غير مصرح" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    return Response.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    return Response.json({ error: "جلسة منتهية الصلاحية أو غير صالحة" }, { status: 401 });
  }
}
