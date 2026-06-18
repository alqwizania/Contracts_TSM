"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import Image from "next/image";
import AnimatedLogo from "../components/AnimatedLogo";
import {
  AlertIcon,
  FolderIcon,
  CalculatorIcon,
  ChartIcon
} from "../components/Icons";

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
      
      {/* Full-screen responsive animated network SVG background */}
      <div className="network-svg-container">
        <svg className="network-svg" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
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

      {/* Subtle grid lines background overlay */}
      <div className="illustration-grid-overlay"></div>

      {/* Center container: Responsive Dual panel glass card */}
      <div className="login-centered-container">
        
        {/* Left Side: Brand presentation and features */}
        <div className="login-features-panel glass-dark">
          <div className="logo-brand-header">
            <AnimatedLogo size={46} />
            <div className="brand-titles">
              <h1 className="brand-headline">نظام إدارة المشاريع والعقود (TSM)</h1>
            </div>
          </div>
          
          <p className="brand-desc">
            الشريك الاستراتيجي الموحد لمتابعة التكاليف، وإجراءات الطرح، وتقييم أولويات المحفظة بما يخدم أهداف كفاءة الإنفاق لهيئة الصحة العامة.
          </p>

          <div className="features-list-box">
            <div className="feature-row">
              <div className="feature-icon flex-center">
                <FolderIcon size={16} className="feature-icon-svg" />
              </div>
              <div className="feature-text">
                <h3>متابعة دورة حياة المشاريع</h3>
                <p>إدارة البنود من خطة الطلبات مروراً بالطرح والترسية والتعاقد وحتى العقود النشطة.</p>
              </div>
            </div>

            <div className="feature-row">
              <div className="feature-icon flex-center">
                <CalculatorIcon size={16} className="feature-icon-svg" />
              </div>
              <div className="feature-text">
                <h3>حاسبة ومصفوفة الأولويات</h3>
                <p>تقييم الأولويات الفنية والمالية والاستباقية للمشاريع بمرونة ودقة عالية.</p>
              </div>
            </div>

            <div className="feature-row">
              <div className="feature-icon flex-center">
                <ChartIcon size={16} className="feature-icon-svg" />
              </div>
              <div className="feature-text">
                <h3>تحليلات ومؤشرات بيانية</h3>
                <p>مخططات تفاعلية لمراقبة ميزانية القطاعات، ومنحنى الإنجاز التراكمي S-Curve.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Secure Login Form Box */}
        <div className="login-form-panel glass-panel">
          <div className="form-header text-center">
            <div className="logo-area flex-center">
              <Image 
                src="/logo.png" 
                alt="شعار هيئة الصحة العامة - وقاية" 
                width={150} 
                height={75}
                priority
                className="logo-img"
              />
            </div>
            <p>يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
          </div>

          {error && (
            <div className="error-banner animate-fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
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
            <span className="secure-badge">
              <Lock size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px', opacity: 0.7 }} />
              <span style={{ verticalAlign: 'middle' }}>نظام مشفر وآمن بالكامل</span>
            </span>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .login-page-wrapper {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #09171a; /* Dark brand slate */
          overflow: hidden;
          font-family: var(--font-cairo), sans-serif;
          position: relative;
          box-sizing: border-box;
          padding: 20px;
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
          z-index: 2;
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
          opacity: 0.6;
        }

        /* SVG Node Animations */
        @keyframes pulse-node-login {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(12, 166, 120, 0.3)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 6px rgba(12, 166, 120, 0.5)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(12, 166, 120, 0.3)); }
        }

        .net-node {
          transform-origin: center;
          animation: pulse-node-login 5s infinite ease-in-out;
        }

        /* Center Grid Box */
        .login-centered-container {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          max-width: 960px;
          width: 100%;
          min-height: 520px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
          z-index: 10;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        /* Left Side Capabilities */
        .login-features-panel {
          background: rgba(10, 25, 28, 0.65);
          padding: 44px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #ffffff;
          border-left: 1px solid rgba(255, 255, 255, 0.06);
          box-sizing: border-box;
        }

        .logo-brand-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand-titles {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: right;
        }

        .badge-pm-brand {
          align-self: flex-start;
          padding: 4px 10px;
          background: rgba(12, 166, 120, 0.15);
          border: 1px solid rgba(12, 166, 120, 0.25);
          color: var(--color-primary);
          font-size: 0.68rem;
          font-weight: 800;
          border-radius: 20px;
        }

        .brand-headline {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
          color: #ffffff;
        }

        .brand-desc {
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0;
          font-weight: 500;
          text-align: right;
        }

        .features-list-box {
          display: flex;
          flex-direction: column;
          gap: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 20px;
        }

        .feature-row {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          text-align: right;
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(11, 114, 133, 0.15);
          border: 1px solid rgba(11, 114, 133, 0.25);
          flex-shrink: 0;
        }

        .feature-icon-svg {
          color: var(--color-secondary);
        }

        .feature-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .feature-text h3 {
          font-size: 0.85rem;
          font-weight: 800;
          margin: 0;
          color: #ffffff;
        }

        .feature-text p {
          font-size: 0.725rem;
          color: rgba(255, 255, 255, 0.55);
          margin: 0;
          line-height: 1.4;
        }

        /* Right Side Form */
        .login-form-panel {
          background: #ffffff;
          padding: 44px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          justify-content: center;
          box-sizing: border-box;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .logo-area {
          margin-bottom: 24px;
        }

        .logo-img {
          object-fit: contain;
          background: transparent;
        }

        .form-header h2 {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          text-align: center;
        }

        .form-header p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin: 0;
          text-align: center;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-align: center;
        }

        .login-field {
          background: #ffffff;
          border: 1px solid var(--slate-250, #cbd5e1);
          color: var(--text-primary);
          font-size: 0.825rem;
          padding: 10px 14px;
          border-radius: 8px;
          transition: all 0.25s ease;
          text-align: center;
        }

        .login-field:focus {
          border-color: var(--color-secondary);
          box-shadow: 0 0 0 3px rgba(11, 114, 133, 0.08);
          outline: none;
        }

        .login-btn {
          margin-top: 6px;
          padding: 11px;
          font-size: 0.85rem;
          font-weight: 800;
          border-radius: 8px;
          width: 100%;
          cursor: pointer;
        }

        .login-footer {
          margin-top: 4px;
        }

        .secure-badge {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .text-center {
          text-align: center !important;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          direction: rtl;
        }

        /* Responsive styling */
        @media (max-width: 868px) {
          .login-centered-container {
            grid-template-columns: 1fr;
            max-width: 440px;
          }
          .login-features-panel {
            display: none;
          }
          .login-form-panel {
            padding: 36px 24px;
            border-radius: 24px;
          }
        }
      `}</style>
    </div>
  );
}
