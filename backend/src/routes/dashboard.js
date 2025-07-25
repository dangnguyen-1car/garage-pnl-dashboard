// backend/src/routes/dashboard.js
const express = require('express');
const router = express.Router();

// GET /api/dashboard/overview - Tổng quan dashboard
router.get('/overview', async (req, res) => {
  try {
    const { period = 'this_month' } = req.query;
    const db = req.app.locals.db;
    
    // Tính toán period dates
    let startDate, endDate;
    const now = new Date();
    
    if (period === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }
    
    // P&L Summary
    const pnlQuery = `
      SELECT 
        SUM(revenue) as total_revenue,
        SUM(cogs) as total_cogs,
        SUM(gross_profit) as total_gross_profit,
        SUM(labor_hours) as total_labor_hours
      FROM fact_pnl 
      WHERE period_date >= $1 AND period_date <= $2
    `;
    
    const pnlResult = await db.query(pnlQuery, [startDate, endDate]);
    
    // Department Performance
    const deptQuery = `
      SELECT 
        d.name,
        d.target_revenue,
        SUM(fp.revenue) as actual_revenue,
        SUM(fp.gross_profit) as gross_profit,
        CASE WHEN SUM(fp.revenue) > 0 THEN (SUM(fp.gross_profit) / SUM(fp.revenue)) * 100 ELSE 0 END as gross_margin
      FROM departments d
      LEFT JOIN fact_pnl fp ON d.id = fp.department_id 
        AND fp.period_date >= $1 AND fp.period_date <= $2
      GROUP BY d.id, d.name, d.target_revenue
      ORDER BY actual_revenue DESC
    `;
    
    const deptResult = await db.query(deptQuery, [startDate, endDate]);
    
    // Customer Type Revenue
    const customerQuery = `
      SELECT 
        customer_type,
        SUM(revenue) as revenue,
        COUNT(*) as order_count
      FROM fact_pnl 
      WHERE period_date >= $1 AND period_date <= $2 AND customer_type IS NOT NULL
      GROUP BY customer_type
    `;
    
    const customerResult = await db.query(customerQuery, [startDate, endDate]);
    
    // Category Revenue
    const categoryQuery = `
      SELECT 
        sc.name as category_name,
        SUM(fp.revenue) as revenue,
        SUM(fp.gross_profit) as gross_profit
      FROM fact_pnl fp
      JOIN service_categories sc ON fp.category_id = sc.id
      WHERE fp.period_date >= $1 AND fp.period_date <= $2
      GROUP BY sc.id, sc.name
      ORDER BY revenue DESC
    `;
    
    const categoryResult = await db.query(categoryQuery, [startDate, endDate]);
    
    const pnlSummary = pnlResult.rows[0];
    const totalRevenue = parseFloat(pnlSummary.total_revenue) || 0;
    
    res.json({
      success: true,
      data: {
        period: period,
        startDate: startDate,
        endDate: endDate,
        summary: {
          totalRevenue: totalRevenue,
          totalCogs: parseFloat(pnlSummary.total_cogs) || 0,
          grossProfit: parseFloat(pnlSummary.total_gross_profit) || 0,
          grossMargin: totalRevenue > 0 ? ((parseFloat(pnlSummary.total_gross_profit) || 0) / totalRevenue) * 100 : 0,
          totalLaborHours: parseFloat(pnlSummary.total_labor_hours) || 0
        },
        departmentPerformance: deptResult.rows.map(row => ({
          name: row.name,
          targetRevenue: parseFloat(row.target_revenue) || 0,
          actualRevenue: parseFloat(row.actual_revenue) || 0,
          grossProfit: parseFloat(row.gross_profit) || 0,
          grossMargin: parseFloat(row.gross_margin) || 0,
          achievement: row.target_revenue > 0 ? ((parseFloat(row.actual_revenue) || 0) / parseFloat(row.target_revenue)) * 100 : 0
        })),
        customerTypeRevenue: customerResult.rows.map(row => ({
          type: row.customer_type,
          revenue: parseFloat(row.revenue) || 0,
          orderCount: parseInt(row.order_count) || 0,
          percentage: totalRevenue > 0 ? ((parseFloat(row.revenue) || 0) / totalRevenue) * 100 : 0
        })),
        categoryRevenue: categoryResult.rows.map(row => ({
          name: row.category_name,
          revenue: parseFloat(row.revenue) || 0,
          grossProfit: parseFloat(row.gross_profit) || 0,
          percentage: totalRevenue > 0 ? ((parseFloat(row.revenue) || 0) / totalRevenue) * 100 : 0
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
