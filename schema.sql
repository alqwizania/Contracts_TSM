-- PUBLIC HEALTH AUTHORITY (PHA) - NEW PROJECT & CONTRACT PORTFOLIO DB SCHEMA
-- Seeding from new Excel file: محفظة_المشاريع_والعقود 10-6-26.xlsx

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS demand_plan CASCADE;
DROP TABLE IF EXISTS tendering_procedures CASCADE;
DROP TABLE IF EXISTS priority_contracts CASCADE;
DROP TABLE IF EXISTS awarding CASCADE;
DROP TABLE IF EXISTS contracting CASCADE;
DROP TABLE IF EXISTS active_contracts CASCADE;
DROP TABLE IF EXISTS priority_matrix CASCADE;
DROP TABLE IF EXISTS priority_calculator CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table (for committee logins)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'committee_member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Comments table (for updates/comments by members)
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    project_id DOUBLE PRECISION NOT NULL, -- maps to 'م' in the sheet
    stage VARCHAR(50) NOT NULL, -- e.g. 'demand_plan', 'tendering_procedures', 'awarding', 'contracting', 'active_contracts', 'priority_matrix'
    comment_text TEXT NOT NULL,
    commenter_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Demand Plan (خطة الطلبات)
CREATE TABLE demand_plan (
    id DOUBLE PRECISION PRIMARY KEY,
    project_name TEXT,
    description TEXT,
    key_deliverables TEXT,
    sector TEXT,
    owning_department TEXT,
    project_owner TEXT,
    project_manager TEXT,
    approval_status_charter TEXT,
    weekly_update TEXT,
    strategic_initiative TEXT,
    health_transformation_initiative TEXT,
    strategic_goal TEXT,
    priority TEXT,
    priority_calculator_result TEXT,
    project_classification TEXT,
    funding_source TEXT,
    estimated_value DOUBLE PRECISION,
    allocated_liquidity DOUBLE PRECISION,
    expense_item TEXT,
    financial_approval_status TEXT,
    expected_start_date TIMESTAMP,
    support_entities_recommendation TEXT,
    recommendation_status TEXT,
    notes TEXT
);

-- 4. Tendering Procedures (في اجراءات الطرح)
CREATE TABLE tendering_procedures (
    id DOUBLE PRECISION PRIMARY KEY,
    project_name TEXT,
    description TEXT,
    sector TEXT,
    owning_department TEXT,
    project_owner TEXT,
    project_manager TEXT,
    facing_challenges TEXT,
    weekly_update TEXT,
    competition_number DOUBLE PRECISION,
    tendering_stage TEXT,
    tendering_date TEXT,
    bids_opening_date TIMESTAMP,
    expected_tendering_duration_months DOUBLE PRECISION,
    budget_source TEXT,
    financial_link_number TEXT,
    procurement_officer TEXT,
    classification TEXT
);

-- 5. Priority Contracts (العقود ذات الاولوية)
CREATE TABLE priority_contracts (
    id DOUBLE PRECISION PRIMARY KEY,
    project_name TEXT,
    status TEXT,
    budget_item TEXT,
    weekly_update TEXT
);

-- 6. Awarding Procedures (الترسية)
CREATE TABLE awarding (
    id DOUBLE PRECISION PRIMARY KEY,
    project_name TEXT,
    sector TEXT,
    owning_department TEXT,
    project_owner TEXT,
    project_manager TEXT,
    weekly_update TEXT,
    competition_number DOUBLE PRECISION,
    awarding_stage TEXT,
    budget_source TEXT,
    contract_status TEXT,
    financial_link_number TEXT,
    notes TEXT,
    bids_opening_date TEXT,
    expected_duration_opening_to_award_months DOUBLE PRECISION,
    first_period_extension TEXT,
    second_period_extension TEXT,
    additional_notes TEXT,
    classification TEXT
);

-- 7. Contracting Procedures (التعاقد)
CREATE TABLE contracting (
    id DOUBLE PRECISION PRIMARY KEY,
    project_name TEXT,
    sector TEXT,
    owning_department TEXT,
    project_owner TEXT,
    project_manager TEXT,
    weekly_update TEXT,
    contract_number DOUBLE PRECISION,
    executing_entity TEXT,
    signature_date TIMESTAMP,
    total_cost DOUBLE PRECISION,
    operational_or_project TEXT,
    budget_source TEXT,
    contract_approval_stage TEXT,
    expected_start_date TIMESTAMP,
    expected_end_date TIMESTAMP,
    duration_months DOUBLE PRECISION,
    contract_status TEXT,
    financial_link_number TEXT,
    notes TEXT,
    classification TEXT
);

-- 8. Active Contracts List (قائمة العقود النشطة)
CREATE TABLE active_contracts (
    id DOUBLE PRECISION PRIMARY KEY,
    project_name TEXT,
    contract_number DOUBLE PRECISION,
    sector TEXT,
    owning_department TEXT,
    project_owner TEXT,
    project_manager TEXT,
    executing_entity TEXT,
    operational_or_project TEXT,
    budget_source TEXT,
    total_cost DOUBLE PRECISION,
    total_spent_till_end_2025 DOUBLE PRECISION,
    annual_liquidity DOUBLE PRECISION,
    spent_from_liquidity DOUBLE PRECISION,
    remaining_liquidity DOUBLE PRECISION,
    total_spent DOUBLE PRECISION,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    duration_months DOUBLE PRECISION,
    actual_progress DOUBLE PRECISION,
    planned_progress DOUBLE PRECISION,
    spending_ratio DOUBLE PRECISION,
    progress_status TEXT,
    time_status TEXT,
    strategic_initiative TEXT,
    health_transformation_initiative TEXT,
    has_challenges TEXT,
    challenges_description TEXT,
    has_change_request TEXT,
    change_request_status TEXT,
    project_condition TEXT,
    notes TEXT,
    extension_or_reduction_10pct TEXT,
    classification TEXT
);


-- 9. Priority Matrix (مصفوفة الأولويات)
CREATE TABLE priority_matrix (
    id DOUBLE PRECISION PRIMARY KEY,
    project_name TEXT,
    description TEXT,
    c1_label TEXT,
    c1_justification TEXT,
    c2_label TEXT,
    c2_justification TEXT,
    c3_label TEXT,
    c3_justification TEXT,
    c4_label TEXT,
    c4_justification TEXT,
    c5_label TEXT,
    c5_justification TEXT,
    financial_alignment_status TEXT,
    funding_feasibility TEXT,
    leadership_support TEXT,
    c1 DOUBLE PRECISION,
    c2 DOUBLE PRECISION,
    c3 DOUBLE PRECISION,
    c4 DOUBLE PRECISION,
    c5 DOUBLE PRECISION,
    budget DOUBLE PRECISION,
    c6 DOUBLE PRECISION,
    final_score DOUBLE PRECISION,
    can_distribute TEXT,
    is_priority BOOLEAN DEFAULT FALSE
);

-- 10. Priority Calculator (حاسبة الأولويات)
CREATE TABLE priority_calculator (
    id DOUBLE PRECISION PRIMARY KEY,
    project_name TEXT,
    budget DOUBLE PRECISION,
    c1 DOUBLE PRECISION,
    c2 DOUBLE PRECISION,
    c3 DOUBLE PRECISION,
    c4 DOUBLE PRECISION,
    c5 DOUBLE PRECISION,
    c6 DOUBLE PRECISION,
    final_score DOUBLE PRECISION,
    can_distribute TEXT,
    is_priority BOOLEAN DEFAULT FALSE
);


