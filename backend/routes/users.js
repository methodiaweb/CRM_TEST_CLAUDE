const express = require('express');
const db = require('../config/database');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Get all users (admin/manager only)
router.get('/', checkRole('admin', 'manager'), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, region, created_at FROM users ORDER BY name'
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: { message: 'Failed to get users' } });
  }
});

// Get sales performance (manager/admin only)
router.get('/performance', checkRole('admin', 'manager'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.region,
        COUNT(l.id) as total_leads,
        COUNT(CASE WHEN l.status = 'won' THEN 1 END) as won_leads,
        SUM(CASE WHEN l.status = 'won' THEN l.value ELSE 0 END) as total_value
      FROM users u
      LEFT JOIN leads l ON u.id = l.assigned_to
      WHERE u.role = 'sales'
      GROUP BY u.id, u.name, u.region
      ORDER BY total_value DESC
    `);

    res.json({ performance: result.rows });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({ error: { message: 'Failed to get performance data' } });
  }
});

module.exports = router;
