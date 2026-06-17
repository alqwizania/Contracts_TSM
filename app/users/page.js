"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import {
  UsersIcon,
  AlertIcon,
  TrashIcon,
  LockIcon,
  PlusIcon,
  HomeIcon
} from "../components/Icons";

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  // Add new user form state
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("committee_member");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pha_token");
    const storedUser = localStorage.getItem("pha_user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);

    if (parsedUser.role !== 'admin') {
      setLoading(false);
      return;
    }

    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const token = localStorage.getItem("pha_token");
      const res = await fetch("/api/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || "فشل تحميل قائمة المستخدمين");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحميل المستخدمين من الخادم");
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    if (!username.trim() || !password || !fullName.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("pha_token");
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          full_name: fullName.trim(),
          role
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "تم إضافة المستخدم بنجاح");
        setUsername("");
        setFullName("");
        setPassword("");
        setRole("committee_member");
        fetchUsers();
      } else {
        setError(data.error || "فشل إضافة المستخدم");
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم لإضافة المستخدم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, usernameToDelete) => {
    if (usernameToDelete === "admin") {
      alert("لا يمكن حذف حساب مدير النظام الأساسي");
      return;
    }
    if (id === currentUser.id) {
      alert("لا يمكنك حذف حسابك الخاص الذي تسجل الدخول به حالياً");
      return;
    }

    const confirmDel = confirm(`هل أنت متأكد من رغبتك في حذف المستخدم: ${usernameToDelete}؟`);
    if (!confirmDel) return;

    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("pha_token");
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "تم حذف المستخدم بنجاح");
        fetchUsers();
      } else {
        setError(data.error || "فشل حذف المستخدم");
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم لحذف المستخدم");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="loading-screen flex-center">
        <div className="spinner"></div>
        <p>جاري تحميل إدارة المستخدمين...</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            flex-direction: column;
            gap: 16px;
            background: #f4f8f9;
            font-family: var(--font-cairo), sans-serif;
          }
          .spinner {
            width: 45px;
            height: 45px;
            border: 4px solid rgba(13, 152, 159, 0.1);
            border-radius: 50%;
            border-top-color: var(--color-secondary);
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Access Denied view for non-admin users
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <DashboardLayout activeTab="users">
        <div className="denied-container">
          <section className="glass-panel denied-card flex-center animate-fade-in">
            <span className="denied-icon"><AlertIcon size={48} style={{ color: "#dc2626" }} /></span>
            <h2>عذراً، هذا القسم غير مصرح لك بالدخول إليه</h2>
            <p>إدارة الحسابات وصلاحيات الأعضاء مخصصة لمدير النظام (admin) فقط. يرجى التواصل مع الدعم الفني إذا كنت بحاجة إلى صلاحيات إضافية.</p>
            <button onClick={() => router.push("/")} className="btn btn-primary back-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <HomeIcon size={16} />
              <span>العودة للوحة التحكم</span>
            </button>
          </section>
        </div>
        <style jsx>{`
          .denied-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .denied-card {
            flex-direction: column;
            padding: 50px 30px;
            text-align: center;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(220, 38, 38, 0.15);
            max-width: 600px;
            margin: 40px auto;
            gap: 16px;
          }
          .denied-icon {
            font-size: 3rem;
          }
          .denied-card h2 {
            font-size: 1.25rem;
            color: #dc2626;
            font-weight: 800;
          }
          .denied-card p {
            font-size: 0.85rem;
            color: var(--text-secondary);
            line-height: 1.6;
          }
          .back-btn {
            font-size: 0.85rem;
            padding: 10px 20px;
            margin-top: 10px;
        `}</style>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="users">
      <div className="users-container">



      {/* Notifications */}
      {error && <div className="notification-banner error-banner animate-fade-in">{error}</div>}
      {successMsg && <div className="notification-banner success-banner animate-fade-in">{successMsg}</div>}

      {/* Users Split Layout */}
      <div className="users-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {/* User list table */}
        <section className="glass-panel list-section">
          <h3>قائمة حسابات النظام ({users.length})</h3>
          
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>الاسم الكامل</th>
                  <th>اسم المستخدم</th>
                  <th>الصلاحية</th>
                  <th>تاريخ الإنشاء</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="user-fullname-cell">
                      <div className="user-icon-circle">{u.full_name[0]}</div>
                      <span className="user-fullname-text">{u.full_name}</span>
                    </td>
                    <td className="user-username">@{u.username}</td>
                    <td>
                      <span className={u.role === 'admin' ? 'badge badge-blue' : 'badge badge-green'}>
                        {u.role === 'admin' ? 'مدير النظام' : 'عضو اللجنة'}
                      </span>
                    </td>
                    <td className="user-date">{formatDate(u.created_at)}</td>
                    <td>
                      {u.username !== 'admin' && u.id !== currentUser?.id ? (
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.username)} 
                          className="btn-delete"
                          title="حذف المستخدم"
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <TrashIcon size={14} />
                          <span>حذف</span>
                        </button>
                      ) : (
                        <span className="btn-delete-disabled" title="لا يمكن حذف الحساب الأساسي أو حسابك الخاص" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <LockIcon size={14} />
                          <span>محمي</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add user form */}
        <section className="glass-panel form-section">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusIcon size={18} className="text-teal" />
            <span>إضافة مستخدم جديد</span>
          </h3>
          <p className="form-desc text-muted">يرجى تعبئة الحقول التالية لإنشاء حساب لجنة أو إدارة جديد.</p>

          <form onSubmit={handleCreateUser} className="add-user-form">
            <div className="form-group">
              <label htmlFor="fullname">الاسم الكامل</label>
              <input 
                type="text" 
                id="fullname"
                placeholder="مثال: د. محمد العتيبي" 
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">اسم المستخدم (بالأحرف الإنجليزية)</label>
              <input 
                type="text" 
                id="username"
                placeholder="مثال: malotaibi" 
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">كلمة المرور</label>
              <input 
                type="password" 
                id="password"
                placeholder="أدخل كلمة مرور قوية..." 
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">صلاحيات الدور الوظيفي</label>
              <select 
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input select-input"
              >
                <option value="committee_member">عضو اللجنة (متاح له التعليق والتقييم)</option>
                <option value="admin">مدير النظام (كامل الصلاحيات وإدارة الحسابات)</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary submit-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
              {submitting ? (
                <span>جاري إنشاء الحساب...</span>
              ) : (
                <>
                  <UsersIcon size={16} />
                  <span>إنشاء حساب مستخدم</span>
                </>
              )}
            </button>
          </form>
        </section>
      </div>

      <style jsx>{`
        .users-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .banner-section {
          padding: 30px;
          background: rgba(255, 255, 255, 0.7);
        }

        .banner-content h2 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .banner-content p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .notification-banner {
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .error-banner {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.2);
          color: #be123c;
        }

        .success-banner {
          background: rgba(13, 148, 136, 0.1);
          border: 1px solid rgba(13, 148, 136, 0.2);
          color: #0f766e;
        }

        .users-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
        }

        @media (max-width: 992px) {
          .users-grid {
            grid-template-columns: 1fr;
          }
        }

        .list-section, .form-section {
          padding: 24px;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .list-section h3, .form-section h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .form-desc {
          font-size: 0.8rem;
          margin-top: -8px;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
          font-size: 0.85rem;
        }

        .users-table th {
          font-weight: 700;
          color: var(--text-secondary);
          padding: 12px 16px;
          border-bottom: 2px solid rgba(0,0,0,0.06);
        }

        .users-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.04);
          vertical-align: middle;
        }

        .user-fullname-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(13, 152, 159, 0.08);
          color: var(--color-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .user-fullname-text {
          font-weight: 700;
          color: var(--text-primary);
        }

        .user-username {
          font-family: monospace;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .user-date {
          color: var(--text-secondary);
        }

        .btn-delete {
          background: rgba(220, 38, 38, 0.08);
          border: 1px solid rgba(220, 38, 38, 0.15);
          color: #dc2626;
          padding: 6px 12px;
          border-radius: 8px;
          font-family: var(--font-cairo);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-delete:hover {
          background: #dc2626;
          color: #ffffff;
        }

        .btn-delete-disabled {
          display: inline-block;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          background: rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.05);
          padding: 6px 12px;
          border-radius: 8px;
        }

        /* Form styling */
        .add-user-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 10px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .select-input {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 12px center;
          background-size: 14px;
          appearance: none;
          padding-left: 36px;
        }

        .submit-btn {
          font-size: 0.85rem;
          padding: 12px;
          justify-content: center;
          margin-top: 10px;
        }
      `}</style>
      </div>
    </DashboardLayout>
  );
}
