// backend/src/routes/costs.js (Updated)
const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const costService = require('../services/cost.service');

// Apply authentication middleware
router.use(authMiddleware);

// POST /api/costs/allocate - Phân bổ chi phí overhead
router.post('/allocate', authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { month_year } = req.body;
    
    // Validate month_year format (YYYY-MM)
    const monthYearRegex = /^\d{4}-\d{2}$/;
    if (!month_year || !monthYearRegex.test(month_year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month_year format. Expected: YYYY-MM (e.g., 2025-07)'
      });
    }

    const result = await costService.allocateOverheadCosts(month_year);
    
    res.json(result);
  } catch (error) {
    console.error('Error allocating costs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to allocate overhead costs',
      error: error.message
    });
  }
});

// GET /api/costs/allocation-summary - Tóm tắt phân bổ chi phí
router.get('/allocation-summary', async (req, res) => {
  try {
    const { month_year } = req.query;
    
    if (!month_year) {
      return res.status(400).json({
        success: false,
        message: 'month_year parameter is required'
      });
    }

    const summary = await costService.getCostAllocationSummary(month_year);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting allocation summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cost allocation summary',
      error: error.message
    });
  }
});

module.exports = router;
