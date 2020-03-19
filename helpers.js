const uselessEmailChecker = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      return database[id]
    }
  }
};

module.exports = { uselessEmailChecker };