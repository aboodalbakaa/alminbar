#!/usr/bin/env python3
"""Seed Iraqi government data into Al-Minbar Supabase using curl (bypasses Cloudflare WAF)."""
import json, subprocess, tempfile, os, sys

import os
PAT = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
REF = os.environ.get("SUPABASE_PROJECT_REF", "ohcxccolujkruyhoaixf")
URL = f"https://api.supabase.com/v1/projects/{REF}/database/query"

def sql(query):
    payload = json.dumps({"query": query})
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
        f.write(payload)
        fname = f.name
    try:
        r = subprocess.run([
            "curl", "-s", "-X", "POST", URL,
            "-H", f"Authorization: Bearer {PAT}",
            "-H", "Content-Type: application/json",
            "-H", "Accept: application/json",
            "--data", f"@{fname}",
        ], capture_output=True, text=True, timeout=30)
        os.unlink(fname)
        if r.returncode != 0:
            print(f"  curl error: {r.stderr}")
            return None
        out = r.stdout.strip()
        if not out:
            return None
        data = json.loads(out)
        if isinstance(data, dict) and 'error' in data:
            print(f"  SQL error: {data['error']}")
            return None
        return data
    except Exception as e:
        print(f"  Exception: {e}")
        if os.path.exists(fname):
            os.unlink(fname)
        return None

def run(label, query):
    print(f"  → {label} ... ", end="", flush=True)
    r = sql(query)
    if r is not None:
        print("OK")
        return True
    else:
        print("FAILED")
        return False

def v(val):
    if val is None:
        return "NULL"
    return "'" + str(val).replace("'", "''") + "'"

# ──────────────────────────────────────────────────────────────
print("\n[1/4] Officials")
# ──────────────────────────────────────────────────────────────

officials = [
    dict(slug="ali-al-zaidi", name_ar="علي فالح كاظم الزيدي", name_en="Ali Faleh al-Zaidi",
         title_ar="رئيس مجلس الوزراء", title_en="Prime Minister", role_type="prime_minister",
         party_ar="الإطار التنسيقي", party_en="Coordination Framework",
         ministry_ar=None, ministry_en=None,
         bio_ar="محامٍ ورجل أعمال، وُلد في ١ مايو ١٩٨٥ في ذي قار. أصغر رئيس وزراء في تاريخ العراق. يحمل بكالوريوس في القانون والاقتصاد وماجستير في العلوم المالية. رئيس سابق لمجلس إدارة مصرف الجنوب الإسلامي. كُلِّف بتشكيل الحكومة في ٢٧ أبريل ٢٠٢٦ ونال ثقة البرلمان في ١٤ مايو ٢٠٢٦.",
         bio_en="Lawyer and businessman, born 1 May 1985 in Dhi Qar. Iraq's youngest prime minister. Holds degrees in law, economics, and financial sciences. Former chairman of Al-Janub Islamic Bank. Tasked with forming a government on 27 April 2026, sworn in 14 May 2026.",
         term_start="2026-05-14", is_active=True),
    dict(slug="nizar-amidi", name_ar="نزار محمد أميدي", name_en="Nizar Amidi",
         title_ar="رئيس الجمهورية", title_en="President of Iraq", role_type="other",
         party_ar="الاتحاد الوطني الكردستاني", party_en="Patriotic Union of Kurdistan (PUK)",
         ministry_ar=None, ministry_en=None,
         bio_ar="سياسي كردي عراقي من حزب الاتحاد الوطني الكردستاني. انتُخب رئيساً للجمهورية في ١١ أبريل ٢٠٢٦ بـ٢٢٧ صوتاً في الجولة الثانية.",
         bio_en="Kurdish Iraqi politician from the PUK. Elected President of Iraq on 11 April 2026 with 227 votes in the second round, succeeding Abdul Latif Rashid who declined to seek re-election.",
         term_start="2026-04-11", is_active=True),
    dict(slug="haibat-al-halbousi", name_ar="هيبت حمد عباس الحلبوسي", name_en="Haibat al-Halbousi",
         title_ar="رئيس مجلس النواب", title_en="Speaker of Parliament", role_type="speaker",
         party_ar="تقدم", party_en="Taqaddum Party (Sunni)",
         ministry_ar=None, ministry_en=None,
         bio_ar="سياسي سني عراقي، وُلد في ١٣ يناير ١٩٨٠. ماجستير في العلوم السياسية من جامعة المستنصرية. رأس لجنة النفط والطاقة ٢٠١٩–٢٠٢٥. انتُخب رئيساً للبرلمان في ٢٩ ديسمبر ٢٠٢٥ بـ٢٠٨ أصوات.",
         bio_en="Iraqi Sunni politician, born 13 January 1980. MA in Political Science, Al-Mustansiriya University. Chaired the Oil and Energy Committee 2019–2025. Elected Speaker of Parliament on 29 December 2025 with 208 votes.",
         term_start="2025-12-29", is_active=True),
    dict(slug="adnan-fayhan", name_ar="عدنان فيحان", name_en="Adnan Fayhan",
         title_ar="النائب الأول لرئيس البرلمان", title_en="First Deputy Speaker", role_type="other",
         party_ar=None, party_en=None, ministry_ar=None, ministry_en=None,
         bio_ar="انتُخب نائباً أول لرئيس مجلس النواب في ٢٩ ديسمبر ٢٠٢٥.",
         bio_en="Elected First Deputy Speaker of the Council of Representatives on 29 December 2025.",
         term_start="2025-12-29", is_active=True),
    dict(slug="fuad-hussein", name_ar="فؤاد محمد حسين", name_en="Fuad Mohammed Hussein",
         title_ar="وزير الخارجية", title_en="Minister of Foreign Affairs", role_type="minister",
         party_ar="الحزب الديمقراطي الكردستاني", party_en="Kurdistan Democratic Party (KDP)",
         ministry_ar="وزارة الخارجية", ministry_en="Foreign Affairs",
         bio_ar="سياسي كردي، وُلد في ١ يونيو ١٩٤٩ في خانقين. دكتوراه في العلاقات الدولية من جامعة فريي بأمستردام. يتقن الكردية والعربية والهولندية والإنجليزية. شغل منصب وزير الخارجية منذ ٢٠٢٠ واحتفظ به في حكومة الزيدي.",
         bio_en="Kurdish politician, born 1 June 1949 in Khanaqin. Doctorate in International Relations, Vrije Universiteit Amsterdam. Fluent in Kurdish, Arabic, Dutch, and English. Served as Foreign Minister since 2020 and retained the role in the Zaidi cabinet.",
         term_start="2026-05-14", is_active=True),
    dict(slug="faleh-sari", name_ar="فالح سري", name_en="Faleh Sari",
         title_ar="وزير المالية", title_en="Minister of Finance", role_type="minister",
         party_ar=None, party_en=None, ministry_ar="وزارة المالية", ministry_en="Finance",
         bio_ar=None, bio_en="Appointed Finance Minister in the Zaidi government, confirmed by parliament 14 May 2026.",
         term_start="2026-05-14", is_active=True),
    dict(slug="basim-mohammed", name_ar="باسم محمد", name_en="Basim Mohammed",
         title_ar="وزير النفط", title_en="Minister of Oil", role_type="minister",
         party_ar=None, party_en=None, ministry_ar="وزارة النفط", ministry_en="Oil",
         bio_ar=None, bio_en="Appointed Minister of Oil in the Zaidi government, confirmed by parliament 14 May 2026.",
         term_start="2026-05-14", is_active=True),
    dict(slug="ali-saad-wahib", name_ar="علي سعد وهيب", name_en="Ali Saad Wahib",
         title_ar="وزير الكهرباء", title_en="Minister of Electricity", role_type="minister",
         party_ar=None, party_en=None, ministry_ar="وزارة الكهرباء", ministry_en="Electricity",
         bio_ar=None, bio_en="Appointed Minister of Electricity in the Zaidi government, confirmed 14 May 2026.",
         term_start="2026-05-14", is_active=True),
    dict(slug="abdulhussein-aziz", name_ar="عبدالحسين عزيز", name_en="Abdulhussein Aziz",
         title_ar="وزير الصحة", title_en="Minister of Health", role_type="minister",
         party_ar=None, party_en=None, ministry_ar="وزارة الصحة", ministry_en="Health",
         bio_ar=None, bio_en="Appointed Minister of Health in the Zaidi government, confirmed 14 May 2026.",
         term_start="2026-05-14", is_active=True),
    dict(slug="sarwa-abdulwahid", name_ar="سروة عبدالواحد", name_en="Sarwa Abdulwahid",
         title_ar="وزيرة البيئة", title_en="Minister of Environment", role_type="minister",
         party_ar=None, party_en=None, ministry_ar="وزارة البيئة", ministry_en="Environment",
         bio_ar="المرأة الوحيدة في حكومة الزيدي. انتُخبت وزيرة للبيئة في ١٤ مايو ٢٠٢٦.",
         bio_en="The only woman in the Zaidi cabinet. Appointed Minister of Environment, confirmed 14 May 2026.",
         term_start="2026-05-14", is_active=True),
    dict(slug="abdulrahim-jassim", name_ar="عبدالرحيم جاسم", name_en="Abdulrahim Jassim",
         title_ar="وزير الزراعة", title_en="Minister of Agriculture", role_type="minister",
         party_ar=None, party_en=None, ministry_ar="وزارة الزراعة", ministry_en="Agriculture",
         bio_ar=None, bio_en="Appointed Minister of Agriculture in the Zaidi government, confirmed 14 May 2026.",
         term_start="2026-05-14", is_active=True),
    dict(slug="muthanna-al-tamimi", name_ar="مثنى علي مهدي التميمي", name_en="Muthanna al-Tamimi",
         title_ar="وزير الموارد المائية", title_en="Minister of Water Resources", role_type="minister",
         party_ar=None, party_en=None, ministry_ar="وزارة الموارد المائية", ministry_en="Water Resources",
         bio_ar=None, bio_en="Appointed Minister of Water Resources in the Zaidi government, confirmed 14 May 2026.",
         term_start="2026-05-14", is_active=True),
    dict(slug="khalid-shwani", name_ar="خالد شواني", name_en="Khalid Shwani",
         title_ar="وزير العدل", title_en="Minister of Justice", role_type="minister",
         party_ar=None, party_en=None, ministry_ar="وزارة العدل", ministry_en="Justice",
         bio_ar="احتفظ بحقيبة العدل في حكومة الزيدي بعد توليها سابقاً.",
         bio_en="Retained the Justice portfolio in the Zaidi government, having previously served in the role.",
         term_start="2026-05-14", is_active=True),
    dict(slug="mohammed-nouri-ahmed", name_ar="محمد نوري أحمد", name_en="Mohammed Nouri Ahmed",
         title_ar="وزير الصناعة والمعادن", title_en="Minister of Industry & Minerals", role_type="minister",
         party_ar=None, party_en=None, ministry_ar="وزارة الصناعة والمعادن", ministry_en="Industry & Minerals",
         bio_ar=None, bio_en="Appointed Minister of Industry in the Zaidi government, confirmed 14 May 2026.",
         term_start="2026-05-14", is_active=True),
    dict(slug="mustafa-jabbar-sanad", name_ar="مصطفى جبار سند", name_en="Mustafa Jabbar Sanad",
         title_ar="وزير الاتصالات", title_en="Minister of Communications", role_type="minister",
         party_ar=None, party_en=None, ministry_ar="وزارة الاتصالات", ministry_en="Communications",
         bio_ar=None, bio_en="Appointed Minister of Communications in the Zaidi government, confirmed 14 May 2026.",
         term_start="2026-05-14", is_active=True),
]

ok = 0
for o in officials:
    q = (
        f"INSERT INTO officials (slug,name_ar,name_en,title_ar,title_en,role_type,"
        f"party_ar,party_en,ministry_ar,ministry_en,bio_ar,bio_en,term_start,is_active) "
        f"VALUES ({v(o['slug'])},{v(o['name_ar'])},{v(o['name_en'])},"
        f"{v(o['title_ar'])},{v(o['title_en'])},{v(o['role_type'])},"
        f"{v(o['party_ar'])},{v(o['party_en'])},{v(o['ministry_ar'])},{v(o['ministry_en'])},"
        f"{v(o['bio_ar'])},{v(o['bio_en'])},{v(o['term_start'])},{str(o['is_active']).lower()}) "
        f"ON CONFLICT (slug) DO NOTHING;"
    )
    if run(o['name_en'], q):
        ok += 1

print(f"  {ok}/{len(officials)} officials inserted")

# ──────────────────────────────────────────────────────────────
print("\n[2/4] Parliament Session")
# ──────────────────────────────────────────────────────────────

run("6th Term, 1st Session", (
    "INSERT INTO parliament_sessions "
    "(session_number,term_number,title_ar,title_en,start_date,status,laws_passed,sessions_held,description_ar,description_en) "
    "VALUES (1,6,"
    "'الدورة الأولى - الفصل التشريعي السادس',"
    "'First Session – Sixth Parliamentary Term',"
    "'2025-12-29','active',0,0,"
    "'الفصل التشريعي السادس لمجلس النواب العراقي المؤلف من ٣٢٩ مقعداً. انعقدت الجلسة الأولى في ٢٩ ديسمبر ٢٠٢٥ وانتُخب فيها هيبت الحلبوسي رئيساً بـ٢٠٨ أصوات.',"
    "'Sixth term of the Iraqi Council of Representatives, 329 seats. First session 29 December 2025; Haibat al-Halbousi elected speaker with 208 votes. Includes 83 seats reserved for women and 9 for minorities.'"
    ") ON CONFLICT DO NOTHING;"
))

# ──────────────────────────────────────────────────────────────
print("\n[3/4] KPIs – PM Zaidi pledges")
# ──────────────────────────────────────────────────────────────

r = sql("SELECT id FROM officials WHERE slug='ali-al-zaidi' LIMIT 1;")
pm_id = r[0]['id'] if r else None
r2 = sql("SELECT id FROM parliament_sessions WHERE term_number=6 AND session_number=1 LIMIT 1;")
session_id = r2[0]['id'] if r2 else None
print(f"  PM: {pm_id}  Session: {session_id}")
if not pm_id:
    print("  ERROR: PM not found")
    sys.exit(1)

sid = v(session_id)

kpis = [
    ("تنويع الاقتصاد والتحرر من الاعتماد على النفط",
     "Economic Diversification — Reduce Oil Dependency",
     "تعهّد الزيدي ببناء اقتصاد وطني متنوع لا يعتمد على مورد واحد مع التركيز على الصناعة والزراعة والسياحة والاستثمار.",
     "Zaidi pledged a comprehensive economic reform to build a diversified, sustainable economy not dependent on a single resource, focusing on industry, agriculture, tourism, and investment.",
     "economy", "promised", "2026-05-16",
     "https://shafaq.com/en/Iraq/Iraq-s-new-PM-pledges-economic-reform-anti-corruption-drive-in-first-address-to-nation"),
    ("إصلاح البنية التحتية (كهرباء وماء وطرق وإسكان)",
     "Infrastructure Reform — Electricity, Water, Roads, Housing",
     "تعهّد بأن ملف الخدمات والبنية التحتية لن يبقى رهيناً لوعود مؤجلة، مع مشاريع تشمل الكهرباء والماء والطرق والصرف الصحي والنقل والإسكان.",
     "Pledged that 'services and infrastructure will no longer remain hostage to deferred promises', committing to electricity, water, roads, sewage, transport, and housing projects.",
     "infrastructure", "promised", "2026-05-16",
     "https://rudaw.net/english/middleeast/iraq/160520261"),
    ("مكافحة الفساد المالي والإداري",
     "Anti-Corruption Drive",
     "التزم بحماية المال العام ومكافحة الفساد الإداري والمالي بجميع أشكاله.",
     "Committed to protecting public funds and combating administrative and financial corruption in all its forms.",
     "corruption", "promised", "2026-05-16",
     "https://shafaq.com/en/Iraq/Iraq-s-new-PM-pledges-economic-reform-anti-corruption-drive-in-first-address-to-nation"),
    ("إصلاح التعليم وتطوير المناهج الدراسية",
     "Education Reform — Curriculum Development",
     "وعد بإصلاح التعليم وتطوير المناهج الدراسية لتواكب متطلبات العصر.",
     "Pledged education reform and developing school curricula to meet modern requirements.",
     "education", "promised", "2026-05-16",
     "https://rudaw.net/english/middleeast/iraq/160520261"),
    ("تحسين الرعاية الصحية وتطوير المستشفيات",
     "Healthcare Improvement — Hospital Development",
     "أكد على تطوير المستشفيات والرعاية الصحية في المناطق الحضرية والريفية.",
     "Emphasized improving hospitals and healthcare services across urban and rural areas.",
     "healthcare", "promised", "2026-05-16",
     "https://shafaq.com/en/Iraq/Iraq-s-new-PM-pledges-economic-reform-anti-corruption-drive-in-first-address-to-nation"),
    ("تعزيز العلاقات العربية والدولية",
     "Strengthening Arab and International Relations",
     "أعلن العمل على تعزيز علاقات العراق مع الدول العربية والمجتمع الدولي.",
     "Announced plans to strengthen Iraq's relations with Arab nations and the international community.",
     "general", "promised", "2026-05-16",
     "https://www.voiceofemirates.com/en/news/2026/05/16/iraqi-prime-minister-pledges-to-strengthen-arab-and-international-relations/"),
    ("تشكيل حكومة كاملة وملء الحقائب الوزارية الشاغرة",
     "Complete Cabinet Formation — Fill Vacant Portfolios",
     "دخلت الحكومة بـ١٤ وزيراً من ٢٣. الشواغر تشمل: الداخلية والدفاع والثقافة والتعليم العالي والتخطيط والشباب والهجرة والإعمار.",
     "The government was sworn in with only 14 of 23 ministers. Vacant portfolios include Interior, Defence, Culture, Higher Education, Planning, Youth, Migration, and Reconstruction.",
     "general", "in_progress", "2026-05-14",
     "https://www.aljazeera.com/news/2026/5/14/iraqs-parliament-approves-new-ali-al-zaidi-government"),
]

ok = 0
for (tar, ten, dar, den, cat, stat, dp, src) in kpis:
    q = (
        f"INSERT INTO kpis (official_id,session_id,title_ar,title_en,description_ar,description_en,category,status,date_promised,source_url) "
        f"VALUES ('{pm_id}',{sid},{v(tar)},{v(ten)},{v(dar)},{v(den)},{v(cat)},{v(stat)},{v(dp)},{v(src)});"
    )
    if run(ten[:55], q):
        ok += 1
print(f"  {ok}/{len(kpis)} KPIs inserted")

# ──────────────────────────────────────────────────────────────
print("\n[4/4] Final counts")
# ──────────────────────────────────────────────────────────────
for table in ["officials", "parliament_sessions", "kpis"]:
    r = sql(f"SELECT count(*) FROM {table};")
    count = r[0]['count'] if r else '?'
    print(f"  {table}: {count} rows")

print("\nDone.")
