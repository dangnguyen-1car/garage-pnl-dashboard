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

// ✨ THÊM MỚI: GET /api/pnl/team/:id - P&L theo team
router.get('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    
    // Validate parameters
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid team ID is required'
      });
    }

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Both from and to dates are required'
      });
    }

    const teamData = await pnlService.getTeamPnl(parseInt(id), from, to);
    
    res.json({
      success: true,
      data: teamData
    });
  } catch (error) {
    console.error('Error in team P&L:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// ✨ THÊM MỚI: GET /api/pnl/department/:id/teams - Lấy danh sách teams theo department
router.get('/department/:id/teams', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid department ID is required'
      });
    }

    const teams = await pnlService.getTeamsByDepartment(parseInt(id));
    
    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Error getting teams by department:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// ✨ THÊM MỚI: GET /api/pnl/team/:id/employees - Lấy danh sách employees theo team
router.get('/team/:id/employees', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid team ID is required'
      });
    }

    const employees = await pnlService.getEmployeesByTeam(parseInt(id));
    
    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error getting employees by team:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// ✨ THÊM MỚI: GET /api/pnl/employee/:id/orders - Lấy danh sách orders theo employee
router.get('/employee/:id/orders', authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    
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

    const orders = await pnlService.getServiceOrdersByEmployee(parseInt(id), from, to);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error getting orders by employee:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;