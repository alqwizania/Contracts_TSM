"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PlusIcon, X } from "lucide-react";

const STAGES = [
  { id: "demand_plan", label: "خطة الطلبات 2026" },
  { id: "tendering_procedures", label: "في إجراءات الطرح" },
  { id: "awarding", label: "الترسية" },
  { id: "contracting", label: "التعاقد" },
  { id: "active_contracts", label: "العقود النشطة" }
];

const SECTORS = [
  "الصحة العامة",
  "البيئة والصحة المهنية",
  "الصحة الحيوانية",
  "تقنية المعلومات",
  "التمكين والخدمات المشتركة",
  "المختبرات والتحاليل",
  "إدارة الطوارئ والأزمات",
  "أخرى (أدخل يدويًا)"
];

const CLASSIFICATIONS = ["تشغيلي", "سلاسل الإمداد", "مشروع", "غير محدد"];
const BUDGET_SOURCES = ["ميزانية الهيئة", "برنامج التحول"];

export default function AddProjectModal({ isOpen, onClose, onSuccess }) {
  const [stage, setStage] = useState("demand_plan");
  const [projectName, setProjectName] = useState("");
  const [sectorType, setSectorType] = useState("الصحة العامة");
  const [customSector, setCustomSector] = useState("");
  const [department, setDepartment] = useState("");
  const [owner, setOwner] = useState("");
  const [manager, setManager] = useState("");
  const [budget, setBudget] = useState("");
  const [classification, setClassification] = useState("تشغيلي");
  const [budgetSource, setBudgetSource] = useState("ميزانية الهيئة");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Reset form states
      setStage("demand_plan");
      setProjectName("");
      setSectorType("الصحة العامة");
      setCustomSector("");
      setDepartment("");
      setOwner("");
      setManager("");
      setBudget("");
      setClassification("تشغيلي");
      setBudgetSource("ميزانية الهيئة");
      setNotes("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!projectName.trim()) {
      setError("اسم المشروع مطلوب");
      setLoading(false);
      return;
    }

    const finalSector = sectorType === "أخرى (أدخل يدويًا)" ? customSector.trim() : sectorType;
    if (!finalSector) {
      setError("الرجاء تحديد أو كتابة اسم القطاع");
      setLoading(false);
      return;
    }

    const payload = {
      stage,
      project_name: projectName.trim(),
      sector: finalSector,
      owning_department: department.trim() || null,
      project_owner: owner.trim() || null,
      project_manager: manager.trim() || null,
      budget: parseFloat(budget) || 0,
      classification,
      budget_source: budgetSource,
      weekly_update: notes.trim() || "تم التأسيس"
    };

    try {
      const token = localStorage.getItem("pha_token");
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إضافة المشروع");
      }

      onSuccess(data.id, stage);
      onClose();
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء حفظ المشروع الجديد");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="add-modal-overlay">
      <div className="add-modal-card glass-panel animate-fade-in">
        
        {/* Header */}
        <div className="add-modal-header">
          <h2 className="flex items-center gap-2">
            <PlusIcon size={20} className="text-teal" />
            <span>إضافة وتأسيس مشروع جديد</span>
          </h2>
          <button onClick={onClose} className="close-btn" aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>

        {/* Error notification */}
        {error && <div className="error-banner">{error}</div>}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="add-modal-body">
          <div className="form-grid">
            
            {/* Project Name */}
            <div className="form-group col-span-2">
              <label htmlFor="projectName">اسم المشروع / الكراسة الرسمية *</label>
              <input
                type="text"
                id="projectName"
                className="form-input"
                placeholder="أدخل اسم المشروع بوضوح..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>

            {/* Project Stage */}
            <div className="form-group">
              <label htmlFor="stage">المرحلة الحالية في دورة الحياة *</label>
              <select
                id="stage"
                className="form-input select-input"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Budget / Estimated Cost */}
            <div className="form-group">
              <label htmlFor="budget">الميزانية التقديرية / إجمالي التكاليف (ريال)</label>
              <input
                type="number"
                id="budget"
                className="form-input"
                placeholder="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            {/* Sector selection */}
            <div className="form-group">
              <label htmlFor="sectorType">القطاع المالك للمشروع *</label>
              <select
                id="sectorType"
                className="form-input select-input"
                value={sectorType}
                onChange={(e) => setSectorType(e.target.value)}
              >
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* Custom Sector Input if 'Other' is selected */}
            {sectorType === "أخرى (أدخل يدويًا)" ? (
              <div className="form-group">
                <label htmlFor="customSector">اكتب اسم القطاع الجديد *</label>
                <input
                  type="text"
                  id="customSector"
                  className="form-input"
                  placeholder="ادخل القطاع يدويًا..."
                  value={customSector}
                  onChange={(e) => setCustomSector(e.target.value)}
                  required
                />
              </div>
            ) : (
              /* Owning Department */
              <div className="form-group">
                <label htmlFor="department">الإدارة المالكة المباشرة</label>
                <input
                  type="text"
                  id="department"
                  className="form-input"
                  placeholder="مثال: إدارة المشتريات..."
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            )}

            {/* Project Owner */}
            <div className="form-group">
              <label htmlFor="owner">مالك المشروع</label>
              <input
                type="text"
                id="owner"
                className="form-input"
                placeholder="اسم مالك المشروع..."
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>

            {/* Project Manager */}
            <div className="form-group">
              <label htmlFor="manager">مدير المشروع</label>
              <input
                type="text"
                id="manager"
                className="form-input"
                placeholder="اسم مدير المشروع..."
                value={manager}
                onChange={(e) => setManager(e.target.value)}
              />
            </div>

            {/* Classification */}
            <div className="form-group">
              <label htmlFor="classification">التصنيف الفني</label>
              <select
                id="classification"
                className="form-input select-input"
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
              >
                {CLASSIFICATIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Budget Source */}
            <div className="form-group">
              <label htmlFor="budgetSource">مصدر ميزانية المشروع</label>
              <select
                id="budgetSource"
                className="form-input select-input"
                value={budgetSource}
                onChange={(e) => setBudgetSource(e.target.value)}
              >
                {BUDGET_SOURCES.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            {/* Notes / First Update */}
            <div className="form-group col-span-2">
              <label htmlFor="notes">وصف المشروع أو التحديث الأولي</label>
              <textarea
                id="notes"
                className="form-input notes-textarea"
                rows={3}
                placeholder="اكتب نبذة أو ملاحظات وتحديثات أولية..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

          </div>

          {/* Footer controls */}
          <div className="add-modal-footer">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ وإنشاء المشروع"}
            </button>
            <button type="button" className="btn btn-glass" onClick={onClose} disabled={loading}>
              إلغاء
            </button>
          </div>

        </form>

      </div>

      <style jsx>{`
        .add-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          direction: rtl;
        }

        .add-modal-card {
          background: #ffffff;
          max-width: 680px;
          width: 100%;
          border-radius: 20px;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
          font-family: var(--font-cairo), sans-serif;
        }

        .add-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--slate-100, #f1f5f9);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .add-modal-header h2 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }



        .add-modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .col-span-2 {
          grid-column: span 2;
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
          text-align: right;
        }

        .select-input {
          height: 38px;
        }

        .notes-textarea {
          resize: none;
          font-family: var(--font-cairo), sans-serif;
          font-size: 0.8rem;
        }

        .add-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--slate-100, #f1f5f9);
          display: flex;
          gap: 12px;
          justify-content: flex-start;
          background: var(--slate-50, #f8fafc);
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.08);
          border-right: 4px solid #ef4444;
          color: #ef4444;
          padding: 10px 16px;
          font-size: 0.8rem;
          font-weight: 700;
          margin: 16px 24px 0 24px;
          border-radius: 6px;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .col-span-2 {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
