const getUserByEmail = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
};

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let random = '';

  for (let i = 0; i < chars.length; i++) {
    if (random.length < 6) {
      random += chars[(Math.random() * 61).toFixed(0)];
    }
  }

  return random;
};

module.exports = { getUserByEmail, generateRandomString };