const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const userSchema = new mongoose.Schema({
      email: String,
      firstName: String,
      lastName: String,
      role: String
    });
    const User = mongoose.model('User', userSchema);

    const users = await User.find().select('email firstName lastName role');
    
    if (users.length === 0) {
      console.log('No users found in database');
      process.exit(0);
    }

    console.log('\nUsers in database:');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} (${u.firstName} ${u.lastName}) - Role: ${u.role}`);
    });

    const email = process.argv[2];
    if (!email) {
      console.log('\nUsage: node makeAdmin.js <email>');
      process.exit(0);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`User with email "${email}" not found`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    console.log(`\nSuccess! User ${email} is now an ADMIN`);
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
