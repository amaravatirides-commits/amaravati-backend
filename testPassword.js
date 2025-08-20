const bcrypt = require('bcryptjs');

async function testPassword() {
  const plainPassword = 'YourExactPasswordHere'; // The password you registered with
  const storedHash = 'YourExactHashFromDBHere';  // Paste exact hash from DB here

  const isMatch = await bcrypt.compare(plainPassword, storedHash);
  console.log('Manual bcrypt.compare result:', isMatch);
}

testPassword();
