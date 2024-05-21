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
router.get("/", (req, res) => {
  const kw = model.readTable();
  res.render("pages/landing/home", {
    keyword
    });

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
});

module.exports = router;
