const mongoose = require('mongoose');
const env = require('../config/env');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const { PRICES } = require('../utils/pricingEngine');

async function seedAdmin() {
  const { name, email, password } = env.seedAdmin;
  if (!name || !email || !password) {
    console.log('SEED_ADMIN_NAME/EMAIL/PASSWORD not set — skipping superadmin seed.');
    return;
  }

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin ${email} already exists — skipping.`);
    return;
  }

  const hashed = await Admin.hashPassword(password);
  await Admin.create({ name, email: email.toLowerCase(), password: hashed, role: 'superadmin' });
  console.log(`Created superadmin: ${email}`);
}

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`Product collection already has ${count} documents — skipping.`);
    return;
  }

  const shirtColors = ['White', 'Navy Blue', 'Black'];
  const bangleColors = ['White', 'Black'];

  const shirts = shirtColors.map((color, i) => ({
    name: `${color} T-Shirt`,
    category: 'tshirt',
    color,
    description: '#MORA on the Hunt campaign T-shirt. Represent MORA Baseball at the Inter University Games.',
    images: [
      `/placeholder/tshirt-${color.toLowerCase().replace(/\s+/g, '-')}-1.svg`,
      `/placeholder/tshirt-${color.toLowerCase().replace(/\s+/g, '-')}-2.svg`,
      `/placeholder/tshirt-${color.toLowerCase().replace(/\s+/g, '-')}-3.svg`,
      `/placeholder/tshirt-${color.toLowerCase().replace(/\s+/g, '-')}-4.svg`,
    ],
    currentPrice: PRICES.shirt,
    available: true,
    sortOrder: i,
  }));

  const bangles = bangleColors.map((color, i) => ({
    name: `${color} Silicone Bangle`,
    category: 'bangle',
    color,
    description: '#MORA on the Hunt campaign silicone bangle.',
    images: [`/placeholder/bangle-${color.toLowerCase()}-1.svg`],
    currentPrice: PRICES.bangle,
    available: true,
    sortOrder: i,
  }));

  await Product.insertMany([...shirts, ...bangles]);
  console.log(`Seeded ${shirts.length + bangles.length} sample products.`);
}

async function run() {
  await connectDB();
  await seedAdmin();
  await seedProducts();
  await mongoose.disconnect();
  console.log('Seeding complete.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
