const model = require.main.require("./src/models/ta");

async function addTa(ta) {
  return await model.addTa(ta);
}

async function addCourse(course) {
  return await model.addCourse(course);
}

async function deleteTa(username) {
  return await model.deleteTa(username);
}

async function findCourse(searchString) {
  const courses = await model.getCourseWithName({
    course_num: searchString,
  });
  return courses;
}

module.exports = {
  addTa,
  addCourse,
  findCourse,
  deleteTa,
};
