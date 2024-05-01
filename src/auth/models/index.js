"use strict";
const fs = require("fs");

exports.retrieveModels = () => {
  let models = [];
  // set all the models on db

  fs.readdirSync(__dirname).forEach(function (file) {
    if (file.indexOf(".js") && file.indexOf("index.js") < 0) {
      let name = file.split(".")[0];
      let fileContent = require("./" + file);
      models.push({ name, fileContent })
    }
  });
  return models;
};

