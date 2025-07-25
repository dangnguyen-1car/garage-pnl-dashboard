// backend/src/services/cost.service.js
const db = require('../config/database');

class CostService {
  async allocateOverheadCosts(monthYear) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get all departments and their cost allocations for the month
      const costQuery = `
        SELECT 
          ca.department_id,
          ca.depreciation,
          ca.management_actual,
          ca.other_costs,
          (ca.depreciation + ca.management_actual + ca.other_costs) as total_overhead
        FROM cost_allocations ca
        WHERE ca.month_year = $1
      `;
      
      const costResult = await client.query(costQuery, [monthYear]);
      
      for (const costRow of costResult.rows) {
        const { department_id, total_overhead } = costRow;
        
        // Get count of transactions for this department in this month
        const countQuery = `
          SELECT COUNT(*) as transaction_count
          FROM fact_pnl 
          WHERE department_id = $1 
            AND DATE_TRUNC('month', period_date) = $2::date
        `;
        
        const countResult = await client.query(countQuery, [
          department_id, 
          `${monthYear}-01`
        ]);
        
        const transactionCount = parseInt(countResult.rows[0].transaction_count);
        
        if (transactionCount > 0) {
          const overheadPerTransaction = parseFloat(total_overhead) / transactionCount;
          
          // Update overhead_cost for all transactions of this department in this month
          const updateQuery = `
            UPDATE fact_pnl 
            SET overhead_cost = $1,
                gross_profit = revenue - cogs - $1
            WHERE department_id = $2 
              AND DATE_TRUNC('month', period_date) = $3::date
          `;
          
          await client.query(updateQuery, [
            overheadPerTransaction,
            department_id,
            `${monthYear}-01`
          ]);
        }
      }
      
      await client.query('COMMIT');
      
      return {
        success: true,
        message: `Overhead costs allocated successfully for ${monthYear}`,
        allocatedDepartments: costResult.rows.length
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCostAllocationSummary(monthYear) {
    const query = `
      SELECT 
        d.name as department_name,
        ca.depreciation,
        ca.management_planned,
        ca.management_actual,
        ca.other_costs,
        (ca.depreciation + ca.management_actual + ca.other_costs) as total_allocated,
        COUNT(fp.id) as transaction_count,
        SUM(fp.overhead_cost) as total_overhead_allocated
      FROM cost_allocations ca
      JOIN departments d ON ca.department_id = d.id
      LEFT JOIN fact_pnl fp ON ca.department_id = fp.department_id 
        AND DATE_TRUNC('month', fp.period_date) = $1::date
      WHERE ca.month_year = $2
      GROUP BY d.name, ca.depreciation, ca.management_planned, 
               ca.management_actual, ca.other_costs
      ORDER BY d.name
    `;
    
    const result = await db.query(query, [`${monthYear}-01`, monthYear]);
    
    return result.rows.map(row => ({
      departmentName: row.department_name,
      depreciation: parseFloat(row.depreciation) || 0,
      managementPlanned: parseFloat(row.management_planned) || 0,
      managementActual: parseFloat(row.management_actual) || 0,
      otherCosts: parseFloat(row.other_costs) || 0,
      totalAllocated: parseFloat(row.total_allocated) || 0,
      transactionCount: parseInt(row.transaction_count) || 0,
      totalOverheadAllocated: parseFloat(row.total_overhead_allocated) || 0,
      allocationVariance: (parseFloat(row.total_allocated) || 0) - (parseFloat(row.total_overhead_allocated) || 0)
    }));
  }
}

module.exports = new CostService();
