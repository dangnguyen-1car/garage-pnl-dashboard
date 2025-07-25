// backend/seeds/generate-data.js
const { Pool } = require('pg');
const moment = require('moment');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'garage_pnl',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function generateSampleData() {
  try {
    console.log('Generating sample data...');

    // Generate employees
    const employees = [
      { code: 'EMP001', name: 'Nguyễn Văn An', dept_id: 1, team_id: 1, position: 'Tổ trưởng', level: 'L5', rate: 85000 },
      { code: 'EMP002', name: 'Trần Thị Bình', dept_id: 1, team_id: 1, position: 'KTV cấp 1', level: 'L3', rate: 65000 },
      { code: 'EMP003', name: 'Lê Văn Cường', dept_id: 1, team_id: 2, position: 'KTV cấp 2', level: 'L4', rate: 75000 },
      { code: 'EMP004', name: 'Phạm Thị Dung', dept_id: 2, team_id: 3, position: 'Tổ trưởng', level: 'L5', rate: 90000 },
      { code: 'EMP005', name: 'Hoàng Văn Em', dept_id: 2, team_id: 4, position: 'KTV cấp 1', level: 'L3', rate: 70000 },
      { code: 'EMP006', name: 'Đặng Thị Phương', dept_id: 3, team_id: 5, position: 'Thợ đồng', level: 'L4', rate: 80000 },
      { code: 'EMP007', name: 'Võ Văn Giang', dept_id: 3, team_id: 6, position: 'Thợ sơn', level: 'L4', rate: 85000 },
      { code: 'EMP008', name: 'Bùi Thị Hoa', dept_id: 4, team_id: 7, position: 'Chuyên viên', level: 'L3', rate: 60000 },
    ];

    for (const emp of employees) {
      await pool.query(
        `INSERT INTO employees (code, name, department_id, team_id, position, level, hourly_rate, target_hours_monthly) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [emp.code, emp.name, emp.dept_id, emp.team_id, emp.position, emp.level, emp.rate, 160]
      );
    }

    // Generate customers
    const customers = [];
    for (let i = 1; i <= 100; i++) {
      const isNewCustomer = Math.random() > 0.4; // 60% khách cũ
      customers.push({
        name: `Khách hàng ${i}`,
        phone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        type: isNewCustomer ? 'khachmoi' : 'khachcu',
        first_visit: moment().subtract(Math.floor(Math.random() * 365), 'days').format('YYYY-MM-DD')
      });
    }

    for (const customer of customers) {
      await pool.query(
        `INSERT INTO customers (name, phone, type, first_visit_date) VALUES ($1, $2, $3, $4)`,
        [customer.name, customer.phone, customer.type, customer.first_visit]
      );
    }

    // Generate service orders
    const vehicleBrands = ['Toyota', 'Honda', 'Mazda', 'VinFast', 'Mercedes Benz', 'BMW', 'Audi'];
    const vehicleModels = ['Camry', 'Accord', 'CX-5', 'VF3', 'C200', 'X3', 'A4'];
    const sources = ['Tới trực tiếp', 'Zalo', 'Facebook', 'Hotline'];

    for (let i = 1; i <= 500; i++) {
      const orderDate = moment().subtract(Math.floor(Math.random() * 90), 'days');
      const completionDate = orderDate.clone().add(Math.floor(Math.random() * 5) + 1, 'days');
      
      const customerId = Math.floor(Math.random() * 100) + 1;
      const advisorId = Math.floor(Math.random() * 8) + 1;
      const salesStaffId = Math.floor(Math.random() * 8) + 1;

      const orderCode = `BG${String(50000 + i).padStart(5, '0')}`;

      await pool.query(
        `INSERT INTO service_orders (order_code, customer_id, vehicle_brand, vehicle_model, 
         license_plate, advisor_id, sales_staff_id, status, order_date, completion_date, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          orderCode,
          customerId,
          vehicleBrands[Math.floor(Math.random() * vehicleBrands.length)],
          vehicleModels[Math.floor(Math.random() * vehicleModels.length)],
          `30A-${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 99) + 10}`,
          advisorId,
          salesStaffId,
          'done',
          orderDate.format('YYYY-MM-DD'),
          completionDate.format('YYYY-MM-DD'),
          sources[Math.floor(Math.random() * sources.length)]
        ]
      );

      // Generate service details for each order
      const numDetails = Math.floor(Math.random() * 5) + 1; // 1-5 dịch vụ mỗi đơn
      let totalOrderAmount = 0;
      let totalOrderCost = 0;

      for (let j = 0; j < numDetails; j++) {
        const categoryId = Math.floor(Math.random() * 15) + 1;
        const employeeId = Math.floor(Math.random() * 8) + 1;
        
        const products = [
          'Thay dầu động cơ',
          'Bảo dưỡng định kỳ',
          'Sửa chữa phanh',
          'Thay lọc gió',
          'Đồng sơn cản trước',
          'Chăm sóc nội thất',
          'Thay má phanh',
          'Sửa điều hòa',
          'Cân bằng động bánh xe',
          'Thay nhớt hộp số'
        ];

        const quantity = Math.random() * 2 + 0.5; // 0.5 - 2.5
        const unitPrice = Math.floor(Math.random() * 2000000) + 100000; // 100k - 2.1M
        const costPrice = unitPrice * (0.6 + Math.random() * 0.2); // 60-80% của giá bán
        const totalAmount = quantity * unitPrice;
        const totalCost = quantity * costPrice;
        const laborHours = Math.random() * 4 + 0.5; // 0.5 - 4.5 giờ

        totalOrderAmount += totalAmount;
        totalOrderCost += totalCost;

        await pool.query(
          `INSERT INTO service_details (order_id, category_id, employee_id, product_name, 
           quantity, unit_price, cost_price, total_amount, total_cost, labor_hours, type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            i, // order_id corresponds to the loop index
            categoryId,
            employeeId,
            products[Math.floor(Math.random() * products.length)],
            quantity.toFixed(2),
            unitPrice,
            costPrice.toFixed(2),
            totalAmount.toFixed(2),
            totalCost.toFixed(2),
            laborHours.toFixed(2),
            Math.random() > 0.7 ? 'product' : 'service'
          ]
        );
      }

      // Update order totals
      await pool.query(
        `UPDATE service_orders SET total_amount = $1, total_cost = $2 WHERE id = $3`,
        [totalOrderAmount.toFixed(2), totalOrderCost.toFixed(2), i]
      );
    }

    // Generate cost allocations
    const months = ['2025-06', '2025-07', '2025-08'];
    for (const month of months) {
      for (let deptId = 1; deptId <= 4; deptId++) {
        const depreciation = Math.floor(Math.random() * 20000000) + 5000000; // 5-25M
        const managementPlanned = Math.floor(Math.random() * 10000000) + 2000000; // 2-12M
        const managementActual = managementPlanned * (0.9 + Math.random() * 0.2); // 90-110% của kế hoạch
        const otherCosts = Math.floor(Math.random() * 5000000) + 500000; // 0.5-5.5M

        await pool.query(
          `INSERT INTO cost_allocations (department_id, month_year, depreciation, 
           management_planned, management_actual, other_costs)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [deptId, month, depreciation, managementPlanned, managementActual, otherCosts]
        );
      }
    }

    // Generate fact_pnl data
    console.log('Generating fact P&L data...');
    
    // Clear existing fact data
    await pool.query('DELETE FROM fact_pnl');

    const factQuery = `
      INSERT INTO fact_pnl (
        period_date, period_type, department_id, team_id, employee_id, 
        category_id, customer_type, revenue, cogs, labor_cost, 
        material_cost, overhead_cost, gross_profit, labor_hours
      )
      SELECT 
        so.completion_date as period_date,
        'daily' as period_type,
        e.department_id,
        e.team_id,
        sd.employee_id,
        sd.category_id,
        c.type as customer_type,
        sd.total_amount as revenue,
        sd.total_cost as cogs,
        sd.labor_hours * e.hourly_rate as labor_cost,
        sd.total_cost - (sd.labor_hours * e.hourly_rate) as material_cost,
        0 as overhead_cost, -- Will be allocated separately
        sd.total_amount - sd.total_cost as gross_profit,
        sd.labor_hours
      FROM service_details sd
      JOIN service_orders so ON sd.order_id = so.id
      JOIN employees e ON sd.employee_id = e.id
      JOIN customers c ON so.customer_id = c.id
      WHERE so.status = 'done'
    `;

    await pool.query(factQuery);

    console.log('Sample data generated successfully!');
    
  } catch (error) {
    console.error('Error generating sample data:', error);
  } finally {
    await pool.end();
  }
}

generateSampleData();
