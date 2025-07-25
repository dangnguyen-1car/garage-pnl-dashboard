const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/kpi/employee/:id - KPI nhân viên
router.get('/employee/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    const db = req.app.locals.db;
    
    // Validate parameters
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid employee ID is required'
      });
    }

    const query = `
      SELECT 
        e.name as employee_name,
        e.code as employee_code,
        e.target_hours_monthly,
        e.hourly_rate,
        d.name as department_name,
        t.name as team_name,
        SUM(fp.labor_hours) as actual_hours,
        SUM(fp.revenue) as total_revenue,
        COUNT(DISTINCT fp.id) as total_tasks,
        AVG(fp.labor_hours) as avg_hours_per_task
      FROM employees e
      LEFT JOIN fact_pnl fp ON e.id = fp.employee_id 
        AND fp.period_date >= $2::date 
        AND fp.period_date <= $3::date
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE e.id = $1
      GROUP BY e.id, e.name, e.code, e.target_hours_monthly, e.hourly_rate, d.name, t.name
    `;
    
    const result = await db.query(query, [parseInt(id), from, to]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const employee = result.rows[0];
    const actualHours = parseFloat(employee.actual_hours) || 0;
    const targetHours = parseFloat(employee.target_hours_monthly) || 0;
    
    res.json({
      success: true,
      data: {
        employeeName: employee.employee_name,
        employeeCode: employee.employee_code,
        departmentName: employee.department_name,
        teamName: employee.team_name,
        targetHours: targetHours,
        actualHours: actualHours,
        hoursAchievement: targetHours > 0 ? (actualHours / targetHours) * 100 : 0,
        totalRevenue: parseFloat(employee.total_revenue) || 0,
        totalTasks: parseInt(employee.total_tasks) || 0,
        avgHoursPerTask: parseFloat(employee.avg_hours_per_task) || 0,
        hourlyRate: parseFloat(employee.hourly_rate) || 0,
        efficiency: actualHours > 0 ? (parseInt(employee.total_tasks) || 0) / actualHours : 0
      }
    });
  } catch (error) {
    console.error('Error in employee KPI:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/kpi/department/:id - KPI bộ phận
router.get('/department/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    const db = req.app.locals.db;
    
    const query = `
      SELECT 
        d.name as department_name,
        d.target_revenue,
        d.target_profit_pct,
        SUM(fp.revenue) as actual_revenue,
        SUM(fp.gross_profit) as actual_profit,
        SUM(fp.labor_hours) as total_hours,
        COUNT(DISTINCT fp.employee_id) as active_employees,
        COUNT(DISTINCT fp.id) as total_transactions
      FROM departments d
      LEFT JOIN fact_pnl fp ON d.id = fp.department_id 
        AND fp.period_date >= $2::date 
        AND fp.period_date <= $3::date
      WHERE d.id = $1
      GROUP BY d.id, d.name, d.target_revenue, d.target_profit_pct
    `;
    
    const result = await db.query(query, [parseInt(id), from, to]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const dept = result.rows[0];
    const actualRevenue = parseFloat(dept.actual_revenue) || 0;
    const actualProfit = parseFloat(dept.actual_profit) || 0;
    const targetRevenue = parseFloat(dept.target_revenue) || 0;
    
    res.json({
      success: true,
      data: {
        departmentName: dept.department_name,
        targetRevenue: targetRevenue,
        actualRevenue: actualRevenue,
        revenueAchievement: targetRevenue > 0 ? (actualRevenue / targetRevenue) * 100 : 0,
        targetProfitPct: parseFloat(dept.target_profit_pct) || 0,
        actualProfitPct: actualRevenue > 0 ? (actualProfit / actualRevenue) * 100 : 0,
        totalHours: parseFloat(dept.total_hours) || 0,
        activeEmployees: parseInt(dept.active_employees) || 0,
        totalTransactions: parseInt(dept.total_transactions) || 0,
        avgRevenuePerHour: dept.total_hours > 0 ? actualRevenue / parseFloat(dept.total_hours) : 0
      }
    });
  } catch (error) {
    console.error('Error in department KPI:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/kpi/labor - Tổng quan sử dụng giờ công
router.get('/labor', async (req, res) => {
  try {
    const { from, to } = req.query;
    const db = req.app.locals.db;
    
    const query = `
      SELECT 
        d.name as department_name,
        SUM(e.target_hours_monthly) as target_total_hours,
        SUM(fp.labor_hours) as actual_total_hours,
        COUNT(DISTINCT e.id) as total_employees,
        AVG(fp.labor_hours) as avg_hours_per_employee
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      LEFT JOIN fact_pnl fp ON e.id = fp.employee_id 
        AND fp.period_date >= $1::date 
        AND fp.period_date <= $2::date
      GROUP BY d.id, d.name
      ORDER BY d.name
    `;
    
    const result = await db.query(query, [from, to]);
    
    const laborData = result.rows.map(row => ({
      departmentName: row.department_name,
      targetHours: parseFloat(row.target_total_hours) || 0,
      actualHours: parseFloat(row.actual_total_hours) || 0,
      utilization: row.target_total_hours > 0 ? 
        (parseFloat(row.actual_total_hours) / parseFloat(row.target_total_hours)) * 100 : 0,
      totalEmployees: parseInt(row.total_employees) || 0,
      avgHoursPerEmployee: parseFloat(row.avg_hours_per_employee) || 0
    }));

    res.json({
      success: true,
      data: laborData
    });
  } catch (error) {
    console.error('Error in labor KPI:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
