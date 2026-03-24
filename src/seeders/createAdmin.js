import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Admin seed failed:', error.message);
    process.exit(1);
  }
};

createAdmin();
