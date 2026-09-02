const { Field, Equipment, Booking, User, sequelize } = require('./models')

async function seed() {
  // create missing tables without destructive changes
  await sequelize.sync()

  // try to add `role` column to Users table if it doesn't exist
  try {
    const qi = sequelize.getQueryInterface()
    await qi.addColumn('Users', 'role', { type: require('sequelize').DataTypes.STRING, defaultValue: 'user' })
    console.log('Added role column to Users table')
  } catch (e) {
    // ignore if column already exists or query fails
  }

  const f1 = await Field.create({ name: 'สนามฟุตบอล ไอ-สปอร์ต', sportType: 'ฟุตบอล', location: 'สุขุมวิท 49', price: '300', capacity: 22, status: 'available', description: 'สนามหญ้าเทียม ขนาด 7 คน', image: '' })
  const f2 = await Field.create({ name: 'แบดมินตัน เซ็นเตอร์', sportType: 'แบดมินตัน', location: 'ลาดพร้าว', price: '120', capacity: 4, status: 'available', description: 'สนามในร่ม พร้อมไฟ', image: '' })

  await Equipment.create({ name: 'ลูกฟุตบอล', sku: 'FB-001', stock: 10, price: '50', condition: 'good' })
  await Equipment.create({ name: 'ไม้แบดมินตัน', sku: 'BD-001', stock: 8, price: '40', condition: 'good' })

  // create admin user if missing
  const adminEmail = 'admin@rental.local'
  const existingAdmin = await User.findOne({ where: { email: adminEmail } })
  if (!existingAdmin) {
    await User.create({ email: adminEmail, password: 'admin123', name: 'Admin', lastname: 'User', role: 'admin', status: 'active' })
    console.log('Admin user created:', adminEmail)
  } else {
    console.log('Admin user already exists:', adminEmail)
  }

  console.log('Seed done')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
