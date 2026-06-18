"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import AddProjectModal from "../components/AddProjectModal";
import ProjectDetailsModal from "../components/ProjectDetailsModal";
import {
  FolderIcon,
  FileTextIcon,
  TrophyIcon,
  CalculatorIcon,
  UsersIcon,
  LockIcon,
  PlusIcon,
  MessageIcon,
  AlertIcon,
  LinkIcon,
  HomeIcon,
  TrendUpIcon,
  BuildingIcon,
  PencilIcon,
  FlashIcon,
  DollarIcon,
  SearchIcon,
  DashboardIcon
} from "../components/Icons";

const getStageIcon = (stageId) => {
  const size = 18;
  switch (stageId) {
    case "active_contracts": return <FlashIcon size={size} className="text-green" />;
    case "demand_plan": return <FolderIcon size={size} className="text-cyan" />;
    case "tendering_procedures": return <PencilIcon size={size} className="text-teal" />;
    case "priority_contracts": return <CalculatorIcon size={size} className="text-blue" />;
    case "awarding": return <TrophyIcon size={size} style={{ color: "#d97706" }} />;
    case "contracting": return <PencilIcon size={size} className="text-teal" />;
    case "portfolio_plan": return <DashboardIcon size={size} className="text-teal" />;
    case "portfolio_details": return <SearchIcon size={size} className="text-teal" />;
    case "annual_cycle": return <TrendUpIcon size={size} className="text-teal" />;
    default: return <FolderIcon size={size} />;
  }
};

const STAGES = [
  { id: "active_contracts", label: "قائمة العقود النشطة", icon: "🟢" },
  { id: "demand_plan", label: "خطة الطلبات 2026", icon: "📋" },
  { id: "tendering_procedures", label: "في إجراءات الطرح", icon: "⚖️" },
  { id: "priority_contracts", label: "العقود ذات الأولوية", icon: "⭐" },
  { id: "awarding", label: "الترسية", icon: "🏆" },
  { id: "contracting", label: "التعاقد", icon: "✍️" },
  { id: "portfolio_plan", label: "خطة المحفظة 2026", icon: "📅" },
  { id: "portfolio_details", label: "خطة المحفظة - التفصيل", icon: "🔍" },
  { id: "annual_cycle", label: "الدورة السنوية", icon: "🔄" }
];

const COLUMNS_MAP = {
  active_contracts: [
    { key: "id", label: "م" },
    { key: "project_name", label: "المشروع" },
    { key: "sector", label: "القطاع" },
    { key: "executing_entity", label: "الجهة المنفذة" },
    { key: "total_cost", label: "إجمالي التكلفة", type: "currency" },
    { key: "progress_status", label: "حالة التقدم", type: "badge" },
    { key: "notes", label: "ملاحظات وتحديثات" }
  ],
  demand_plan: [
    { key: "id", label: "م" },
    { key: "project_name", label: "المشروع/الكراسة" },
    { key: "sector", label: "القطاع" },
    { key: "owning_department", label: "الإدارة المالكة" },
    { key: "estimated_value", label: "القيمة التقديرية", type: "currency" },
    { key: "financial_approval_status", label: "الاعتماد المالي" },
    { key: "weekly_update", label: "تحديث" }
  ],
  tendering_procedures: [
    { key: "id", label: "م" },
    { key: "project_name", label: "المنافسة/الكراسة" },
    { key: "owning_department", label: "الإدارة المالكة" },
    { key: "competition_number", label: "رقم المنافسة" },
    { key: "tendering_stage", label: "مرحلة الطرح" },
    { key: "procurement_officer", label: "مسؤول المشتريات" },
    { key: "weekly_update", label: "تحديث/ملاحظات" }
  ],
  priority_contracts: [
    { key: "id", label: "م" },
    { key: "project_name", label: "المشروع" },
    { key: "status", label: "الحالة" },
    { key: "budget_item", label: "البند" },
    { key: "weekly_update", label: "التحديث الأسبوعي" }
  ],
  awarding: [
    { key: "id", label: "م" },
    { key: "project_name", label: "اسم المشروع" },
    { key: "owning_department", label: "الإدارة المالكة" },
    { key: "competition_number", label: "رقم المنافسة" },
    { key: "awarding_stage", label: "مرحلة المنافسة" },
    { key: "contract_status", label: "وضع العقد" }
  ],
  contracting: [
    { key: "id", label: "م" },
    { key: "project_name", label: "اسم المشروع" },
    { key: "executing_entity", label: "الجهة المنفذة" },
    { key: "total_cost", label: "إجمالي التكاليف", type: "currency" },
    { key: "contract_status", label: "وضع العقد" },
    { key: "weekly_update", label: "تحديث" }
  ],
  portfolio_plan: [
    { key: "id", label: "م" },
    { key: "phase", label: "المرحلة" },
    { key: "main_activities", label: "الأنشطة الرئيسية" },
    { key: "quarter", label: "الربع" },
    { key: "leading_entity", label: "الجهة القائدة" },
    { key: "status", label: "الحالة" }
  ],
  portfolio_details: [
    { key: "id", label: "م" },
    { key: "step_activity", label: "الخطوة/النشاط" },
    { key: "quarter", label: "الربع" },
    { key: "leading_entity", label: "الجهة القائدة" },
    { key: "phase", label: "المرحلة" },
    { key: "status", label: "الحالة" }
  ],
  annual_cycle: [
    { key: "id", label: "م" },
    { key: "quarter_period", label: "الربع / الفترة" },
    { key: "months", label: "الأشهر" },
    { key: "main_activities", label: "الأنشطة الرئيسية" },
    { key: "outputs", label: "المخرجات" },
    { key: "leading_entity", label: "الجهة القائدة" }
  ]
};

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("active_contracts");
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailsStage, setDetailsStage] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Load auth state
  useEffect(() => {
    const storedUser = localStorage.getItem("pha_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch list when activeTab, search, or refreshTrigger changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/portfolio?stage=${activeTab}&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setDataList(data.data);
        }
      } catch (err) {
        console.error("Error loading stage data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeTab, search, refreshTrigger]);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const renderCell = (row, col) => {
    const value = row[col.key];
    if (value === null || value === undefined) return <span className="text-muted">-</span>;

    if (col.type === "currency") {
      return formatCurrency(value);
    }

    if (col.type === "badge") {
      let badgeClass = "badge-blue";
      if (value.includes("المسار") || value.includes("مكتمل")) badgeClass = "badge-green";
      if (value.includes("صعوبات") || value.includes("تحدي") || value.includes("متأخر قليلا")) badgeClass = "badge-yellow";
      if (value.includes("متعثر") || value.includes("متأخر")) badgeClass = "badge-red";
      return <span className={`badge ${badgeClass}`}>{value}</span>;
    }

    // Truncate long notes/texts
    if (typeof value === "string" && value.length > 80) {
      return `${value.slice(0, 80)}...`;
    }

    return value;
  };

  const handleLogout = () => {
    localStorage.removeItem("pha_token");
    localStorage.removeItem("pha_user");
    setUser(null);
    router.refresh();
  };

  return (
    <DashboardLayout activeTab="portfolio">
      <div className="portfolio-container">

      {/* Main Layout Splits */}
      <div className="portfolio-layout">
        {/* Sidebar Tabs */}
        <aside className="glass-panel sidebar-tabs animate-fade-in">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FolderIcon size={18} className="text-teal" />
            <span>مراحل وأوراق المحفظة</span>
          </h3>
          <div className="tabs-list">
            {STAGES.map((stage) => (
              <button
                key={stage.id}
                className={`tab-item flex-right ${activeTab === stage.id ? "active-tab" : ""}`}
                onClick={() => {
                  setActiveTab(stage.id);
                  setSearch("");
                }}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span className="tab-icon" style={{ display: "flex", alignItems: "center" }}>{getStageIcon(stage.id)}</span>
                <span className="tab-label">{stage.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Content Table Area */}
        <main className="glass-panel content-area animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Header & Search */}
          <div className="content-header">
            <div className="header-title-row">
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                {getStageIcon(activeTab)}
                <span>{STAGES.find(s => s.id === activeTab)?.label}</span>
              </h2>
              {user && ["active_contracts", "demand_plan", "tendering_procedures", "awarding", "contracting"].includes(activeTab) && (
                <button 
                  onClick={() => setIsAddOpen(true)}
                  className="btn btn-primary add-project-btn flex items-center gap-1"
                  style={{ marginRight: '16px', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '8px' }}
                >
                  <PlusIcon size={14} />
                  <span>إضافة مشروع جديد</span>
                </button>
              )}
            </div>
            <div className="search-bar-wrapper">
              <span className="search-icon" style={{ display: "flex", alignItems: "center" }}><SearchIcon size={18} /></span>
              <input
                type="text"
                placeholder="بحث سريع في هذه الورقة..."
                className="form-input search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container">
            {loading ? (
              <div className="table-loading flex-center">
                <div className="spinner"></div>
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : dataList.length === 0 ? (
              <div className="empty-state flex-center">
                <span>📂</span>
                <p>لا توجد بيانات مطابقة للبحث أو معروضة في هذا القسم.</p>
              </div>
            ) : (
              <table className="portfolio-table">
                <thead>
                  <tr>
                    {COLUMNS_MAP[activeTab]?.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                    <th>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((row, idx) => {
                    const isClickable = ["active_contracts", "demand_plan", "tendering_procedures", "awarding", "contracting", "priority_contracts"].includes(activeTab);
                    return (
                      <tr 
                        key={row.id || idx}
                        onClick={() => {
                          if (isClickable) {
                            setDetailsStage(activeTab);
                            setDetailsId(row.id);
                            setIsDetailsOpen(true);
                          }
                        }}
                        style={{ cursor: isClickable ? "pointer" : "default" }}
                        className="project-table-row"
                      >
                        {COLUMNS_MAP[activeTab]?.map((col) => (
                          <td key={col.key}>{renderCell(row, col)}</td>
                        ))}
                        <td onClick={(e) => e.stopPropagation()}>
                          {/* Only detail links for project/contract sheets, timeline sheets don't have separate detail pages */}
                          {isClickable ? (
                            <button 
                              onClick={() => {
                                setDetailsStage(activeTab);
                                setDetailsId(row.id);
                                setIsDetailsOpen(true);
                              }}
                              className="btn btn-glass btn-detail"
                            >
                              📄 تفاصيل
                            </button>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        .portfolio-container {
          max-width: 1420px;
          margin: 0 auto;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
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

        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
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

        .portfolio-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 992px) {
          .portfolio-layout {
            grid-template-columns: 1fr;
          }
        }

        .sidebar-tabs {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-tabs h3 {
          font-size: 0.95rem;
          color: var(--text-secondary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 12px;
        }

        .tabs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tab-item {
          background: transparent;
          border: none;
          padding: 12px 16px;
          border-radius: 10px;
          color: var(--text-secondary);
          font-family: var(--font-cairo);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: right;
        }

        .tab-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
        }

        .active-tab {
          background: rgba(9, 201, 146, 0.08) !important;
          border: 1px solid rgba(9, 201, 146, 0.15) !important;
          color: var(--color-primary) !important;
        }

        .content-area {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .content-header h2 {
          font-size: 1.3rem;
        }

        .search-bar-wrapper {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 2px 14px;
          width: 320px;
        }

        .search-icon {
          color: var(--text-secondary);
          margin-left: 8px;
        }

        .search-input {
          border: none;
          background: transparent;
          padding: 8px 0;
          width: 100%;
        }

        .search-input:focus {
          box-shadow: none;
          background: transparent;
        }

        .table-container {
          overflow-x: auto;
          width: 100%;
        }

        .portfolio-table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
        }

        .portfolio-table th {
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 2px solid rgba(255, 255, 255, 0.06);
          padding: 14px 16px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .portfolio-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .portfolio-table tr:hover td {
          background: rgba(255, 255, 255, 0.01);
        }

        .btn-detail {
          padding: 4px 12px;
          font-size: 0.75rem;
          border-radius: 6px;
        }

        .table-loading {
          padding: 60px 0;
          flex-direction: column;
          gap: 16px;
        }

        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--color-primary);
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state span {
          font-size: 2.5rem;
          opacity: 0.5;
        }

        .header-title-row {
          display: flex;
          align-items: center;
        }

        .project-table-row {
          transition: background-color 0.2s;
        }

        .project-table-row:hover td {
          background: rgba(11, 114, 133, 0.02) !important;
        }
      `}</style>
      
      {/* Modals */}
      <AddProjectModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={(newId, newStage) => {
          triggerRefresh();
          setDetailsStage(newStage);
          setDetailsId(newId);
          setIsDetailsOpen(true);
        }}
      />

      <ProjectDetailsModal
        isOpen={isDetailsOpen}
        stage={detailsStage}
        id={detailsId}
        onClose={() => setIsDetailsOpen(false)}
        onUpdate={triggerRefresh}
      />

      </div>
    </DashboardLayout>
  );
}
