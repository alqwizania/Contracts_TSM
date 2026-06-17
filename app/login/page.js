"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertIcon } from "../components/Icons";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      // Save token & user info
      localStorage.setItem("pha_token", data.token);
      localStorage.setItem("pha_user", JSON.stringify(data.user));

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      
      {/* Left Column: Vibrant Animated Project Nodes presentation */}
      <div className="left-info-panel">
        
        {/* Subtle grid lines background overlay */}
        <div className="illustration-grid-overlay"></div>
        
        {/* Floating animated network SVG */}
        <div className="network-svg-container">
          <svg className="network-svg" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-purple" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path className="net-line line-1" d="M100 200 L300 150 L500 250 L650 150" stroke="rgba(12, 166, 120, 0.12)" strokeWidth="2" strokeDasharray="5,5" />
            <path className="net-line line-2" d="M200 450 L300 150 L400 600" stroke="rgba(11, 114, 133, 0.15)" strokeWidth="2" />
            <path className="net-line line-3" d="M500 250 L400 600 L650 500" stroke="rgba(11, 114, 133, 0.12)" strokeWidth="2" strokeDasharray="8,4" />
            <path className="net-line line-4" d="M100 200 L200 450 L400 600" stroke="rgba(12, 166, 120, 0.1)" strokeWidth="3" />
            
            {/* Animated flowing particles */}
            <circle r="4" fill="#0da678" filter="url(#glow-green)">
              <animateMotion dur="8s" repeatCount="indefinite" path="M100 200 L300 150 L500 250 L650 150" />
            </circle>
            <circle r="5" fill="#0b7285" filter="url(#glow-cyan)">
              <animateMotion dur="6s" repeatCount="indefinite" path="M200 450 L300 150 L400 600" />
            </circle>
            <circle r="4" fill="#a855f7" filter="url(#glow-purple)">
              <animateMotion dur="10s" repeatCount="indefinite" path="M500 250 L400 600 L650 500" />
            </circle>
            <circle r="5" fill="#0da678" filter="url(#glow-green)">
              <animateMotion dur="7s" repeatCount="indefinite" path="M100 200 L200 450 L400 600" />
            </circle>

            <circle className="net-node node-1" cx="100" cy="200" r="8" fill="var(--color-primary)" />
            <circle className="net-node node-2" cx="300" cy="150" r="12" fill="var(--color-secondary)" />
            <circle className="net-node node-3" cx="500" cy="250" r="10" fill="#a855f7" />
            <circle className="net-node node-4" cx="200" cy="450" r="14" fill="#ca8a04" />
            <circle className="net-node node-5" cx="400" cy="600" r="16" fill="var(--color-primary)" />
            <circle className="net-node node-6" cx="650" cy="150" r="9" fill="#3b82f6" />
            <circle className="net-node node-7" cx="650" cy="500" r="11" fill="#ef4444" />
          </svg>
        </div>

        {/* Brand/Dashboard Slogan */}
        <div className="left-panel-content animate-fade-in">
          <div className="badge-pm-brand">منصة وقاية الرقمية</div>
          <h1 className="left-headline">لوحة متابعة المشاريع والعقود</h1>
          <p className="left-description">
            شريكك الاستراتيجي في إدارة الميزانيات، تخطيط الاحتياجات، وتقييم الأولويات لتحقيق الكفاءة التشغيلية للهيئة.
          </p>

          {/* Floating glassmorphic mockup card */}
          <div className="floating-preview-card glass-dark">
            <div className="preview-header">
              <span className="dot-indicator green-pulse"></span>
              <span className="preview-title">مؤشر أداء المحفظة الاستراتيجي</span>
            </div>
            <div className="preview-metrics">
              <div className="metric-box">
                <span className="metric-num">167</span>
                <span className="metric-lbl">مجموع المشاريع</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">106</span>
                <span className="metric-lbl">عقود نشطة</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">94.2%</span>
                <span className="metric-lbl">نسبة الإنجاز</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Clean White Form Panel */}
      <div className="right-form-panel">
        
        <div className="login-card-container animate-fade-in">
          <div className="logo-area flex-center">
            <Image 
              src="/logo.png" 
              alt="شعار هيئة الصحة العامة - وقاية" 
              width={160} 
              height={80}
              priority
              className="logo-img"
            />
          </div>
          
          <div className="card-header text-center">
            <h2>مرحباً بك مجدداً</h2>
            <p>يرجى تسجيل الدخول للوصول إلى لوحة التحكم الآمنة</p>
          </div>

          {error && (
            <div className="error-banner animate-fade-in" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: 'flex', alignItems: 'center' }}><AlertIcon size={18} /></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">اسم المستخدم</label>
              <input
                type="text"
                id="username"
                className="form-input login-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">كلمة المرور</label>
              <input
                type="password"
                id="password"
                className="form-input login-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary login-btn flex-center"
              disabled={loading}
            >
              {loading ? "جاري التحقق من الهوية..." : "تسجيل الدخول الآمن"}
            </button>
          </form>

          <div className="login-footer text-center">
            <span className="secure-badge">🔒 نظام مشفر وآمن بالكامل</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .login-page-wrapper {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          background-color: #ffffff;
          overflow: hidden;
          font-family: var(--font-cairo), sans-serif;
          position: relative;
          box-sizing: border-box;
        }

        /* Left Panel - Illustration and branding */
        .left-info-panel {
          flex: 1.25;
          background: #09171a; /* Sleek dark-teal brand slate */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          position: relative;
          color: #ffffff;
          overflow: hidden;
          box-sizing: border-box;
          border-left: 1px solid rgba(255,255,255,0.05);
        }

        .illustration-grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .network-svg-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          pointer-events: none;
        }

        .network-svg {
          width: 100%;
          height: 100%;
          opacity: 0.85;
        }

        /* SVG node / line animations */
        @keyframes pulse-node {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(12, 166, 120, 0.4)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(12, 166, 120, 0.7)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(12, 166, 120, 0.4)); }
        }

        @keyframes pulse-node-cyan {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(11, 114, 133, 0.4)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(11, 114, 133, 0.7)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(11, 114, 133, 0.4)); }
        }

        .net-node {
          transform-origin: center;
          animation: pulse-node 4s infinite ease-in-out;
        }

        .node-2, .node-4, .node-6 {
          animation-name: pulse-node-cyan;
          animation-duration: 5s;
        }

        .left-panel-content {
          width: 100%;
          max-width: 480px;
          z-index: 5;
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: right;
        }

        .badge-pm-brand {
          display: inline-flex;
          align-self: flex-start;
          padding: 6px 14px;
          background: rgba(12, 166, 120, 0.15);
          border: 1px solid rgba(12, 166, 120, 0.25);
          color: var(--color-primary);
          font-size: 0.725rem;
          font-weight: 800;
          border-radius: 30px;
        }

        .left-headline {
          font-size: 2.2rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.3;
          margin: 0;
          text-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .left-description {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0;
          font-weight: 500;
        }

        /* Floating glass preview card */
        .floating-preview-card {
          margin-top: 16px;
          background: rgba(30, 41, 59, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: float-card 6s infinite ease-in-out;
        }

        @keyframes float-card {
          0% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dot-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .green-pulse {
          background-color: var(--color-primary);
          box-shadow: 0 0 8px var(--color-primary);
          animation: indicator-pulse 2s infinite;
        }

        @keyframes indicator-pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        .preview-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.9);
        }

        .preview-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 14px;
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: center;
        }

        .metric-num {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .metric-lbl {
          font-size: 0.625rem;
          color: rgba(255,255,255,0.5);
          font-weight: 700;
        }

        /* Right Panel - Login inputs */
        .right-form-panel {
          flex: 0.9;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          position: relative;
          box-sizing: border-box;
          z-index: 10;
        }

        .login-card-container {
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: relative;
          z-index: 10;
        }

        .logo-img {
          object-fit: contain;
          background: #ffffff;
          padding: 10px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          border: 1px solid rgba(13, 152, 159, 0.04);
        }

        .card-header h2 {
          font-family: var(--font-cairo);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 6px;
          margin-top: 0;
        }

        .card-header p {
          font-family: var(--font-cairo);
          font-size: 0.78rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-family: var(--font-cairo);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-align: right;
        }

        .login-field {
          background: var(--slate-50);
          border-color: var(--slate-200);
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .login-field:focus {
          background: #ffffff;
          border-color: var(--color-secondary);
          box-shadow: 0 0 0 4px rgba(11, 114, 133, 0.06);
        }

        .login-btn {
          margin-top: 8px;
          padding: 12px;
          font-size: 0.88rem;
          font-weight: 800;
          border-radius: 10px;
          width: 100%;
        }

        .login-footer {
          margin-top: 8px;
        }

        .secure-badge {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.78rem;
          font-weight: 700;
          direction: rtl;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .left-info-panel {
            display: none;
          }
          .right-form-panel {
            flex: 1;
            padding: 36px 24px;
            background: radial-gradient(circle at 95% 5%, rgba(12, 166, 120, 0.05) 0%, transparent 40%),
                        radial-gradient(circle at 5% 95%, rgba(11, 114, 133, 0.05) 0%, transparent 45%),
                        #ffffff;
          }
          .login-card-container {
            max-width: 440px;
            background: #ffffff;
            padding: 36px 28px;
            border-radius: 20px;
            box-shadow: 0 16px 36px rgba(15, 23, 42, 0.03);
            border: 1px solid rgba(0,0,0,0.03);
          }
        }
      `}</style>
    </div>
  );
}
