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

const urlsForUser = (id, database) => {
  const urlsForUser = {};

  for (let url in database) {
    if (database[url].userID === id) {
      urlsForUser[url] = database[url];
    }
  }

  return urlsForUser;
};

const checkForHTTP = (longURL, database, sessionID, visitorID, timeStamp) => {
  // add total view count, unique view count, and time stamp for stretch work

  // check if longURL includes http:// or https://
  if ((longURL.slice(0, 7)) === 'http://' || (longURL.slice(0, 8)) === 'https://') {
    database.viewCount++;
    visitorID.push(sessionID);
    timeStamp.push(Date());
    return true;
  }

  return false;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  checkForHTTP
};