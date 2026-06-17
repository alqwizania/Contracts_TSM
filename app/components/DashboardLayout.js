"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { LogOutIcon, LockIcon } from "./Icons";

export default function DashboardLayout({ children, activeTab }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Always collapsed by default on initial page load
    setIsCollapsed(true);

    // Load user info
    const storedUser = localStorage.getItem("pha_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    // Set up a custom event listener to stay in sync with sidebar clicks
    const handleToggle = () => {
      const state = localStorage.getItem("pha_sidebar_collapsed") === "true";
      setIsCollapsed(state);
    };

    window.addEventListener("pha_sidebar_toggle", handleToggle);
    return () => window.removeEventListener("pha_sidebar_toggle", handleToggle);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pha_token");
    localStorage.removeItem("pha_user");
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const getPageTitle = (tab) => {
    switch (tab) {
      case "dashboard": return "لوحة التحكم بالمحفظة";
      case "portfolio": return "المحفظة التفصيلية للمشاريع";
      case "priority": return "حاسبة الأولويات للمشاريع";
      case "users": return "إدارة حسابات المستخدمين";
      default: return "تفاصيل وحالة المادة";
    }
  };

  const getPageSubtitle = (tab) => {
    switch (tab) {
      case "dashboard": return "مؤشرات الأداء العام وإحصاءات مراحل تنفيذ المشاريع والعقود 2026";
      case "portfolio": return "استعراض كافة المشاريع والعقود وتصفح تفاصيلها وتحديثاتها الأسبوعية";
      case "priority": return "مصفوفة تقييم الأثر والمواءمة الاستراتيجية وتحديد درجات الأولوية";
      case "users": return "صلاحيات الأعضاء وحسابات لجنة المشاريع والعقود لهيئة الصحة العامة";
      default: return "هيئة الصحة العامة - وقاية";
    }
  };

  return (
    <div className="dashboard-layout-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} />

      {/* Main Content Area */}
      <main className={`main-content-panel ${isCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Page Header */}
        <div className="page-header-container glass-panel animate-fade-in">
          <div className="header-right">
            <h1 className="page-title">{getPageTitle(activeTab)}</h1>
            <p className="page-subtitle">{getPageSubtitle(activeTab)}</p>
          </div>
          
          <div className="header-left">
            {user ? (
              <div className="user-profile-header">
                <div className="user-info-text">
                  <span className="user-name">{user.full_name}</span>
                  <span className="user-role">{user.role === 'admin' ? 'مدير النظام' : 'عضو اللجنة'}</span>
                </div>
                <div className="user-avatar-circle">{user.full_name ? user.full_name[0] : 'U'}</div>
              </div>
            ) : (
              <Link href="/login" className="header-login-btn">
                <LockIcon size={16} />
                <span>تسجيل الدخول</span>
              </Link>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="content-inner animate-fade-in">
          {children}
        </div>

        {/* Global Static Footer with PHA Logo */}
        <footer className="dashboard-footer-static glass-panel">
          <div className="footer-content">
            <span className="footer-copyright">جميع الحقوق محفوظة © هيئة الصحة العامة - وقاية ٢٠٢٦</span>
            <div className="footer-logo">
              <img 
                src="/logo.png" 
                alt="شعار وقاية" 
                className="footer-logo-img"
              />
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .dashboard-footer-static {
          width: 100%;
          max-width: 1400px;
          margin: 32px auto 0 auto;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(13, 152, 159, 0.08);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
          box-sizing: border-box;
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          direction: rtl;
        }

        .footer-copyright {
          font-family: var(--font-cairo);
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 700;
        }

        .footer-logo-img {
          height: 36px;
          object-fit: contain;
          background: #ffffff;
          padding: 4px 8px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0,0,0,0.02);
        }

        .dashboard-layout-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          background-color: var(--bg-gradient-end);
        }

        .main-content-panel {
          flex: 1;
          width: 100%;
          min-height: 100vh;
          padding-right: 284px; /* Matches sidebar expanded width 260px + 24px gap */
          padding-left: 24px;
          padding-top: 24px;
          padding-bottom: 24px;
          transition: padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }

        .main-content-panel.sidebar-collapsed {
          padding-right: 102px; /* Matches sidebar collapsed width 78px + 24px gap */
        }

        /* Page Header Container */
        .page-header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          margin-bottom: 24px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(13, 152, 159, 0.08);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
          backdrop-filter: blur(10px);
          max-width: 1400px;
          margin-right: auto;
          margin-left: auto;
          box-sizing: border-box;
          width: 100%;
        }

        .header-right {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .page-title {
          font-family: var(--font-cairo);
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .page-subtitle {
          font-family: var(--font-cairo);
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin: 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-profile-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        .user-name {
          font-family: var(--font-cairo);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .user-role {
          font-family: var(--font-cairo);
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .user-avatar-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.95rem;
          box-shadow: 0 4px 10px rgba(13, 152, 159, 0.15);
        }

        .header-logout-btn {
          background: rgba(220, 38, 38, 0.05);
          border: 1px solid rgba(220, 38, 38, 0.1);
          color: #dc2626;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-right: 8px;
        }

        .header-logout-btn:hover {
          background: #dc2626;
          color: #ffffff;
          transform: scale(1.05);
        }

        .header-login-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          color: #ffffff !important;
          text-decoration: none !important;
          font-family: var(--font-cairo);
          font-size: 0.8rem;
          font-weight: 700;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(13, 152, 159, 0.15);
          transition: all 0.2s ease;
        }

        .header-login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(13, 152, 159, 0.25);
        }

        .content-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0;
          box-sizing: border-box;
          width: 100%;
        }

        /* Mobile Responsive Adjustments */
        @media (max-width: 768px) {
          .main-content-panel,
          .main-content-panel.sidebar-collapsed {
            padding-right: 0 !important;
            padding-left: 0 !important;
            padding-top: 72px; /* Clear mobile top bar (60px + gap) */
          }
          
          .content-inner {
            padding: 16px;
          }

          .page-header-container {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 16px;
            margin-bottom: 16px;
            border-radius: 0;
            border-left: none;
            border-right: none;
          }

          .header-left {
            justify-content: space-between;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            padding-top: 12px;
          }
        }
      `}</style>
    </div>
  );
}
