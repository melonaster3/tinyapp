const { assert } = require('chai');

const { checkUserByEmail } = require('../helpers.js');
const { paramTo } = require('../helpers.js');

const testUsers = {
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

describe('Functions in the server', function() {

  it('Should return true for email that exists for checkUserbyEmail ', function() {
    const user = checkUserByEmail(testUsers, "user@example.com")
    const expected = true;
    // Write your assert statement here
    assert.deepEqual(user, expected);
  });

  it('Should return false for email that DOSENT exists for checkUserbyEmail', function() {
    const user = checkUserByEmail(testUsers, "asdfg@example.com")
    const expected = false;
    // Write your assert statement here
    assert.deepEqual(user, expected);
  });


});