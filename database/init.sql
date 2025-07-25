-- database/init.sql (Updated)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng Users (mới)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Bộ phận
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(50),
    target_revenue DECIMAL(15,2) DEFAULT 0,
    target_profit_pct DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Tổ/Team
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(id),
    target_revenue DECIMAL(15,2) DEFAULT 0,
    target_profit_pct DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Nhân viên
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE,
    name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(id),
    team_id INT REFERENCES teams(id),
    position VARCHAR(50),
    level VARCHAR(10),
    hourly_rate DECIMAL(12,2) DEFAULT 0,
    target_hours_monthly DECIMAL(8,2) DEFAULT 160,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Danh mục dịch vụ
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Khách hàng
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(15),
    type VARCHAR(20) DEFAULT 'khachmoi',
    first_visit_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Đơn dịch vụ
CREATE TABLE service_orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(id),
    vehicle_brand VARCHAR(50),
    vehicle_model VARCHAR(50),
    license_plate VARCHAR(15),
    advisor_id INT REFERENCES employees(id),
    sales_staff_id INT REFERENCES employees(id),
    status VARCHAR(20) DEFAULT 'draft',
    order_date DATE,
    completion_date DATE,
    total_amount DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Chi tiết đơn dịch vụ
CREATE TABLE service_details (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES service_orders(id),
    category_id INT REFERENCES service_categories(id),
    employee_id INT REFERENCES employees(id),
    product_name TEXT NOT NULL,
    quantity DECIMAL(8,2) DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'cái',
    unit_price DECIMAL(15,2) DEFAULT 0,
    cost_price DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    labor_hours DECIMAL(4,2) DEFAULT 0,
    type VARCHAR(20) DEFAULT 'service',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Phân bổ chi phí
CREATE TABLE cost_allocations (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id),
    month_year VARCHAR(7) NOT NULL,
    depreciation DECIMAL(15,2) DEFAULT 0,
    management_planned DECIMAL(15,2) DEFAULT 0,
    management_actual DECIMAL(15,2) DEFAULT 0,
    other_costs DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Fact tổng hợp
CREATE TABLE fact_pnl (
    id SERIAL PRIMARY KEY,
    period_date DATE,
    period_type VARCHAR(10),
    department_id INT REFERENCES departments(id),
    team_id INT REFERENCES teams(id),
    employee_id INT REFERENCES employees(id),
    category_id INT REFERENCES service_categories(id),
    customer_type VARCHAR(20),
    revenue DECIMAL(15,2) DEFAULT 0,
    cogs DECIMAL(15,2) DEFAULT 0,
    labor_cost DECIMAL(15,2) DEFAULT 0,
    material_cost DECIMAL(15,2) DEFAULT 0,
    overhead_cost DECIMAL(15,2) DEFAULT 0,
    gross_profit DECIMAL(15,2) DEFAULT 0,
    labor_hours DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- INDEXES cho hiệu năng tối ưu
-- ===============================

-- Teams table indexes
CREATE INDEX idx_teams_department_id ON teams(department_id);

-- Employees table indexes
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_team_id ON employees(team_id);
CREATE INDEX idx_employees_code ON employees(code);

-- Service categories indexes
CREATE INDEX idx_service_categories_department_id ON service_categories(department_id);

-- Service orders indexes
CREATE INDEX idx_service_orders_customer_id ON service_orders(customer_id);
CREATE INDEX idx_service_orders_advisor_id ON service_orders(advisor_id);
CREATE INDEX idx_service_orders_sales_staff_id ON service_orders(sales_staff_id);
CREATE INDEX idx_service_orders_order_date ON service_orders(order_date);
CREATE INDEX idx_service_orders_completion_date ON service_orders(completion_date);
CREATE INDEX idx_service_orders_status ON service_orders(status);

-- Service details indexes
CREATE INDEX idx_service_details_order_id ON service_details(order_id);
CREATE INDEX idx_service_details_category_id ON service_details(category_id);
CREATE INDEX idx_service_details_employee_id ON service_details(employee_id);

-- Cost allocations indexes
CREATE INDEX idx_cost_allocations_department_id ON cost_allocations(department_id);
CREATE INDEX idx_cost_allocations_month_year ON cost_allocations(month_year);

-- Fact P&L indexes (quan trọng nhất)
CREATE INDEX idx_fact_pnl_period_date ON fact_pnl(period_date);
CREATE INDEX idx_fact_pnl_department_id ON fact_pnl(department_id);
CREATE INDEX idx_fact_pnl_team_id ON fact_pnl(team_id);
CREATE INDEX idx_fact_pnl_employee_id ON fact_pnl(employee_id);
CREATE INDEX idx_fact_pnl_category_id ON fact_pnl(category_id);
CREATE INDEX idx_fact_pnl_customer_type ON fact_pnl(customer_type);

-- Composite indexes cho các truy vấn phức tạp
CREATE INDEX idx_fact_pnl_date_dept ON fact_pnl(period_date, department_id);
CREATE INDEX idx_fact_pnl_date_emp ON fact_pnl(period_date, employee_id);
CREATE INDEX idx_fact_pnl_dept_category ON fact_pnl(department_id, category_id);

-- Seed data
INSERT INTO departments (name, code, type, target_revenue, target_profit_pct) VALUES
('Bộ phận Kỹ thuật Tổ 1', 'KT1', 'Kỹ thuật', 120000000, 25.0),
('Bộ phận Kỹ thuật Tổ 2', 'KT2', 'Kỹ thuật', 110000000, 23.0),
('Bộ phận Đồng Sơn', 'DS', 'Đồng Sơn', 80000000, 30.0),
('Bộ phận Chăm sóc xe', 'CSCX', 'Detailing', 45000000, 35.0);

INSERT INTO teams (name, department_id, target_revenue) VALUES
('Tổ Bảo dưỡng', 1, 60000000),
('Tổ Sửa chữa động cơ', 1, 60000000),
('Tổ Điện - Điều hòa', 2, 55000000),
('Tổ Phanh - Treo', 2, 55000000),
('Tổ Đồng', 3, 40000000),
('Tổ Sơn', 3, 40000000),
('Tổ Detailing', 4, 45000000);

INSERT INTO service_categories (code, name, department_id) VALUES
('BDN', 'Bảo dưỡng nhanh', 1),
('BDDK', 'Bảo dưỡng định kỳ', 1),
('EN', 'Hệ thống động cơ', 1),
('BR', 'Hệ thống phanh', 2),
('TR', 'Hệ thống truyền động', 1),
('EL', 'Hệ thống điện', 2),
('AC', 'Hệ thống điều hòa', 2),
('SU', 'Hệ thống treo', 2),
('ST', 'Hệ thống lái', 2),
('FU', 'Hệ thống nhiên liệu', 1),
('EX', 'Hệ thống xả', 1),
('TY', 'Hệ thống lốp', 1),
('BD', 'Dịch vụ đồng', 3),
('PT', 'Dịch vụ sơn', 3),
('DT', 'Dịch vụ detailing', 4);

-- Tạo user admin mặc định (password: admin123)
INSERT INTO users (username, password_hash, role, full_name) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Administrator');
