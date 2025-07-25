const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/reports/summary - Báo cáo tổng hợp
router.get('/summary', async (req, res) => {
  try {
    const { from, to } = req.query;
    const db = req.app.locals.db;
    
    // Validate date parameters
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Both from and to dates are required'
      });
    }

    const query = `
      SELECT 
        DATE_TRUNC('month', period_date) as month,
        SUM(revenue) as total_revenue,
        SUM(cogs) as total_cogs,
        SUM(gross_profit) as total_gross_profit,
        SUM(labor_hours) as total_labor_hours,
        COUNT(DISTINCT employee_id) as active_employees,
        COUNT(*) as total_transactions
      FROM fact_pnl 
      WHERE period_date >= $1::date AND period_date <= $2::date
      GROUP BY DATE_TRUNC('month', period_date)
      ORDER BY month
    `;
    
    const result = await db.query(query, [from, to]);
    
    const summaryData = result.rows.map(row => ({
      month: row.month,
      totalRevenue: parseFloat(row.total_revenue) || 0,
      totalCogs: parseFloat(row.total_cogs) || 0,
      totalGrossProfit: parseFloat(row.total_gross_profit) || 0,
      grossMargin: row.total_revenue > 0 ? 
        (parseFloat(row.total_gross_profit) / parseFloat(row.total_revenue)) * 100 : 0,
      totalLaborHours: parseFloat(row.total_labor_hours) || 0,
      activeEmployees: parseInt(row.active_employees) || 0,
      totalTransactions: parseInt(row.total_transactions) || 0
    }));

    res.json({
      success: true,
      data: summaryData
    });
  } catch (error) {
    console.error('Error in summary report:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/reports/performance - Báo cáo hiệu suất
router.get('/performance', authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { from, to, department_id } = req.query;
    const db = req.app.locals.db;
    
    let whereClause = 'WHERE fp.period_date >= $1::date AND fp.period_date <= $2::date';
    let params = [from, to];
    
    if (department_id) {
      whereClause += ' AND fp.department_id = $3';
      params.push(department_id);
    }

    const query = `
      SELECT 
        e.name as employee_name,
        e.code as employee_code,
        d.name as department_name,
        t.name as team_name,
        SUM(fp.revenue) as total_revenue,
        SUM(fp.gross_profit) as total_profit,
        SUM(fp.labor_hours) as total_hours,
        COUNT(*) as total_tasks,
        AVG(fp.revenue / NULLIF(fp.labor_hours, 0)) as revenue_per_hour
      FROM fact_pnl fp
      JOIN employees e ON fp.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      ${whereClause}
      GROUP BY e.id, e.name, e.code, d.name, t.name
      ORDER BY total_revenue DESC
    `;
    
    const result = await db.query(query, params);
    
    const performanceData = result.rows.map(row => ({
      employeeName: row.employee_name,
      employeeCode: row.employee_code,
      departmentName: row.department_name,
      teamName: row.team_name,
      totalRevenue: parseFloat(row.total_revenue) || 0,
      totalProfit: parseFloat(row.total_profit) || 0,
      totalHours: parseFloat(row.total_hours) || 0,
      totalTasks: parseInt(row.total_tasks) || 0,
      revenuePerHour: parseFloat(row.revenue_per_hour) || 0,
      profitMargin: row.total_revenue > 0 ? 
        (parseFloat(row.total_profit) / parseFloat(row.total_revenue)) * 100 : 0
    }));

    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Error in performance report:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/reports/export - Export dữ liệu
router.get('/export', authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { from, to, type = 'summary' } = req.query;
    const db = req.app.locals.db;
    
    let query;
    let filename;
    
    switch (type) {
      case 'pnl':
        query = `
          SELECT 
            so.order_code,
            so.order_date,
            c.name as customer_name,
            c.type as customer_type,
            so.vehicle_brand,
            so.vehicle_model,
            so.total_amount,
            so.total_cost,
            (so.total_amount - so.total_cost) as gross_profit
          FROM service_orders so
          LEFT JOIN customers c ON so.customer_id = c.id
          WHERE so.completion_date >= $1::date AND so.completion_date <= $2::date
          ORDER BY so.completion_date DESC
        `;
        filename = `pnl_report_${from}_${to}.csv`;
        break;
        
      case 'employee':
        query = `
          SELECT 
            e.code as employee_code,
            e.name as employee_name,
            d.name as department_name,
            SUM(fp.revenue) as total_revenue,
            SUM(fp.labor_hours) as total_hours
          FROM fact_pnl fp
          JOIN employees e ON fp.employee_id = e.id
          JOIN departments d ON e.department_id = d.id
          WHERE fp.period_date >= $1::date AND fp.period_date <= $2::date
          GROUP BY e.id, e.code, e.name, d.name
          ORDER BY total_revenue DESC
        `;
        filename = `employee_report_${from}_${to}.csv`;
        break;
        
      default:
        query = `
          SELECT 
            period_date,
            SUM(revenue) as revenue,
            SUM(cogs) as cogs,
            SUM(gross_profit) as gross_profit
          FROM fact_pnl 
          WHERE period_date >= $1::date AND period_date <= $2::date
          GROUP BY period_date
          ORDER BY period_date
        `;
        filename = `summary_report_${from}_${to}.csv`;
    }
    
    const result = await db.query(query, [from, to]);
    
    // Convert to CSV format
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found for the specified period'
      });
    }
    
    const headers = Object.keys(result.rows[0]);
    let csv = headers.join(',') + '\n';
    
    result.rows.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csv += values.join(',') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error in export report:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
