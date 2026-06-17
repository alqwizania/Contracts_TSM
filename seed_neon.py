import os
import sys
import psycopg2
import pandas as pd
import numpy as np
import bcrypt
import datetime

base_dir = os.path.dirname(os.path.abspath(__file__))
excel_path = os.path.join(base_dir, "محفظة_المشاريع_والعقود 10-6-26 (1).xlsx")
db_url = os.environ.get("DATABASE_URL")
if not db_url:
    print("Error: DATABASE_URL environment variable is not defined.")
    sys.exit(1)
schema_path = os.path.join(base_dir, "schema.sql")

def clean_float(val):
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    val_str = str(val).replace(",", "").replace("ريال", "").strip()
    try:
        return float(val_str)
    except ValueError:
        return None

def clean_date(val):
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, (datetime.datetime, datetime.date)):
        return val
    try:
        return pd.to_datetime(str(val).strip()).to_pydatetime()
    except Exception:
        return None

def clean_text(val):
    if pd.isna(val) or val is None:
        return None
    val_str = str(val).strip()
    if val_str.lower() in ("nan", "nat", "null", "none", ""):
        return None
    return val_str

def main():
    print("Connecting to Neon Database...")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # 1. Run schema.sql
    print("Initializing Database Schema from schema.sql...")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    cur.execute(schema_sql)
    conn.commit()
    print("Schema initialized successfully.")
    
    # Load Excel File
    print("Loading Excel File...")
    xl = pd.ExcelFile(excel_path)
    
    # --- 1. Seed Users ---
    print("Seeding Default Users...")
    users_data = [
        ("admin", "admin", "مدير النظام", "admin"),
        ("committee1", "committee123", "عضو اللجنة 1", "committee_member"),
        ("committee2", "committee123", "عضو اللجنة 2", "committee_member")
    ]
    for username, plain_pass, full_name, role in users_data:
        hashed = bcrypt.hashpw(plain_pass.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cur.execute(
            "INSERT INTO users (username, password_hash, full_name, role) VALUES (%s, %s, %s, %s)",
            (username, hashed, full_name, role)
        )
    conn.commit()
    print("Users seeded.")

    # --- 2. Seed Demand Plan (خطة الطلبات) ---
    print("Seeding Demand Plan...")
    df = xl.parse(" خطة الطلبات", skiprows=2)
    # Filter out rows with no ID (م)
    df = df[df["م"].notna()]
    for idx, row in df.iterrows():
        cur.execute(
            """INSERT INTO demand_plan (
                id, project_name, description, key_deliverables, sector, owning_department, 
                project_owner, project_manager, approval_status_charter, weekly_update, 
                strategic_initiative, health_transformation_initiative, strategic_goal, 
                priority, priority_calculator_result, project_classification, funding_source, 
                estimated_value, allocated_liquidity, expense_item, financial_approval_status, 
                expected_start_date, support_entities_recommendation, recommendation_status, notes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                clean_float(row.get("م")),
                clean_text(row.get("المشروع/الكراسة التشغيلية")),
                clean_text(row.get("الوصف")),
                clean_text(row.get("مخرجات أساسية")),
                clean_text(row.get("القطاع")),
                clean_text(row.get("الإدارة المالكة")),
                clean_text(row.get("مالك المشروع")),
                clean_text(row.get("مدير المشروع")),
                clean_text(row.get("حالة  نموذج اعتماد المشروع/الميثاق")),
                clean_text(row.get("تحديث")),
                clean_text(row.get("المبادرة الاستراتيجية")),
                clean_text(row.get("مبادرة التحول الصحي المرتبطة")),
                clean_text(row.get("الهدف الاستراتيجي")),
                clean_text(row.get("الأولوية")),
                clean_text(row.get("نتيجة حاسبة الأولويات")),
                clean_text(row.get("تصنيف المشروع")),
                clean_text(row.get("مصدر التمويل")),
                clean_float(row.get("القيمة التقديرية (ريال)")),
                clean_float(row.get("السيولة المخصصة")),
                clean_text(row.get("بند الصرف")),
                clean_text(row.get("حالة الاعتماد المالي")),
                clean_date(row.get("تاريخ بدء العقد المتوقع")),
                clean_text(row.get("موافقة/توصية الجهات الداعمة")),
                clean_text(row.get("حالة الموافقة/التوصية")),
                clean_text(row.get("ملاحظات"))
            )
        )
    conn.commit()
    print(f"Demand Plan seeded ({len(df)} rows).")

    # --- 3. Seed Tendering Procedures (في اجراءات الطرح) ---
    print("Seeding Tendering Procedures...")
    df = xl.parse("في اجراءات الطرح", skiprows=2)
    df = df[df["م"].notna()]
    for idx, row in df.iterrows():
        cur.execute(
            """INSERT INTO tendering_procedures (
                id, project_name, description, sector, owning_department, project_owner, 
                project_manager, facing_challenges, weekly_update, competition_number, 
                tendering_stage, tendering_date, bids_opening_date, 
                expected_tendering_duration_months, budget_source, financial_link_number, 
                procurement_officer
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                clean_float(row.get("م")),
                clean_text(row.get("المنافسة/الكراسة")),
                clean_text(row.get("نبذة/وصف المشروع")),
                clean_text(row.get("القطاع")),
                clean_text(row.get("الإدارة المالكة")),
                clean_text(row.get("مالك المشروع")),
                clean_text(row.get("مدير المشروع")),
                clean_text(row.get("تواجه تحديات")),
                clean_text(row.get("تحديث/ملاحظات")),
                clean_float(row.get("رقم المنافسة")),
                clean_text(row.get("مرحلة الطرح")),
                clean_text(row.get("تاريخ الطرح")),
                clean_date(row.get("تاريخ فتح العروض")),
                clean_float(row.get("المدة بالأشهر المتوقعة لإجراءات الطرح")),
                clean_text(row.get("مصدر الميزانية")),
                clean_text(row.get("رقم الارتباط المالي")),
                clean_text(row.get("مسؤول العقود والمشتريات"))
            )
        )
    conn.commit()
    print(f"Tendering Procedures seeded ({len(df)} rows).")

    # --- 4. Seed Priority Contracts (العقود ذات الاولوية) ---
    print("Seeding Priority Contracts...")
    df = xl.parse(" العقود ذات الاولوية ", skiprows=2)
    df = df[df["م"].notna()]
    for idx, row in df.iterrows():
        cur.execute(
            """INSERT INTO priority_contracts (
                id, project_name, status, budget_item, weekly_update
            ) VALUES (%s, %s, %s, %s, %s)""",
            (
                clean_float(row.get("م")),
                clean_text(row.get("المشروع")),
                clean_text(row.get("الحالة")),
                clean_text(row.get("البند")),
                clean_text(row.get("التحديث الأسبوعي"))
            )
        )
    conn.commit()
    print(f"Priority Contracts seeded ({len(df)} rows).")

    # --- 5. Seed Awarding (الترسية) ---
    print("Seeding Awarding...")
    df = xl.parse("  الترسية", skiprows=2)
    df = df[df["م"].notna()]
    for idx, row in df.iterrows():
        cur.execute(
            """INSERT INTO awarding (
                id, project_name, sector, owning_department, project_owner, project_manager, 
                weekly_update, competition_number, awarding_stage, budget_source, contract_status, 
                financial_link_number, notes, bids_opening_date, 
                expected_duration_opening_to_award_months, first_period_extension, 
                second_period_extension, additional_notes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                clean_float(row.get("م")),
                clean_text(row.get("اسم المشروع")),
                clean_text(row.get("القطاع")),
                clean_text(row.get("الإدارة المالكة")),
                clean_text(row.get("مالك المشروع")),
                clean_text(row.get("مدير المشروع")),
                clean_text(row.get("تحديث (لا يتم تحديد التحديثات كقائمة مسدلة ويتم إدخالها يدويا)")),
                clean_float(row.get("رقم المنافسة")),
                clean_text(row.get("مرحلة المنافسة")),
                clean_text(row.get("مصدر الميزانية")),
                clean_text(row.get("وضع العقد")),
                clean_text(row.get("رقم الارتباط المالي")),
                clean_text(row.get("ملاحظات")),
                clean_text(row.get("تاريخ فتح العروض")),
                clean_float(row.get("المدة بالأشهر المتوقعة من فتح العروض الى الترسية")),
                clean_text(row.get("تمديد الفترة الأولى")),
                clean_text(row.get("تمديد الفترة الثانية")),
                clean_text(row.get("ملاحظات.1"))
            )
        )
    conn.commit()
    print(f"Awarding seeded ({len(df)} rows).")

    # --- 6. Seed Contracting (التعاقد) ---
    print("Seeding Contracting...")
    df = xl.parse("التعاقد", skiprows=2)
    df = df[df["م"].notna()]
    for idx, row in df.iterrows():
        cur.execute(
            """INSERT INTO contracting (
                id, project_name, sector, owning_department, project_owner, project_manager, 
                weekly_update, contract_number, executing_entity, signature_date, total_cost, 
                operational_or_project, budget_source, contract_approval_stage, 
                expected_start_date, expected_end_date, duration_months, contract_status, 
                financial_link_number, notes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                clean_float(row.get("م")),
                clean_text(row.get("اسم المشروع")),
                clean_text(row.get("القطاع")),
                clean_text(row.get("الإدارة المالكة")),
                clean_text(row.get("مالك المشروع")),
                clean_text(row.get("مدير المشروع")),
                clean_text(row.get("تحديث (لا يتم تحديد التحديثات كقائمة مسدلة ويتم إدخالها يدويا)")),
                clean_float(row.get("رقم العقد/التعميد")),
                clean_text(row.get("الجهة المنفذة")),
                clean_date(row.get("تاريخ توقيع العقد")),
                clean_float(row.get("إجمالي تكاليف العقد (ريال)")),
                clean_text(row.get("تشغيلي/مشروع")),
                clean_text(row.get("مصدر الميزانية")),
                clean_text(row.get("مرحلة إجازة العقد")),
                clean_date(row.get("تاريخ بدء العقد المتوقع")),
                clean_date(row.get("تاريخ انتهاء العقد المتوقع")),
                clean_float(row.get("المدة بالأشهر")),
                clean_text(row.get("وضع العقد")),
                clean_text(row.get("رقم الارتباط المالي")),
                clean_text(row.get("ملاحظات"))
            )
        )
    conn.commit()
    print(f"Contracting seeded ({len(df)} rows).")

    # --- 7. Seed Active Contracts (قائمة العقود النشطة) ---
    print("Seeding Active Contracts...")
    df = xl.parse(" قائمة العقود النشطة", skiprows=2)
    df = df[df["م"].notna()]
    for idx, row in df.iterrows():
        cur.execute(
            """INSERT INTO active_contracts (
                id, project_name, contract_number, sector, owning_department, project_owner, 
                project_manager, executing_entity, operational_or_project, budget_source, 
                total_cost, total_spent_till_end_2025, annual_liquidity, spent_from_liquidity, 
                remaining_liquidity, total_spent, start_date, end_date, duration_months, 
                actual_progress, planned_progress, spending_ratio, progress_status, time_status, 
                strategic_initiative, health_transformation_initiative, has_challenges, 
                challenges_description, has_change_request, change_request_status, 
                project_condition, notes, extension_or_reduction_10pct
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                clean_float(row.get("م")),
                clean_text(row.get("المشروع")),
                clean_float(row.get("رقم العقد/أمر الشراء")),
                clean_text(row.get("القطاع")),
                clean_text(row.get("الإدارة المالكة")),
                clean_text(row.get("مالك المشروع")),
                clean_text(row.get("مدير المشروع")),
                clean_text(row.get("الجهة المنفذة")),
                clean_text(row.get("تشغيلي/مشروع")),
                clean_text(row.get("مصدر الميزانية")),
                clean_float(row.get("إجمالي تكاليف العقد (ريال)")),
                clean_float(row.get("إجمالي الصرف حتى نهاية 2025")),
                clean_float(row.get("السيولة السنوية")),
                clean_float(row.get("المصروف من السيولة")),
                clean_float(row.get("المتبقي من السيولة")),
                clean_float(row.get("اجمالي الصرف")),
                clean_date(row.get("تاريخ بدء العقد")),
                clean_date(row.get("تاريخ انتهاء العقد")),
                clean_float(row.get("مدة المشروع بالأشهر")),
                clean_float(row.get("نسبة الإنجاز الفعلي")),
                clean_float(row.get("نسبة الإنجاز المخطط")),
                clean_float(row.get("نسبة الصرف على العقد")),
                clean_text(row.get("حالة التقدم")),
                clean_text(row.get("الحالة الزمنية للعقد")),
                clean_text(row.get("المبادرة الاستراتيجية")),
                clean_text(row.get("مبادرة التحول الصحي المرتبطة")),
                clean_text(row.get("وجود تحديات")),
                clean_text(row.get("وصف التحديات")),
                clean_text(row.get("هل يوجد طلب تغير على العقد")),
                clean_text(row.get("حالة طلب التغير")),
                clean_text(row.get("وضع المشروع")),
                clean_text(row.get("ملاحظات")),
                clean_text(row.get("التمديد أو التخفيض والزيادة (10% من العقد)"))
            )
        )
    conn.commit()
    print(f"Active Contracts seeded ({len(df)} rows).")

    # --- 8. Seed Portfolio Plan 2026 (خطة المحفظة 2026) ---
    print("Seeding Portfolio Plan...")
    df = xl.parse("خطة المحفظة 2026", skiprows=2)
    df = df[df["م"].notna()]
    for idx, row in df.iterrows():
        cur.execute(
            """INSERT INTO portfolio_plan (
                id, phase, main_activities, quarter, start_date, end_date, days, leading_entity, 
                main_outputs, official_reference_date, status, progress, days_remaining, 
                epmo, strategy, finance, supply_chain, leadership, dga, mof, sectors
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                clean_float(row.get("م")),
                clean_text(row.get("المرحلة")),
                clean_text(row.get("الأنشطة الرئيسية")),
                clean_text(row.get("الربع")),
                clean_date(row.get("تاريخ البدء")),
                clean_date(row.get("تاريخ الانتهاء")),
                clean_float(row.get("الأيام")),
                clean_text(row.get("الجهة القائدة")),
                clean_text(row.get("المخرجات الرئيسية")),
                clean_text(row.get("المرجع / الموعد الرسمي")),
                clean_text(row.get("الحالة")),
                clean_float(row.get("الإنجاز")),
                clean_float(row.get("أيام متبقية")),
                clean_text(row.get("EPMO")),
                clean_text(row.get("الاستراتيجية")),
                clean_text(row.get("المالية")),
                clean_text(row.get("سلاسل الإمداد")),
                clean_text(row.get("القيادة")),
                clean_text(row.get("DGA")),
                clean_text(row.get("وزارة المالية")),
                clean_text(row.get("القطاعات"))
            )
        )
    conn.commit()
    print(f"Portfolio Plan seeded ({len(df)} rows).")

    # --- 9. Seed Portfolio Details (خطة المحفظة - التفصيل) ---
    print("Seeding Portfolio Details...")
    df = xl.parse("خطة المحفظة - التفصيل", skiprows=2)
    df = df[df["م"].notna()]
    for idx, row in df.iterrows():
        cur.execute(
            """INSERT INTO portfolio_details (
                id, step_activity, quarter, start_date, end_date, days, leading_entity, phase, 
                status, progress, days_remaining, note, epmo, strategy, finance, supply_chain, 
                leadership, dga, mof, sectors
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                clean_float(row.get("م")),
                clean_text(row.get("الخطوة/النشاط")),
                clean_text(row.get("الربع")),
                clean_date(row.get("تاريخ البدء")),
                clean_date(row.get("تاريخ الانتهاء")),
                clean_float(row.get("الأيام")),
                clean_text(row.get("الجهة القائدة")),
                clean_text(row.get("المرحلة")),
                clean_text(row.get("الحالة")),
                clean_float(row.get("الإنجاز")),
                clean_float(row.get("أيام متبقية")),
                clean_text(row.get("ملاحظة")),
                clean_text(row.get("EPMO")),
                clean_text(row.get("الاستراتيجية")),
                clean_text(row.get("المالية")),
                clean_text(row.get("سلاسل الإمداد")),
                clean_text(row.get("القيادة")),
                clean_text(row.get("DGA")),
                clean_text(row.get("وزارة المالية")),
                clean_text(row.get("القطاعات"))
            )
        )
    conn.commit()
    print(f"Portfolio Details seeded ({len(df)} rows).")

    # --- 10. Seed Annual Cycle (الدورة السنوية) ---
    print("Seeding Annual Cycle...")
    df = xl.parse("الدورة السنوية", skiprows=1)
    df = df[df["م"].notna()]
    for idx, row in df.iterrows():
        cur.execute(
            """INSERT INTO annual_cycle (
                id, quarter_period, months, main_activities, outputs, leading_entity
            ) VALUES (%s, %s, %s, %s, %s, %s)""",
            (
                clean_float(row.get("م")),
                clean_text(row.get("الربع / الفترة")),
                clean_text(row.get("الأشهر")),
                clean_text(row.get("الأنشطة الرئيسية")),
                clean_text(row.get("المخرجات")),
                clean_text(row.get("الجهة القائدة"))
            )
        )
    conn.commit()
    print(f"Annual Cycle seeded ({len(df)} rows).")

    cur.close()
    conn.close()
    print("ALL SEEDING COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
