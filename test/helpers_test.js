const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user object that includes the given email in its email key', function() {
    const user = getUserByEmail("user@example.com", users);
    const expectedOutput = { id: 'userRandomID',
      email: 'user@example.com',
      password: 'purple-monkey-dinosaur' };
    
    assert.deepEqual(user, expectedOutput);
  });
});

describe('getUserByEmail', function() {
  it('should return undefined if the user is not in the user database', function() {
    const user = getUserByEmail('notAnEmail@example.com', users);
    const expectedOutput = undefined;

    assert.equal(user, expectedOutput);
  });
});


describe('getUserByEmail', function() {
  it('should return undefined if there is no email provided', function() {
    const user = getUserByEmail(null, users);
    const expectedOutput = undefined;

    assert.equal(user, expectedOutput);
  });
});