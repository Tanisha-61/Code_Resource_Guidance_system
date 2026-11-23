require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/CRGS');
    const email = (process.env.ADMIN_EMAIL || 'admin@crgs.local').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'ChangeThisAdminPassword123';
    const name = process.env.ADMIN_NAME || 'CRGS Administrator';
    const hashed = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ email }, { name, email, password: hashed, role: 'admin' }, { upsert: true, new: true });
    console.log(`Admin account ready: ${email}`);
    console.log('Set a strong ADMIN_PASSWORD in your .env before using this account.');
  } catch (e) { console.error(e.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
