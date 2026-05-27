require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-results';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');

  const users = [
    { name: 'Teacher User', email: 'teacher@example.com', password: 'password123', role: 'teacher' },
    { name: 'Student User', email: 'student@example.com', password: 'password123', role: 'student' }
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`User exists: ${u.email}`);
      continue;
    }

    const user = new User(u);
    await user.save();
    console.log(`Created user: ${u.email} (${u.role})`);
  }

  console.log('Seeding complete');
  process.exit(0);
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
