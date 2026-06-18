"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  X, 
  MessageSquare, 
  Lock, 
  AlertTriangle, 
  Plus, 
  Folder, 
  Calculator, 
  CheckCircle2,
  Calendar,
  DollarSign
} from "lucide-react";

const LABELS_MAP = {
  id: "م الرقمي",
  project_name: "المشروع / المنافسة",
  description: "نبذة / وصف المشروع",
  sector: "القطاع",
  owning_department: "الإدارة المالكة",
  project_owner: "مالك المشروع",
  project_manager: "مدير المشروع",
  weekly_update: "التحديث الأسبوعي المعتمد",
  notes: "الملاحظات العامة",
  
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

  facing_challenges: "هل تواجه تحديات؟",
  competition_number: "رقم المنافسة في منصة اعتماد",
  tendering_stage: "مرحلة الطرح الحالية",
  tendering_date: "تاريخ الطرح في المنصة",
  bids_opening_date: "تاريخ فتح العروض المالي والفني",
  expected_tendering_duration_months: "المدة المتوقعة بالأشهر للإجراءات",
  budget_source: "مصدر الميزانية المخصصة",
  financial_link_number: "رقم الارتباط المالي",
  procurement_officer: "مسؤول العقود والمشتريات",

  awarding_stage: "مرحلة المنافسة الحالية",
  contract_status: "وضع العقد ومساره",
  expected_duration_opening_to_award_months: "المدة المتوقعة من فتح العروض للترسية",
  first_period_extension: "تمديد الفترة الأولى",
  second_period_extension: "تمديد الفترة الثانية",
  additional_notes: "ملاحظات إضافية للترسية",

  contract_number: "رقم العقد / التعميد الرسمي",
  executing_entity: "الجهة المنفذة (المقاول/الشركة)",
  signature_date: "تاريخ توقيع العقد",
  total_cost: "إجمالي تكاليف العقد",
  operational_or_project: "تصنيف العقد (تشغيلي/مشروع)",
  contract_approval_stage: "مرحلة إجازة العقد والموافقة",
  expected_end_date: "تاريخ انتهاء العقد المتوقع",
  duration_months: "المدة بالأشهر",

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

export default function ProjectDetailsModal({ isOpen, stage, id, onClose, onUpdate }) {
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Send to calculator states
  const [calculatorStatus, setCalculatorStatus] = useState("idle"); // idle, loading, sent, exists
  const [calculatorError, setCalculatorError] = useState("");

  // Comment form state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read auth user
    const storedUser = localStorage.getItem("pha_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (isOpen && stage && id) {
      loadProjectDetails();
      checkPriorityMatrixStatus();
    } else {
      setProject(null);
      setComments([]);
      setError("");
      setCalculatorStatus("idle");
      setCalculatorError("");
      setCommentText("");
    }
  }, [isOpen, stage, id]);

  const loadProjectDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/portfolio/${stage}/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تحميل تفاصيل المشروع");
      }

      setProject(data.project);
      setComments(data.comments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkPriorityMatrixStatus = async () => {
    try {
      const token = localStorage.getItem("pha_token");
      if (!token) return;

      const res = await fetch("/api/priority", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && project) {
        const exists = data.data.some(
          (p) => p.project_name?.trim().toLowerCase() === project.project_name?.trim().toLowerCase()
        );
        if (exists) {
          setCalculatorStatus("exists");
        }
      }
    } catch (err) {
      console.error("Error checking priority status:", err);
    }
  };

  useEffect(() => {
    if (project) {
      checkPriorityMatrixStatus();
    }
  }, [project]);

  const handleSendToCalculator = async () => {
    if (!project) return;
    setCalculatorStatus("loading");
    setCalculatorError("");

    const budgetVal = project.total_cost || project.estimated_value || 0;
    const descVal = `تم إرساله من قسم: ${stage === 'demand_plan' ? 'خطة الطلبات' : stage === 'active_contracts' ? 'العقود النشطة' : stage} (مَعُرّف المشروع: ${id})`;

    try {
      const token = localStorage.getItem("pha_token");
      const res = await fetch("/api/priority", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          project_name: project.project_name,
          budget: budgetVal,
          description: descVal
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل الإرسال لحاسبة الأولويات");
      }

      setCalculatorStatus("sent");
      if (onUpdate) onUpdate();
    } catch (err) {
      setCalculatorError(err.message);
      setCalculatorStatus("idle");
    }
  };

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
        throw new Error(data.error || "فشل حفظ التحديث");
      }

      // Reload comments
      await loadProjectDetails();
      setCommentText("");
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatValue = (key, val) => {
    if (val === null || val === undefined || val === "") return <span className="text-muted">غير مدخل</span>;

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
      const percentage = typeof val === "number" && val <= 1 ? val * 100 : val;
      return `${parseFloat(percentage).toFixed(0)}%`;
    }

    // Dates
    if (val && (key.includes("date") || key === "start_date" || key === "end_date" || key === "signature_date")) {
      return new Date(val).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }

    return String(val);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="detail-modal-overlay">
      <div className="detail-modal-card glass-panel animate-fade-in">
        
        {/* Header */}
        <div className="detail-modal-header">
          <div className="header-titles">
            <h2>{project ? project.project_name : "تفاصيل البند"}</h2>
            {project && (
              <div className="header-meta flex items-center gap-2">
                <span className="badge badge-blue">{project.sector || "القطاع غير محدد"}</span>
                {project.progress_status && (
                  <span className="badge badge-green">{project.progress_status}</span>
                )}
                {stage && (
                  <span className="badge badge-stage">{stage === 'demand_plan' ? 'خطة الطلبات' : stage === 'active_contracts' ? 'عقد نشط' : stage}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="header-actions">
            {project && user && (
              <>
                {calculatorStatus === "exists" && (
                  <span className="badge-calculator-exists flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>مضاف للتقييم</span>
                  </span>
                )}
                {calculatorStatus === "sent" && (
                  <span className="badge-calculator-sent flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>تم الإرسال للتقييم</span>
                  </span>
                )}
                {calculatorStatus === "idle" && (
                  <button 
                    onClick={handleSendToCalculator} 
                    className="btn btn-glass btn-calculator flex items-center gap-1"
                  >
                    <Calculator size={13} />
                    <span>إرسال لحاسبة الأولويات</span>
                  </button>
                )}
                {calculatorStatus === "loading" && (
                  <span className="text-muted font-medium text-xs">جاري الإرسال...</span>
                )}
                {calculatorError && (
                  <span className="text-red-500 text-xs" title={calculatorError}>فشل الإرسال</span>
                )}
              </>
            )}

            <button onClick={onClose} className="close-btn" aria-label="إغلاق">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content Split */}
        <div className="detail-modal-body-wrapper">
          {loading ? (
            <div className="modal-loading-state flex-center">
              <div className="spinner"></div>
              <p>جاري تحميل التفاصيل والملاحظات...</p>
            </div>
          ) : error ? (
            <div className="modal-error-state flex-center">
              <AlertTriangle size={32} className="text-red" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="detail-split-layout">
              
              {/* Right Panel: Project Attributes Grid */}
              <div className="details-attributes-panel">
                <h3 className="panel-sub-title">معلومات وتصانيف المشروع</h3>
                <div className="fields-grid-modal">
                  {Object.entries(project).map(([key, value]) => {
                    if (
                      key === "id" || 
                      key === "project_name" || 
                      key === "sector" || 
                      value === null || 
                      value === undefined || 
                      value === ""
                    ) return null;
                    
                    const label = LABELS_MAP[key];
                    if (!label) return null;

                    return (
                      <div key={key} className="field-item-modal">
                        <span className="field-label-modal">{label}</span>
                        <div className="field-value-modal">{formatValue(key, value)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Left Panel: Comments Timeline Sidebar */}
              <div className="details-timeline-panel">
                <div className="timeline-title-row">
                  <MessageSquare size={16} className="text-teal" />
                  <h3>تحديثات اللجنة والتعليقات</h3>
                </div>

                {/* Form to post new comment */}
                {user ? (
                  <form onSubmit={handleAddComment} className="comment-form-modal">
                    <textarea
                      placeholder="اكتب تحديثاً أو قراراً أسبوعياً للمشروع..."
                      className="form-input comment-textarea-modal"
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                    ></textarea>
                    <button 
                      type="submit" 
                      className="btn btn-primary send-comment-btn"
                      disabled={submittingComment}
                    >
                      {submittingComment ? "جاري الحفظ..." : "حفظ التحديث الأسبوعي"}
                    </button>
                  </form>
                ) : (
                  <div className="lock-banner-modal flex-center">
                    <Lock size={16} className="text-red" />
                    <p>سجل دخولك كعضو لجنة لإضافة تحديثات وتعليقات على هذا البند.</p>
                  </div>
                )}

                {/* Comments List */}
                <div className="comments-scroll-modal">
                  {comments.map((comm) => (
                    <div key={comm.id} className="comment-bubble-modal">
                      <div className="bubble-header-modal">
                        <span className="commenter-name-modal">{comm.commenter_name}</span>
                        <span className="comment-date-modal">
                          {new Date(comm.created_at).toLocaleDateString("ar-SA", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <div className="bubble-text-modal">{comm.comment_text}</div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="no-comments-modal flex-center">
                      <MessageSquare size={24} style={{ opacity: 0.3 }} />
                      <p>لا توجد تحديثات أو تعليقات لهذا المشروع بعد.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      <style jsx>{`
        .detail-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          z-index: 20000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          direction: rtl;
        }

        .detail-modal-card {
          background: #ffffff;
          max-width: 1100px;
          width: 100%;
          border-radius: 20px;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
          font-family: var(--font-cairo), sans-serif;
        }

        .detail-modal-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--slate-100, #f1f5f9);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          gap: 20px;
        }

        .header-titles {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: right;
          max-width: 65%;
        }

        .header-titles h2 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .badge-stage {
          background: rgba(11, 114, 133, 0.08);
          color: var(--color-secondary);
          border: 1px solid rgba(11, 114, 133, 0.15);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .btn-calculator {
          padding: 6px 12px;
          font-size: 0.72rem;
          border-radius: 6px;
          border-color: rgba(11, 114, 133, 0.25);
          color: var(--color-secondary);
        }

        .btn-calculator:hover {
          background: rgba(11, 114, 133, 0.05);
        }

        .badge-calculator-exists {
          padding: 5px 10px;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 6px;
          background: rgba(12, 166, 120, 0.08);
          color: var(--color-primary);
          border: 1px solid rgba(12, 166, 120, 0.25);
        }

        .badge-calculator-sent {
          padding: 5px 10px;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 6px;
          background: rgba(59, 130, 246, 0.08);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }



        .detail-modal-body-wrapper {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .modal-loading-state,
        .modal-error-state {
          padding: 80px 0;
          flex-direction: column;
          gap: 16px;
        }

        .spinner {
          width: 38px;
          height: 38px;
          border: 3.5px solid rgba(13, 152, 159, 0.1);
          border-radius: 50%;
          border-top-color: var(--color-secondary);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .detail-split-layout {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          height: 100%;
          flex: 1;
        }

        .details-attributes-panel {
          padding: 24px;
          border-left: 1px solid var(--slate-100, #f1f5f9);
          overflow-y: auto;
          box-sizing: border-box;
        }

        .panel-sub-title {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 16px 0;
          text-align: right;
          border-right: 3px solid var(--color-primary);
          padding-right: 8px;
        }

        .fields-grid-modal {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .field-item-modal {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: var(--slate-50, #f8fafc);
          border: 1px solid rgba(0, 0, 0, 0.02);
          padding: 10px 14px;
          border-radius: 8px;
          text-align: right;
        }

        .field-label-modal {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .field-value-modal {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        /* Timeline panel styles */
        .details-timeline-panel {
          padding: 24px;
          background: var(--slate-50, #f8fafc);
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .timeline-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          text-align: right;
        }

        .timeline-title-row h3 {
          font-size: 0.88rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-primary);
        }

        .comment-form-modal {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #ffffff;
          padding: 14px;
          border-radius: 10px;
          border: 1px solid var(--slate-150, #e2e8f0);
        }

        .comment-textarea-modal {
          resize: none;
          font-size: 0.78rem;
          font-family: var(--font-cairo), sans-serif;
          padding: 8px;
          border-radius: 6px;
        }

        .send-comment-btn {
          padding: 8px;
          font-size: 0.78rem;
          font-weight: 800;
          justify-content: center;
          border-radius: 6px;
        }

        .lock-banner-modal {
          padding: 14px;
          background: rgba(0, 0, 0, 0.03);
          border: 1px dashed var(--slate-200, #cbd5e1);
          border-radius: 10px;
          text-align: center;
          font-size: 0.72rem;
          color: var(--text-secondary);
          gap: 8px;
        }

        .lock-banner-modal p {
          margin: 0;
          font-weight: 600;
        }

        .comments-scroll-modal {
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          flex: 1;
        }

        .comment-bubble-modal {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.03);
          padding: 10px 14px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: right;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.01);
        }

        .bubble-header-modal {
          display: flex;
          justify-content: space-between;
          font-size: 0.68rem;
        }

        .commenter-name-modal {
          font-weight: 800;
          color: var(--color-secondary);
        }

        .comment-date-modal {
          color: var(--text-muted);
        }

        .bubble-text-modal {
          font-size: 0.78rem;
          color: var(--text-primary);
          line-height: 1.4;
          white-space: pre-wrap;
        }

        .no-comments-modal {
          padding: 40px 0;
          flex-direction: column;
          gap: 8px;
          color: var(--text-muted);
          font-size: 0.75rem;
          text-align: center;
        }

        .no-comments-modal p {
          margin: 0;
          font-weight: 600;
        }

        @media (max-width: 868px) {
          .detail-split-layout {
            grid-template-columns: 1fr;
          }
          .details-attributes-panel {
            border-left: none;
            border-bottom: 1px solid var(--slate-100, #f1f5f9);
          }
          .fields-grid-modal {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
