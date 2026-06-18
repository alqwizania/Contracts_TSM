"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import AnimatedLogo from "./AnimatedLogo";

export default function Header({ activeTab }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("pha_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pha_token");
    localStorage.removeItem("pha_user");
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="glass-panel navbar animate-fade-in">
      <div className="nav-right">
        <AnimatedLogo size={42} />
        <div className="nav-title-block">
          <h1>محفظة المشاريع والعقود 2026</h1>
          <p>هيئة الصحة العامة - وقاية</p>
        </div>
      </div>

      <nav className="nav-tabs-container">
        <Link href="/" className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}>
          📊 لوحة القيادة
        </Link>
        <Link href="/priority" className={`nav-tab ${activeTab === 'priority' ? 'active' : ''}`}>
          🎯 تقييم الأولويات
        </Link>
        {user?.role === 'admin' && (
          <Link href="/users" className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}>
            👥 إدارة المستخدمين
          </Link>
        )}
      </nav>
      
      <div className="nav-left">
        {user ? (
          <div className="user-profile">
            <div className="user-avatar">{user.full_name ? user.full_name[0] : 'U'}</div>
            <div className="user-info">
              <span className="user-name">{user.full_name}</span>
              <span className="user-role">{user.role === 'admin' ? 'مدير النظام' : 'عضو اللجنة'}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-glass logout-btn">
              تسجيل الخروج
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn btn-primary login-btn">
            🔑 تسجيل الدخول
          </Link>
        )}
      </div>

      <style jsx>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          margin-bottom: 16px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(13, 152, 159, 0.08);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-logo {
          object-fit: contain;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
        }

        .nav-title-block h1 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .nav-title-block p {
          font-size: 0.75rem;
          color: var(--color-secondary);
          font-weight: 700;
        }

        .nav-tabs-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.03);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.02);
        }

        .nav-tab {
          font-family: var(--font-cairo);
          font-size: 0.85rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 8px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .nav-tab:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.5);
        }

        .nav-tab.active {
          color: #ffffff;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          box-shadow: 0 4px 12px rgba(13, 152, 159, 0.15);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.05);
          padding: 6px 14px;
          border-radius: 12px;
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(13, 152, 159, 0.15);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .user-role {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .logout-btn {
          font-size: 0.7rem;
          padding: 6px 10px;
          border-radius: 6px;
          margin-right: 8px;
        }

        .login-btn {
          font-size: 0.8rem;
          padding: 8px 16px;
        }

        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
            padding: 16px;
          }
          .nav-tabs-container {
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
}
