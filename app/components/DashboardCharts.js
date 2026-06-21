"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Treemap,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from "recharts";

// Currency Formatter Helpers
const formatCurrency = (value) => {
  if (value === undefined || value === null) return "0 ريال";
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)} مليار ريال`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)} مليون ريال`;
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0
  }).format(value);
};

const formatShortCurrencyYAxis = (value) => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)} مل`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)} م`;
  return `${value} ر.س`;
};

// Custom Tooltip for Budget vs Spent Sector Bar Chart
const CustomSectorTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip glass-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value budget-color">
          <span>الميزانية المعتمدة: </span>
          <strong>{formatCurrency(payload[0].value)}</strong>
        </p>
        <p className="tooltip-value spent-color">
          <span>المصروف الفعلي: </span>
          <strong>{formatCurrency(payload[1].value)}</strong>
        </p>
        <style jsx>{`
          .custom-tooltip {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid var(--slate-200);
            padding: 12px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            font-family: var(--font-cairo), sans-serif;
            font-size: 0.75rem;
            text-align: right;
            direction: rtl;
          }
          .tooltip-label {
            font-weight: 800;
            margin-bottom: 6px;
            color: var(--text-primary);
          }
          .tooltip-value {
            margin: 3px 0;
            font-weight: 600;
          }
          .budget-color {
            color: var(--color-secondary);
          }
          .spent-color {
            color: #be123c;
          }
        `}</style>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Risk vs. Priority Score Scatter Chart
const CustomScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip glass-tooltip">
        <p className="tooltip-label">{data.project_name}</p>
        <p className="tooltip-value score-color">
          <span>درجة الأولوية: </span>
          <strong>{data.final_score?.toFixed(2)} / 5.00</strong>
        </p>
        <p className="tooltip-value budget-color">
          <span>الميزانية المقدرة: </span>
          <strong>{formatCurrency(data.budget)}</strong>
        </p>
        <p className="tooltip-value risk-color">
          <span>أثر المخاطر (C4): </span>
          <strong>مستوى {data.urgency_risk} / 5</strong>
        </p>
        <p className="tooltip-value priority-status-color">
          <span>التصنيف: </span>
          <strong style={{ color: data.is_priority ? "var(--color-primary)" : "#64748b" }}>
            {data.is_priority ? "عقد ذو أولوية" : "عقد عادي"}
          </strong>
        </p>
        <style jsx>{`
          .custom-tooltip {
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid var(--slate-200);
            padding: 12px;
            border-radius: 10px;
            box-shadow: 0 4px 22px rgba(0, 0, 0, 0.08);
            font-family: var(--font-cairo), sans-serif;
            font-size: 0.75rem;
            text-align: right;
            direction: rtl;
            max-width: 280px;
          }
          .tooltip-label {
            font-weight: 800;
            margin-bottom: 6px;
            color: var(--text-primary);
            line-height: 1.3;
          }
          .tooltip-value {
            margin: 4px 0;
            font-weight: 600;
          }
          .score-color {
            color: var(--color-primary);
          }
          .budget-color {
            color: var(--color-secondary);
          }
          .risk-color {
            color: #b45309;
          }
          .priority-status-color {
            border-top: 1px dashed var(--slate-200);
            padding-top: 4px;
            margin-top: 6px;
          }
        `}</style>
      </div>
    );
  }
  return null;
};
const CustomSCurveTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip glass-tooltip">
        <p className="tooltip-label">الشهر: {label}</p>
        <p className="tooltip-value planned-color">
          <span>نسبة الإنجاز المخطط: </span>
          <strong>{payload[0].value}%</strong>
        </p>
        <p className="tooltip-value actual-color">
          <span>نسبة الإنجاز الفعلي: </span>
          <strong>{payload[1].value}%</strong>
        </p>
        <style jsx>{`
          .custom-tooltip {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid var(--slate-200);
            padding: 12px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            font-family: var(--font-cairo), sans-serif;
            font-size: 0.75rem;
            text-align: right;
            direction: rtl;
          }
          .tooltip-label {
            font-weight: 800;
            margin-bottom: 6px;
            color: var(--text-primary);
          }
          .tooltip-value {
            margin: 3px 0;
            font-weight: 600;
          }
          .planned-color {
            color: var(--color-primary);
          }
          .actual-color {
            color: #f59e0b;
          }
        `}</style>
      </div>
    );
  }
  return null;
};

// Custom Content Renderer for Classification Treemap
const CustomTreemapContent = (props) => {
  const { x, y, width, height, index, name, value } = props;
  const colors = [
    "#0b7285", // Teal Blue
    "#0ca678", // Emerald
    "#0f4c5c", // Deep Accent Cyan
    "#088f8f", // Medium Teal
    "#20b2aa", // Light Sea Green
    "#2e8b57"  // Sea Green
  ];
  const color = colors[index % colors.length];

  if (width < 30 || height < 20) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: "#ffffff",
          strokeWidth: 1.5,
          strokeOpacity: 1
        }}
      />
      {width > 60 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2 - 4}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={11}
          fontWeight={700}
          fontFamily="Cairo"
        >
          {name}
        </text>
      )}
      {width > 60 && height > 45 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize={10}
          fontWeight={600}
          fontFamily="Cairo"
        >
          {formatCurrency(value)}
        </text>
      )}
    </g>
  );
};

export default function DashboardCharts({ sectorBudgetStats, sCurveStats, classificationTreemapStats, scatterStats = [] }) {
  return (
    <div className="charts-grid animate-fade-in">
      
      {/* Row 1: Bar Chart & Scatter Chart */}
      <div className="two-charts-row">
        
        {/* 1. Sector Budget vs Spent Bar Chart */}
        <section className="glass-panel chart-card">
          <div className="chart-header-row">
            <div className="chart-title-block">
              <h3 className="chart-heading">مقارنة الميزانيات المعتمدة بالمصروفات الفعلية حسب القطاع</h3>
              <p className="chart-desc-text">يقارن إجمالي تكاليف العقود بالمصروفات الفعلية المترتبة عليها لكل قطاع من القطاعات النشطة</p>
            </div>
            <div className="legend-pills">
              <span className="legend-pill bg-teal">الميزانية المعتمدة</span>
              <span className="legend-pill bg-rose">المصروف الفعلي</span>
            </div>
          </div>
          
          <div className="chart-wrapper">
            {sectorBudgetStats && sectorBudgetStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={sectorBudgetStats}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="sector" 
                    tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600, fontFamily: "Cairo" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={formatShortCurrencyYAxis}
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    orientation="right"
                  />
                  <Tooltip content={<CustomSectorTooltip />} cursor={{ fill: "rgba(11, 114, 133, 0.03)" }} />
                  <Bar dataKey="budget" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" fill="#be123c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-box">لا توجد بيانات متاحة لقطاعات الميزانية</div>
            )}
          </div>
        </section>

        {/* 2. Risk vs Priority Score Scatter Chart */}
        <section className="glass-panel chart-card">
          <div className="chart-header-row">
            <div className="chart-title-block">
              <h3 className="chart-heading">مصفوفة توزيع أولوية ومخاطر المشاريع</h3>
              <p className="chart-desc-text">مخطط فقاعي يربط درجة الأولوية (أفقي) وحجم الميزانية (عمودي) وشدة المخاطر C4 (حجم الفقاعة)</p>
            </div>
            <div className="legend-pills">
              <span className="legend-pill" style={{ backgroundColor: 'var(--color-primary)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '6px' }}>ذو أولوية</span>
              <span className="legend-pill" style={{ backgroundColor: 'var(--color-secondary)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '6px' }}>عادي</span>
            </div>
          </div>
          
          <div className="chart-wrapper">
            {scatterStats && scatterStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <ScatterChart
                  margin={{ top: 15, right: 15, bottom: 5, left: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    dataKey="final_score" 
                    name="درجة الأولوية" 
                    domain={[0, 5]}
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'درجة الأولوية', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 9, fontFamily: 'Cairo', fontWeight: 700 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="budget" 
                    name="الميزانية" 
                    tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(0)}م` : `${v}`}
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    orientation="right"
                    label={{ value: 'الميزانية (ريال)', angle: -90, position: 'insideRight', fill: '#94a3b8', fontSize: 9, fontFamily: 'Cairo', fontWeight: 700 }}
                  />
                  <ZAxis type="number" dataKey="urgency_risk" range={[40, 300]} name="أثر المخاطر" />
                  <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="المشاريع" data={scatterStats}>
                    {scatterStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.is_priority ? "var(--color-primary)" : "var(--color-secondary)"} 
                        style={{ cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-box">لا توجد مشاريع مقيمة لعرض مصفوفة الأولوية</div>
            )}
          </div>
        </section>

      </div>

      {/* Row 2: S-Curve & Treemap */}
      <div className="two-charts-row">
        
        {/* 3. Portfolio S-Curve Line Chart */}
        <section className="glass-panel chart-card">
          <div className="chart-header-row">
            <div className="chart-title-block">
              <h3 className="chart-heading">منحنى نسب الإنجاز التراكمي للمحفظة (S-Curve)</h3>
              <p className="chart-desc-text">يوضح مسار الإنجاز التراكمي المخطط له مقابل الإنجاز الفعلي لجميع العقود القائمة</p>
            </div>
            <div className="legend-pills">
              <span className="legend-pill bg-emerald">المخطط التراكمي</span>
              <span className="legend-pill bg-amber">الفعلي التراكمي</span>
            </div>
          </div>
          
          <div className="chart-wrapper">
            {sCurveStats && sCurveStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <LineChart
                  data={sCurveStats}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    orientation="right"
                  />
                  <Tooltip content={<CustomSCurveTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="planned" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-box">لا توجد بيانات كافية لرسم منحنى S-Curve</div>
            )}
          </div>
        </section>

        {/* 3. Classification Treemap Chart */}
        <section className="glass-panel chart-card">
          <div className="chart-header-row">
            <div className="chart-title-block">
              <h3 className="chart-heading">توزيع الميزانيات التقديرية حسب التصنيف</h3>
              <p className="chart-desc-text">مساحات تمثيلية توضح نسب تركيز الميزانيات المخصصة حسب التصنيفات الفنية والتشغيلية</p>
            </div>
          </div>
          
          <div className="chart-wrapper">
            {classificationTreemapStats && classificationTreemapStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <Treemap
                  data={classificationTreemapStats}
                  dataKey="value"
                  stroke="#fff"
                  fill="#0b7285"
                  content={<CustomTreemapContent />}
                />
              </ResponsiveContainer>
            ) : (
              <div className="no-data-box">لا توجد بيانات متاحة لتصنيف الميزانيات</div>
            )}
          </div>
        </section>

      </div>

      <style jsx>{`
        .charts-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          box-sizing: border-box;
          direction: rtl;
        }
        .chart-card {
          background: #ffffff;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-radius: 16px;
        }
        .full-width-chart {
          width: 100%;
        }
        .two-charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          width: 100%;
        }
        .chart-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
        }
        .chart-title-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 75%;
        }
        .chart-heading {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }
        .chart-desc-text {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 600;
          margin: 0;
          line-height: 1.4;
        }
        .legend-pills {
          display: flex;
          gap: 10px;
        }
        .legend-pill {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          color: #ffffff;
        }
        .bg-teal {
          background-color: var(--color-secondary);
        }
        .bg-rose {
          background-color: #be123c;
        }
        .bg-emerald {
          background-color: var(--color-primary);
        }
        .bg-amber {
          background-color: #f59e0b;
        }
        .chart-wrapper {
          width: 100%;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .no-data-box {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        @media (max-width: 992px) {
          .two-charts-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
