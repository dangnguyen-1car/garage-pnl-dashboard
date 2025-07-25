# 🚗 P&L Dashboard - Garage Management System

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Hệ thống quản lý báo cáo P&L (Profit & Loss) chuyên nghiệp cho garage ô tô với dashboard real-time, phân tích KPI và quản lý chi phí tự động.**

## 🌟 **Tổng Quan**

P&L Dashboard là giải pháp quản lý tài chính toàn diện dành cho các garage ô tô, giúp theo dõi lợi nhuận, chi phí và hiệu suất hoạt động theo thời gian thực. Hệ thống cung cấp báo cáo đa cấp từ tổng thể garage xuống đến từng nhân viên.

### 🎯 **Vấn Đề Giải Quyết**

- ❌ Khó khăn trong việc theo dõi lợi nhuận theo từng bộ phận
- ❌ Thiếu transparency trong việc phân bổ chi phí
- ❌ Không có KPI tracking cho nhân viên kỹ thuật
- ❌ Báo cáo thủ công tốn thời gian và dễ sai sót
- ❌ Khó so sánh hiệu suất giữa các tổ/nhóm

### ✅ **Giải Pháp Cung Cấp**

- 📊 Dashboard P&L real-time với drill-down 5 cấp độ
- 💰 Phân bổ chi phí tự động theo KPI doanh số
- 👥 Tracking hiệu suất nhân viên và KPI cá nhân
- 📈 Phân tích khách hàng mới vs cũ
- 🎯 So sánh thực tế vs mục tiêu theo bộ phận
- 📱 Responsive design cho desktop và tablet

## 🚀 **Tính Năng Chính**

### 📊 **Dashboard & Báo Cáo**
- **P&L 5 cấp độ**: Garage → Bộ phận → Team → Dịch vụ → Nhân viên
- **Real-time monitoring**: Cập nhật dữ liệu thời gian thực
- **Interactive charts**: Chart.js với khả năng drill-down
- **Export reports**: Xuất CSV/Excel cho báo cáo

### 💼 **Quản Lý Chi Phí**
- **Phân bổ tự động**: Chi phí overhead theo KPI doanh số
- **Cost tracking**: Theo dõi chi phí khấu hao, quản lý, vật tư
- **Labor costing**: Tính toán chi phí nhân công đến 0.01 giờ
- **Variance analysis**: So sánh kế hoạch vs thực tế

### 👥 **KPI & Performance**
- **Employee KPI**: Theo dõi hiệu suất cá nhân
- **Department targets**: Mục tiêu và achievement theo bộ phận
- **Labor utilization**: Tỷ lệ sử dụng giờ công
- **Revenue per hour**: Doanh thu trên giờ công

### 🔐 **Bảo Mật & Phân Quyền**
- **JWT Authentication**: Đăng nhập bảo mật với token
- **Role-based access**: Admin, Manager, Employee roles
- **Protected routes**: Bảo vệ API endpoints
- **Password hashing**: Bcrypt cho mật khẩu

## 🛠️ **Tech Stack**

### **Backend**
- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Authentication**: JWT + bcryptjs
- **ORM**: Native PostgreSQL queries
- **Environment**: dotenv

### **Frontend**
- **Framework**: React 18.2 + TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI (MUI) 5.x
- **Charts**: Chart.js + react-chartjs-2
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors

### **DevOps & Tools**
- **Database**: Docker Compose
- **Development**: Nodemon, React Scripts
- **Process Management**: Concurrently
- **Code Quality**: ESLint, TypeScript strict mode

## 📁 **Cấu Trúc Project**

garage-pnl-dashboard/
├── 📂 backend/ # Node.js API Server
│ ├── 📂 src/
│ │ ├── 📂 routes/ # API endpoints
│ │ ├── 📂 services/ # Business logic
│ │ ├── 📂 middleware/ # Auth, validation
│ │ ├── 📂 config/ # Database config
│ │ └── 📄 app.js # Express app
│ ├── 📂 seeds/ # Sample data generators
│ └── 📄 package.json
├── 📂 frontend/ # React TypeScript App
│ ├── 📂 src/
│ │ ├── 📂 components/ # React components
│ │ ├── 📂 store/ # Redux store & slices
│ │ ├── 📂 types/ # TypeScript interfaces
│ │ └── 📂 utils/ # Helper functions
│ ├── 📂 public/
│ └── 📄 package.json
├── 📂 database/
│ └── 📄 init.sql # Database schema
├── 📄 docker-compose.yml # PostgreSQL container
├── 📄 package.json # Root scripts

## 🚀 **Quick Start**

### **Prerequisites**

Required software
Node.js 18.x or higher

npm 9.x or higher

Docker Desktop (for PostgreSQL)

Git

Check versions
node --version # v18.x.x
npm --version # 9.x.x
text

### **1. Clone Repository**

git clone https://github.com/dangnguyen-1car/garage-pnl-dashboard.git
cd garage-pnl-dashboar

### **2. Install Dependencies**

Install all dependencies
npm run install:all

Or install separately
npm run install:backend

### **3. Setup Database**

Start PostgreSQL with Docker
docker-compose up -d postgres

Wait for database to be ready (10-15 seconds)
docker-compose logs postgres

### **4. Create Admin User**

Create default admin user
cd backend
node seeds/create-admin.js

### **5. Start Application**

Start both backend and frontend

Or start separately
npm run start:backend # Terminal 1
npm run start:frontend # Termina

### **6. Access Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **Database**: localhost:5432 (postgres/postgres)

### **7. Login Credentials**

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | `admin` | `admin123` | Full access |
| **Demo** | `demo` | `demo123` | Limited access |

## 📊 **Database Schema**

### **Core Tables**

-- Key entities
👥 users # Authentication & authorization
🏢 departments # Bộ phận (Kỹ thuật, Đồng Sơn, Detailing)
🛠️ teams # Tổ/nhóm trong bộ phận
👤 employees # Nhân viên với cấp bậc (L1-L5)
🚗 service_orders # Đơn dịch vụ
📋 service_details # Chi tiết từng dịch vụ
💰 cost_allocations # Phân bổ chi phí theo tháng

### **Indexes Optimization**

- ✅ **15+ indexes** cho performance tối ưu
- ✅ **Composite indexes** cho truy vấn phức tạp
- ✅ **Foreign key indexes** cho JOIN operations
- ✅ **Date range indexes** cho period filtering

## 📡 **API Documentation**

### **Authentication**

Login
POST /api/auth/login
{
"username": "admin
, "password": "admin
Response
{
"success": tru
, "data
: { "token": "eyJhbGciOiJIUzI1N
Is...",
"user"
{ "id": 1,
"username":
a
m

### **P&L Endpoints**

Garage P&L tổng thể
GET /api/pnl/garage?from=2025-01-01&to=2025-12-31&period=monthly

P&L theo bộ phận
GET /api/pnl/department/1?from=2025-07-01&to=2025-07-31

P&L theo nhân viên
GET /api/pnl/employee/1?from=2025-07-01&to=2025-07-31

P&L theo đơn dịch vụ
GET /api/pnl/service/BG50001

### **Dashboard Endpoints**

Tổng quan dashboard
GET /api/dashboard/overview?period=this_month

KPI nhân viên
GET /api/kpi/employee/1?from=2025-07-01&to=2025-07-31

Phân bổ chi phí
POST /api/costs/allocate
{
"month_year": "2025-0

## 🎨 **Screenshots**

### Dashboard Overview
![Dashboard Overview](docs/images/dashboard-overview.png)

### P&L Reports
![P&L Reports](docs/images/pnl-reports.png)

### Employee KPI
![Employee KPI](docs/images/employee-kpi.png)

## ⚙️ **Configuration**

### **Environment Variables**

**Backend (.env)**
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=garage_pnl
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key

**Frontend (.env)**
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=developmen

### **Database Configuration**

docker-compose.yml
services:
postgre
: image: postg
es:15 en
ironment: POSTGRE
_DB: garage_pnl P
STGRES_USER: postgres
POSTGR

## 🧪 **Development**

### **Development Scripts**

Development mode with hot reload
npm run dev

Backend only
npm run start:backend

Frontend only
npm run start:frontend

Build for production
npm run build:frontend

Generate sample data
cd backend && npm run seed

### **Code Quality**

Type checking
npx tsc --noEmit

Linting
npm run lint

Format code
npm run format

## 🚀 **Deployment**

### **Production Build**

Build frontend
npm run build:frontend

Set production environment
NODE_ENV=production

Use PM2 for process management
npm install -g pm2
pm2 start backend/src/app.js --

### **Docker Deployment**

Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 5000

## 🤝 **Contributing**

### **Development Workflow**

1. **Fork** repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Code Standards**

- ✅ **TypeScript strict mode** enabled
- ✅ **ESLint** for code quality
- ✅ **Prettier** for formatting
- ✅ **Conventional commits** for commit messages
- ✅ **Unit tests** for business logic

## 📈 **Roadmap**

### **v2.0 Features**
- [ ] **Mobile app** (React Native)
- [ ] **Advanced analytics** (Machine Learning predictions)
- [ ] **Multi-garage support** (Franchise management)
- [ ] **Real-time notifications** (WebSocket)
- [ ] **Advanced reporting** (Custom report builder)

### **v1.1 Enhancements**
- [ ] **Dark mode** support
- [ ] **Export to PDF** reports
- [ ] **Advanced filters** in dashboard
- [ ] **Audit logging** for all actions

## ❓ **FAQ**

**Q: Làm thế nào để thêm bộ phận mới?**
A: Thêm record vào bảng `departments` và cập nhật seed data.

**Q: Có thể thay đổi cấu trúc KPI không?**
A: Có, chỉnh sửa trong `backend/src/services/kpi.service.js`.

**Q: Hệ thống có hỗ trợ multi-tenant không?**
A: Hiện tại chưa, sẽ có trong v2.0.

## 🐛 **Troubleshooting**

### **Common Issues**

Database connection error
docker-compose restart postgres

Frontend build error
cd frontend && rm -rf node_modules && npm install

Backend module not found
cd backend && npm install

Port already in use
lsof -ti:5000 | xargs kill -9 # Kill process on port 5000

### **Debug Mode**

Enable debug logging
NODE_ENV=development DEBUG=* npm run start:backend

Frontend debug
REACT_APP_DEBUG=true npm run start:frontend

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 **Authors**

- **Dang Nguyen** - (https://github.com/dangnguyen-1car)

## 🙏 **Acknowledgments**

- **Material-UI** team for excellent React components
- **Chart.js** community for visualization library
- **PostgreSQL** team for robust database
- **Node.js** and **React** communities

## 📞 **Support**

- **Email**: your.email@domain.com
- **GitHub Issues**: [Create an issue](https://github.com/dangnguyen-1care/garage-pnl-dashboard/issues)
- **Documentation**: [Wiki](https://github.com/dangnguyen-1car/garage-pnl-dashboard/wiki)

---

<div align="center">

**🌟 Nếu project hữu ích, hãy cho một Star! 🌟**

[![GitHub Stars](https://img.shields.io/github/stars/dangnguyen-1car/garage-pnl-dashboard.svg?style=social&label=Star&maxAge=2592000)](https://github.com/dangnguyen-1car/garage-pnl-dashboard/stargazers/)

</div>