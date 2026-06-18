"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import DashboardLayout from "./components/DashboardLayout";
import ProjectDetailsModal from "./components/ProjectDetailsModal";
import { X } from "lucide-react";

// Dynamically import DashboardCharts and DashboardDonuts to avoid SSR hydration mismatches
const DashboardCharts = dynamic(() => import("./components/DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="flex-center" style={{ minHeight: "150px", flexDirection: "column", gap: "12px", background: "#ffffff", borderRadius: "16px", border: "1px solid var(--slate-200)", padding: "20px" }}>
      <div className="small-spinner"></div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", margin: 0 }}>جاري تحميل المخططات التفاعلية المتقدمة...</p>
    </div>
  )
});

const DashboardDonuts = dynamic(() => import("./components/DashboardDonuts"), {
  ssr: false,
  loading: () => (
    <div className="flex-center" style={{ minHeight: "250px", flexDirection: "column", gap: "12px", background: "#ffffff", borderRadius: "16px", border: "1px solid var(--slate-200)", padding: "20px" }}>
      <div className="small-spinner"></div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", margin: 0 }}>جاري تحميل المؤشرات والتحليلات البيانية...</p>
    </div>
  )
});

import {
  FolderIcon,
  PencilIcon,
  FlashIcon,
  DollarIcon,
  SearchIcon,
  DashboardIcon,
  TrendUpIcon,
  BuildingIcon,
  MessageIcon,
  LinkIcon,
  TrophyIcon,
  CalculatorIcon
} from "./components/Icons";

export default function DashboardHome() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [ragStats, setRagStats] = useState([]);
  const [heiaRagStats, setHeiaRagStats] = useState([]);
  const [transformationRagStats, setTransformationRagStats] = useState([]);
  const [sectorStats, setSectorStats] = useState([]);
  const [latestComments, setLatestComments] = useState([]);
  const [topPriorityProjects, setTopPriorityProjects] = useState([]);
  const [budgetSourcesStats, setBudgetSourcesStats] = useState(null);
  const [classificationStats, setClassificationStats] = useState([]);
  const [heiaClassificationStats, setHeiaClassificationStats] = useState([]);
  const [transformationClassificationStats, setTransformationClassificationStats] = useState([]);
  const [sectorBudgetStats, setSectorBudgetStats] = useState([]);
  const [sCurveStats, setSCurveStats] = useState([]);
  const [classificationTreemapStats, setClassificationTreemapStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabular projects list details (Modal popout)
  const [activeCard, setActiveCard] = useState("active_contracts");
  const [stageProjects, setStageProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [listSearchTerm, setListSearchTerm] = useState("");
  const [popoutOpen, setPopoutOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

  // Project details modal states
  const [detailsStage, setDetailsStage] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const router = useRouter();

  const triggerRefresh = () => {
    loadStats();
    if (activeCard) {
      loadStageProjects(activeCard, activeFilters);
    }
  };

  // Load dashboard statistics
  async function loadStats() {
    try {
      const res = await fetch("/api/portfolio?type=summary");
      const data = await res.json();
      if (data.success) {
        setStats(data.summary);
        setRagStats(data.activeRagStats || []);
        setHeiaRagStats(data.heiaRagStats || []);
        setTransformationRagStats(data.transformationRagStats || []);
        setSectorStats(data.sectorStats || []);
        setLatestComments(data.latestComments || []);
        setTopPriorityProjects(data.topPriorityProjects || []);
        setBudgetSourcesStats(data.budgetSourcesStats || null);
        setClassificationStats(data.classificationStats || []);
        setHeiaClassificationStats(data.heiaClassificationStats || []);
        setTransformationClassificationStats(data.transformationClassificationStats || []);
        setSectorBudgetStats(data.sectorBudgetStats || []);
        setSCurveStats(data.sCurveStats || []);
        setClassificationTreemapStats(data.classificationTreemapStats || []);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("pha_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    loadStats();
  }, []);

  const loadStageProjects = async (stageKey, extraFilters = null) => {
    setProjectsLoading(true);
    setActiveFilters(extraFilters);
    try {
      let url = `/api/portfolio?stage=${stageKey}`;
      if (extraFilters) {
        Object.entries(extraFilters).forEach(([k, v]) => {
          if (v) url += `&${k}=${encodeURIComponent(v)}`;
        });
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStageProjects(data.data || []);
      }
    } catch (err) {
      console.error("Error loading stage projects:", err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleCardClick = (stageKey) => {
    setActiveCard(stageKey);
    setPopoutOpen(true);
    setListSearchTerm("");
    loadStageProjects(stageKey, null);
  };

  const handleSegmentClick = (budgetSource, filterType, value) => {
    let targetStage = "all";
    let extraFilters = { budget_source: budgetSource };

    if (filterType === 'stage') {
      const labelMap = {
        "خطة الطلبات": "demand_plan",
        "في الطرح": "tendering_procedures",
        "الترسية": "awarding",
        "التعاقد": "contracting",
        "نشطة": "active_contracts",
        "العقود النشطة": "active_contracts"
      };
      targetStage = labelMap[value] || "all";
    } else if (filterType === 'classification') {
      extraFilters.classification = value;
    } else if (filterType === 'rag') {
      targetStage = "active_contracts";
      extraFilters.status = value;
    }

    setActiveCard(targetStage);
    setPopoutOpen(true);
    setListSearchTerm("");
    loadStageProjects(targetStage, extraFilters);
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "0 ريال";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getScoreColorClass = (score) => {
    if (score >= 4.0) return "text-emerald";
    if (score >= 3.0) return "text-teal";
    if (score >= 2.0) return "text-yellow";
    return "text-red";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStageLabel = (stage) => {
    const labels = {
      demand_plan: "خطة الطلبات",
      tendering_procedures: "إجراءات الطرح",
      priority_contracts: "العقود ذات الأولوية",
      awarding: "الترسية",
      contracting: "التعاقد",
      active_contracts: "العقود النشطة",
      priority_matrix: "تقييم الأولويات"
    };
    return labels[stage] || stage;
  };

  // Filter project list by search text
  const filteredStageProjects = stageProjects.filter(p => 
    p.project_name?.toLowerCase().includes(listSearchTerm.toLowerCase()) ||
    p.sector?.toLowerCase().includes(listSearchTerm.toLowerCase()) ||
    p.owning_department?.toLowerCase().includes(listSearchTerm.toLowerCase())
  );

  // SVG Donut Chart Color Arrays
  const lifecycleColors = ["#06b6d4", "#a855f7", "#ca8a04", "#2563eb", "#0d9488"];
  const classificationColors = ["#0284c7", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"];
  const stageStatusColors = ["#0d9488", "#2563eb", "#ca8a04", "#a855f7"];
  const progressStatusColors = ["#10b981", "#3b82f6", "#f59e0b", "#f97316", "#ef4444", "#06b6d4"];

  // Prepare data arrays for SVG Charts
  const buildHeiaChartData = () => {
    if (!budgetSourcesStats?.heia) return [];
    const h = budgetSourcesStats.heia;
    return [
      { name: "خطة الطلبات", value: h.demand_count },
      { name: "في الطرح", value: h.tendering_count },
      { name: "الترسية", value: h.awarding_count },
      { name: "التعاقد", value: h.contracting_count },
      { name: "نشطة", value: h.active_count }
    ].filter(x => x.value > 0);
  };

  const buildTransformationChartData = () => {
    if (!budgetSourcesStats?.transformation) return [];
    const t = budgetSourcesStats.transformation;
    return [
      { name: "خطة الطلبات", value: t.demand_count },
      { name: "في الطرح", value: t.tendering_count },
      { name: "الترسية", value: t.awarding_count },
      { name: "التعاقد", value: t.contracting_count },
      { name: "نشطة", value: t.active_count }
    ].filter(x => x.value > 0);
  };

  const buildTransformationContractStageData = () => {
    if (!budgetSourcesStats?.transformation) return [];
    const t = budgetSourcesStats.transformation;
    return [
      { name: "نشطة", value: t.active_count },
      { name: "التعاقد", value: t.contracting_count },
      { name: "الترسية", value: t.awarding_count },
      { name: "في الطرح", value: t.tendering_count }
    ].filter(x => x.value > 0);
  };

  const buildProgressStatusData = () => {
    return heiaRagStats.map(item => ({
      name: item.status,
      value: item.count
    })).filter(x => x.value > 0);
  };

  const buildTransformationProgressStatusData = () => {
    return transformationRagStats.map(item => ({
      name: item.status,
      value: item.count
    })).filter(x => x.value > 0);
  };

  if (loading) {
    return (
      <div className="loading-skeleton-dashboard animate-fade-in">
        <div className="skeleton-header">
          <div className="skeleton-line title"></div>
          <div className="skeleton-line subtitle"></div>
        </div>
        
        <div className="skeleton-kpi-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div className="skeleton-circle"></div>
                <div className="skeleton-line" style={{ width: '40px', height: '14px' }}></div>
              </div>
              <div className="skeleton-line" style={{ width: '80%', height: '16px' }}></div>
              <div className="skeleton-line" style={{ width: '50%', height: '12px' }}></div>
            </div>
          ))}
        </div>

        <div className="skeleton-charts-block">
          <div className="skeleton-card" style={{ height: '320px' }}>
            <div className="skeleton-line title"></div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="skeleton-circle" style={{ width: '140px', height: '14px' }}></div>
            </div>
          </div>
          <div className="skeleton-card" style={{ height: '320px' }}>
            <div className="skeleton-line title"></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
              <div className="skeleton-line" style={{ width: '90%' }}></div>
              <div className="skeleton-line" style={{ width: '75%' }}></div>
              <div className="skeleton-line" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .loading-skeleton-dashboard {
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 30px;
            min-height: 100vh;
            background: #f8fafc;
            direction: rtl;
            font-family: var(--font-cairo), sans-serif;
            box-sizing: border-box;
          }
          .skeleton-header {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .skeleton-kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
          }
          .skeleton-charts-block {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 20px;
          }
          @media (max-width: 1024px) {
            .skeleton-charts-block {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="dashboard-container animate-fade-in">
        
        {/* KPI Grid Panel */}
        <section className="kpi-panel-section">
          <div className="kpi-grid">
            
            {/* Card 1: إجمالي المشاريع */}
            <div 
              onClick={() => handleCardClick("all")}
              className={`kpi-card glass-panel glass-panel-hover ${activeCard === "all" && popoutOpen ? "active-kpi" : ""}`}
            >
              <div className="kpi-top-row">
                <div className="kpi-icon-wrapper cyan-bg">
                  <FolderIcon size={20} className="cyan-text" />
                </div>
                <span className="kpi-badge">100%</span>
              </div>
              <div className="kpi-main-info">
                <h3 className="kpi-title">إجمالي المشاريع</h3>
                <div className="kpi-value">{stats?.total}</div>
                <div className="kpi-subtext">كافة المشاريع في المحفظة</div>
                <div className="kpi-progress-bar-container">
                  <div className="kpi-progress-fill bg-cyan" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>

            {/* Card 2: إجمالي المشاريع القائمة */}
            <div 
              onClick={() => handleCardClick("active_contracts")}
              className={`kpi-card glass-panel glass-panel-hover ${activeCard === "active_contracts" && popoutOpen ? "active-kpi" : ""}`}
            >
              <div className="kpi-top-row">
                <div className="kpi-icon-wrapper teal-bg">
                  <FlashIcon size={20} className="teal-text" />
                </div>
                <span className="kpi-badge">
                  {stats?.total > 0 ? Math.round(((stats?.active?.count || 0) / stats?.total) * 100) : 0}%
                </span>
              </div>
              <div className="kpi-main-info">
                <h3 className="kpi-title">إجمالي المشاريع القائمة</h3>
                <div className="kpi-value">{stats?.active?.count}</div>
                <div className="kpi-subtext">الميزانية: {formatCurrency(stats?.active?.total_cost)}</div>
                <div className="kpi-progress-bar-container">
                  <div className="kpi-progress-fill bg-teal" style={{ width: `${stats?.total > 0 ? ((stats?.active?.count || 0) / stats?.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Card 3: إجمالي العقود المعتمدة */}
            <div 
              onClick={() => handleCardClick("contracting")}
              className={`kpi-card glass-panel glass-panel-hover ${activeCard === "contracting" && popoutOpen ? "active-kpi" : ""}`}
            >
              <div className="kpi-top-row">
                <div className="kpi-icon-wrapper blue-bg">
                  <PencilIcon size={20} className="blue-text" />
                </div>
                <span className="kpi-badge">
                  {stats?.total > 0 ? Math.round(((stats?.contracting?.count || 0) / stats?.total) * 100) : 0}%
                </span>
              </div>
              <div className="kpi-main-info">
                <h3 className="kpi-title">إجمالي العقود المعتمدة</h3>
                <div className="kpi-value">{stats?.contracting?.count}</div>
                <div className="kpi-subtext">الميزانية: {formatCurrency(stats?.contracting?.budget)}</div>
                <div className="kpi-progress-bar-container">
                  <div className="kpi-progress-fill bg-blue" style={{ width: `${stats?.total > 0 ? ((stats?.contracting?.count || 0) / stats?.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Card 4: إجمالي المشاريع التي تمت ترسيتها */}
            <div 
              onClick={() => handleCardClick("awarding")}
              className={`kpi-card glass-panel glass-panel-hover ${activeCard === "awarding" && popoutOpen ? "active-kpi" : ""}`}
            >
              <div className="kpi-top-row">
                <div className="kpi-icon-wrapper yellow-bg">
                  <TrophyIcon size={20} className="yellow-text" />
                </div>
                <span className="kpi-badge">
                  {stats?.total > 0 ? Math.round(((stats?.awarding?.count || 0) / stats?.total) * 100) : 0}%
                </span>
              </div>
              <div className="kpi-main-info">
                <h3 className="kpi-title">إجمالي المشاريع المرساة</h3>
                <div className="kpi-value">{stats?.awarding?.count}</div>
                <div className="kpi-subtext">قيد التوقيع والاعتماد</div>
                <div className="kpi-progress-bar-container">
                  <div className="kpi-progress-fill bg-yellow" style={{ width: `${stats?.total > 0 ? ((stats?.awarding?.count || 0) / stats?.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Card 5: إجمالي المشاريع المطروحة */}
            <div 
              onClick={() => handleCardClick("tendering_procedures")}
              className={`kpi-card glass-panel glass-panel-hover ${activeCard === "tendering_procedures" && popoutOpen ? "active-kpi" : ""}`}
            >
              <div className="kpi-top-row">
                <div className="kpi-icon-wrapper purple-bg">
                  <CalculatorIcon size={20} className="purple-text" />
                </div>
                <span className="kpi-badge">
                  {stats?.total > 0 ? Math.round(((stats?.tendering?.count || 0) / stats?.total) * 100) : 0}%
                </span>
              </div>
              <div className="kpi-main-info">
                <h3 className="kpi-title">إجمالي المشاريع المطروحة</h3>
                <div className="kpi-value">{stats?.tendering?.count}</div>
                <div className="kpi-subtext">مراجعة كراسات وإعداد عروض</div>
                <div className="kpi-progress-bar-container">
                  <div className="kpi-progress-fill bg-purple" style={{ width: `${stats?.total > 0 ? ((stats?.tendering?.count || 0) / stats?.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Interactive Advanced Visualizations Section */}
        <section className="interactive-charts-section animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="section-title-wrapper">
            <h2 className="section-main-title">التحليلات والمؤشرات التفاعلية المتقدمة</h2>
            <p className="section-sub-title">إحصاءات تفصيلية تفاعلية لمراقبة ميزانيات القطاعات، نسب الإنجاز التراكمي وتوزيع بنود المحفظة</p>
          </div>
          <DashboardCharts 
            sectorBudgetStats={sectorBudgetStats} 
            sCurveStats={sCurveStats} 
            classificationTreemapStats={classificationTreemapStats} 
          />
        </section>

        <DashboardDonuts
          heiaLifecycleData={buildHeiaChartData()}
          heiaClassificationData={heiaClassificationStats}
          heiaRagData={buildProgressStatusData()}
          transLifecycleData={buildTransformationChartData()}
          transClassificationData={transformationClassificationStats}
          transRagData={buildTransformationProgressStatusData()}
          onSegmentClick={handleSegmentClick}
        />
      </div>

      {/* Dynamic Project Line-List Details (Modal Popout Overlay Portalled to document.body) */}
      {popoutOpen && mounted && typeof window !== "undefined" && createPortal(
        <div className="modal-overlay">
          <div className="popout-card">
            
            <div className="popout-header">
              <div className="header-meta">
                <h2 className="popout-headline" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span>تفاصيل المشاريع: {getStageLabel(activeCard === "all" ? "priority_matrix" : activeCard)}</span>
                  {activeFilters && (
                    <span className="filter-badge" style={{ fontSize: '0.7rem', background: 'rgba(9, 201, 146, 0.1)', padding: '4px 10px', borderRadius: '20px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      {activeFilters.budget_source}
                      {activeFilters.classification && ` - تصنيف: ${activeFilters.classification}`}
                      {activeFilters.status && ` - حالة: ${activeFilters.status}`}
                    </span>
                  )}
                  <span className="count-badge" style={{ fontSize: '0.8rem', background: 'var(--slate-100)', padding: '2px 8px', borderRadius: '6px', color: 'var(--color-secondary)' }}>
                    ({filteredStageProjects.length} مشروع)
                  </span>
                </h2>
                <p className="popout-desc font-medium">كافة البنود والمشاريع التابعة للمجموعة المختارة</p>
              </div>
              
              <div className="header-controls">
                {/* Search bar inside popout */}
                <div className="popout-search-box">
                  <span className="popout-search-icon"><SearchIcon size={14} /></span>
                  <input 
                    type="text" 
                    placeholder="ابحث بالاسم، القطاع أو الإدارة..." 
                    className="form-input popout-search-input"
                    value={listSearchTerm}
                    onChange={(e) => setListSearchTerm(e.target.value)}
                  />
                </div>
                {/* Close button */}
                <button onClick={() => setPopoutOpen(false)} className="close-popout-btn" aria-label="إغلاق"><X size={18} /></button>
              </div>
            </div>

            <div className="popout-body table-responsive">
              {projectsLoading ? (
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <div className="skeleton-line" style={{ width: '30px', height: '14px' }}></div>
                      <div className="skeleton-line" style={{ flex: 1, height: '14px' }}></div>
                      <div className="skeleton-line" style={{ width: '100px', height: '14px' }}></div>
                      <div className="skeleton-line" style={{ width: '140px', height: '14px' }}></div>
                      <div className="skeleton-line" style={{ width: '90px', height: '14px' }}></div>
                      <div className="skeleton-line" style={{ width: '70px', height: '14px' }}></div>
                    </div>
                  ))}
                </div>
              ) : filteredStageProjects.length === 0 ? (
                <div className="empty-panel text-center text-muted" style={{ padding: '40px' }}>لا توجد مشاريع مطابقة للبحث</div>
              ) : (
                <table className="stage-list-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>م</th>
                      <th style={{ width: '400px' }}>اسم المشروع / العقد</th>
                      <th>القطاع</th>
                      <th>الإدارة المالكة</th>
                      <th>الميزانية / التكلفة</th>
                      <th>التصنيف</th>
                      {activeCard === "all" ? <th>المرحلة الحالية</th> : <th>مصدر الميزانية</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStageProjects.map((proj, index) => {
                      const costVal = proj.total_cost || proj.estimated_value || 0;
                      const classificationVal = proj.classification || proj.project_classification || "غير محدد";
                      const budgetSourceVal = proj.budget_source || proj.funding_source || "غير محدد";
                      
                      const getStageKeyFromLabel = (label) => {
                        const map = {
                          "خطة الطلبات": "demand_plan",
                          "في الطرح": "tendering_procedures",
                          "الترسية": "awarding",
                          "التعاقد": "contracting",
                          "عقد نشط": "active_contracts"
                        };
                        return map[label] || "active_contracts";
                      };

                      const computedStage = activeCard === "all" ? getStageKeyFromLabel(proj.stage_name) : activeCard;

                      return (
                        <tr 
                          key={proj.id || index}
                          onClick={() => {
                            setDetailsStage(computedStage);
                            setDetailsId(proj.id);
                            setIsDetailsOpen(true);
                          }}
                          className="clickable-popout-row"
                          style={{ cursor: "pointer" }}
                        >
                          <td className="col-id">{proj.id || index + 1}</td>
                          <td className="col-name font-bold" title={proj.project_name}>{proj.project_name}</td>
                          <td><span className="cell-tag tag-sector">{proj.sector || "غير محدد"}</span></td>
                          <td className="text-secondary font-medium">{proj.owning_department || "غير محدد"}</td>
                          <td className="font-bold">{costVal > 0 ? formatCurrency(costVal) : "قيد الدراسة"}</td>
                          <td><span className="cell-tag tag-classification">{classificationVal}</span></td>
                          {activeCard === "all" ? (
                            <td><span className="cell-tag tag-stage">{proj.stage_name}</span></td>
                          ) : (
                            <td className="text-muted font-medium">{budgetSourceVal}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="popout-footer">
              <button onClick={() => setPopoutOpen(false)} className="btn btn-primary close-footer-btn">إغلاق القائمة التصفحية</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx>{`
        .interactive-charts-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
        .section-title-wrapper {
          border-right: 4px solid var(--color-primary);
          padding-right: 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 4px;
        }
        .section-main-title {
          font-size: 1.05rem;
          font-weight: 850;
          color: var(--text-primary);
          margin: 0;
        }
        .section-sub-title {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
          margin: 0;
        }
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-sizing: border-box;
          width: 100%;
        }

        /* KPI Panel */
        .kpi-panel-section {
          width: 100%;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }
        .kpi-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(11, 114, 133, 0.02);
          width: 100%;
          box-sizing: border-box;
        }
        .kpi-card:hover {
          transform: translateY(-4px);
          border-color: rgba(11, 114, 133, 0.25);
          box-shadow: 0 12px 30px rgba(11, 114, 133, 0.08);
          background: #ffffff;
        }
        .active-kpi {
          border-color: var(--color-secondary) !important;
          background: rgba(11, 114, 133, 0.02) !important;
          box-shadow: 0 8px 25px rgba(11, 114, 133, 0.06) !important;
        }
        .kpi-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .kpi-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          background: rgba(11, 114, 133, 0.05);
          color: var(--color-secondary);
        }
        .kpi-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cyan-bg { background: rgba(9, 201, 146, 0.08); }
        .cyan-text { color: var(--color-primary); }
        .teal-bg { background: rgba(11, 114, 133, 0.08); }
        .teal-text { color: var(--color-secondary); }
        .blue-bg { background: rgba(37, 99, 235, 0.08); }
        .blue-text { color: #1d4ed8; }
        .yellow-bg { background: rgba(180, 83, 9, 0.08); }
        .yellow-text { color: #b45309; }
        .purple-bg { background: rgba(168, 85, 247, 0.08); }
        .purple-text { color: #a855f7; }

        .kpi-main-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          text-align: right;
        }
        .kpi-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin: 0;
        }
        .kpi-value {
          font-size: 1.5rem;
          font-weight: 850;
          color: var(--text-primary);
          line-height: 1.1;
        }
        .kpi-subtext {
          font-size: 0.625rem;
          color: var(--text-muted);
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .kpi-progress-bar-container {
          width: 100%;
          height: 5px;
          background: var(--slate-100);
          border-radius: 10px;
          overflow: hidden;
          margin-top: 6px;
        }
        .kpi-progress-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.5s ease-out;
        }
        .bg-cyan { background-color: var(--color-primary); }
        .bg-teal { background-color: var(--color-secondary); }
        .bg-blue { background-color: #3b82f6; }
        .bg-yellow { background-color: #f59e0b; }
        .bg-purple { background-color: #a855f7; }

        /* Two Columns Layout */
        .two-columns-dashboard {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          width: 100%;
        }

        .dashboard-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .chart-block-section {
          padding: 24px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .chart-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .chart-subtitle {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 600;
          margin: 0;
        }

        .chart-body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 170px;
          width: 100%;
        }

        .column-focus-header {
          padding: 16px 20px;
          border-radius: 14px;
          margin-bottom: -8px;
          border-right: 4px solid var(--color-secondary);
        }
        .heia-gradient {
          background: linear-gradient(to left, rgba(12, 166, 120, 0.04) 0%, transparent 100%);
          border-right-color: var(--color-primary);
        }
        .trans-gradient {
          background: linear-gradient(to left, rgba(11, 114, 133, 0.04) 0%, transparent 100%);
          border-right-color: var(--color-secondary);
        }
        .column-focus-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }
        .column-focus-subtitle {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 600;
          margin: 4px 0 0 0;
        }
        
        .clickable-popout-row {
          transition: background-color 0.2s;
        }

        .clickable-popout-row:hover td {
          background: rgba(11, 114, 133, 0.03) !important;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .two-columns-dashboard {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isDetailsOpen}
        stage={detailsStage}
        id={detailsId}
        onClose={() => setIsDetailsOpen(false)}
        onUpdate={triggerRefresh}
      />
      
    </DashboardLayout>
  );
}
