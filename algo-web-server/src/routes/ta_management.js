const express = require("express");
const router = express.Router();
const { checkAuthenticationWithUserType } = require.main.require(
  "./src/utils/authentication"
);
const { findCourse, findTA, isOHInputValid, isWLInputValid } =
  require.main.require("./src/services/course");
const { writeToTable } = require.main.require("./src/models/course");
const url = require("url");
const OH_TABLE = "./src/models/course/office_hours.json";
const PL_TABLE = "./src/models/course/performance_log.json";
const WL_TABLE = "./src/models/ta/wish_list.json";

// LANDING PAGE OF TA_MANAGEMENT
router.get(
  "/",
  checkAuthenticationWithUserType(["ta", "prof"], (req, res) => {
    res.render("pages/ta_management/ta_management_landing.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

// COURSE SEARCH
router.get(
  "/course-search",
  checkAuthenticationWithUserType(["ta", "prof"], (req, res) => {
    res.render("pages/ta_management/ta_management_course_search.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

// AFTER THE COURSE HAS BEEN CHOSEN
router.get(
  "/courses",
  checkAuthenticationWithUserType(["ta", "prof"], async (req, res) => {
    if (!req.query.course_name_search) {
      res.render("pages/ta_management/ta_management_course_search.ejs", {
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
        error: "Please enter a search term.",
      });
    } else {
      const courses = await findCourse(req.query.course_name_search);

      if (courses.length === 0) {
        res.render("pages/ta_management/ta_management_course_search.ejs", {
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
          error:
            "No course matched the search term. (Note: The query is case and space sensitive, please respect the format in the example.)",
        });
      } else {
        res.render("pages/ta_management/ta_management_course_result.ejs", {
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
          course: courses[0].course_num,
        });
      }
    }
  })
);

//OFFICE HOURS AND RESPONSIBILITIES LANDING PAGE
router.get(
  "/office-hours-and-responsibilities",
  checkAuthenticationWithUserType(["ta", "prof"], async (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    const courseName = queryObject["courseKey"];
    res.render("pages/ta_management/ta_management_office_hours.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
      course: courseName,
    });
  })
);

//POST REQUEST for office hours and responsibilities
router.post(
  "/add-office-hours-and-responsibilities",
  checkAuthenticationWithUserType(["ta", "prof"], async (req, res) => {
    const courseName = req.body.courseName;
    const isValid = await isOHInputValid(req.body);
    if (!isValid) {
      res.render("pages/ta_management/ta_management_office_hours.ejs", {
        OHinfo: req.body,
        errors: ["Missing required fields"],
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
        course: courseName,
      });
    } else {
      const result = await writeToTable(req.body, OH_TABLE);
      if (result.error) {
        res
          .status(400)
          .render("pages/ta_management/ta_management_office_hours.ejs", {
            OHinfo: req.body,
            errors: result.error.details.map((detail) => detail.message),
            userTypes: req.session.user.userTypes,
            username: req.session.user.username,
            course: courseName,
          });
        return;
      } else {
        res.render("pages/ta_management/ta_management_course_result.ejs", {
          successMsg: `Office hours and other information of ${req.body.firstName} ${req.body.lastName} set successfully.`,
          errors: [],
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
          course: courseName,
        });
      }
    }
  })
);

//PERFORMANCE LOG LANDING PAGE
router.get(
  "/performance-log",
  checkAuthenticationWithUserType(["ta", "prof"], async (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    const courseName = queryObject["courseKey"];
    const someCourse = await findCourse(courseName);
    const TAmatch = await findTA(someCourse[0].course_name);
    if (TAmatch.length === 0) {
      res.render("pages/ta_management/ta_management_course_result.ejs", {
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
        course: courseName,
        errorMsg: "No TA exists for this course",
      });
    } else {
      res.render("pages/ta_management/ta_management_performance_log.ejs", {
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
        course: courseName,
        TAmatch,
      });
    }
  })
);

//POST REQUEST for TA performance log
router.post(
  "/add-performance",
  checkAuthenticationWithUserType(["ta", "prof"], async (req, res) => {
    const courseName = req.body.courseName;
    const result = await writeToTable(req.body, PL_TABLE);
    if (result.error) {
      res
        .status(400)
        .render("pages/ta_management/ta_management_performance_log.ejs", {
          PLinfo: req.body,
          errors: result.error.details.map((detail) => detail.message),
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
          course: courseName,
        });
      return;
    } else {
      res.render("pages/ta_management/ta_management_course_result.ejs", {
        successMsg: `Performance log of ${req.body.taName} set successfully.`,
        errors: [],
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
        course: courseName,
      });
    }
  })
);

//WISH LIST LANDING PAGE
router.get(
  "/wish-list",
  checkAuthenticationWithUserType(["ta", "prof"], async (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    const courseName = queryObject["courseKey"];
    res.render("pages/ta_management/ta_management_wish_list.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
      course: courseName,
    });
  })
);

//POST REQUEST for TA wish list
router.post(
  "/add-wish-list",
  checkAuthenticationWithUserType(["ta", "prof"], async (req, res) => {
    const courseName = req.body.courseName;
    const isValid = await isWLInputValid(req.body);
    if (!isValid) {
      res.render("pages/ta_management/ta_management_wish_list.ejs", {
        WLinfo: req.body,
        errors: ["Missing required fields"],
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
        course: courseName,
      });
    } else {
      const result = await writeToTable(req.body, WL_TABLE);
      if (result.error) {
        res
          .status(400)
          .render("pages/ta_management/ta_management_wish_list.ejs", {
            PLinfo: req.body,
            errors: result.error.details.map((detail) => detail.message),
            userTypes: req.session.user.userTypes,
            username: req.session.user.username,
            course: courseName,
          });
        return;
      } else {
        res.render("pages/ta_management/ta_management_course_result.ejs", {
          successMsg: `Your wish list has been set successfully.`,
          errors: [],
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
          course: courseName,
        });
      }
    }
  })
);

module.exports = router;
