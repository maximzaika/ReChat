const color = require("colors");

const logData = true;

const log = (description, color = "default", showLog = true) => {
  if (!logData) return;
  if (showLog) {
    switch (color) {
      case "ref":
        return console.log(description.red);
      case "green":
        return console.log(description.green);
      case "yellow":
        return console.log(description.yellow);
      default:
        return console.log(description);
    }
  }
};

module.exports = {
  log,
};
