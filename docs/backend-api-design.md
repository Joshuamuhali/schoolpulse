# School Pulse - REST API Design Specification

## Production-Ready Backend Architecture
**Monolithic Node.js/NestJS REST API for AWS Deployment**

---

## 1. ARCHITECTURE OVERVIEW

```
┌─────────────────┐      HTTP/JSON      ┌──────────────────┐      SQL       ┌─────────────────┐
│   React Frontend │  ←──────────────→  │  NestJS Monolith │  ←──────────→  │  RDS PostgreSQL │
│   (S3/CloudFront)│      JWT Auth      │     (EC2)        │   Prisma ORM   │                 │
└─────────────────┘                    └──────────────────┘                └─────────────────┘
```

**Core Principles:**
- Single monolithic codebase
- Stateless REST API
- JWT authentication
- Tenant isolation via `tenant_id`
- PostgreSQL on AWS RDS
- Deployed on EC2 (single instance)

---

## 2. MULTI-TENANCY STRATEGY

### 2.1 Tenant Resolution

**Primary Method: Subdomain-based**
```
school-a.pulseschools.com  →  tenant_id: uuid-school-a
school-b.pulseschools.com  →  tenant_id: uuid-school-b
```

**Fallback Method: JWT Payload**
```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "role": "school_admin",
  "iat": 1234567890
}
```

### 2.2 Tenant Isolation Rule

**EVERY database query MUST include:**
```sql
WHERE tenant_id = 'current-tenant-uuid'
```

**Middleware enforces this automatically.**

---

## 3. AUTHENTICATION SYSTEM (JWT)

### 3.1 Token Strategy

**Access Token:**
- Expires: 15 minutes
- Contains: user_id, tenant_id, role, permissions
- Stored: Memory (React state)

**Refresh Token:**
- Expires: 7 days
- Contains: user_id, token_version
- Stored: httpOnly cookie

### 3.2 Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new school + owner | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/refresh` | Refresh access token | No (cookie) |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/change-password` | Change password | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

### 3.3 Request/Response Examples

**POST /auth/register**
```json
// Request
{
  "school_name": "Lusaka Primary School",
  "subdomain": "lusaka-primary",
  "email": "admin@lusakaprimary.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Banda"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@lusakaprimary.com",
      "first_name": "John",
      "last_name": "Banda",
      "role": "school_admin"
    },
    "school": {
      "id": "uuid",
      "name": "Lusaka Primary School",
      "subdomain": "lusaka-primary"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "error": null
}
```

**POST /auth/login**
```json
// Request
{
  "email": "admin@lusakaprimary.com",
  "password": "SecurePass123!"
}

// Response 200
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@lusakaprimary.com",
      "first_name": "John",
      "last_name": "Banda",
      "role": "school_admin",
      "tenant_id": "uuid"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "error": null
}
```

---

## 4. USER ROLES & PERMISSIONS (RBAC)

### 4.1 Role Hierarchy

| Role | Scope | Description |
|------|-------|-------------|
| `super_admin` | System | Full system access, manage all schools |
| `school_admin` | Tenant | Full school management, billing, users |
| `principal` | Tenant | Academic operations, reports |
| `bursar` | Tenant | Finance only, fees, payments |
| `teacher` | Tenant | Class management, attendance, marks |
| `parent` | Student | View child's records only |

### 4.2 Permission Matrix

| Resource | super_admin | school_admin | principal | bursar | teacher | parent |
|----------|:-----------:|:------------:|:---------:|:------:|:-------:|:------:|
| **Schools** | | | | | | |
| Create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Read All | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Read Own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Users** | | | | | | |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read All | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Read Own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Pupils** | | | | | | |
| Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Read All | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Read Own Class | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ | ✅* | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Teachers** | | | | | | |
| Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Read All | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Attendance** | | | | | | |
| Mark | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Read | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Fees** | | | | | | |
| Create Invoice | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Record Payment | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Read | ✅ | ✅ | ❌ | ✅ | ❌ | ✅* |
| **Exams** | | | | | | |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Enter Marks | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅* |
| **Features** | | | | | | |
| Enable/Disable | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read Status | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Teacher can update pupils in their assigned classes
*Parent can only see their own child's records

---

## 5. COMPLETE API ENDPOINTS

### 5.1 TENANTS (Schools)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/tenants` | Create new school | super_admin, register flow |
| GET | `/tenants` | List all schools (admin) | super_admin |
| GET | `/tenants/:id` | Get school by ID | Any (own school) |
| GET | `/tenants/me` | Get current user's school | Any |
| PATCH | `/tenants/:id` | Update school | super_admin, school_admin |
| DELETE | `/tenants/:id` | Delete school | super_admin |
| GET | `/tenants/:id/stats` | School statistics | school_admin, principal |

**Request/Response Examples:**

**GET /tenants/me**
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Lusaka Primary School",
    "subdomain": "lusaka-primary",
    "class_structure": "multi",
    "address": "123 Main Road, Lusaka",
    "phone": "+260 97 123 4567",
    "email": "info@lusakaprimary.com",
    "logo_url": "https://cdn.example.com/logo.png",
    "settings": {
      "currency": "ZMW",
      "timezone": "Africa/Lusaka",
      "academic_year": "2026"
    },
    "features": [
      { "code": "pupils", "enabled": true, "price": 0 },
      { "code": "attendance", "enabled": true, "price": 20 },
      { "code": "exams", "enabled": false, "price": 30 }
    ],
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-05-01T14:30:00Z"
  },
  "error": null
}
```

---

### 5.2 USERS

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/users` | Create user | school_admin |
| GET | `/users` | List users | Any |
| GET | `/users/:id` | Get user by ID | Any (same tenant) |
| PATCH | `/users/:id` | Update user | school_admin, self |
| DELETE | `/users/:id` | Delete user | school_admin |
| POST | `/users/:id/role` | Assign role | school_admin |
| GET | `/users/:id/activity` | User activity log | school_admin |

**Request/Response Examples:**

**POST /users**
```json
// Request
{
  "email": "teacher@lusakaprimary.com",
  "first_name": "Mary",
  "last_name": "Phiri",
  "role": "teacher",
  "phone": "+260 96 987 6543"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "teacher@lusakaprimary.com",
    "first_name": "Mary",
    "last_name": "Phiri",
    "role": "teacher",
    "phone": "+260 96 987 6543",
    "status": "active",
    "created_at": "2026-05-06T10:00:00Z"
  },
  "error": null
}
```

---

### 5.3 PUPILS (Students)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/pupils` | Create pupil | school_admin, principal |
| GET | `/pupils` | List pupils (paginated) | Any |
| GET | `/pupils/:id` | Get pupil by ID | Any (same tenant) |
| PATCH | `/pupils/:id` | Update pupil | school_admin, principal, teacher* |
| DELETE | `/pupils/:id` | Delete pupil | school_admin, principal |
| GET | `/pupils/:id/attendance` | Get attendance history | Any |
| GET | `/pupils/:id/fees` | Get fee balance | school_admin, bursar, parent* |
| POST | `/pupils/:id/assign-class` | Assign to class | school_admin, principal |

**Query Parameters for GET /pupils:**
```
?page=1&limit=50
&class_id=uuid
&status=active
&search=John
&gender=M
```

**Request/Response Examples:**

**GET /pupils**
```json
// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "pupil_number": "2026-001",
        "first_name": "Chanda",
        "last_name": "Musonda",
        "gender": "F",
        "date_of_birth": "2015-03-12",
        "class_id": "uuid",
        "class_name": "Grade 5A",
        "guardian_name": "Mr. Musonda",
        "guardian_phone": "+260 97 111 2222",
        "guardian_email": "parent@example.com",
        "address": "456 Kitwe Road, Lusaka",
        "status": "active",
        "enrollment_date": "2026-01-15",
        "balance": 0.00,
        "created_at": "2026-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 450,
      "pages": 9
    }
  },
  "error": null
}
```

**POST /pupils**
```json
// Request
{
  "first_name": "Chanda",
  "last_name": "Musonda",
  "gender": "F",
  "date_of_birth": "2015-03-12",
  "class_id": "uuid",
  "guardian_name": "Mr. Musonda",
  "guardian_phone": "+260 97 111 2222",
  "guardian_email": "parent@example.com",
  "address": "456 Kitwe Road, Lusaka"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "pupil_number": "2026-001",
    "first_name": "Chanda",
    "last_name": "Musonda",
    "gender": "F",
    "date_of_birth": "2015-03-12",
    "class_id": "uuid",
    "guardian_name": "Mr. Musonda",
    "guardian_phone": "+260 97 111 2222",
    "guardian_email": "parent@example.com",
    "address": "456 Kitwe Road, Lusaka",
    "status": "active",
    "enrollment_date": "2026-01-15",
    "balance": 0.00,
    "created_at": "2026-05-06T10:00:00Z"
  },
  "error": null
}
```

---

### 5.4 TEACHERS

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/teachers` | Create teacher | school_admin, principal |
| GET | `/teachers` | List teachers | Any |
| GET | `/teachers/:id` | Get teacher by ID | Any |
| PATCH | `/teachers/:id` | Update teacher | school_admin, principal |
| DELETE | `/teachers/:id` | Delete teacher | school_admin, principal |
| POST | `/teachers/:id/assign-class` | Assign class | school_admin, principal |
| POST | `/teachers/:id/assign-subject` | Assign subject | school_admin, principal |

**Request/Response Examples:**

**GET /teachers**
```json
// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "first_name": "Mary",
        "last_name": "Phiri",
        "email": "teacher@lusakaprimary.com",
        "phone": "+260 96 987 6543",
        "employee_id": "TCH-2026-001",
        "department": "Mathematics",
        "qualifications": ["B.Ed Mathematics", "Diploma in Education"],
        "join_date": "2024-01-15",
        "status": "active",
        "assigned_classes": [
          { "id": "uuid", "name": "Grade 5A" },
          { "id": "uuid", "name": "Grade 6B" }
        ],
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25
    }
  },
  "error": null
}
```

---

### 5.5 CLASSES

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/classes` | Create class | school_admin, principal |
| GET | `/classes` | List classes | Any |
| GET | `/classes/:id` | Get class by ID | Any |
| PATCH | `/classes/:id` | Update class | school_admin, principal |
| DELETE | `/classes/:id` | Delete class | school_admin, principal |
| GET | `/classes/:id/pupils` | Get pupils in class | Any |
| GET | `/classes/:id/teacher` | Get assigned teacher | Any |

**Request/Response Examples:**

**GET /classes**
```json
// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Grade 5A",
        "grade_level": "5",
        "stream": "A",
        "academic_year": "2026",
        "capacity": 40,
        "current_enrollment": 38,
        "class_teacher_id": "uuid",
        "class_teacher_name": "Mary Phiri",
        "room": "Block A - Room 12",
        "created_at": "2026-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 12
    }
  },
  "error": null
}
```

---

### 5.6 ATTENDANCE

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/attendance/mark` | Mark attendance | school_admin, principal, teacher |
| GET | `/attendance` | Get attendance records | Any |
| GET | `/attendance/summary` | Get daily summary | school_admin, principal |
| GET | `/attendance/pupil/:id` | Get pupil attendance | Any |
| GET | `/attendance/class/:id` | Get class attendance | Any |
| PATCH | `/attendance/:id` | Update attendance mark | school_admin, principal, teacher |

**Query Parameters for GET /attendance:**
```
?date=2026-05-06
&class_id=uuid
&pupil_id=uuid
&status=present
```

**Request/Response Examples:**

**POST /attendance/mark**
```json
// Request (single or bulk)
{
  "date": "2026-05-06",
  "class_id": "uuid",
  "records": [
    {
      "pupil_id": "uuid",
      "status": "present",
      "notes": ""
    },
    {
      "pupil_id": "uuid",
      "status": "absent",
      "notes": "Sick leave"
    }
  ]
}

// Response 201
{
  "success": true,
  "data": {
    "marked": 38,
    "records": [
      {
        "id": "uuid",
        "pupil_id": "uuid",
        "pupil_name": "Chanda Musonda",
        "date": "2026-05-06",
        "status": "present",
        "marked_by": "Mary Phiri",
        "created_at": "2026-05-06T08:30:00Z"
      }
    ]
  },
  "error": null
}
```

**GET /attendance/summary**
```json
// Response 200
{
  "success": true,
  "data": {
    "date": "2026-05-06",
    "total_pupils": 450,
    "present": 432,
    "absent": 15,
    "late": 3,
    "attendance_rate": 96.0,
    "by_class": [
      {
        "class_id": "uuid",
        "class_name": "Grade 5A",
        "total": 38,
        "present": 36,
        "absent": 2,
        "late": 0
      }
    ]
  },
  "error": null
}
```

---

### 5.7 EXAMS

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/exams` | Create exam | school_admin, principal |
| GET | `/exams` | List exams | Any |
| GET | `/exams/:id` | Get exam by ID | Any |
| PATCH | `/exams/:id` | Update exam | school_admin, principal |
| DELETE | `/exams/:id` | Delete exam | school_admin, principal |
| POST | `/exams/:id/results` | Submit results | school_admin, principal, teacher |
| GET | `/exams/:id/results` | Get all results | Any |
| GET | `/exams/:id/results/pupil/:id` | Get pupil results | Any |

**Request/Response Examples:**

**POST /exams**
```json
// Request
{
  "title": "Mid-Term Mathematics Examination",
  "subject": "Mathematics",
  "class_id": "uuid",
  "exam_date": "2026-05-15",
  "max_marks": 100,
  "passing_marks": 40,
  "exam_type": "mid_term",
  "duration_minutes": 120,
  "description": "Covers Chapters 1-5"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Mid-Term Mathematics Examination",
    "subject": "Mathematics",
    "class_id": "uuid",
    "class_name": "Grade 5A",
    "exam_date": "2026-05-15",
    "max_marks": 100,
    "passing_marks": 40,
    "exam_type": "mid_term",
    "duration_minutes": 120,
    "description": "Covers Chapters 1-5",
    "status": "upcoming",
    "created_at": "2026-05-06T10:00:00Z"
  },
  "error": null
}
```

**POST /exams/:id/results**
```json
// Request
{
  "results": [
    {
      "pupil_id": "uuid",
      "marks": 85,
      "grade": "A",
      "remarks": "Excellent work"
    },
    {
      "pupil_id": "uuid",
      "marks": 62,
      "grade": "B",
      "remarks": "Good effort"
    }
  ]
}

// Response 201
{
  "success": true,
  "data": {
    "submitted": 38,
    "class_average": 68.5,
    "highest": 95,
    "lowest": 35,
    "results": [
      {
        "id": "uuid",
        "pupil_id": "uuid",
        "pupil_name": "Chanda Musonda",
        "marks": 85,
        "grade": "A",
        "remarks": "Excellent work",
        "rank": 3
      }
    ]
  },
  "error": null
}
```

---

### 5.8 FEES & BILLING

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/fees/structures` | Create fee structure | school_admin |
| GET | `/fees/structures` | List fee structures | school_admin, bursar |
| POST | `/fees/invoices` | Generate invoice | school_admin, bursar |
| GET | `/fees/invoices` | List invoices | school_admin, bursar |
| GET | `/fees/invoices/:id` | Get invoice | school_admin, bursar, parent* |
| POST | `/fees/payments` | Record payment | school_admin, bursar |
| GET | `/fees/payments` | List payments | school_admin, bursar |
| GET | `/fees/balance/pupil/:id` | Get pupil balance | school_admin, bursar, parent* |
| GET | `/fees/reports/outstanding` | Outstanding fees report | school_admin, bursar |

**Request/Response Examples:**

**POST /fees/structures**
```json
// Request
{
  "name": "Term 2 Tuition Fee",
  "amount": 2500.00,
  "frequency": "term",
  "applicable_classes": ["uuid1", "uuid2", "uuid3"],
  "due_date": "2026-05-30",
  "description": "Second term tuition fees",
  "is_mandatory": true
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Term 2 Tuition Fee",
    "amount": 2500.00,
    "frequency": "term",
    "applicable_classes": ["Grade 5A", "Grade 5B", "Grade 6A"],
    "due_date": "2026-05-30",
    "description": "Second term tuition fees",
    "is_mandatory": true,
    "is_active": true,
    "created_at": "2026-05-06T10:00:00Z"
  },
  "error": null
}
```

**POST /fees/invoices**
```json
// Request
{
  "pupil_id": "uuid",
  "fee_structure_id": "uuid",
  "amount": 2500.00,
  "due_date": "2026-05-30",
  "notes": "Term 2 fees"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoice_number": "INV-2026-001",
    "pupil_id": "uuid",
    "pupil_name": "Chanda Musonda",
    "amount": 2500.00,
    "paid_amount": 0.00,
    "balance": 2500.00,
    "status": "pending",
    "due_date": "2026-05-30",
    "created_at": "2026-05-06T10:00:00Z"
  },
  "error": null
}
```

**POST /fees/payments**
```json
// Request
{
  "invoice_id": "uuid",
  "amount": 2500.00,
  "payment_method": "mobile_money",
  "reference_number": "MM-123456789",
  "payment_date": "2026-05-06",
  "notes": "Full payment"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "receipt_number": "RCP-2026-001",
    "invoice_id": "uuid",
    "pupil_id": "uuid",
    "pupil_name": "Chanda Musonda",
    "amount": 2500.00,
    "payment_method": "mobile_money",
    "reference_number": "MM-123456789",
    "payment_date": "2026-05-06",
    "recorded_by": "John Banda",
    "created_at": "2026-05-06T10:00:00Z"
  },
  "error": null
}
```

**GET /fees/balance/pupil/:id**
```json
// Response 200
{
  "success": true,
  "data": {
    "pupil_id": "uuid",
    "pupil_name": "Chanda Musonda",
    "total_invoiced": 5000.00,
    "total_paid": 3750.00,
    "balance": 1250.00,
    "overdue_amount": 0.00,
    "invoices": [
      {
        "id": "uuid",
        "invoice_number": "INV-2026-001",
        "amount": 2500.00,
        "paid_amount": 2500.00,
        "balance": 0.00,
        "status": "paid",
        "due_date": "2026-04-30"
      },
      {
        "id": "uuid",
        "invoice_number": "INV-2026-002",
        "amount": 2500.00,
        "paid_amount": 1250.00,
        "balance": 1250.00,
        "status": "partial",
        "due_date": "2026-05-30"
      }
    ]
  },
  "error": null
}
```

---

### 5.9 FEATURES (Billing System)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/features` | List all features | Any |
| GET | `/features/available` | Available for subscription | school_admin |
| POST | `/features/subscribe` | Subscribe to feature | school_admin |
| POST | `/features/unsubscribe` | Unsubscribe from feature | school_admin |
| GET | `/features/billing` | Current billing summary | school_admin |

**Feature Codes:**
- `pupils` - Student Management (Base)
- `teachers` - Teacher Management (Base)
- `classes` - Class Management (Base)
- `attendance` - Attendance Tracking (ZMW 20/month)
- `exams` - Examination Management (ZMW 30/month)
- `fees` - Fee Collection & Billing (ZMW 50/month)
- `messaging` - SMS/Email Communication (ZMW 25/month)
- `reports` - Advanced Reporting (ZMW 15/month)
- `analytics` - Data Analytics Dashboard (ZMW 40/month)

**Request/Response Examples:**

**GET /features**
```json
// Response 200
{
  "success": true,
  "data": {
    "tenant_id": "uuid",
    "current_bill": 125.00,
    "billing_cycle": "monthly",
    "next_billing_date": "2026-06-01",
    "features": [
      {
        "code": "pupils",
        "name": "Student Management",
        "description": "Manage student records, enrollment, and profiles",
        "enabled": true,
        "price": 0,
        "is_base": true,
        "subscribed_at": "2026-01-15T10:00:00Z"
      },
      {
        "code": "attendance",
        "name": "Attendance Tracking",
        "description": "Daily attendance marking and reports",
        "enabled": true,
        "price": 20.00,
        "is_base": false,
        "subscribed_at": "2026-02-01T10:00:00Z",
        "next_charge": "2026-06-01"
      },
      {
        "code": "exams",
        "name": "Examination Management",
        "description": "Exam scheduling, results entry, and report cards",
        "enabled": false,
        "price": 30.00,
        "is_base": false
      }
    ]
  },
  "error": null
}
```

**POST /features/subscribe**
```json
// Request
{
  "feature_code": "exams"
}

// Response 200
{
  "success": true,
  "data": {
    "feature_code": "exams",
    "enabled": true,
    "price": 30.00,
    "new_monthly_total": 155.00,
    "message": "Feature enabled. New monthly bill: ZMW 155.00"
  },
  "error": null
}
```

---

### 5.10 ADMIN (Super Admin Only)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/tenants` | List all schools | super_admin |
| GET | `/admin/tenants/:id/stats` | School detailed stats | super_admin |
| GET | `/admin/users` | List all users | super_admin |
| GET | `/admin/revenue` | Platform revenue | super_admin |
| GET | `/admin/activity` | Platform activity log | super_admin |

---

## 6. DATABASE DESIGN (PostgreSQL)

### 6.1 Core Tables

```sql
-- TENANTS (Schools)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  class_structure VARCHAR(20) DEFAULT 'multi',
  state VARCHAR(20) DEFAULT 'active',
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'teacher',
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- PUPILS (Students)
CREATE TABLE pupils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  pupil_number VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender CHAR(1) CHECK (gender IN ('M', 'F')),
  date_of_birth DATE,
  class_id UUID,
  guardian_name VARCHAR(200),
  guardian_phone VARCHAR(50),
  guardian_email VARCHAR(255),
  address TEXT,
  status VARCHAR(20) DEFAULT 'active',
  enrollment_date DATE DEFAULT CURRENT_DATE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, pupil_number)
);

-- TEACHERS
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  employee_id VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  department VARCHAR(100),
  qualifications JSONB DEFAULT '[]',
  join_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CLASSES
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  grade_level VARCHAR(20),
  stream VARCHAR(20),
  academic_year VARCHAR(10),
  capacity INTEGER DEFAULT 40,
  class_teacher_id UUID REFERENCES teachers(id),
  room VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ATTENDANCE
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  pupil_id UUID NOT NULL REFERENCES pupils(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, pupil_id, date)
);

-- EXAMS
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  class_id UUID REFERENCES classes(id),
  exam_date DATE NOT NULL,
  max_marks INTEGER NOT NULL,
  passing_marks INTEGER,
  exam_type VARCHAR(50),
  duration_minutes INTEGER,
  description TEXT,
  status VARCHAR(20) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXAM RESULTS
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  pupil_id UUID NOT NULL REFERENCES pupils(id) ON DELETE CASCADE,
  marks INTEGER NOT NULL,
  grade VARCHAR(10),
  remarks TEXT,
  entered_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, exam_id, pupil_id)
);

-- FEE STRUCTURES
CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency VARCHAR(20) CHECK (frequency IN ('monthly', 'term', 'annual', 'one-time')),
  applicable_classes JSONB DEFAULT '[]',
  due_date DATE,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INVOICES
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  pupil_id UUID NOT NULL REFERENCES pupils(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES fee_structures(id),
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  balance DECIMAL(10,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, invoice_number)
);

-- PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  pupil_id UUID NOT NULL REFERENCES pupils(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'cheque', 'card')),
  reference_number VARCHAR(100),
  payment_date DATE NOT NULL,
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, receipt_number)
);

-- FEATURES (Master list)
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_base BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TENANT FEATURES (Subscriptions)
CREATE TABLE tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id),
  enabled BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tenant_id, feature_id)
);

-- REFRESH TOKENS
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTIVITY LOG
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.2 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_pupils_tenant_class ON pupils(tenant_id, class_id);
CREATE INDEX idx_pupils_tenant_status ON pupils(tenant_id, status);
CREATE INDEX idx_attendance_tenant_date ON attendance(tenant_id, date);
CREATE INDEX idx_attendance_pupil_date ON attendance(pupil_id, date);
CREATE INDEX idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX idx_invoices_pupil ON invoices(pupil_id);
CREATE INDEX idx_payments_tenant_date ON payments(tenant_id, payment_date);
CREATE INDEX idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX idx_activity_logs_tenant_created ON activity_logs(tenant_id, created_at);
```

### 6.3 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pupils ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_pupils ON pupils
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_teachers ON teachers
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_classes ON classes
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_attendance ON attendance
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_exams ON exams
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_exam_results ON exam_results
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_fee_structures ON fee_structures
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_invoices ON invoices
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_payments ON payments
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

---

## 7. NESTJS FOLDER STRUCTURE

```
school-pulse-api/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── config/
│   │   ├── database.config.ts     # Database configuration
│   │   ├── jwt.config.ts          # JWT configuration
│   │   └── app.config.ts          # General configuration
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── tenant.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── tenant.guard.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   └── tenant.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── refresh-token.dto.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   ├── tenants/
│   │   │   ├── tenants.module.ts
│   │   │   ├── tenants.controller.ts
│   │   │   ├── tenants.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-tenant.dto.ts
│   │   │   │   └── update-tenant.dto.ts
│   │   │   └── entities/
│   │   │       └── tenant.entity.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   ├── pupils/
│   │   │   ├── pupils.module.ts
│   │   │   ├── pupils.controller.ts
│   │   │   ├── pupils.service.ts
│   │   │   └── dto/
│   │   │       ├── create-pupil.dto.ts
│   │   │       └── update-pupil.dto.ts
│   │   ├── teachers/
│   │   │   ├── teachers.module.ts
│   │   │   ├── teachers.controller.ts
│   │   │   └── teachers.service.ts
│   │   ├── classes/
│   │   │   ├── classes.module.ts
│   │   │   ├── classes.controller.ts
│   │   │   └── classes.service.ts
│   │   ├── attendance/
│   │   │   ├── attendance.module.ts
│   │   │   ├── attendance.controller.ts
│   │   │   └── attendance.service.ts
│   │   ├── exams/
│   │   │   ├── exams.module.ts
│   │   │   ├── exams.controller.ts
│   │   │   └── exams.service.ts
│   │   ├── fees/
│   │   │   ├── fees.module.ts
│   │   │   ├── fees.controller.ts
│   │   │   └── fees.service.ts
│   │   ├── features/
│   │   │   ├── features.module.ts
│   │   │   ├── features.controller.ts
│   │   │   └── features.service.ts
│   │   └── admin/
│   │       ├── admin.module.ts
│   │       ├── admin.controller.ts
│   │       └── admin.service.ts
│   ├── database/
│   │   ├── prisma.schema
│   │   ├── migrations/
│   │   └── seeds/
│   └── utils/
│       ├── password.util.ts
│       ├── tenant.util.ts
│       └── response.util.ts
├── package.json
├── nest-cli.json
├── tsconfig.json
├── Dockerfile
└── .env.example
```

---

## 8. BILLING SYSTEM ARCHITECTURE

### 8.1 Feature Pricing Model

```json
{
  "features": {
    "pupils": { "price": 0, "is_base": true },
    "teachers": { "price": 0, "is_base": true },
    "classes": { "price": 0, "is_base": true },
    "attendance": { "price": 20, "billing_cycle": "monthly" },
    "exams": { "price": 30, "billing_cycle": "monthly" },
    "fees": { "price": 50, "billing_cycle": "monthly" },
    "messaging": { "price": 25, "billing_cycle": "monthly" },
    "reports": { "price": 15, "billing_cycle": "monthly" },
    "analytics": { "price": 40, "billing_cycle": "monthly" }
  }
}
```

### 8.2 Billing Flow

1. **Monthly Cron Job** (1st of each month):
   - Calculate tenant's active features
   - Generate billing records
   - Send invoices

2. **Feature Toggle**:
   - Real-time enable/disable
   - Prorated billing for mid-cycle changes
   - Immediate access control

3. **Payment Processing**:
   - Integration with Zambian payment gateways
   - Automatic service suspension for non-payment
   - Grace period: 7 days

---

## 9. DEPLOYMENT ARCHITECTURE (AWS)

### 9.1 Infrastructure Components

```
┌─────────────────┐
│   Route 53      │ ← DNS Management
│   (pulseschools.com) │
└─────────────────┘
         │
┌─────────────────┐
│  CloudFront     │ ← CDN + SSL
│   (Frontend)    │
└─────────────────┘
         │
┌─────────────────┐
│      S3         │ ← Static Frontend
│   (React App)   │
└─────────────────┘
         │
┌─────────────────┐
│   EC2 Instance  │ ← NestJS API
│  (t3.medium)    │
└─────────────────┘
         │
┌─────────────────┐
│     RDS         │ ← PostgreSQL
│   (db.t3.micro)│
└─────────────────┘
```

### 9.2 Environment Configuration

```bash
# EC2 Environment Variables
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/schoolpulse
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=https://*.pulseschools.com
REDIS_URL=redis://cache-endpoint:6379
```

---

## 10. SUMMARY

This REST API design provides:

✅ **Complete multi-tenant SaaS architecture**
✅ **Production-ready security (JWT + RLS)**
✅ **Feature-based billing system**
✅ **Comprehensive RBAC**
✅ **Scalable database design**
✅ **AWS deployment ready**
✅ **Monolithic simplicity**

**Next Steps:**
1. Approve this design
2. Build NestJS implementation
3. Set up AWS infrastructure
4. Deploy and test
5. Migrate frontend to use real HTTP API

This is the real backend that will replace Supabase completely.
