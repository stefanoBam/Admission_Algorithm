const express = require("express");
const router = express.Router();
var { parse } = require("csv-parse");
var formidable = require("formidable");
const { checkAuthenticationWithUserType } = require.main.require(
  "./src/utils/authentication"
);
const fs = require("fs");
const { addTa } = require.main.require("./src/services/admin");
const { addCourse } = require.main.require("./src/services/admin");
const { findCourse } = require.main.require("./src/services/course");
const model = require.main.require("./src/models/ta");

// get the home
router.get(
  "/",
  checkAuthenticationWithUserType(["admin", "sysop"], (req, res) => {
    res.render("pages/ta_administration/orangeMenu.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);
// get the import page
router.get(
  "/import",
  checkAuthenticationWithUserType(["admin", "sysop"], (req, res) => {
    res.render("pages/ta_administration/import.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);
// get the import page for courses
router.get(
  "/import_courses",
  checkAuthenticationWithUserType(["admin", "sysop"], (req, res) => {
    res.render("pages/ta_administration/import_courses.ejs", {
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);
// get the ta information
router.get(
  "/taInfo",
  checkAuthenticationWithUserType(["admin", "sysop"], async (req, res) => {
    const tas = await model.getAllTas();
    res.render("pages/ta_administration/taInfo.ejs", {
      tas,
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);
// get to the add ta
router.post(
  "/addTA",
  checkAuthenticationWithUserType(["admin", "sysop"], async (req, res) => {
    const { TA } = req.body;
    const { COURSE } = req.body;
    await model.addTaToCourse(TA, COURSE);
    const tas = await model.getAllTas();
    const courses = await model.getAllCourses();
    const registered = await model.getAllRegisteredEntities();
    res.render("pages/ta_administration/edit.ejs", {
      tas,
      courses,
      registered,
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);
// to remove the ta from the db
router.post(
  "/removeTA",
  checkAuthenticationWithUserType(["admin", "sysop"], async (req, res) => {
    const { TA } = req.body;
    const myArray = TA.trim().split("%");
    const ta = myArray[0];
    const course = myArray[1];

    await model.removeTaFromCourse(ta, course);

    const tas = await model.getAllTas();
    const courses = await model.getAllCourses();
    const registered = await model.getAllRegisteredEntities();
    res.render("pages/ta_administration/edit.ejs", {
      tas,
      courses,
      registered,
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

// the result that it gives
router.get(
  "/taInfo/result",
  checkAuthenticationWithUserType(["admin", "sysop"], async (req, res) => {
    const tas = await model.getAllTas();
    const ta = tas.find((t) => t.TA_name.trim() === req.query.TA.trim());
    const rating = await model.getTaRatingAverage(ta);
    const performances = await model.getPerformance(ta);
    const comments = await model.getStudentComments(ta);
    const wishList = await model.getWishList(ta);
    ta.rating = rating;
    const allregistered = await model.getAllRegisteredEntities();
    const registered = allregistered.filter(
      (r) => r.TA_name.trim() === ta.TA_name.trim()
    );

    res.render("pages/ta_administration/ta_result.ejs", {
      ta,
      performances,
      comments,
      wishList,
      registered,
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

// the result that it gives for the course info
router.get(
  "/courseInfo/result",
  checkAuthenticationWithUserType(["admin", "sysop"], async (req, res) => {
    const COURSE = req.query.COURSE.trim();
    const courses = await model.getAllCourses();
    const course = courses.find((c) => c.course_num.trim() === COURSE);
    const allregistered = await model.getAllRegisteredEntities();
    const registered = allregistered.filter(
      (r) => r.courseName.trim() === course.course_name.trim()
    );
    res.render("pages/ta_administration/courseResult.ejs", {
      course,
      registered,
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

// the course information
router.get(
  "/courseInfo",
  checkAuthenticationWithUserType(["admin", "sysop"], async (req, res) => {
    const courses = await model.getAllCourses();
    res.render("pages/ta_administration/courseInfo.ejs", {
      courses,
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

// in order to edit the db
router.get(
  "/edit",
  checkAuthenticationWithUserType(["admin", "sysop"], async (req, res) => {
    const tas = await model.getAllTas();
    const courses = await model.getAllCourses();
    const registered = await model.getAllRegisteredEntities();
    res.render("pages/ta_administration/edit.ejs", {
      tas,
      courses,
      registered,
      userTypes: req.session.user.userTypes,
      username: req.session.user.username,
    });
  })
);

// display the courses
router.get(
  "/courses",
  checkAuthenticationWithUserType(["ta", "prof"], async (req, res) => {
    if (!req.query.course_name_search) {
      res.render("pages/ta_administration/edit.ejs", {
        userTypes: req.session.user.userTypes,
        username: req.session.user.username,
        error: "Please enter a search term.",
      });
    } else {
      const courses = await findCourse(req.query.course_name_search);

      if (courses.length === 0) {
        res.render("pages/ta_administration/edit.ejs", {
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
          error: "No course matched the search term.",
        });
      } else {
        res.render("pages/ta_administration/result.ejs", {
          userTypes: req.session.user.userTypes,
          username: req.session.user.username,
          course: courses[0].course_name,
        });
      }
    }
  })
);

// function to import
router.post("/tas/import", async (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    const filepath = files.filename.filepath;
    fs.createReadStream(filepath)
      .pipe(parse({ delimiter: "," }))
      .on("data", function (csvrow) {
        const ta = {
          term_month_year: csvrow[0],
          TA_name: csvrow[1],
          student_ID: csvrow[2],
          legal_name: csvrow[3],
          email: csvrow[4],
          grad_ugrad: csvrow[5],
          supervisor_name: csvrow[6],
          priority: csvrow[7],
          hours: csvrow[8],
          date_applied: csvrow[9],
          location: csvrow[10],
          phone: csvrow[11],
          degree: csvrow[12],
          courses_applied_for: csvrow[13],
          open_to_other_courses: csvrow[14],
          notes: csvrow[15],
        };
        addTa(ta);
      })
      .on("end", function () {});
  });
  res.render("pages/ta_administration/orangeMenu.ejs", {
    userTypes: req.session.user.userTypes,
    username: req.session.user.username,
  });
});

// same thing as above but for courses
router.post("/courses/import", async (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    const filepath = files.filename.filepath;
    fs.createReadStream(filepath)
      .pipe(parse({ delimiter: "," }))
      .on("data", function (csvrow) {
        const course = {
          term_month_year: csvrow[0],
          course_num: csvrow[1],
          course_type: csvrow[2],
          course_name: csvrow[3],
          instructor_name: csvrow[4],
          course_enrollment_num: csvrow[5],
          TA_quota: csvrow[6],
        };
        addCourse(course);
      })
      .on("end", function () {});
  });
  res.render("pages/ta_administration/orangeMenu.ejs", {
    userTypes: req.session.user.userTypes,
    username: req.session.user.username,
  });
});

module.exports = router;
