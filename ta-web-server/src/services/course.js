const model = require.main.require("./src/models/course");

//finds a course in the database, calls the getCourseWithName function that is in index.js in the src/models/course folder
async function findCourse(searchString) {
  const courses = await model.getCourseWithName({
    course_num: searchString,
  });
  return courses;
}

//finds a TA in a specific course, calls getTAWithCourse function that is in index.js in the src/models/course folder
async function findTA(courseString) {
  const TAs = await model.getTAWithCourse({
    courseName: courseString,
  });
  return TAs;
}

//validates the input of the office hours form for ta management
async function isOHInputValid(input) {
  if (
    input.firstName == "" ||
    input.lastName == "" ||
    input.email == "" ||
    input.position == "" ||
    input.duties == "" ||
    input.office_hours == "" ||
    input.office_location == ""
  ) {
    return false;
  }
  return true;
}

//validates the input of the wish list form for ta management
async function isWLInputValid(input) {
  if (
    input.termMonthYear == "" ||
    input.courseNum == "" ||
    input.profFN == "" ||
    input.profLN == "" ||
    input.taFN == "" ||
    input.taLN == ""
  ) {
    return false;
  }
  return true;
}

//validates the input of the courses and profs form for sysop
async function isCPInputValid(input) {
  if (
    input.course_name == "" ||
    input.course_num == "" ||
    input.term_month_year == "" ||
    input.instructor_assigned_name == ""
  ) {
    return false;
  }
  return true;
}

module.exports = {
  findCourse,
  findTA,
  isOHInputValid,
  isWLInputValid,
  isCPInputValid,
};
