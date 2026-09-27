# دليل رفع وتشغيل التطبيق باستخدام Docker على السيرفر (Server Deployment Guide)

يقدم هذا الدليل خطوة بخطوة طريقة رفع وتشغيل نظام إدارة المبيعات والمخازن (POS System) على سيرفرك الخاص باستخدام حاويات **Docker** و **Docker Compose**.

---

## 📁 المكونات والجهازية
تم تجهيز المشروع بالملفات التالية لضمان التشغيل الفوري:
1. `Dockerfile`: بناء متعدد المراحل (Multi-stage build) لتقليل حجم الصورة وتسريع التشغيل.
2. `docker-compose.yml`: يتضمن حاوية التطبيق (App) وحاوية قاعدة البيانات (PostgreSQL 16) مع الربط التلقائي والنسخ الاحتياطي.
3. `.dockerignore`: استثناء الملفات غير الضرورية لتسريع عملية البناء.
4. `.env.example`: نموذج إعدادات المتغيرات البيئية.

---

## 🚀 خطوات التشغيل والرفع على السيرفر

### الخطوة 1: نقل ملفات المشروع إلى السيرفر
قم بنقل كود المشروع إلى السيرفر الخاص بك عن طريق `git clone` أو رفع الأرشيف المضغوط عبر `SCP` / `SFTP`.

```bash
cd /path/to/your/project
```

---

### الخطوة 2: إعداد ملف المتغيرات البيئية (.env)
قم بإنشاء ملف `.env` بناءً على النموذج المرفق `.env.example`:

```bash
cp .env.example .env
```

قم بتعديل كلمة سر قاعدة البيانات والمفاتيح في ملف `.env` إذا لزم الأمر:
```env
POSTGRES_USER=pos_user
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=pos_db
PORT=3000
```

---

### الخطوة 3: تشغيل الحاويات (Docker Compose)
أمر بناء وتشغيل الحاويات في الخلفية:

```bash
docker compose up -d --build
```

---

### الخطوة 4: التحقق من حالة التشغيل واللوجات

* **التحقق من حالة الحاويات:**
  ```bash
  docker compose ps
  ```

* **متابعة سجل التشغيل (Logs):**
  ```bash
  docker compose logs -f app
  ```

* **فحص صحة النظام (Healthcheck):**
  يمكنك زيارة رابط فحص الصحة:
  `http://<SERVER_IP>:3000/api/health`

---

## 🌐 إعداد Nginx وشهادة الأمان SSL (اختر اختياري للسيرفرات)

إذا كنت ترغب بربط التطبيق بدومين (مثل `pos.yourdomain.com`) وإضافة شهادة SSL مجانية عبر Certbot:

### 1. تكوين Nginx Reverse Proxy:
قم بإنشاء ملف `/etc/nginx/sites-available/pos`:

```nginx
server {
    server_name pos.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. تفعيل الموقع وتشغيل Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/pos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d pos.yourdomain.com
```

---

## 💾 النسخ الاحتياطي واستعادة قاعدة البيانات (Backup & Restore)

* **أخذ نسخة احتياطية من قاعدة البيانات:**
  ```bash
  docker exec -t pos_postgres pg_dump -U pos_user pos_db > backup_$(date +%Y%m%m_%H%M%S).sql
  ```

* **استعادة نسخة احتياطية:**
  ```bash
  cat backup.sql | docker exec -i pos_postgres psql -U pos_user -d pos_db
  ```

---

## 🛠️ الأوامر الشائعة للتحكم

| الأمر | الوصف |
| :--- | :--- |
| `docker compose up -d` | تشغيل التطبيق في الخلفية |
| `docker compose stop` | إيقاف الحاويات مؤقتاً |
| `docker compose down` | إيقاف وحذف الحاويات مع الاحتفاظ ببيانات DB |
| `docker compose down -v` | إيقاف وحذف الحاويات **مع مسح قاعدة البيانات** |
| `docker compose restart app` | إعادة تشغيل حاوية التطبيق فقط |

---

## English Quick Start Summary

1. Create env configuration: `cp .env.example .env`
2. Start containers: `docker compose up -d --build`
3. Access app at: `http://<SERVER_IP>:3000`
