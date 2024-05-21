// This file includes all read / write logic for accounts database

const _ = require("lodash");
const { hashPassword } = require.main.require("./src/utils/password");
const writer = require.main.require("./src/utils/writer");
const reader = require.main.require("./src/utils/reader");
const schema = require.main.require("./src/models/account/schema");
const logger = require.main.require("./src/utils/logger");
const fs = require("fs");

const ACCOUNT_TABLE = "./src/models/account/db.json";
const ACCOUNT_TABLE_TMP = "./src/models/account/db.json.tmp";

// Writes a user into the database
async function writeUser(
  user,
  options = { table: ACCOUNT_TABLE, hashPassword: true }
) {
  // Validate again before writing row
  let { error, value: validatedUser } = schema.validate(user);
  if (!error) {
    if (options.hashPassword) {
      validatedUser.password = await hashPassword(validatedUser.password);
    }
    try {
      await writer.writeLineToFile(
        JSON.stringify(validatedUser),
        options.table
      );
    } catch (error) {
      logger.error({ error, ctx: "db.core.account" });
      error = { details: [{ message: error.message }] };
    }
  }
  return { error };
}

// Deletes user from the database
async function deleteUser(username) {
  const users = reader.fileAsyncIterator(ACCOUNT_TABLE);
  for await (const rawUser of users) {
    try {
      const user = JSON.parse(rawUser);
      if (user.username !== username) {
        await writer.writeLineToFile(rawUser, ACCOUNT_TABLE_TMP);
      }
    } catch (error) {
      logger.error({ error, ctx: "db.core.account" });
    }
  }

  const error = await fs.promises.rename(ACCOUNT_TABLE_TMP, ACCOUNT_TABLE);
  if (error) {
    logger.error({ error, ctx: "db.core.account" });
    return false;
  } else {
    return true;
  }
}

// Gets first user matching all given keys (could by any key)
//e.g., {firstName: "jerry", lastName: "gao"} -> find user with firsName AND lastName
// does not work for values of arrays or objects
async function getUserWithKeys(searchTerms) {
  const users = reader.fileAsyncIterator(ACCOUNT_TABLE);
  for await (const rawUser of users) {
    try {
      let user = JSON.parse(rawUser);
      if (
        Object.entries(searchTerms).every(([key, value]) => {
          return user[key] === value;
        })
      ) {
        return user;
      }
    } catch (error) {
      logger.error({ error, ctx: "db.core.account" });
    }
  }
  return false;
}

// Gets first user matching one or more given keys (could by any key)
//e.g., {firstName: "jerry", lastName: "gao"} -> find users with firsName OR lastName
// does not work for values of arrays or objects
async function getUserWithAnyKeys(searchTerms) {
  const users = reader.fileAsyncIterator(ACCOUNT_TABLE);
  for await (const rawUser of users) {
    try {
      let user = JSON.parse(rawUser);
      if (
        Object.entries(searchTerms).some(([key, value]) => {
          return user[key] === value;
        })
      ) {
        return user;
      }
    } catch (error) {
      logger.error({ error, ctx: "db.core.account" });
    }
  }
  return false;
}

// Edits a user in the database (param includes a full user, i.e.,
// the function overrides the user in question)
async function editUser(inputUser) {
  const users = reader.fileAsyncIterator(ACCOUNT_TABLE);
  for await (const rawUser of users) {
    try {
      const user = JSON.parse(rawUser);
      if (user.username === inputUser.username) {
        // If password has been updated, hash it and store in inputUser to write to db
        if (user.password !== inputUser.password) {
          inputUser.password = await hashPassword(inputUser.password);
        }
        const { error } = await writeUser(inputUser, {
          table: ACCOUNT_TABLE_TMP,
          hashPassword: false,
        });
        if (error) {
          return { error };
        }
      } else {
        await writer.writeLineToFile(rawUser, ACCOUNT_TABLE_TMP);
      }
    } catch (error) {
      logger.error({ error, ctx: "db.core.account" });
      return { error: { details: [{ message: error.message }] } };
    }
  }

  try {
    await fs.promises.rename(ACCOUNT_TABLE_TMP, ACCOUNT_TABLE);
  } catch (error) {
    logger.error({ error, ctx: "db.core.account" });
    return { error: { details: [{ message: error.message }] } };
  }
  return {};
}

// Get ALL users with any of the given keys
//e.g., {firstName: "jerry", lastName: "gao"} -> find users with firsName OR lastName
// does not work for values of arrays or objects
async function getUsersWithAnyKeys(searchTerms) {
  const users = reader.fileAsyncIterator(ACCOUNT_TABLE);
  const matchedUsers = [];
  for await (const rawUser of users) {
    try {
      let user = JSON.parse(rawUser);
      if (
        Object.entries(searchTerms).some(([key, value]) => {
          return user[key] === value;
        })
      ) {
        matchedUsers.push(user);
      }
    } catch (error) {
      logger.error({ error, ctx: "db.core.account" });
    }
  }

  return matchedUsers;
}

module.exports = {
  writeUser,
  getUserWithKeys,
  getUserWithAnyKeys,
  getUsersWithAnyKeys,
  deleteUser,
  editUser,
};
