const writer = require.main.require("./src/utils/writer");
const fs = require("fs");
const reader = require.main.require("./src/utils/reader");
const TA_TABLE = "./src/models/ta/db.json";
const COURSE_TABLE = "./src/models/ta/db2.json";
const TA_TABLE_TMP = "./src/models/ta/db.json.tmp";
const TACOURSE_TABLE_TMP = "./src/models/ta/TACOURSE_TABLE_TMP.json.tmp";
const TA_RATING_TABLE = "./src/models/ta/ta_rating.json";
const PERFORMANCE_TABLE = "./src/models/course/performance_log.json";
const WISHLIST_TABLE = "./src/models/ta/wish_list.json";
const TACOURSE_TABLE = "./src/models/ta/db3.json";

// to add tas to the db
async function addTa(ta, options = { table: TA_TABLE }) {
  (ta = JSON.stringify(ta)), await writer.writeLineToFile(ta, TA_TABLE);
  return true;
}

// to get tas from the db
async function getAllTas() {
  const tas = reader.fileAsyncIterator(TA_TABLE);
  const matchedTas = [];
  for await (const rawTa of tas) {
    try {
      let ta = JSON.parse(rawTa);
      matchedTas.push(ta);
    } catch (error) {}
  }
  return matchedTas;
}
// get all the entities
async function getAllRegisteredEntities() {
  const registered = reader.fileAsyncIterator(TACOURSE_TABLE);
  const matchedTas = [];
  for await (const rawTa of registered) {
    try {
      let ta = JSON.parse(rawTa);
      matchedTas.push(ta);
    } catch (error) {}
  }
  return matchedTas;
}
// add a ta to a course
async function addTaToCourse(ta, course, courseNumber) {
  const entity = {
    TA_name: ta,
    courseName: course,
  };
  try {
    await writer.writeLineToFile(JSON.stringify(entity), TACOURSE_TABLE);
  } catch (error) {
    console.error(error);
  }
  return 0;
}

// display all the courses
async function getAllCourses() {
  const tas = reader.fileAsyncIterator(COURSE_TABLE);
  const matchedTas = [];
  for await (const rawTa of tas) {
    try {
      let ta = JSON.parse(rawTa);
      matchedTas.push(ta);
    } catch (error) {}
  }
  return matchedTas;
}

// display the performance
async function getPerformance(ta) {
  const performances = reader.fileAsyncIterator(PERFORMANCE_TABLE);
  const matchedP = [];
  for await (const rawP of performances) {
    try {
      let performance = JSON.parse(rawP);
      if (performance.taName.trim() === ta.TA_name.trim()) {
        matchedP.push(performance);
      }
    } catch (error) {}
  }
  return matchedP;
}

// display the wishlist
async function getWishList(ta) {
  const wishLists = reader.fileAsyncIterator(WISHLIST_TABLE);
  const matchedW = [];
  for await (const rawWish of wishLists) {
    try {
      let wish = JSON.parse(rawWish);
      if (wish.taFN.trim() === ta.TA_name.trim()) {
        matchedW.push(wish);
      }
    } catch (error) {}
  }
  return matchedW;
}

// obtain the students comment
async function getStudentComments(ta) {
  const ratings = reader.fileAsyncIterator(TA_RATING_TABLE);
  const matchedRatings = [];
  for await (const rawRating of ratings) {
    try {
      let rating = JSON.parse(rawRating);
      if (rating.TAfirstName.trim() === ta.TA_name.trim()) {
        matchedRatings.push(rating);
      }
    } catch (error) {}
  }
  return matchedRatings;
}

// display and compute the average
async function getTaRatingAverage(ta) {
  const ratings = reader.fileAsyncIterator(TA_RATING_TABLE);
  const matchedRatings = [];
  for await (const rawRatings of ratings) {
    try {
      let rating = JSON.parse(rawRatings);
      if (rating.TAfirstName.trim() === ta.TA_name.trim()) {
        matchedRatings.push(rating);
      }
    } catch (error) {}
  }
  if (matchedRatings.length === 0) {
    return 0;
  }

  let allRatings = 0;
  for (let i = 0; i < matchedRatings.length; i++) {
    allRatings = allRatings + parseInt(matchedRatings[i].starRating);
  }
  return allRatings / matchedRatings.length;
}

// add a class
async function addCourse(course, options = { table: COURSE_TABLE }) {
  (course = JSON.stringify(course)),
    await writer.writeLineToFile(course, COURSE_TABLE);
  return true;
}
// remove a ta from course
async function removeTaFromCourse(TA_name, course_name) {
  const entities = reader.fileAsyncIterator(TACOURSE_TABLE);
  for await (const entity of entities) {
    try {
      const e = JSON.parse(entity);
      if (
        e.TA_name.trim() === TA_name.trim() &&
        e.courseName.trim() === course_name.trim()
      ) {
        continue;
      }
      await writer.writeLineToFile(entity, TACOURSE_TABLE_TMP);
    } catch (error) {
      console.error("error");
    }
  }
  try {
    await fs.promises.rename(TACOURSE_TABLE_TMP, TACOURSE_TABLE);
  } catch (error) {
    console.error(error);
  }
  return true;
}

// obtain the course with the name
async function getCourseWithName(searchTerms) {
  const courses = reader.fileAsyncIterator(COURSE_TABLE);
  const matchedCourses = [];
  for await (const rawCourse of courses) {
    try {
      let course = JSON.parse(rawCourse);
      if (
        Object.entries(searchTerms).every(([key, value]) => {
          return course[key] === value;
        })
      ) {
        matchedCourses.push(course);
      }
    } catch (error) {
      logger.error({ error, ctx: "db.core.account" });
    }
  }
  return matchedCourses;
}

// write a rating
async function writeTARating(TAjson, option = { table: TA_RATING_TABLE }) {
  let error;
  try {
    await writer.writeLineToFile(JSON.stringify(TAjson), option.table);
  } catch (error) {
    logger.error({ error, ctx: "db.core.account" });
    error = { details: [{ message: error.message }] };
  }
  return { error };
}

module.exports = {
  addTa,
  addCourse,
  removeTaFromCourse,
  getPerformance,
  getCourseWithName,
  getStudentComments,
  getWishList,
  getAllTas,
  addTaToCourse,
  getAllCourses,
  getTaRatingAverage,
  writeTARating,
  getAllRegisteredEntities,
};
