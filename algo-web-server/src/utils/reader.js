const fs = require("fs");
const readline = require("readline");

// Returns a line reader over a file
function fileAsyncIterator(file) {
  const fileStream = fs.createReadStream(file);

  const lineReader = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  return lineReader;
}

module.exports = { fileAsyncIterator };
