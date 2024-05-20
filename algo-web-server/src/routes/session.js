const Joi = require("joi");
const express = require("express");
const router = express.Router();
const { checkLoginCredentials } = require.main.require(
  "./src/services/session"
);
const { checkAuthentication } = require.main.require(
  "./src/utils/authentication"
);
const { response_type } = require.main.require("./src/response");

const schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
}).required();

// GET landing page
router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("pages/landing/home", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  } else {
    res.render("pages/landing/home");
  }
});

// GET login page
router.get("/login", (req, res) => {
  if (req.session.authenticated) {
    res.render("pages/landing/home", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  } else {
    res.render("pages/landing/login", { errors: [] });
  }
});

// POST / login to the website
router.post("/login", async (req, res) => {
  if (req.session.authenticated) {
    res.render("pages/landing/home", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
    return;
  }

  let { error, value } = schema.validate(req.body);
  if (error) {
    res.status(400).render("pages/landing/login", {
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }

  // extract username and password from validated user
  const { username, password } = value;
  // check matching username and password
  let authenticatedUser = await checkLoginCredentials(username, password);
  if (authenticatedUser) {
    req.session.authenticated = true;
    req.session.user = {
      userTypes: authenticatedUser.userTypes,
      username: authenticatedUser.username,
    };
    res.render("pages/landing/home", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  } else {
    res.status(400).render("pages/landing/login", {
      response: response_type.AUTH,
      errors: ["Unable to authenticate user"],
    });
  }
});

// POST / logout
router.post(
  "/logout",
  checkAuthentication((req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.json({
          errors: [err.message],
          response: response_type.AUTH,
        });
      } else {
        res.render("pages/landing/home");
      }
    });
  })
);

module.exports = router;
