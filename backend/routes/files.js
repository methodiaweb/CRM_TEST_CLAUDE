const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter - only PDF and DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Невалиден тип файл. Само PDF и DOCX са позволени.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

router.use(auth);

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'Няма качен файл' } });
    }

    await client.query('BEGIN');

    const { leadId, fileType, fileDate } = req.body;

    if (!leadId || !fileType) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: { message: 'leadId и fileType са задължителни' } });
    }

    // Insert file record
    const fileResult = await client.query(
      `INSERT INTO files 
       (lead_id, name, original_name, type, file_path, file_date, uploaded_by, uploaded_by_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        leadId,
        req.file.filename,
        req.file.originalname,
        fileType,
        req.file.path,
        fileDate || new Date().toISOString(),
        req.user.id,
        req.user.name
      ]
    );

    // Create timeline event
    await client.query(
      'INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES ($1, $2, $3, $4, $5)',
      [leadId, 'file', req.user.id, req.user.name, `Качен файл: ${req.file.originalname}`]
    );

    await client.query('COMMIT');

    res.status(201).json({ file: fileResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
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

    const result = await db.query('SELECT * FROM files WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Файлът не е намерен' } });
    }

    const file = result.rows[0];

    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: { message: 'Физическият файл не съществува' } });
    }

    res.download(file.file_path, file.original_name || file.name);
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

    // Delete physical file
    if (file.file_path && fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    // Delete database record
    await client.query('DELETE FROM files WHERE id = $1', [id]);

    // Create timeline event
    await client.query(
      'INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES ($1, $2, $3, $4, $5)',
      [file.lead_id, 'file', req.user.id, req.user.name, `Изтрит файл: ${file.original_name || file.name}`]
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
