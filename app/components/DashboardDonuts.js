"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Sector } from "recharts";

// Premium Brand Color Sets
const LifecycleColors = ["#0ea5e9", "#a855f7", "#eab308", "#3b82f6", "#14b8a6"];
const ClassificationColors = ["#0284c7", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"];
const RagColors = ["#10b981", "#3b82f6", "#f59e0b", "#f97316", "#ef4444", "#06b6d4"];

// Custom active shape rendering (glow and expansion on hover)
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08))" }}
      />
    </g>
  );
};

// Custom Tooltip component
const CustomDonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-donut-tooltip">
        <p className="tooltip-title">{data.name}</p>
        <p className="tooltip-value">
          العدد: <strong>{data.value}</strong>
        </p>
        <style jsx>{`
          .custom-donut-tooltip {
            background: #ffffff;
            border: 1px solid var(--slate-200);
            padding: 8px 12px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            font-size: 0.72rem;
            font-family: var(--font-cairo), sans-serif;
            text-align: right;
            direction: rtl;
          }
          .tooltip-title {
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 2px;
          }
          .tooltip-value {
            color: var(--text-secondary);
            margin: 0;
          }
        `}</style>
      </div>
    );
  }
  return null;
};

// Single Donut Chart Card Component
const DonutCard = ({ title, subtitle, data, colors, totalLabel, onClick }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const isFocused = activeIndex !== -1;
  const displayValue = isFocused ? data[activeIndex].value : total;
  const displayLabel = isFocused ? data[activeIndex].name : totalLabel;

  return (
    <section className="glass-panel donut-card-block animate-fade-in">
      <div className="card-header-block">
        <h3 className="donut-card-title">{title}</h3>
        <p className="donut-card-subtitle">{subtitle}</p>
      </div>

      <div className="donut-layout">
        
        {/* Top: Interactive Donut SVG Container (Larger Size) */}
        <div className="donut-visual-container">
          <div className="donut-svg-wrapper">
            {total > 0 ? (
              <PieChart width={200} height={200}>
                <Tooltip content={<CustomDonutTooltip />} offset={40} />
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[index % colors.length]} 
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onClick={() => onClick && onClick(entry.name)}
                    />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <div className="no-data-text">لا توجد بيانات</div>
            )}
            
            {/* Centered Total Counter */}
            <div className="donut-center-metric">
              <span className="center-value-text">{displayValue}</span>
              <span className="center-label-text" title={displayLabel}>{displayLabel}</span>
            </div>
          </div>
        </div>

        {/* Bottom: Customized Pill Legend */}
        <div className="donut-legend-bottom">
          {data.map((item, idx) => {
            const color = colors[idx % colors.length];
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const isHovered = activeIndex === idx;

            return (
              <div 
                key={idx} 
                className={`legend-pill ${isHovered ? "legend-pill-active" : ""}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
                onClick={() => onClick && onClick(item.name)}
                style={isHovered ? { backgroundColor: `${color}14`, color: color, borderColor: `${color}30` } : {}}
              >
                <span className="legend-indicator" style={{ backgroundColor: color }}></span>
                <span className="legend-text-label" title={item.name}>{item.name}</span>
                <span className="legend-number-val">{item.value}</span>
                <span className="legend-percentage-val">({percentage.toFixed(0)}%)</span>
              </div>
            );
          })}
        </div>

      </div>

      <style jsx>{`
        .donut-card-block {
          padding: 24px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-radius: 16px;
        }
        .card-header-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: right;
        }
        .donut-card-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }
        .donut-card-subtitle {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 600;
          margin: 0;
        }
        .donut-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        .donut-visual-container {
          width: 200px;
          height: 200px;
          position: relative;
          flex-shrink: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .donut-svg-wrapper {
          width: 200px;
          height: 200px;
          position: relative;
        }
        .donut-center-metric {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .center-value-text {
          font-size: 1.85rem;
          font-weight: 850;
          color: var(--text-primary);
          line-height: 1;
        }
        .center-label-text {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 700;
          margin-top: 4px;
          max-width: 120px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .donut-legend-bottom {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          width: 100%;
          direction: rtl;
          margin-top: 8px;
        }
        .legend-pill {
          display: flex;
          align-items: center;
          font-size: 0.7rem;
          color: var(--text-secondary);
          gap: 6px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 20px;
          border: 1px solid var(--slate-100);
          background: rgba(241, 245, 249, 0.4);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .legend-pill:hover,
        .legend-pill-active {
          background: var(--slate-100);
          color: var(--text-primary);
          border-color: var(--slate-200);
        }
        .legend-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .legend-text-label {
          white-space: nowrap;
          text-align: right;
        }
        .legend-number-val {
          font-weight: 700;
          color: var(--text-primary);
        }
        .legend-percentage-val {
          color: var(--text-muted);
          font-size: 0.625rem;
        }
        .no-data-text {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </section>
  );
};

export default function DashboardDonuts({
  heiaLifecycleData,
  heiaClassificationData,
  heiaRagData,
  transLifecycleData,
  transClassificationData,
  transRagData,
  onSegmentClick
}) {
  return (
    <div className="two-columns-dashboard">
      
      {/* Column 1: ميزانية الهيئة */}
      <div className="dashboard-column">
        <div className="column-focus-header heia-header">
          <div className="header-top-row">
            <span className="badge-lifecycle heia-badge">الميزانية العامة</span>
            <h2 className="column-focus-title">مسار ميزانية الهيئة</h2>
          </div>
          <p className="column-focus-subtitle">تحليلات ومؤشرات المشاريع الممولة من ميزانية الهيئة العامة</p>
        </div>

        <DonutCard
          title="دورة حياة ميزانية الهيئة"
          subtitle="توزيع المشاريع الممولة بالكامل من ميزانية الهيئة العامة"
          data={heiaLifecycleData}
          colors={LifecycleColors}
          totalLabel="مشروع"
          onClick={(value) => onSegmentClick && onSegmentClick('ميزانية الهيئة', 'stage', value)}
        />

        <DonutCard
          title="التصنيف الفني للهيئة"
          subtitle="تصنيفات مشاريع الهيئة حسب نوع الاحتياج التشغيلي والتقني"
          data={heiaClassificationData}
          colors={ClassificationColors}
          totalLabel="مشروع"
          onClick={(value) => onSegmentClick && onSegmentClick('ميزانية الهيئة', 'classification', value)}
        />

        <DonutCard
          title="مؤشر التقدم (RAG) للهيئة"
          subtitle="الحالة الفعلية وسرعة إنجاز العقود القائمة لميزانية الهيئة"
          data={heiaRagData}
          colors={RagColors}
          totalLabel="عقد نشط"
          onClick={(value) => onSegmentClick && onSegmentClick('ميزانية الهيئة', 'rag', value)}
        />
      </div>

      {/* Column 2: برنامج التحول */}
      <div className="dashboard-column">
        <div className="column-focus-header trans-header">
          <div className="header-top-row">
            <span className="badge-lifecycle trans-badge">مبادرات التحول</span>
            <h2 className="column-focus-title">مسار برنامج التحول</h2>
          </div>
          <p className="column-focus-subtitle">تحليلات ومؤشرات مبادرات برنامج التحول الوطني الصحي</p>
        </div>

        <DonutCard
          title="دورة حياة برنامج التحول"
          subtitle="توزيع المشاريع المرتبطة بمبادرات برنامج التحول"
          data={transLifecycleData}
          colors={LifecycleColors}
          totalLabel="مشروع"
          onClick={(value) => onSegmentClick && onSegmentClick('برنامج التحول', 'stage', value)}
        />

        <DonutCard
          title="التصنيف الفني للتحول"
          subtitle="تصنيفات مشاريع برنامج التحول حسب التصنيف التشغيلي"
          data={transClassificationData}
          colors={ClassificationColors}
          totalLabel="مشروع"
          onClick={(value) => onSegmentClick && onSegmentClick('برنامج التحول', 'classification', value)}
        />

        <DonutCard
          title="مؤشر التقدم (RAG) للتحول"
          subtitle="الحالة الفعلية وسرعة إنجاز العقود القائمة لبرنامج التحول"
          data={transRagData}
          colors={RagColors}
          totalLabel="عقد نشط"
          onClick={(value) => onSegmentClick && onSegmentClick('برنامج التحول', 'rag', value)}
        />
      </div>

      <style jsx>{`
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
        .column-focus-header {
          padding: 18px 24px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: -8px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border: 1px solid rgba(0, 0, 0, 0.03);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01);
        }
        .heia-header {
          background: linear-gradient(135deg, rgba(12, 166, 120, 0.03) 0%, #ffffff 100%);
          border-right: 4px solid var(--color-primary);
        }
        .trans-header {
          background: linear-gradient(135deg, rgba(11, 114, 133, 0.03) 0%, #ffffff 100%);
          border-right: 4px solid var(--color-secondary);
        }
        .column-focus-header:hover {
          transform: translateY(-2px);
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(11, 114, 133, 0.04);
        }
        .header-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          direction: rtl;
        }
        .column-focus-title {
          font-size: 1.05rem;
          font-weight: 850;
          color: var(--text-primary);
          margin: 0;
        }
        .badge-lifecycle {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .heia-badge {
          background: rgba(12, 166, 120, 0.06);
          color: var(--color-primary);
          border: 1px solid rgba(12, 166, 120, 0.15);
        }
        .trans-badge {
          background: rgba(11, 114, 133, 0.06);
          color: var(--color-secondary);
          border: 1px solid rgba(11, 114, 133, 0.15);
        }
        .column-focus-subtitle {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin: 0;
          line-height: 1.4;
          text-align: right;
        }
        @media (max-width: 1024px) {
          .two-columns-dashboard {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
