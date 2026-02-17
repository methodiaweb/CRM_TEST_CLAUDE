const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Get notifications for current user
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, l.name as lead_name 
       FROM notifications n
       LEFT JOIN leads l ON n.lead_id = l.id
       WHERE n.user_id = $1 
       ORDER BY n.created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: { message: 'Failed to get notifications' } });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: { message: 'Failed to mark notification as read' } });
  }
});

// Mark all as read
router.patch('/all/read', async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: { message: 'Failed to mark all as read' } });
  }
});

module.exports = router;
