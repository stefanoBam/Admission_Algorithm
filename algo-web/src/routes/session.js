const Joi = require("joi");
const express = require("express");
const router = express.Router();
const reader = require.main.require("./src/utils/reader");

const { response_type } = require.main.require("./src/response");


// read JSON file and passes it 
const JSON_TABLE = "./src/models/list_of_keywords.json";
async function readTable(){
  const allKW = reader.fileAsyncIterator(JSON_TABLE)
  const kwlist = [];
  for await (const someWord of allKW){
    try{
      kwlist.push(someWord);
    } catch (error){}
  }
  return kwlist;
}

// GET landing page
router.get("/", async (req, res) => {
  const keyword = await readTable();
  console.log(keyword)
  console.log(typeof keyword)
  console.log("HELLLLOOOOOOOOO")
  res.render("pages/landing/home", {
    keyword
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
