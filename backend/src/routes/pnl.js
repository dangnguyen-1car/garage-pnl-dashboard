// backend/src/routes/pnl.js (Updated with security fixes)
const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const pnlService = require('../services/pnl.service');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Whitelist for period validation
const VALID_PERIODS = ['daily', 'monthly', 'yearly'];

// GET /api/pnl/garage - P&L tổng thể garage
router.get('/garage', async (req, res) => {
  try {
    const { from, to, period = 'monthly' } = req.query;
    
    // Validate period parameter (fix SQL injection vulnerability)
    if (!VALID_PERIODS.includes(period)) {
      return res.status(400).json({
        success: false,
        message: `Invalid period. Allowed values: ${VALID_PERIODS.join(', ')}`
      });
    }

    // Validate date parameters
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Both from and to dates are required'
      });
    }

    const pnlData = await pnlService.getGaragePnl(from, to, period);
    
    res.json({
      success: true,
      data: pnlData
    });
  } catch (error) {
    console.error('Error in garage P&L:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/pnl/department/:id - P&L theo bộ phận
router.get('/department/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    
    // Validate parameters
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid department ID is required'
      });
    }

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Both from and to dates are required'
      });
    }

    const pnlData = await pnlService.getDepartmentPnl(parseInt(id), from, to);
    
    res.json({
      success: true,
      data: pnlData
    });
  } catch (error) {
    console.error('Error in department P&L:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/pnl/service/:id - P&L theo đơn dịch vụ
router.get('/service/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    const serviceData = await pnlService.getServicePnl(id);
    
    if (!serviceData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }
    
    res.json({
      success: true,
      data: serviceData
    });
  } catch (error) {
    console.error('Error in service P&L:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/pnl/employee/:id - P&L theo nhân viên
router.get('/employee/:id', authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    
    // Validate parameters
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid employee ID is required'
      });
    }

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Both from and to dates are required'
      });
    }

    const employeeData = await pnlService.getEmployeePnl(parseInt(id), from, to);
    
    res.json({
      success: true,
      data: employeeData
    });
  } catch (error) {
    console.error('Error in employee P&L:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
