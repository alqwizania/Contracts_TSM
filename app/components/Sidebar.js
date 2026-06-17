"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  UsersIcon, 
  LogOutIcon, 
  MenuIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  ChartIcon,
  ClipboardIcon,
  FileTextIcon,
  ProjectLogo
} from "./Icons";

export default function Sidebar({ activeTab }) {
  const [user, setUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load user info
    const storedUser = localStorage.getItem("pha_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    // Always collapsed by default on initial page load
    setIsCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("pha_sidebar_collapsed", String(newState));
    window.dispatchEvent(new Event("pha_sidebar_toggle"));
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("pha_token");
    localStorage.removeItem("pha_user");
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar glass-panel">
        <button className="mobile-menu-btn" onClick={toggleMobileSidebar} aria-label="القائمة">
          <MenuIcon size={24} />
        </button>
        
        <div className="mobile-brand">
          <Image 
            src="/logo.png" 
            alt="وقاية" 
            width={70} 
            height={35} 
            className="mobile-logo-img"
            priority
          />
          <span className="mobile-brand-title">محفظة المشاريع والعقود</span>
        </div>

        {user && (
          <div className="mobile-user-avatar">
            {user.full_name ? user.full_name[0] : 'U'}
          </div>
        )}
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div className="mobile-sidebar-backdrop" onClick={toggleMobileSidebar} />
      )}

      {/* Main Sidebar Wrapper */}
      <aside className={`sidebar-aside glass-panel ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}>
        {/* Header/Logo Section with Project Management Icon Logo */}
        <div className="sidebar-header">
          <div className={`logo-wrapper-pm ${isCollapsed ? "logo-collapsed" : ""}`}>
            <ProjectLogo size={isCollapsed ? 32 : 36} />
            <div className={`brand-text-pm ${isCollapsed ? "collapsed-label" : ""}`}>
              <span className="brand-name-pm">منصة المشاريع</span>
              <span className="brand-sub-pm">هيئة الصحة العامة</span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <Link href="/" className={`nav-link-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <span className="nav-icon"><ChartIcon size={20} /></span>
            <span className={`nav-label ${isCollapsed ? "collapsed-label" : ""}`}>لوحة التحكم</span>
          </Link>

          <Link href="/portfolio" className={`nav-link-item ${activeTab === 'portfolio' ? 'active' : ''}`}>
            <span className="nav-icon"><ClipboardIcon size={20} /></span>
            <span className={`nav-label ${isCollapsed ? "collapsed-label" : ""}`}>كافة المشاريع</span>
          </Link>

          <Link href="/priority" className={`nav-link-item ${activeTab === 'priority' ? 'active' : ''}`}>
            <span className="nav-icon"><FileTextIcon size={20} /></span>
            <span className={`nav-label ${isCollapsed ? "collapsed-label" : ""}`}>حاسبة الأولويات</span>
          </Link>

          {user?.role === 'admin' && (
            <Link href="/users" className={`nav-link-item ${activeTab === 'users' ? 'active' : ''}`}>
              <span className="nav-icon"><UsersIcon size={20} /></span>
              <span className={`nav-label ${isCollapsed ? "collapsed-label" : ""}`}>إدارة المستخدمين</span>
            </Link>
          )}
        </nav>

        {/* User Info / Logout Section at bottom */}
        <div className="sidebar-footer">
          {/* Desktop Collapse Toggle */}
          <button className="toggle-btn-footer desktop-only" onClick={toggleSidebar} aria-label={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}>
            <span className="toggle-icon">
              {isCollapsed ? <ChevronLeftIcon size={20} /> : <ChevronRightIcon size={20} />}
            </span>
          </button>

          {/* Desktop User Info & Logout */}
          {user && (
            <div className="desktop-user-logout-section desktop-only">
              <div className={`user-info-summary ${isCollapsed ? "collapsed-user" : ""}`}>
                <div className="user-avatar">{user.full_name ? user.full_name[0] : 'U'}</div>
                <div className={`user-details ${isCollapsed ? "collapsed-details" : ""}`}>
                  <span className="user-fullname">{user.full_name}</span>
                  <span className="user-role-label">{user.role === 'admin' ? 'مدير النظام' : 'عضو اللجنة'}</span>
                </div>
              </div>
              <button className={`btn-logout-desktop ${isCollapsed ? "collapsed" : ""}`} onClick={handleLogout} title="تسجيل الخروج">
                <span className="logout-icon"><LogOutIcon size={18} /></span>
                <span className={`logout-text ${isCollapsed ? "collapsed-label" : ""}`}>تسجيل الخروج</span>
              </button>
            </div>
          )}

          {/* Mobile User Details & Logout */}
          {user && (
            <div className="mobile-user-block mobile-only">
              <div className="user-info-wrapper">
                <div className="user-avatar">{user.full_name ? user.full_name[0] : 'U'}</div>
                <div className="user-details">
                  <span className="user-fullname">{user.full_name}</span>
                  <span className="user-role-label">{user.role === 'admin' ? 'مدير النظام' : 'عضو اللجنة'}</span>
                </div>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                <span className="logout-icon"><LogOutIcon size={18} /></span>
                <span className="logout-text">تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
