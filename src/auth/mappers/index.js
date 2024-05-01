"use strict";
const fs = require("fs");
const camelCase = require("camelcase");
const mappers = {};
const init = function () {
  fs.readdirSync(__dirname).forEach(function (file) {
    if (file.indexOf(".js") !== -1 && file.indexOf("index.js") < 0) {
      var mapper = require("./" + file);
      var name = camelCase(file.substring(0, file.indexOf(".js")));

      // use toModel as toSummary if one is not defined
      if (!mapper.toSummary) {
        mapper.toSummary = mapper.toModel;
      }

      mappers[name] = mapper;
    }
  });
};

init();

module.exports = mappers;
