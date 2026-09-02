# MedSpace V2 — Update Notes

هذه النسخة هي التطوير الثاني لمشروع MedSpace.

## ما تغير

1. تم استبدال نموذج الـHero العام الذي يشبه صندوقًا بعلامة + بنموذج بصري طبي فعلي: قلب + رئتان + مسار ECG داخل بطاقة 3D زجاجية، مع شارات Heart/Lungs/ECG.
2. تم إصلاح فكرة أيقونة واحدة لكل درس: كل Module يرسل من Flask `icon` خاصًا به، والواجهة ترسم SVG مختلفًا لكل تخصص.
3. تمت إضافة ألوان خاصة للتخصصات:
   - Gynécologie → وردي
   - Dermatologie → أصفر
   - Cardiologie → أحمر/مرجاني
   - Pneumologie → أزرق سماوي
   - Neurologie → بنفسجي
   - Hépato-Gastrologie → برتقالي
   - Néphrologie → سماوي
   - وغيرها مع fallback.
4. كل درس لديه زر ✓ مستقل لتحديد أنه مكتمل.
5. يمكن تحديد الدرس كمكتمل من بطاقة الدرس أو من قارئ الدرس.
6. البطاقة المكتملة تتغير بصريًا وتظهر `✓ تمت الدراسة`.
7. تمت إضافة لوحة تقدم شاملة:
   - العدد المكتمل
   - نسبة الإنجاز العامة
   - Progress Ring
   - Progress Bar
   - آخر نشاط
   - تقدم كل Module
   - رسم دائري صغير لكل Module
   - زر عرض دروس Module.
8. تمت إضافة `Continue Studying` لآخر درس.
9. تمت إضافة تصدير واستيراد التقدم كملف JSON.
10. تمت إضافة زر لمسح التقدم مع تأكيد.
11. البحث والفلترة والـLoad More بقيت تعمل عبر API بدون عرض 680 بطاقة دفعة واحدة.
12. تم تحسين قارئ Google Drive والتنقل السابق/التالي بحيث يستطيع جلب الدرس المجاور حتى لو لم يكن ضمن الدفعة المحملة حاليًا.
13. تمت إضافة `/api/lessons/<id>/adjacent`.
14. تمت إضافة `/api/health`.

## أين يحفظ التقدم؟

في متصفح الجهاز داخل `localStorage` بالمفتاح:

`medspace.progress.v2`

يحتوي على:
- `completed`: الدروس المكتملة مع id/title/module/date
- `recent`: آخر الأنشطة
- `last`: آخر درس مفتوح

هذا التخزين محلي لنفس المتصفح والجهاز، وليس قاعدة بيانات مشتركة بين الأجهزة.

## الملفات الأساسية

```text
medspace/
├── app.py
├── lessons.csv
├── requirements.txt
├── README.md
├── templates/index.html
└── static/
    ├── css/style.css
    ├── js/app.js
    └── icons/medical.svg
```

## التشغيل في Termux

```bash
termux-setup-storage
cd ~/storage/downloads/medspace_v2
pip install -r requirements.txt
python app.py
```

ثم:

`http://127.0.0.1:5000`

## مهم

- `lessons.csv` يجب أن يبقى كما هو.
- لا تستخدم Streamlit لهذا الإصدار؛ Flask هو الأساس.
- Google Drive permissions لا يمكن تجاوزها.
- إذا كان المطلوب لاحقًا مزامنة التقدم بين عدة أجهزة أو مستخدمين، يجب نقل التقدم من localStorage إلى backend/database مع هوية مستخدم.
