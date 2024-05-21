// This file contains business logic for account related routes

const model = require.main.require("./src/models/account");
const schema = require.main.require("./src/models/account/schema");

async function registerUser(user) {
  const userExists = !!(await model.getUserWithAnyKeys({
    username: user.username,
    email: user.email,
    mcGillId: user.studentId,
  }));

  if (userExists) {
    return {
      error: {
        details: [
          {
            message:
              "A user with the same username, email, or McGill ID exists. Registration Failed.",
          },
        ],
      },
    };
  }

  return await model.writeUser(user);
}

async function findUsers(searchString) {
  let keys = schema.keys;
  const users = await model.getUsersWithAnyKeys({
    firstName: searchString,
    lastName: searchString,
    username: searchString,
    email: searchString,
    mcGillId: searchString,
  });

  return users;
}

async function deleteUser(username) {
  return await model.deleteUser(username);
}

async function handleUnauthenticatedUserRegistration(req, res) {
  req.body.registeredCourses = req.body.registeredCourses
    ? req.body.registeredCourses.split(",")
    : [];
  const { error, value } = schema.validate(req.body);
  if (error) {
    res.status(400).render("pages/landing/register", {
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }
  const result = await registerUser(value);

  if (result.error) {
    res.status(400).render("pages/landing/register", {
      errors: result.error.details.map((detail) => detail.message),
    });
    return;
  } else {
    res.render("pages/landing/login", {
      successRegisterMsg: "Registration successful. ",
      errors: [],
    });
  }
}

async function handleSysopUserRegistration(req, res) {
  req.body.registeredCourses = req.body.registeredCourses
    ? req.body.registeredCourses.split(",")
    : [];
  const { error, value } = schema.validate(req.body);
  if (error) {
    res.status(400).render("pages/sysop_tasks/sysop_add_user.ejs", {
      errors: error.details.map((detail) => detail.message),
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
    return;
  }
  const result = await registerUser(value);

  if (result.error) {
    res.status(400).render("pages/sysop_tasks/sysop_add_user.ejs", {
      errors: result.error.details.map((detail) => detail.message),
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
    return;
  } else {
    res.render("pages/sysop_tasks/sysop_landing.ejs", {
      successMsg: "New user added successfully.",
      errors: [],
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  }
}

async function editUser(inputUser) {
  inputUser.registeredCourses = inputUser.registeredCourses
    ? inputUser.registeredCourses.split(",")
    : [];
  return await model.editUser(inputUser);
}

module.exports = {
  registerUser,
  handleSysopUserRegistration,
  handleUnauthenticatedUserRegistration,
  findUsers,
  deleteUser,
  editUser,
};
