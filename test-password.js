const bcrypt = require('bcryptjs');

const password = 'TrueNorth2025!';
const hash = '$2b$10$s/GoUitfhJT5Nth4nZA3qeFeCZMPLIO/mhXBjU/2h9bfoVsU9k8M6';

bcrypt.compare(password, hash).then(result => {
  console.log('Password matches:', result);
  if (!result) {
    console.log('Creating new hash...');
    return bcrypt.hash(password, 10);
  }
}).then(newHash => {
  if (newHash) {
    console.log('New hash:', newHash);
  }
});
