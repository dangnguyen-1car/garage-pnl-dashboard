// backend/src/services/pnl.service.js
const db = require('../config/database');

class PnlService {
  async getGaragePnl(from, to, period) {
    const query = `
      SELECT 
        DATE_TRUNC($3, period_date) as period,
        SUM(revenue) as total_revenue,
        SUM(cogs) as total_cogs,
        SUM(labor_cost) as total_labor_cost,
        SUM(material_cost) as total_material_cost,
        SUM(overhead_cost) as total_overhead_cost,
        SUM(gross_profit) as total_gross_profit,
        SUM(labor_hours) as total_labor_hours
      FROM fact_pnl 
      WHERE period_date >= $1::date AND period_date <= $2::date
      GROUP BY DATE_TRUNC($3, period_date)
      ORDER BY period
    `;
    
    const result = await db.query(query, [from, to, period]);
    
    return result.rows.map(row => ({
      period: row.period,
      revenue: parseFloat(row.total_revenue) || 0,
      cogs: parseFloat(row.total_cogs) || 0,
      grossProfit: parseFloat(row.total_gross_profit) || 0,
      grossMargin: row.total_revenue > 0 ? 
        (parseFloat(row.total_gross_profit) / parseFloat(row.total_revenue)) * 100 : 0,
      laborCost: parseFloat(row.total_labor_cost) || 0,
      materialCost: parseFloat(row.total_material_cost) || 0,
      overheadCost: parseFloat(row.total_overhead_cost) || 0,
      laborHours: parseFloat(row.total_labor_hours) || 0
    }));
  }

  async getDepartmentPnl(departmentId, from, to) {
    const query = `
      SELECT 
        d.name as department_name,
        fp.period_date,
        SUM(fp.revenue) as revenue,
        SUM(fp.cogs) as cogs,
        SUM(fp.gross_profit) as gross_profit,
        SUM(fp.labor_hours) as labor_hours,
        SUM(fp.overhead_cost) as overhead_cost,
        d.target_revenue,
        d.target_profit_pct
      FROM fact_pnl fp
      JOIN departments d ON fp.department_id = d.id
      WHERE fp.department_id = $1 
        AND fp.period_date >= $2::date 
        AND fp.period_date <= $3::date
      GROUP BY d.name, fp.period_date, d.target_revenue, d.target_profit_pct
      ORDER BY fp.period_date
    `;
    
    const result = await db.query(query, [departmentId, from, to]);
    
    return result.rows.map(row => ({
      date: row.period_date,
      departmentName: row.department_name,
      revenue: parseFloat(row.revenue) || 0,
      cogs: parseFloat(row.cogs) || 0,
      grossProfit: parseFloat(row.gross_profit) || 0,
      grossMargin: row.revenue > 0 ? 
        (parseFloat(row.gross_profit) / parseFloat(row.revenue)) * 100 : 0,
      laborHours: parseFloat(row.labor_hours) || 0,
      overheadCost: parseFloat(row.overhead_cost) || 0,
      targetRevenue: parseFloat(row.target_revenue) || 0,
      targetProfitPct: parseFloat(row.target_profit_pct) || 0,
      revenueAchievement: row.target_revenue > 0 ? 
        (parseFloat(row.revenue) / parseFloat(row.target_revenue)) * 100 : 0
    }));
  }

  async getServicePnl(serviceId) {
    const query = `
      SELECT 
        so.order_code,
        so.order_date,
        so.completion_date,
        so.total_amount,
        so.total_cost,
        c.name as customer_name,
        c.type as customer_type,
        so.vehicle_brand,
        so.vehicle_model,
        sd.product_name,
        sd.quantity,
        sd.unit_price,
        sd.cost_price,
        sd.total_amount as detail_amount,
        sd.total_cost as detail_cost,
        sd.labor_hours,
        sc.name as category_name,
        e.name as employee_name
      FROM service_orders so
      LEFT JOIN service_details sd ON so.id = sd.order_id
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN service_categories sc ON sd.category_id = sc.id
      LEFT JOIN employees e ON sd.employee_id = e.id
      WHERE so.order_code = $1
      ORDER BY sd.id
    `;
    
    const result = await db.query(query, [serviceId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const serviceData = result.rows[0];
    const details = result.rows.map(row => ({
      productName: row.product_name,
      quantity: parseFloat(row.quantity) || 0,
      unitPrice: parseFloat(row.unit_price) || 0,
      costPrice: parseFloat(row.cost_price) || 0,
      totalAmount: parseFloat(row.detail_amount) || 0,
      totalCost: parseFloat(row.detail_cost) || 0,
      laborHours: parseFloat(row.labor_hours) || 0,
      categoryName: row.category_name,
      employeeName: row.employee_name,
      grossProfit: (parseFloat(row.detail_amount) || 0) - (parseFloat(row.detail_cost) || 0),
      grossMargin: row.detail_amount > 0 ? 
        (((parseFloat(row.detail_amount) || 0) - (parseFloat(row.detail_cost) || 0)) / 
         parseFloat(row.detail_amount)) * 100 : 0
    }));
    
    return {
      orderCode: serviceData.order_code,
      orderDate: serviceData.order_date,
      completionDate: serviceData.completion_date,
      customerName: serviceData.customer_name,
      customerType: serviceData.customer_type,
      vehicleBrand: serviceData.vehicle_brand,
      vehicleModel: serviceData.vehicle_model,
      totalAmount: parseFloat(serviceData.total_amount) || 0,
      totalCost: parseFloat(serviceData.total_cost) || 0,
      grossProfit: (parseFloat(serviceData.total_amount) || 0) - (parseFloat(serviceData.total_cost) || 0),
      grossMargin: serviceData.total_amount > 0 ? 
        (((parseFloat(serviceData.total_amount) || 0) - (parseFloat(serviceData.total_cost) || 0)) / 
         parseFloat(serviceData.total_amount)) * 100 : 0,
      details: details
    };
  }

  async getEmployeePnl(employeeId, from, to) {
    const query = `
      SELECT 
        e.name as employee_name,
        e.code as employee_code,
        e.position,
        e.level,
        d.name as department_name,
        t.name as team_name,
        fp.period_date,
        SUM(fp.revenue) as revenue,
        SUM(fp.cogs) as cogs,
        SUM(fp.gross_profit) as gross_profit,
        SUM(fp.labor_hours) as labor_hours,
        SUM(fp.overhead_cost) as overhead_cost,
        e.hourly_rate,
        e.target_hours_monthly
      FROM fact_pnl fp
      JOIN employees e ON fp.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE fp.employee_id = $1 
        AND fp.period_date >= $2::date 
        AND fp.period_date <= $3::date
      GROUP BY e.id, e.name, e.code, e.position, e.level, d.name, t.name, 
               fp.period_date, e.hourly_rate, e.target_hours_monthly
      ORDER BY fp.period_date
    `;
    
    const result = await db.query(query, [employeeId, from, to]);
    
    return result.rows.map(row => ({
      date: row.period_date,
      employeeName: row.employee_name,
      employeeCode: row.employee_code,
      position: row.position,
      level: row.level,
      departmentName: row.department_name,
      teamName: row.team_name,
      revenue: parseFloat(row.revenue) || 0,
      cogs: parseFloat(row.cogs) || 0,
      grossProfit: parseFloat(row.gross_profit) || 0,
      grossMargin: row.revenue > 0 ? 
        (parseFloat(row.gross_profit) / parseFloat(row.revenue)) * 100 : 0,
      laborHours: parseFloat(row.labor_hours) || 0,
      overheadCost: parseFloat(row.overhead_cost) || 0,
      hourlyRate: parseFloat(row.hourly_rate) || 0,
      targetHours: parseFloat(row.target_hours_monthly) || 0,
      hoursAchievement: row.target_hours_monthly > 0 ? 
        (parseFloat(row.labor_hours) / parseFloat(row.target_hours_monthly)) * 100 : 0,
      laborCost: (parseFloat(row.labor_hours) || 0) * (parseFloat(row.hourly_rate) || 0)
    }));
  }
}

module.exports = new PnlService();
