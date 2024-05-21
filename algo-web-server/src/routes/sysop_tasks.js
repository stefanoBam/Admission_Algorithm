const express = require("express");
const router = express.Router();
const { checkAuthenticationWithUserType } = require.main.require(
  "./src/utils/authentication"
);
var { parse } = require("csv-parse");
var formidable = require("formidable");
const fs = require("fs");
const { writeToTable } = require.main.require("./src/models/course");
const CP_TABLE = "./src/models/course/courses_and_profs.json";
const { isCPInputValid } = require.main.require("./src/services/course");

// GET home page
router.get(
  "/",
  checkAuthenticationWithUserType(["sysop"], (req, res) => {
    res.render("pages/sysop_tasks/sysop_landing.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

// GET add user page
router.get(
  "/add-user",
  checkAuthenticationWithUserType(["sysop"], (req, res) => {
    res.render("pages/sysop_tasks/sysop_add_user.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

// GET search user page
router.get(
  "/search-users",
  checkAuthenticationWithUserType(["sysop"], (req, res) => {
    res.render("pages/sysop_tasks/sysop_search_users.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

// GET add user course page
router.get(
  "/add-course",
  checkAuthenticationWithUserType(["sysop"], (req, res) => {
    res.render("pages/sysop_tasks/sysop_add_course.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

//POST REQUEST for office hours and responsibilities
router.post(
  "/add-course",
  checkAuthenticationWithUserType(["sysop"], async (req, res) => {
    const isValid = await isCPInputValid(req.body);
    if (!isValid) {
      res.render("pages/sysop_tasks/sysop_add_course.ejs", {
        Inputinfo: req.body,
        errors: ["Missing required fields"],
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
      });
    } else {
      const result = await writeToTable(req.body, CP_TABLE);
      if (result.error) {
        res.status(400).render("pages/sysop_tasks/sysop_add_course.ejs", {
          OHinfo: req.body,
          errors: result.error.details.map((detail) => detail.message),
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
        });
        return;
      } else {
        res.render("pages/sysop_tasks/sysop_landing.ejs", {
          successMsg: `Course ${req.body.course_num} with instructor ${req.body.instructor_assigned_name} was added successfully.`,
          errors: [],
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
        });
      }
    }
  })
);

//GET REQUEST FOR IMPORT COURSES
router.get(
  "/import-courses",
  checkAuthenticationWithUserType(["sysop"], (req, res) => {
    res.render("pages/sysop_tasks/sysop_import_course.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

//POST REQUEST FOR IMPORTING COURSES (THROUGH A CSV)
router.post(
  "/importing-courses",
  checkAuthenticationWithUserType(["ta", "prof"], async (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      const filepath = files.courseFile.filepath;
      fs.createReadStream(filepath)
        .pipe(parse({ delimiter: "," }))
        .on("data", function (csvrow) {
          const courseNProf = {
            term_month_year: csvrow[0],
            course_num: csvrow[1],
            course_name: csvrow[2],
            instructor_assigned_name: csvrow[3],
          };
          writeToTable(courseNProf, CP_TABLE);
        })
        .on("end", function () {});
    });
    res.render("pages/sysop_tasks/sysop_landing.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
      successMsg: `The CSV was imported successfully.`,
      errors: [],
    });
  })
);

// EXAMPLE OF A POST
router.post("/test", async (req, res) => {
  res.status(404).json("Not implemented");
});

module.exports = router;
