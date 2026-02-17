const express = require('express');
const db = require('../config/database');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all leads (filtered by role)
router.get('/', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        l.*,
        json_build_object(
          'person', lc.person,
          'email', lc.email,
          'phone', lc.phone
        ) as contact,
        json_build_object(
          'eik', lcomp.eik,
          'mol', lcomp.mol,
          'address', lcomp.address
        ) as company,
        u.name as assigned_to_name
      FROM leads l
      LEFT JOIN lead_contacts lc ON l.id = lc.lead_id
      LEFT JOIN lead_companies lcomp ON l.id = lcomp.lead_id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Role-based filtering
    if (userRole === 'sales') {
      query += ` AND l.assigned_to = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    // Status filter
    if (status && status !== 'all') {
      query += ` AND l.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Type filter
    if (type && type !== 'all') {
      query += ` AND l.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    // Search
    if (search) {
      query += ` AND (l.name ILIKE $${paramCount} OR lc.email ILIKE $${paramCount} OR lc.phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY l.created_at DESC';

    const result = await db.query(query, params);

    // Get timeline and files for each lead
    const leadsWithDetails = await Promise.all(
      result.rows.map(async (lead) => {
        const timelineResult = await db.query(
          'SELECT * FROM timeline_events WHERE lead_id = $1 ORDER BY created_at ASC',
          [lead.id]
        );

        const filesResult = await db.query(
          'SELECT * FROM files WHERE lead_id = $1 ORDER BY created_at DESC',
          [lead.id]
        );

        return {
          ...lead,
          timeline: timelineResult.rows,
          files: filesResult.rows,
          assignedTo: lead.assigned_to
        };
      })
    );

    res.json({ leads: leadsWithDetails });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: { message: 'Failed to get leads' } });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await db.query(
      `
      SELECT 
        l.*,
        json_build_object(
          'person', lc.person,
          'email', lc.email,
          'phone', lc.phone
        ) as contact,
        json_build_object(
          'eik', lcomp.eik,
          'mol', lcomp.mol,
          'address', lcomp.address
        ) as company
      FROM leads l
      LEFT JOIN lead_contacts lc ON l.id = lc.lead_id
      LEFT JOIN lead_companies lcomp ON l.id = lcomp.lead_id
      WHERE l.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Lead not found' } });
    }

    const lead = result.rows[0];

    // Check permissions
    if (userRole === 'sales' && lead.assigned_to !== userId) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    // Get timeline
    const timelineResult = await db.query(
      'SELECT * FROM timeline_events WHERE lead_id = $1 ORDER BY created_at ASC',
      [id]
    );

    // Get files
    const filesResult = await db.query(
      'SELECT * FROM files WHERE lead_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      lead: {
        ...lead,
        timeline: timelineResult.rows,
        files: filesResult.rows,
        assignedTo: lead.assigned_to
      }
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: { message: 'Failed to get lead' } });
  }
});

// Create lead
router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      name,
      type,
      status,
      source,
      region,
      value,
      assignedTo,
      contact,
      company
    } = req.body;

    // Create lead
    const leadResult = await client.query(
      `INSERT INTO leads (name, type, status, source_level1, source_level2, region, value, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, type, status || 'new', source.level1, source.level2, region, value || 0, assignedTo, req.user.id]
    );

    const lead = leadResult.rows[0];

    // Create contact
    await client.query(
      'INSERT INTO lead_contacts (lead_id, person, email, phone) VALUES ($1, $2, $3, $4)',
      [lead.id, contact.person, contact.email, contact.phone]
    );

    // Create company info if B2B
    if (type === 'B2B' && company) {
      await client.query(
        'INSERT INTO lead_companies (lead_id, eik, mol, address) VALUES ($1, $2, $3, $4)',
        [lead.id, company.eik, company.mol, company.address]
      );
    }

    // Create timeline event
    await client.query(
      'INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES ($1, $2, $3, $4, $5)',
      [lead.id, 'created', req.user.id, req.user.name, 'Лийд създаден']
    );

    // If assigned, create assignment event
    if (assignedTo) {
      const assignedUserResult = await client.query('SELECT name FROM users WHERE id = $1', [assignedTo]);
      if (assignedUserResult.rows.length > 0) {
        await client.query(
          'INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES ($1, $2, $3, $4, $5)',
          [lead.id, 'assigned', req.user.id, req.user.name, `Назначен на ${assignedUserResult.rows[0].name}`]
        );
      }
    }

    await client.query('COMMIT');

    // Fetch complete lead
    const completeLeadResult = await db.query(
      `
      SELECT 
        l.*,
        json_build_object(
          'person', lc.person,
          'email', lc.email,
          'phone', lc.phone
        ) as contact,
        json_build_object(
          'eik', lcomp.eik,
          'mol', lcomp.mol,
          'address', lcomp.address
        ) as company
      FROM leads l
      LEFT JOIN lead_contacts lc ON l.id = lc.lead_id
      LEFT JOIN lead_companies lcomp ON l.id = lcomp.lead_id
      WHERE l.id = $1
      `,
      [lead.id]
    );

    const timelineResult = await db.query(
      'SELECT * FROM timeline_events WHERE lead_id = $1 ORDER BY created_at ASC',
      [lead.id]
    );

    res.status(201).json({
      lead: {
        ...completeLeadResult.rows[0],
        timeline: timelineResult.rows,
        files: [],
        assignedTo: completeLeadResult.rows[0].assigned_to
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create lead error:', error);
    res.status(500).json({ error: { message: 'Failed to create lead' } });
  } finally {
    client.release();
  }
});

// Update lead status
router.patch('/:id/status', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status } = req.body;

    // Get current status
    const currentResult = await client.query('SELECT status FROM leads WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: { message: 'Lead not found' } });
    }

    const oldStatus = currentResult.rows[0].status;

    // Update status
    await client.query('UPDATE leads SET status = $1 WHERE id = $2', [status, id]);

    // Status labels
    const statuses = {
      new: 'Нов',
      contacted: 'Контактуван',
      offer_sent: 'Оферта изпратена',
      negotiation: 'Преговори',
      won: 'Спечелен',
      lost: 'Загубен'
    };

    // Create timeline event
    await client.query(
      'INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES ($1, $2, $3, $4, $5)',
      [id, 'status_change', req.user.id, req.user.name, `Статус променен от "${statuses[oldStatus]}" на "${statuses[status]}"`]
    );

    await client.query('COMMIT');

    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update status error:', error);
    res.status(500).json({ error: { message: 'Failed to update status' } });
  } finally {
    client.release();
  }
});

// Add comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: { message: 'Comment cannot be empty' } });
    }

    await db.query(
      'INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES ($1, $2, $3, $4, $5)',
      [id, 'comment', req.user.id, req.user.name, comment]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: { message: 'Failed to add comment' } });
  }
});

// Get statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = 'SELECT status, type, value FROM leads WHERE 1=1';
    const params = [];

    if (userRole === 'sales') {
      query += ' AND assigned_to = $1';
      params.push(userId);
    }

    const result = await db.query(query, params);
    const leads = result.rows;

    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      active: leads.filter(l => !['won', 'lost'].includes(l.status)).length,
      won: leads.filter(l => l.status === 'won').length,
      lost: leads.filter(l => l.status === 'lost').length,
      totalValue: leads.reduce((sum, l) => sum + parseFloat(l.value || 0), 0),
      wonValue: leads.filter(l => l.status === 'won').reduce((sum, l) => sum + parseFloat(l.value || 0), 0),
      conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'won').length / leads.length) * 100) : 0
    };

    // Status distribution
    const statusData = [
      { status: 'Нов', count: leads.filter(l => l.status === 'new').length },
      { status: 'Контактуван', count: leads.filter(l => l.status === 'contacted').length },
      { status: 'Оферта изпратена', count: leads.filter(l => l.status === 'offer_sent').length },
      { status: 'Преговори', count: leads.filter(l => l.status === 'negotiation').length },
      { status: 'Спечелен', count: leads.filter(l => l.status === 'won').length },
      { status: 'Загубен', count: leads.filter(l => l.status === 'lost').length }
    ];

    // Type distribution
    const typeData = [
      { type: 'B2B', count: leads.filter(l => l.type === 'B2B').length },
      { type: 'B2C', count: leads.filter(l => l.type === 'B2C').length }
    ];

    res.json({
      stats,
      charts: {
        statusData,
        typeData
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: { message: 'Failed to get statistics' } });
  }
});

module.exports = router;
