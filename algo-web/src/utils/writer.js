const fs = require("fs");

// Writes a line to a file
async function writeLineToFile(line, path) {
  return fs.promises.appendFile(path, line + "\n");
}

module.exports = {
  writeLineToFile,
};
