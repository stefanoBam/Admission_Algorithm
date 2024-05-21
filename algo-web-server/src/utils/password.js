// Files contains functions related to hashing passwords (bcrypt)

const bcrypt = require("bcrypt");
const saltRounds = 10;

async function hashPassword(plaintextPassword) {
  return bcrypt.hash(plaintextPassword, saltRounds);
}

async function comparePasswords(plaintextPassword, hash) {
  return bcrypt.compare(plaintextPassword, hash);
}

module.exports = {
  hashPassword,
  comparePasswords,
};
