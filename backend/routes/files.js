const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Upload file (base64 in database)
router.post('/upload', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    const { leadId, fileName, fileType, fileDate, fileData } = req.body;

    if (!leadId || !fileName || !fileType || !fileData) {
      return res.status(400).json({ 
        error: { message: 'leadId, fileName, fileType и fileData са задължителни' } 
      });
    }

    // Validate file type by extension
    const ext = fileName.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      return res.status(400).json({ 
        error: { message: 'Невалиден тип файл. Само PDF и DOCX са позволени.' } 
      });
    }

    // Insert file record with base64 data
    const fileResult = await client.query(
      `INSERT INTO files 
       (lead_id, original_name, type, file_data, file_date, uploaded_by, uploaded_by_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, lead_id, original_name, type, file_date, uploaded_by, uploaded_by_name, created_at`,
      [
        leadId,
        fileName,
        fileType,
        fileData, // base64 string
        fileDate || new Date().toISOString(),
        req.user.id,
        req.user.name
      ]
    );

    // Create timeline event
    await client.query(
      'INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES ($1, $2, $3, $4, $5)',
      [leadId, 'file', req.user.id, req.user.name, `Качен файл: ${fileName}`]
    );

    await client.query('COMMIT');

    res.status(201).json({ file: fileResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Upload file error:', error);
    res.status(500).json({ error: { message: error.message || 'Грешка при качване на файл' } });
  } finally {
    client.release();
  }
});

// Download file
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT original_name, file_data FROM files WHERE id = $1', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Файлът не е намерен' } });
    }

    const file = result.rows[0];

    if (!file.file_data) {
      return res.status(404).json({ error: { message: 'Файлът няма съдържание' } });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(file.file_data, 'base64');
    
    // Determine content type
    const ext = file.original_name.split('.').pop().toLowerCase();
    const contentType = ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: { message: 'Грешка при изтегляне на файл' } });
  }
});

// Get files for lead
router.get('/lead/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;

    const result = await db.query(
      `SELECT id, lead_id, original_name, type, file_date, uploaded_by, uploaded_by_name, created_at 
       FROM files WHERE lead_id = $1 ORDER BY created_at DESC`,
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

    const fileResult = await client.query('SELECT * FROM files WHERE id = $1', [id]);
    if (fileResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: { message: 'File not found' } });
    }

    const file = fileResult.rows[0];

    await client.query('DELETE FROM files WHERE id = $1', [id]);

    await client.query(
      'INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES ($1, $2, $3, $4, $5)',
      [file.lead_id, 'file', req.user.id, req.user.name, `Изтрит файл: ${file.original_name}`]
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
