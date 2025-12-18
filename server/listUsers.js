const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const userSchema = new mongoose.Schema({
      email: String,
      firstName: String,
      lastName: String,
      role: String
    });
    const User = mongoose.model('User', userSchema);
    const users = await User.find().select('email firstName lastName role');
    console.log('Users in database:');
    users.forEach(u => console.log(`  - ${u.email} (${u.firstName} ${u.lastName}) - Role: ${u.role}`));
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
