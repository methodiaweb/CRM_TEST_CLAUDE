const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing database...');

    // Read and execute schema
    const fs = require('fs');
    const schemaSQL = fs.readFileSync(__dirname + '/../database/schema.sql', 'utf8');
    await client.query(schemaSQL);

    console.log('✅ Schema created');

    // Hash password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Insert users with proper hashed passwords
    console.log('👥 Creating users...');
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, region) VALUES
      ('Админ', 'admin@company.com', $1, 'admin', 'Всички'),
      ('Иван Петров', 'ivan@company.com', $1, 'manager', 'София'),
      ('Мария Георгиева', 'maria@company.com', $1, 'sales', 'Пловдив'),
      ('Георги Димитров', 'georgi@company.com', $1, 'sales', 'Варна'),
      ('Елена Костова', 'elena@company.com', $1, 'sales', 'София')
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash]);

    console.log('✅ Users created (password for all: password123)');

    // Insert sample leads
    console.log('📊 Creating sample leads...');
    
    const leadData = [
      {
        name: 'Софтех ЕООД',
        type: 'B2B',
        status: 'won',
        source: ['Онлайн', 'Уебсайт'],
        region: 'София',
        value: 25000,
        contact: { person: 'Петър Иванов', email: 'contact@softech.bg', phone: '0888123456' },
        company: { eik: '123456789', mol: 'Петър Иванов', address: 'София, ул. Витоша 1' }
      },
      {
        name: 'Мега Маркет АД',
        type: 'B2B',
        status: 'offer_sent',
        source: ['Препоръка', 'Клиент'],
        region: 'Пловдив',
        value: 18000,
        contact: { person: 'Стефан Димов', email: 'sales@megamarket.bg', phone: '0877111222' },
        company: { eik: '987654321', mol: 'Стефан Димов', address: 'Пловдив, бул. Руски 45' }
      },
      {
        name: 'Иван Стоянов',
        type: 'B2C',
        status: 'contacted',
        source: ['Онлайн', 'Facebook'],
        region: 'Пловдив',
        value: 3500,
        contact: { person: 'Иван Стоянов', email: 'ivan.st@gmail.com', phone: '0877654321' },
        company: null
      },
      {
        name: 'ТехноСофт АД',
        type: 'B2B',
        status: 'won',
        source: ['Офлайн', 'Директна среща'],
        region: 'Варна',
        value: 45000,
        contact: { person: 'Валентин Петров', email: 'sales@tehnosoft.bg', phone: '0888111222' },
        company: { eik: '147258369', mol: 'Валентин Петров', address: 'Варна, бул. Владислав Варненчик 89' }
      }
    ];

    for (const lead of leadData) {
      // Determine assigned_to based on region
      const userResult = await client.query(
        "SELECT id FROM users WHERE role = 'sales' AND region = $1 LIMIT 1",
        [lead.region]
      );
      const assignedTo = userResult.rows[0]?.id || 3; // Default to Мария

      // Insert lead
      const leadResult = await client.query(
        `INSERT INTO leads (name, type, status, source_level1, source_level2, region, value, assigned_to, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
         RETURNING id`,
        [lead.name, lead.type, lead.status, lead.source[0], lead.source[1], lead.region, lead.value, assignedTo]
      );

      const leadId = leadResult.rows[0].id;

      // Insert contact
      await client.query(
        'INSERT INTO lead_contacts (lead_id, person, email, phone) VALUES ($1, $2, $3, $4)',
        [leadId, lead.contact.person, lead.contact.email, lead.contact.phone]
      );

      // Insert company if B2B
      if (lead.company) {
        await client.query(
          'INSERT INTO lead_companies (lead_id, eik, mol, address) VALUES ($1, $2, $3, $4)',
          [leadId, lead.company.eik, lead.company.mol, lead.company.address]
        );
      }

      // Insert timeline events
      await client.query(
        `INSERT INTO timeline_events (lead_id, type, user_id, user_name, data) VALUES 
         ($1, 'created', 1, 'Система', 'Лийд създаден'),
         ($1, 'assigned', 1, 'Админ', 'Назначен на търговец'),
         ($1, 'comment', $2, (SELECT name FROM users WHERE id = $2), 'Първи контакт - изглежда перспективно')`,
        [leadId, assignedTo]
      );
    }

    console.log('✅ Sample leads created');
    console.log('\n🎉 Database initialization complete!');
    console.log('\n📧 Login credentials:');
    console.log('   Email: admin@company.com');
    console.log('   Password: password123');
    console.log('\n   (Same password for all users)');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
