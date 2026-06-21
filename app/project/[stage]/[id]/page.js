"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  MessageIcon,
  LockIcon,
  AlertIcon,
  PlusIcon,
  FolderIcon,
  ChevronRightIcon
} from "../../../components/Icons";
import { Star, Eye } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const LABELS_MAP = {
  // Common fields
  id: "م الرقمي",
  project_name: "المشروع / المنافسة",
  description: "نبذة / وصف المشروع",
  sector: "القطاع",
  owning_department: "الإدارة المالكة",
  project_owner: "مالك المشروع",
  project_manager: "مدير المشروع",
  weekly_update: "التحديث الأسبوعي المعتمد",
  notes: "الملاحظات العامة",
  
  // Demand stage specific
  key_deliverables: "مخرجات أساسية للمشروع",
  approval_status_charter: "حالة نموذج اعتماد الميثاق",
  strategic_initiative: "المبادرة الاستراتيجية",
  health_transformation_initiative: "مبادرة التحول الصحي المرتبطة",
  strategic_goal: "الهدف الاستراتيجي",
  priority: "أولوية المشروع",
  priority_calculator_result: "نتيجة حاسبة الأولويات",
  project_classification: "تصنيف المشروع",
  funding_source: "مصدر التمويل",
  estimated_value: "القيمة التقديرية",
  allocated_liquidity: "السيولة السنوية المخصصة",
  expense_item: "بند الصرف",
  financial_approval_status: "حالة الاعتماد المالي",
  expected_start_date: "تاريخ بدء العقد المتوقع",
  support_entities_recommendation: "مواقف/توصيات الجهات الداعمة",
  recommendation_status: "حالة الموافقة/التوصية",

  // Tendering stage specific
  facing_challenges: "هل تواجه تحديات؟",
  competition_number: "رقم المنافسة في منصة اعتماد",
  tendering_stage: "مرحلة الطرح الحالية",
  tendering_date: "تاريخ الطرح في المنصة",
  bids_opening_date: "تاريخ فتح العروض المالي والفني",
  expected_tendering_duration_months: "المدة المتوقعة بالأشهر للإجراءات",
  budget_source: "مصدر الميزانية المخصصة",
  financial_link_number: "رقم الارتباط المالي",
  procurement_officer: "مسؤول العقود والمشتريات",

  // Awarding specific
  awarding_stage: "مرحلة المنافسة الحالية",
  contract_status: "وضع العقد ومساره",
  expected_duration_opening_to_award_months: "المدة المتوقعة من فتح العروض للترسية",
  first_period_extension: "تمديد الفترة الأولى",
  second_period_extension: "تمديد الفترة الثانية",
  additional_notes: "ملاحظات إضافية للترسية",

  // Contracting specific
  contract_number: "رقم العقد / التعميد الرسمي",
  executing_entity: "الجهة المنفذة (المقاول/الشركة)",
  signature_date: "تاريخ توقيع العقد",
  total_cost: "إجمالي تكاليف العقد",
  operational_or_project: "تصنيف العقد (تشغيلي/مشروع)",
  contract_approval_stage: "مرحلة إجازة العقد والموافقة",
  expected_end_date: "تاريخ انتهاء العقد المتوقع",
  duration_months: "المدة بالأشهر",

  // Active contracts specific
  total_spent_till_end_2025: "إجمالي الصرف حتى نهاية 2025",
  annual_liquidity: "السيولة السنوية الحالية",
  spent_from_liquidity: "المصروف من السيولة للعام الحالي",
  remaining_liquidity: "المتبقي من السيولة للعام الحالي",
  total_spent: "إجمالي الصرف التراكمي",
  start_date: "تاريخ بدء العمل الفعلي",
  end_date: "تاريخ انتهاء العقد الفعلي",
  actual_progress: "نسبة الإنجاز الفعلي",
  planned_progress: "نسبة الإنجاز المخطط لها",
  spending_ratio: "نسبة الصرف على العقد",
  progress_status: "حالة تقدم الأعمال",
  time_status: "الحالة الزمنية للعقد",
  has_challenges: "وجود تحديات أو معوقات",
  challenges_description: "وصف التحديات والمخاطر",
  has_change_request: "هل يوجد طلب أمر تغير على العقد؟",
  change_request_status: "حالة طلب الأمر التغيري",
  project_condition: "وضع المشروع العام",
  extension_or_reduction_10pct: "التمديد أو الزيادة والنقصان (10%)"
};

export default function ProjectDetailPage({ params }) {
  const { stage, id } = use(params);
  
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [showPriority, setShowPriority] = useState(false);
  
  // Comment Form State
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Read auth user
    const storedUser = localStorage.getItem("pha_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    async function loadProjectDetails() {
      try {
        setShowPriority(false);
        const res = await fetch(`/api/portfolio/${stage}/${id}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "فشل تحميل التفاصيل");
        }
        
        setProject(data.project);
        setComments(data.comments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProjectDetails();
  }, [stage, id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/portfolio/${stage}/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_text: commentText,
          commenter_name: user?.full_name || "عضو اللجنة"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ التعليق");
      }

      // Reload comments
      const freshRes = await fetch(`/api/portfolio/${stage}/${id}`);
      const freshData = await freshRes.json();
      if (freshData.success) {
        setComments(freshData.comments || []);
        // Also update local project object notes/weekly_update to reflect the change
        setProject(prev => ({
          ...prev,
          weekly_update: commentText,
          notes: commentText
        }));
      }

      setCommentText("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pha_token");
    localStorage.removeItem("pha_user");
    setUser(null);
    router.push("/");
  };

  const formatValue = (key, val) => {
    if (val === null || val === undefined || val === '') return <span className="text-muted">غير مدخل</span>;

    // Currency values
    if (["total_cost", "estimated_value", "allocated_liquidity", "annual_liquidity", "spent_from_liquidity", "remaining_liquidity", "total_spent", "total_spent_till_end_2025"].includes(key)) {
      return new Intl.NumberFormat("ar-SA", {
        style: "currency",
        currency: "SAR",
        maximumFractionDigits: 0
      }).format(val);
    }

    // Percentage values
    if (["actual_progress", "planned_progress", "spending_ratio"].includes(key)) {
      const percentage = typeof val === 'number' && val <= 1 ? val * 100 : val;
      return `${parseFloat(percentage).toFixed(0)}%`;
    }

    // Dates
    if (val && (key.includes("date") || key === "start_date" || key === "end_date" || key === "signature_date")) {
      return new Date(val).toLocaleDateString("ar-SA", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    return String(val);
  };

  if (loading) {
    return (
      <div className="loading-screen flex-center">
        <div className="spinner"></div>
        <p>جاري تحميل تفاصيل المادة...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="error-screen flex-center" style={{ padding: "40px 0" }}>
          <span><AlertIcon size={48} style={{ color: "#dc2626" }} /></span>
          <h2>عذراً، لم نتمكن من العثور على التفاصيل المطلوبة</h2>
          <p>{error || "المشروع غير موجود في قاعدة البيانات"}</p>
          <Link href="/portfolio" className="btn btn-primary">
            العودة للمحفظة التفصيلية
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="detail-container animate-fade-in">
        {/* Breadcrumb path */}
        <div className="breadcrumb" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/">الرئيسية</Link>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>/</span>
          <Link href="/portfolio">المحفظة</Link>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>/</span>
          <span>تفاصيل المشروع</span>
        </div>

      {/* Detail Split layout */}
      <div className="detail-layout">
        {/* Main Details Grid */}
        <main className="glass-panel details-card">
          <div className="details-header">
            <h2>{project.project_name || "تفاصيل المشروع"}</h2>
            <div className="header-meta">
              <span className="badge badge-blue">{project.sector || "القطاع غير محدد"}</span>
              {project.progress_status && (
                <span className="badge badge-green">{project.progress_status}</span>
              )}
              {showPriority && project.is_priority && (
                <span className="badge badge-priority flex items-center gap-1">
                  <Star size={11} fill="#d97706" style={{ color: "#d97706" }} />
                  <span>ذو أولوية</span>
                </span>
              )}
            </div>
          </div>

          {!showPriority && (
            <div className="reveal-priority-banner">
              <div className="reveal-icon-container">
                <Eye size={18} style={{ color: "var(--color-secondary)" }} />
              </div>
              <div className="reveal-content">
                <h4>تفاصيل الأولوية مخفية حالياً</h4>
                <p>انقر على الزر لتفعيل تقييم المشروع وعرض بيانات الأولوية الخاصة به.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPriority(true)}
                className="btn-reveal-priority"
              >
                كشف تفاصيل وتقييم الأولوية
              </button>
            </div>
          )}

          <div className="fields-grid">
            {Object.entries(project).map(([key, value]) => {
              // Skip formatting database metadata & hidden keys
              if (key === 'id' || key === 'project_name' || key === 'sector' || value === null || value === undefined || value === '') return null;
              
              if (!showPriority && (key === 'priority' || key === 'priority_calculator_result' || key === 'is_priority')) {
                return null;
              }

              const label = LABELS_MAP[key];
              if (!label) return null; // Only show fields we have mapped to look professional

              return (
                <div key={key} className="field-item">
                  <span className="field-label">{label}</span>
                  <div className="field-value">{formatValue(key, value)}</div>
                </div>
              );
            })}
          </div>

          {showPriority && project && project.c1 !== undefined && project.c1 !== null && (
            <div className="radar-chart-card">
              <h4 className="radar-chart-title">تحليل معايير مصفوفة الأولوية</h4>
              <div style={{ width: '100%', height: '220px', marginTop: '12px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                    { subject: 'الإلزام C1', A: project.c1 || 1, fullMark: 5 },
                    { subject: 'الاستراتيجية C2', A: project.c2 || 1, fullMark: 5 },
                    { subject: 'قرار 921 C3', A: project.c3 || 1, fullMark: 5 },
                    { subject: 'الاستمرارية C4', A: project.c4 || 1, fullMark: 5 },
                    { subject: 'الجاهزية C5', A: project.c5 || 1, fullMark: 5 },
                    { subject: 'التمويل C6', A: project.c6 || 5, fullMark: 5 }
                  ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 9, fontWeight: 700, fontFamily: "Cairo" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#94a3b8", fontSize: 8 }} />
                    <Radar name="التقييم" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </main>

        {/* Updates / Comments Feed Sidebar */}
        <aside className="glass-panel sidebar-comments">
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageIcon size={20} className="text-teal" />
            <span>سجل تحديثات وقرارات اللجنة</span>
          </h2>
          <p className="sidebar-desc">متابعة فورية ومباشرة لتحديثات اللجنة الأسبوعية</p>

          {/* New Comment input (restricted to logged-in members) */}
          {user ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                placeholder="اكتب تحديثاً أو قراراً جديداً للمشروع..."
                className="form-input comment-textarea"
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              ></textarea>
              <button 
                type="submit" 
                className="btn btn-primary send-comment-btn"
                disabled={submittingComment}
              >
                {submittingComment ? "جاري الإرسال..." : "حفظ وإعلان التحديث"}
              </button>
            </form>
          ) : (
            <div className="lock-banner flex-center">
              <span><LockIcon size={28} style={{ color: "#dc2626" }} /></span>
              <p>يرجى تسجيل الدخول كعضو لجنة لإضافة تحديثات وتعليقات على هذا المشروع.</p>
              <Link href="/login" className="btn btn-glass" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <LockIcon size={14} />
                <span>تسجيل الدخول</span>
              </Link>
            </div>
          )}

          {/* Comments Feed List */}
          <div className="comments-feed-list">
            {comments.map((comm) => (
              <div key={comm.id} className="comment-bubble">
                <div className="bubble-header">
                  <span className="commenter-name">{comm.commenter_name}</span>
                  <span className="comment-date">
                    {new Date(comm.created_at).toLocaleDateString("ar-SA", {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="bubble-text">{comm.comment_text}</div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="no-comments flex-center">
                <span><MessageIcon size={28} style={{ opacity: 0.4 }} /></span>
                <p>لا توجد تعليقات أو تحديثات مسجلة لهذا المشروع بعد.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <style jsx>{`
        .detail-container {
          max-width: 1420px;
          margin: 0 auto;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .radar-chart-card {
          margin-top: 24px;
          padding: 16px;
          background: #ffffff;
          border: 1px solid var(--slate-150, #e2e8f0);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .radar-chart-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 8px 0;
          text-align: right;
          border-right: 3px solid var(--color-secondary);
          padding-right: 8px;
        }

        .badge-priority {
          background: rgba(217, 119, 6, 0.08);
          color: #d97706;
          border: 1px solid rgba(217, 119, 6, 0.2);
        }

        .reveal-priority-banner {
          background: rgba(11, 114, 133, 0.03);
          border: 1px dashed rgba(11, 114, 133, 0.2);
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          direction: rtl;
          text-align: right;
          box-sizing: border-box;
          width: 100%;
          grid-column: 1 / -1;
        }

        .reveal-icon-container {
          background: rgba(11, 114, 133, 0.08);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .reveal-content {
          flex: 1;
        }

        .reveal-content h4 {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .reveal-content p {
          font-size: 0.72rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }

        .btn-reveal-priority {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          color: #ffffff !important;
          font-family: var(--font-cairo), sans-serif;
          font-size: 0.75rem;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 700;
          white-space: nowrap;
          border: none;
          box-shadow: 0 2px 6px rgba(12, 166, 120, 0.15);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .btn-reveal-priority:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(12, 166, 120, 0.22);
        }

        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
        }

        .nav-logo {
          object-fit: contain;
          filter: drop-shadow(0 0 5px rgba(9, 201, 146, 0.2));
        }

        .nav-title-block h1 {
          font-size: 1.2rem;
          color: var(--text-primary);
        }

        .nav-title-block p {
          font-size: 0.8rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
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
          color: #03080c;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .user-role {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .logout-btn {
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 6px;
          margin-right: 8px;
        }

        .breadcrumb {
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          gap: 8px;
        }

        .breadcrumb a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
        }

        .detail-layout {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 992px) {
          .detail-layout {
            grid-template-columns: 1fr;
          }
        }

        .details-card {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .details-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 20px;
        }

        .details-header h2 {
          font-size: 1.4rem;
          line-height: 1.4;
        }

        .header-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .field-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.02);
          padding: 12px 16px;
          border-radius: 10px;
        }

        .field-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .field-value {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .sidebar-comments {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-comments h2 {
          font-size: 1rem;
        }

        .sidebar-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 12px;
        }

        .comment-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(255, 255, 255, 0.02);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .comment-textarea {
          resize: none;
          font-size: 0.85rem;
        }

        .send-comment-btn {
          width: 100%;
          padding: 10px;
          justify-content: center;
          font-size: 0.85rem;
        }

        .lock-banner {
          flex-direction: column;
          gap: 12px;
          padding: 24px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          text-align: center;
        }

        .lock-banner span {
          font-size: 1.8rem;
        }

        .lock-banner p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .comments-feed-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          padding-left: 4px;
        }

        .comment-bubble {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 14px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bubble-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
        }

        .commenter-name {
          font-weight: 700;
          color: var(--color-primary);
        }

        .comment-date {
          color: var(--text-muted);
        }

        .bubble-text {
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .no-comments {
          flex-direction: column;
          gap: 8px;
          padding: 40px 0;
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .no-comments span {
          font-size: 1.8rem;
          opacity: 0.4;
        }

        .loading-screen {
          min-height: 100vh;
          flex-direction: column;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--color-primary);
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-screen {
          min-height: 100vh;
          flex-direction: column;
          gap: 16px;
          text-align: center;
          padding: 20px;
        }

        .error-screen span {
          font-size: 3rem;
        }

        .error-screen h2 {
          font-size: 1.4rem;
        }

        .error-screen p {
          font-size: 0.9rem;
          margin-bottom: 10px;
        }
      `}</style>
      </div>
    </DashboardLayout>
  );
}
