const express = require("express");
const router = express.Router();
const { checkAuthenticationWithUserType } = require.main.require(
  "./src/utils/authentication"
);
const { writeTARating } = require.main.require("./src/models/ta");

//function that verifies if the input of the TA rating form is valid
function isInputValid(input) {
  if (
    input.TAfirstName == "" ||
    input.TAlastName == "" ||
    input.courseName == "" ||
    input.courseTY == "" ||
    !input.starRating
  ) {
    return false;
  }
  return true;
}

// LANDING PAGE OF TA RATING
router.get(
  "/",
  checkAuthenticationWithUserType(
    ["student", "ta", "prof", "admin", "sysop"],
    (req, res) => {
      res.render("pages/ta_rating/ta_rating_landing.ejs", {
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
      });
    }
  )
);

//POST REQUEST for TA performance log
router.post(
  "/add-ta-rating",
  checkAuthenticationWithUserType(
    ["student", "ta", "prof", "admin", "sysop"],
    async (req, res) => {
      const result = await writeTARating(req.body);
      const isValid = isInputValid(req.body);
      if (!isValid) {
        res.render("pages/ta_rating/ta_rating_landing.ejs", {
          OHinfo: req.body,
          errors: ["Missing required fields"],
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
        });
      } else {
        if (result.error) {
          res.status(400).render("pages/ta_rating/ta_rating_landing.ejs", {
            TAratinginfo: req.body,
            errors: result.error.details.map((detail) => detail.message),
            userTypes: req.session.user.userTypes,
            username: req.session.user.username,
          });
          return;
        } else {
          res.render("pages/ta_rating/ta_rating_landing.ejs", {
            successMsg: `Rating for ${req.body.TAfirstName} ${req.body.TAlastName} succesfully added.`,
            errors: [],
            userTypes: req.session.user.userTypes,
            username: req.session.user.username,
          });
        }
      }
    }
  )
);

module.exports = router;
