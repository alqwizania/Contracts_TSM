"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { X } from "lucide-react";
import {
  CalculatorIcon,
  SearchIcon,
  PlusIcon,
  ChevronDownIcon
} from "../components/Icons";

const C1_OPTIONS = [
  { value: 5, label: "مشروع ملزم بأمر سامي / قرار مجلس الوزراء / نظام نافذ" },
  { value: 4, label: "مشروع ملزم بقرار وزاري أو قرار مجلس إدارة الهيئة واللجان المنبثقة منها" },
  { value: 3, label: "مشروع معتمد بقرار لجنة عليا أو لجنة مشتركة أو مجلس الشورى أو جهة رقابية أخرى أو خدمة أساسية" },
  { value: 2, label: "مشروع معتمد إداريًا دون إلزام نظامي" },
  { value: 1, label: "لا يوجد سند نظامي" }
];

const C2_OPTIONS = [
  { value: 5, label: "مرتبط مباشرة بأكثر من مبادرة استراتيجية" },
  { value: 4, label: "مرتبط مباشرة بمبادرة استراتيجية واحدة" },
  { value: 2, label: "ارتباط غير مباشر بمبادرة استراتيجية" },
  { value: 1, label: "لا يوجد ارتباط" }
];

const C3_OPTIONS = [
  { value: 5, label: "يدعم أكثر من اختصاص نظامي بشكل مباشر" },
  { value: 4, label: "يدعم اختصاصًا واحدًا بشكل مباشر" },
  { value: 3, label: "يدعم أكثر من اختصاص بشكل غير مباشر أو يعد احد الممكنات الأساسية" },
  { value: 2, label: "دعم غير مباشر لاختصاص واحد او ضمن اعمال الهيئة الإدارية" },
  { value: 1, label: "لا يوجد ارتباط" }
];

const C4_OPTIONS = [
  { value: 5, label: "عدم التنفيذ يؤدي إلى تعثر جوهري أو مساءلة نظامية" },
  { value: 4, label: "يؤدي إلى تعثر دون وجود بديل" },
  { value: 3, label: "يؤدي إلى تعثر مع وجود بدائل مؤقتة" },
  { value: 2, label: "يسبب تأخيرًا يمكن احتواؤه" },
  { value: 1, label: "مشروع تحسيني فقط" }
];

const C5_OPTIONS = [
  { value: 5, label: "مشروع قائم ويحتاج استكمال تمويل" },
  { value: 4, label: "تم الترسية" },
  { value: 3, label: "مطروح في منصة اعتماد" },
  { value: 2, label: "مستكمل إجراءات الطرح" },
  { value: 1, label: "فكرة أو مقترح" }
];

const C6_OPTIONS = [
  { value: 5, label: "منخفض التكلفة يمكن تمويله بالكامل ضمن السيولة المتاحة (<= 1,000,000 ريال)", canDistribute: "نعم" },
  { value: 4, label: "متوسط التكلفة يمكن توزيعه على سنوات (> 1,000,000 - <= 5,000,000 ريال)", canDistribute: "نعم" },
  { value: 3, label: "متوسط التكلفة لا يمكن توزيعه على سنوات (> 1,000,000 - <= 5,000,000 ريال)", canDistribute: "لا" },
  { value: 2, label: "عالي التكلفة يمكن توزيعه على سنوات (> 5,000,000 ريال)", canDistribute: "نعم" },
  { value: 1, label: "عالي التكلفة لا يمكن توزيعه على سنوات (> 5,000,000 ريال)", canDistribute: "لا" }
];

export default function PriorityPage() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Project values form state
  const [formC1, setFormC1] = useState(1);
  const [formC2, setFormC2] = useState(1);
  const [formC3, setFormC3] = useState(1);
  const [formC4, setFormC4] = useState(1);
  const [formC5, setFormC5] = useState(1);
  const [formC6, setFormC6] = useState(5);

  const [c1Just, setC1Just] = useState("");
  const [c2Just, setC2Just] = useState("");
  const [c3Just, setC3Just] = useState("");
  const [c4Just, setC4Just] = useState("");
  const [c5Just, setC5Just] = useState("");

  const [formBudget, setFormBudget] = useState(0);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIsPriority, setFormIsPriority] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // Check login and fetch data
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("pha_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchPriorityData();
  }, []);

  async function fetchPriorityData() {
    try {
      const token = localStorage.getItem("pha_token");
      const res = await fetch("/api/priority", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      } else {
        setError(data.error || "فشل تحميل البيانات");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحميل البيانات من الخادم");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAssess = (project) => {
    setSelectedProject(project);
    
    // Set initial form states from project values
    setFormC1(project.c1 || 1);
    setFormC2(project.c2 || 1);
    setFormC3(project.c3 || 1);
    setFormC4(project.c4 || 1);
    setFormC5(project.c5 || 1);
    setFormC6(project.c6 || 5);

    setC1Just(project.c1_justification || "");
    setC2Just(project.c2_justification || "");
    setC3Just(project.c3_justification || "");
    setC4Just(project.c4_justification || "");
    setC5Just(project.c5_justification || "");
    setFormBudget(project.budget || 0);
    setFormIsPriority(project.is_priority || false);

    setIsEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    setFormName("");
    setFormDesc("");
    setFormBudget(0);
    setFormC1(1);
    setFormC2(1);
    setFormC3(1);
    setFormC4(1);
    setFormC5(1);
    setFormC6(5);
    setC1Just("");
    setC2Just("");
    setC3Just("");
    setC4Just("");
    setC5Just("");
    setFormIsPriority(false);

    setIsAddModalOpen(true);
  };

  // Live score calculations
  const getPhaseOneScore = (c1, c2, c3, c4, c5) => {
    return (c1 * 0.15) + (c2 * 0.15) + (c3 * 0.15) + (c4 * 0.35) + (c5 * 0.20);
  };

  const getFinalScore = (p1, c6) => {
    return (p1 * 0.8) + (c6 * 0.2);
  };

  const getScoreColorClass = (score) => {
    if (score >= 4.0) return "text-emerald";
    if (score >= 3.0) return "text-teal";
    if (score >= 2.0) return "text-yellow";
    return "text-red";
  };

  // Auto rate C6 if budget changes or keep custom dropdown
  useEffect(() => {
    // Determine default C6 score if budget changes in edit/add modals
    if (formBudget <= 1000000) {
      setFormC6(5);
    } else if (formBudget <= 5000000) {
      // default medium to can distribute (4)
      setFormC6(4);
    } else {
      // default high to cannot distribute (1)
      setFormC6(1);
    }
  }, [formBudget]);

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const c1Label = C1_OPTIONS.find(o => o.value === Number(formC1))?.label || "";
    const c2Label = C2_OPTIONS.find(o => o.value === Number(formC2))?.label || "";
    const c3Label = C3_OPTIONS.find(o => o.value === Number(formC3))?.label || "";
    const c4Label = C4_OPTIONS.find(o => o.value === Number(formC4))?.label || "";
    const c5Label = C5_OPTIONS.find(o => o.value === Number(formC5))?.label || "";
    
    const selectedC6Opt = C6_OPTIONS.find(o => o.value === Number(formC6));
    const canDistributeText = selectedC6Opt ? selectedC6Opt.canDistribute : "لا";

    const payload = {
      id: selectedProject.id,
      project_name: selectedProject.project_name,
      c1: formC1,
      c2: formC2,
      c3: formC3,
      c4: formC4,
      c5: formC5,
      c1_label: c1Label,
      c2_label: c2Label,
      c3_label: c3Label,
      c4_label: c4Label,
      c5_label: c5Label,
      c1_justification: c1Just,
      c2_justification: c2Just,
      c3_justification: c3Just,
      c4_justification: c4Just,
      c5_justification: c5Just,
      budget: formBudget,
      can_distribute: canDistributeText,
      is_priority: formIsPriority,
      // Pass other fields to satisfy API
      financial_alignment_status: selectedProject.financial_alignment_status || "",
      funding_feasibility: selectedC6Opt ? selectedC6Opt.label : "",
      leadership_support: selectedProject.leadership_support || ""
    };

    try {
      const token = localStorage.getItem("pha_token");
      const res = await fetch("/api/priority", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setSuccess("تم حفظ التقييم بنجاح وحساب النتيجة المرجحة");
        fetchPriorityData();
      } else {
        setError(data.error || "فشل حفظ التقييم");
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم لحفظ التقييم");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewProject = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("يرجى إدخال اسم المشروع");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");

    const c1Label = C1_OPTIONS.find(o => o.value === Number(formC1))?.label || "";
    const c2Label = C2_OPTIONS.find(o => o.value === Number(formC2))?.label || "";
    const c3Label = C3_OPTIONS.find(o => o.value === Number(formC3))?.label || "";
    const c4Label = C4_OPTIONS.find(o => o.value === Number(formC4))?.label || "";
    const c5Label = C5_OPTIONS.find(o => o.value === Number(formC5))?.label || "";

    const selectedC6Opt = C6_OPTIONS.find(o => o.value === Number(formC6));
    const canDistributeText = selectedC6Opt ? selectedC6Opt.canDistribute : "لا";

    const payload = {
      project_name: formName.trim(),
      description: formDesc.trim(),
      c1: formC1,
      c2: formC2,
      c3: formC3,
      c4: formC4,
      c5: formC5,
      c1_label: c1Label,
      c2_label: c2Label,
      c3_label: c3Label,
      c4_label: c4Label,
      c5_label: c5Label,
      c1_justification: c1Just,
      c2_justification: c2Just,
      c3_justification: c3Just,
      c4_justification: c4Just,
      c5_justification: c5Just,
      budget: formBudget,
      can_distribute: canDistributeText,
      is_priority: formIsPriority,
      financial_alignment_status: "مكتمل التقييم",
      funding_feasibility: selectedC6Opt ? selectedC6Opt.label : "",
      leadership_support: "مؤيد"
    };

    try {
      const token = localStorage.getItem("pha_token");
      const res = await fetch("/api/priority", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setSuccess("تم إضافة المشروع الجديد بنجاح وحساب أولويته");
        fetchPriorityData();
      } else {
        setError(data.error || "فشل إضافة المشروع");
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم لإضافة المشروع");
    } finally {
      setSaving(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (val) => {
    if (!val) return "0 ريال";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const liveP1 = getPhaseOneScore(formC1, formC2, formC3, formC4, formC5);
  const liveFinal = getFinalScore(liveP1, formC6);

  return (
    <DashboardLayout activeTab="priority">
      <div className="priority-container">
        
        {/* Header Control Bar */}
        <section className="controls-row animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="glass-panel search-wrapper">
            <span className="search-icon" style={{ display: "flex", alignItems: "center" }}><SearchIcon size={18} /></span>
            <input 
              type="text" 
              placeholder="ابحث عن مشروع في مصفوفة الأولويات..." 
              className="form-input search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={handleOpenAdd} className="btn btn-primary add-project-btn">
            <PlusIcon size={16} />
            <span>إضافة وتقييم مشروع جديد</span>
          </button>
        </section>

        {error && <div className="error-banner animate-fade-in">{error}</div>}
        {success && <div className="success-banner animate-fade-in">{success}</div>}

        {/* Matrix Table */}
        {loading ? (
          <div className="loading-card flex-center">
            <div className="spinner"></div>
            <p style={{ marginTop: '12px' }}>جاري تحميل مصفوفة الأولويات...</p>
          </div>
        ) : (
          <section className="glass-panel table-section animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="table-responsive">
              <table className="priority-table">
                <thead>
                  <tr>
                    <th>م</th>
                    <th>اسم المشروع</th>
                    <th>الميزانية المقدرة</th>
                    <th className="text-center">معايير المرحلة 1 (C1-C5)</th>
                    <th className="text-center">وزن المرحلة 1</th>
                    <th className="text-center">قابلية التمويل C6</th>
                    <th className="text-center">الوزن النهائي</th>
                    <th>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => {
                    const p1Score = getPhaseOneScore(p.c1 || 1, p.c2 || 1, p.c3 || 1, p.c4 || 1, p.c5 || 1);
                    const finalScore = p.final_score || getFinalScore(p1Score, p.c6 || 5);
                    return (
                      <tr key={p.id}>
                        <td className="row-id">{p.id}</td>
                        <td className="project-name-cell">
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <div className="p-title">{p.project_name}</div>
                            {p.is_priority && (
                              <span className="priority-badge" title="عقد ذو أولوية">
                                ★ ذو أولوية
                              </span>
                            )}
                          </div>
                          {p.description && <div className="p-desc text-muted">{p.description.slice(0, 85)}...</div>}
                        </td>
                        <td className="p-budget">{formatCurrency(p.budget)}</td>
                        <td className="text-center">
                          <div className="badge-score-row">
                            <span className="badge-score-dot" title={`C1 الإلزام: ${p.c1 || 1}`}>{p.c1 || 1}</span>
                            <span className="badge-score-dot" title={`C2 الاستراتيجية: ${p.c2 || 1}`}>{p.c2 || 1}</span>
                            <span className="badge-score-dot" title={`C3 قرار 921: ${p.c3 || 1}`}>{p.c3 || 1}</span>
                            <span className="badge-score-dot" title={`C4 الاستمرارية: ${p.c4 || 1}`}>{p.c4 || 1}</span>
                            <span className="badge-score-dot" title={`C5 الجاهزية: ${p.c5 || 1}`}>{p.c5 || 1}</span>
                          </div>
                        </td>
                        <td className="text-center font-bold">{p1Score.toFixed(2)}</td>
                        <td className="text-center">
                          <span className="badge-score-c6" title={`مستوى C6: ${p.c6 || 5}`}>{p.c6 || 5}</span>
                        </td>
                        <td className="text-center p-score">
                          <span className={`score-value ${getScoreColorClass(finalScore)}`}>
                            {finalScore.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => handleOpenAssess(p)} className="btn btn-glass assess-btn">
                            <CalculatorIcon size={14} className="text-secondary" />
                            <span>تقييم</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty-text">لا توجد مشاريع مطابقة للبحث</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Modal: Assess & Edit Project (Portalled to document.body) */}
        {isEditModalOpen && selectedProject && mounted && typeof window !== "undefined" && createPortal(
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h2 className="flex items-center gap-2">
                  <CalculatorIcon size={20} className="text-teal" />
                  <span>تقييم أولوية المشروع: {selectedProject.project_name}</span>
                </h2>
                <button onClick={() => setIsEditModalOpen(false)} className="close-btn" aria-label="إغلاق"><X size={18} /></button>
              </div>
              
              <form onSubmit={handleSaveAssessment} className="modal-body">
                {/* Live Scores Banner */}
                <div className="live-score-banner">
                  <div className="score-block">
                    <span className="score-lbl">وزن المرحلة الأولى (80%):</span>
                    <span className="score-val">{liveP1.toFixed(2)} / 5.00</span>
                  </div>
                  <div className="score-block">
                    <span className="score-lbl">قابلية التمويل C6 (20%):</span>
                    <span className="score-val">{formC6} / 5</span>
                  </div>
                  <div className="score-block highlight-score">
                    <span className="score-lbl">الوزن النهائي التراكمي:</span>
                    <span className={`score-val ${getScoreColorClass(liveFinal)}`}>{liveFinal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="form-grid">
                  {/* Priority Contract checkbox */}
                  <div className="form-group full-width toggle-group">
                    <label className="toggle-label">
                      <input 
                        type="checkbox" 
                        checked={formIsPriority}
                        onChange={(e) => setFormIsPriority(e.target.checked)}
                        className="toggle-checkbox"
                      />
                      <span className="toggle-text">عقد ذو أولوية (يظهر عليه شارة التمييز ذات الأولوية)</span>
                    </label>
                  </div>

                  {/* Budget input */}
                  <div className="form-group full-width">
                    <label>الميزانية التقديرية للمشروع (ريال سعودي)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formBudget}
                      onChange={(e) => setFormBudget(Number(e.target.value))}
                      required 
                    />
                  </div>

                  {/* C1: Regulatory compliance */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label>C1: مستوى الإلزام النظامي (الوزن: 15%)</label>
                      <select 
                        value={formC1} 
                        onChange={(e) => setFormC1(Number(e.target.value))} 
                        className="form-input select-input"
                      >
                        {C1_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="أدخل المبررات والأسس النظامية لهذا المعيار..." 
                      className="form-input justification-input" 
                      value={c1Just}
                      onChange={(e) => setC1Just(e.target.value)}
                    />
                  </div>

                  {/* C2: Strategic alignment */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label>C2: درجة الارتباط بالاستراتيجية (الوزن: 15%)</label>
                      <select 
                        value={formC2} 
                        onChange={(e) => setFormC2(Number(e.target.value))} 
                        className="form-input select-input"
                      >
                        {C2_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="أدخل مبررات الارتباط بأهداف مبادرة الاستراتيجية..." 
                      className="form-input justification-input" 
                      value={c2Just}
                      onChange={(e) => setC2Just(e.target.value)}
                    />
                  </div>

                  {/* C3: 921 decision alignment */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label>C3: الارتباط قرار 921 (الوزن: 15%)</label>
                      <select 
                        value={formC3} 
                        onChange={(e) => setFormC3(Number(e.target.value))} 
                        className="form-input select-input"
                      >
                        {C3_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="أدخل مبررات دعم اختصاصات الهيئة في قرار مجلس الوزراء 921..." 
                      className="form-input justification-input" 
                      value={c3Just}
                      onChange={(e) => setC3Just(e.target.value)}
                    />
                  </div>

                  {/* C4: Business continuity */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label>C4: أثر المشروع على استمرارية الأعمال والمخاطر التشغيلية (الوزن: 35%)</label>
                      <select 
                        value={formC4} 
                        onChange={(e) => setFormC4(Number(e.target.value))} 
                        className="form-input select-input"
                      >
                        {C4_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="أدخل مبررات تحليل المخاطر التشغيلية في حال عدم التنفيذ..." 
                      className="form-input justification-input" 
                      value={c4Just}
                      onChange={(e) => setC4Just(e.target.value)}
                    />
                  </div>

                  {/* C5: Readiness */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label>C5: مستوى جاهزية المشروع (الوزن: 20%)</label>
                      <select 
                        value={formC5} 
                        onChange={(e) => setFormC5(Number(e.target.value))} 
                        className="form-input select-input"
                      >
                        {C5_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="أدخل مبررات مستوى الجاهزية والاعتمادات المطروحة..." 
                      className="form-input justification-input" 
                      value={c5Just}
                      onChange={(e) => setC5Just(e.target.value)}
                    />
                  </div>

                  {/* C6: Feasibility - rated directly from the frontend */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label className="text-teal font-bold">قابلية التمويل C6 (المرحلة الثانية - الوزن: 20%)</label>
                      <select 
                        value={formC6} 
                        onChange={(e) => setFormC6(Number(e.target.value))} 
                        className="form-input select-input text-teal font-bold"
                      >
                        {C6_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <p className="crit-desc text-muted">
                      ملاحظة: يتم تصنيف قابلية التمويل بناءً على التكلفة المقدرة وإمكانية توزيع الصرف على سنوات لتجنب الضغط على السيولة.
                    </p>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="submit" disabled={saving} className="btn btn-primary save-btn">
                    {saving ? <span>جاري الحفظ...</span> : <span>حفظ التقييم</span>}
                  </button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-glass">إلغاء</button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Modal: Add New Project (Portalled to document.body) */}
        {isAddModalOpen && mounted && typeof window !== "undefined" && createPortal(
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h2 className="flex items-center gap-2">
                  <PlusIcon size={20} className="text-teal" />
                  <span>إضافة وتقييم مشروع جديد للمحفظة</span>
                </h2>
                <button onClick={() => setIsAddModalOpen(false)} className="close-btn" aria-label="إغلاق"><X size={18} /></button>
              </div>
              
              <form onSubmit={handleAddNewProject} className="modal-body">
                {/* Live Scores Banner */}
                <div className="live-score-banner">
                  <div className="score-block">
                    <span className="score-lbl">وزن المرحلة الأولى (80%):</span>
                    <span className="score-val">{liveP1.toFixed(2)}</span>
                  </div>
                  <div className="score-block">
                    <span className="score-lbl">وزن التمويل C6 (20%):</span>
                    <span className="score-val">{formC6}</span>
                  </div>
                  <div className="score-block highlight-score">
                    <span className="score-lbl">الوزن النهائي المتوقع:</span>
                    <span className={`score-val ${getScoreColorClass(liveFinal)}`}>{liveFinal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="form-grid">
                  {/* Name */}
                  <div className="form-group full-width">
                    <label>اسم المشروع</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="أدخل اسم المشروع بالكامل..." 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required 
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group full-width">
                    <label>نبذة / وصف المشروع</label>
                    <textarea 
                      className="form-input" 
                      placeholder="أدخل نبذة مختصرة عن نطاق وأهداف المشروع..." 
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      style={{ minHeight: '80px', fontFamily: 'var(--font-cairo)' }}
                    />
                  </div>

                  {/* Priority Contract checkbox */}
                  <div className="form-group full-width toggle-group">
                    <label className="toggle-label">
                      <input 
                        type="checkbox" 
                        checked={formIsPriority}
                        onChange={(e) => setFormIsPriority(e.target.checked)}
                        className="toggle-checkbox"
                      />
                      <span className="toggle-text">عقد ذو أولوية (يظهر عليه شارة التمييز ذات الأولوية)</span>
                    </label>
                  </div>

                  {/* Budget */}
                  <div className="form-group full-width">
                    <label>الميزانية التقديرية للمشروع (ريال سعودي)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formBudget}
                      onChange={(e) => setFormBudget(Number(e.target.value))}
                      required 
                    />
                  </div>

                  {/* C1 Criteria */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label>C1: مستوى الإلزام النظامي</label>
                      <select 
                        value={formC1} 
                        onChange={(e) => setFormC1(Number(e.target.value))} 
                        className="form-input select-input"
                      >
                        {C1_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="المبررات لمعيار مستوى الإلزام النظامي..." 
                      className="form-input justification-input" 
                      value={c1Just}
                      onChange={(e) => setC1Just(e.target.value)}
                    />
                  </div>

                  {/* C2 Criteria */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label>C2: درجة الارتباط بالاستراتيجية</label>
                      <select 
                        value={formC2} 
                        onChange={(e) => setFormC2(Number(e.target.value))} 
                        className="form-input select-input"
                      >
                        {C2_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="المبررات لمعيار الارتباط بالاستراتيجية..." 
                      className="form-input justification-input" 
                      value={c2Just}
                      onChange={(e) => setC2Just(e.target.value)}
                    />
                  </div>

                  {/* C3 Criteria */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label>C3: الارتباط قرار 921</label>
                      <select 
                        value={formC3} 
                        onChange={(e) => setFormC3(Number(e.target.value))} 
                        className="form-input select-input"
                      >
                        {C3_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="المبررات لمعيار الارتباط قرار 921..." 
                      className="form-input justification-input" 
                      value={c3Just}
                      onChange={(e) => setC3Just(e.target.value)}
                    />
                  </div>

                  {/* C4 Criteria */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label>C4: أثر المشروع على استمرارية الأعمال</label>
                      <select 
                        value={formC4} 
                        onChange={(e) => setFormC4(Number(e.target.value))} 
                        className="form-input select-input"
                      >
                        {C4_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="المبررات لمعيار أثر المشروع على استمرارية الأعمال..." 
                      className="form-input justification-input" 
                      value={c4Just}
                      onChange={(e) => setC4Just(e.target.value)}
                    />
                  </div>

                  {/* C5 Criteria */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label>C5: مستوى جاهزية المشروع</label>
                      <select 
                        value={formC5} 
                        onChange={(e) => setFormC5(Number(e.target.value))} 
                        className="form-input select-input"
                      >
                        {C5_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="المبررات لمعيار مستوى جاهزية المشروع..." 
                      className="form-input justification-input" 
                      value={c5Just}
                      onChange={(e) => setC5Just(e.target.value)}
                    />
                  </div>

                  {/* C6 Criteria */}
                  <div className="form-group full-width crit-block">
                    <div className="crit-header">
                      <label className="text-teal font-bold">قابلية التمويل C6 (المرحلة الثانية)</label>
                      <select 
                        value={formC6} 
                        onChange={(e) => setFormC6(Number(e.target.value))} 
                        className="form-input select-input text-teal font-bold"
                      >
                        {C6_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>({opt.value}) - {opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="submit" disabled={saving} className="btn btn-primary save-btn">
                    {saving ? <span>جاري الإضافة...</span> : <span>إضافة وتقييم المشروع</span>}
                  </button>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-glass">إلغاء</button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      </div>

      <style jsx>{`
        .priority-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .controls-row {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .search-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 4px 16px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(13, 152, 159, 0.06);
        }

        .search-icon {
          color: var(--text-muted);
          margin-left: 10px;
        }

        .search-input {
          border: none;
          background: transparent;
          padding: 10px 0;
          width: 100%;
          outline: none;
        }

        .add-project-btn {
          font-size: 0.85rem;
          padding: 12px 20px;
        }

        .table-section {
          padding: 24px;
          background: rgba(255, 255, 255, 0.8);
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .priority-table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
          font-size: 0.85rem;
        }

        .priority-table th {
          font-weight: 700;
          color: var(--text-secondary);
          padding: 14px 16px;
          border-bottom: 2px solid rgba(0,0,0,0.06);
        }

        .priority-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.04);
          vertical-align: middle;
        }

        .row-id {
          font-weight: 700;
          color: var(--text-muted);
        }

        .project-name-cell {
          max-width: 380px;
        }

        .p-title {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .priority-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(217, 119, 6, 0.08);
          border: 1px solid rgba(217, 119, 6, 0.15);
          color: #d97706;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          direction: rtl;
        }

        .toggle-group {
          margin-bottom: 4px;
          background: rgba(0, 0, 0, 0.01);
          border: 1px dashed rgba(13, 152, 159, 0.15);
          padding: 12px;
          border-radius: 8px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .toggle-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--color-secondary);
        }

        .toggle-text {
          font-weight: 700;
        }

        .p-desc {
          font-size: 0.72rem;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .p-budget {
          font-weight: 700;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .badge-score-row {
          display: inline-flex;
          gap: 6px;
          justify-content: center;
        }

        .badge-score-dot {
          display: inline-block;
          width: 22px;
          height: 22px;
          line-height: 22px;
          text-align: center;
          background: rgba(13, 152, 159, 0.05);
          border: 1px solid rgba(13, 152, 159, 0.1);
          border-radius: 5px;
          font-weight: 700;
          font-size: 0.75rem;
          color: var(--color-secondary);
        }

        .badge-score-c6 {
          display: inline-block;
          width: 24px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          background: rgba(9, 201, 146, 0.08);
          border: 1px solid rgba(9, 201, 146, 0.15);
          border-radius: 5px;
          font-weight: 800;
          font-size: 0.8rem;
          color: var(--color-primary);
        }

        .p-score {
          font-weight: 800;
        }

        .score-value {
          font-size: 1.05rem;
          font-weight: 800;
        }

        .text-emerald { color: #0d9488; }
        .text-teal { color: #0f766e; }
        .text-yellow { color: #b45309; }
        .text-red { color: #be123c; }

        .assess-btn {
          font-size: 0.75rem;
          padding: 6px 12px;
          border-radius: 8px;
        }

        .empty-text {
          text-align: center;
          padding: 30px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .error-banner {
          background: rgba(220, 38, 38, 0.08);
          border: 1px solid rgba(220, 38, 38, 0.15);
          color: #be123c;
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .success-banner {
          background: rgba(13, 148, 136, 0.08);
          border: 1px solid rgba(13, 148, 136, 0.15);
          color: #0f766e;
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }



        .loading-card {
          padding: 50px;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(13, 152, 159, 0.05);
          border-radius: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(13, 152, 159, 0.1);
          border-radius: 50%;
          border-top-color: var(--color-secondary);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}
