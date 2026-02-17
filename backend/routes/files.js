const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Add file (for now just metadata, actual file upload can be added later)
router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    const { leadId, name, type } = req.body;

    if (!leadId || !name || !type) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    // Insert file
    const fileResult = await client.query(
      'INSERT INTO files (lead_id, name, type, uploaded_by, uploaded_by_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [leadId, name, type, req.user.id, req.user.name]
    );

    // Create timeline event
    await client.query(
      'INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES ($1, $2, $3, $4, $5)',
      [leadId, 'file', req.user.id, req.user.name, `Качен файл: ${name}`]
    );

    await client.query('COMMIT');

    res.status(201).json({ file: fileResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add file error:', error);
    res.status(500).json({ error: { message: 'Failed to add file' } });
  } finally {
    client.release();
  }
});

// Get files for lead
router.get('/lead/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;

    const result = await db.query(
      'SELECT * FROM files WHERE lead_id = $1 ORDER BY created_at DESC',
      [leadId]
    );

    res.json({ files: result.rows });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: { message: 'Failed to get files' } });
  }
});

// Delete file
router.delete('/:id', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Get file info
    const fileResult = await client.query('SELECT * FROM files WHERE id = $1', [id]);
    if (fileResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: { message: 'File not found' } });
    }

    const file = fileResult.rows[0];

    // Delete file
    await client.query('DELETE FROM files WHERE id = $1', [id]);

    // Create timeline event
    await client.query(
      'INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES ($1, $2, $3, $4, $5)',
      [file.lead_id, 'file', req.user.id, req.user.name, `Изтрит файл: ${file.name}`]
    );

    await client.query('COMMIT');

    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete file error:', error);
    res.status(500).json({ error: { message: 'Failed to delete file' } });
  } finally {
    client.release();
  }
});

module.exports = router;
