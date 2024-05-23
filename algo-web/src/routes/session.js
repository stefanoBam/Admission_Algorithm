const Joi = require("joi");
const express = require("express");
const router = express.Router();
const reader = require.main.require("./src/utils/reader");

const { response_type } = require.main.require("./src/response");


// read JSON file and passes it 
const INITIAL_TABLE = "./src/models/list_of_keywords.json";
const RESULT_TABLE ="./src/models/list_of_resultingkw.json";
async function readTable(someTABLE){
  const allKW = reader.fileAsyncIterator(someTABLE)
  const kwlist = [];
  for await (const someWord of allKW){
    try{
      kwlist.push(JSON.parse(someWord));
    } catch (error){}
  }
  return kwlist;
}

// GET landing page
router.get("/", async (req, res) => {
  const keyword = await readTable(INITIAL_TABLE);
  const resultingKW = await readTable(RESULT_TABLE);
  console.log(keyword)
  console.log(typeof keyword)
  console.log("HELLLLOOOOOOOOO")
  res.render("pages/landing/home", {
    keyword,
    resultingKW
    });

});

// POST / login to the website
router.post("/login", async (req, res) => {
    res.render("pages/landing/home", {
    });
    return;
  
  if (error) {
    res.status(400).render("pages/landing/login", {
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }
});

module.exports = router;
