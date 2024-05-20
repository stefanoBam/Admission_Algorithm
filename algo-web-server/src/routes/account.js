const express = require("express");
const { editUser } = require("../services/account");
const router = express.Router();
const { checkAuthenticationWithUserType } = require.main.require(
  "./src/utils/authentication"
);
const {
  handleSysopUserRegistration,
  handleUnauthenticatedUserRegistration,
  findUsers,
  deleteUser,
} = require.main.require("./src/services/account");
const model = require.main.require("./src/models/account");

// GET register page
router.get("/register", (req, res) => {
  if (req.session.authenticated) {
    res.render("pages/landing/home", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  } else {
    res.render("pages/landing/register", { errors: [] });
  }
});

// GET all users given some query param
router.get(
  "/users",
  checkAuthenticationWithUserType(["sysop"], async (req, res) => {
    if (!req.query.search_term) {
      res.render("pages/sysop_tasks/sysop_search_users.ejs", {
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
        error: "Please enter a search term.",
      });
    } else {
      const users = await findUsers(req.query.search_term);

      if (users.length === 0) {
        res.render("pages/sysop_tasks/sysop_search_users.ejs", {
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
          error: "No user matched search term.",
        });
      } else {
        res.render("pages/sysop_tasks/sysop_users_result.ejs", {
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
          users,
        });
      }
    }
  })
);

// POST / create a new account
router.post("/register", async (req, res) => {
  if (!req.session.authenticated) {
    await handleUnauthenticatedUserRegistration(req, res);
  } else if (req.session.user.userTypes.includes("sysop")) {
    await handleSysopUserRegistration(req, res);
  }
});

// GET landing home page
router.get(
  "/",
  checkAuthenticationWithUserType(["sysop"], async (req, res) => {
    const user = await model.getUserWithKeys({ username: req.query.username });
    if (user) {
      res.render("pages/sysop_tasks/sysop_edit_user.ejs", {
        user,
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
      });
    } else {
      res.render("pages/sysop_tasks/sysop_landing.ejs", {
        errorMsg: "Internal error: cannot edit selected user.",
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
      });
    }
  })
);

// POST / edit a user
router.post(
  "/edit",
  checkAuthenticationWithUserType(["sysop"], async (req, res) => {
    const result = await editUser(req.body);
    if (result.error) {
      res.status(400).render("pages/sysop_tasks/sysop_edit_user.ejs", {
        user: req.body,
        errors: result.error.details.map((detail) => detail.message),
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
      });
      return;
    } else {
      res.render("pages/sysop_tasks/sysop_landing.ejs", {
        successMsg: `User ${req.body.username} edited successfully.`,
        errors: [],
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
      });
    }
  })
);

// POST / delete a user
router.post(
  "/remove",
  checkAuthenticationWithUserType(["sysop"], async (req, res) => {
    if (req.body.username && (await deleteUser(req.body.username))) {
      // If user deletes themself, delete session (log them out)
      if (req.body.username === req.session.user.username) {
        delete req.session.user;
        req.session.authenticated = false;
        res.status(404).render("pages/landing/home");
      } else {
        res.render("pages/sysop_tasks/sysop_landing.ejs", {
          successMsg: `Deleted user ${req.body.username}`,
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
        });
      }
    } else {
      res.render("pages/sysop_tasks/sysop_landing.ejs", {
        errorMsg: "Internal error: failed to delete user.",
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
      });
    }
  })
);

module.exports = router;
