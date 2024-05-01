"use strict";
const _ = require("underscore");
const catchAsync = require("../helpers/catchAsync");
let responseHelper = require("./response");

let responseDecoratorFn = function (req, res, next) {
      responseHelper.decorate(req, res);
      next();
};

module.exports = function (directoryPath, app) {
      let modulePath;
      let apiRoot;
      let requiredModule;
      var tasks = [];

      let register = function (option, filters) {
            if (_.isEmpty(requiredModule)) {
                  return;
            }
            let apiType = this.apiType;

            tasks.push(responseDecoratorFn);

            if (typeof option === "object" && !filters) {
                  //come as array or object
                  var options = [];

                  if (option[0]) {
                        options = option;
                  } else {
                        options.push(option);
                  }

                  options.forEach(function (item) {
                        let filters = item.filters ? item.filters : [];

                        if (item.filter) {
                              filters.push(item.filter);
                        }

                        filters.forEach((item) => tasks.push(item));

                        tasks.push(catchAsync(requiredModule[item.method]));

                        let apiUrl = item.url ? apiRoot + item.url : apiRoot;
                        let permissionName = apiType + "." + `${item.method}`;

                        switch (item.action.toUpperCase()) {
                              case "GET":
                                    app.get(apiUrl, tasks).descriptor({
                                          name: permissionName,
                                    });
                                    tasks.splice(1, filters.length + 1);
                                    break;

                              case "POST":
                                    app.post(apiUrl, tasks).descriptor({
                                          name: permissionName,
                                    });
                                    tasks.splice(1, filters.length + 1);
                                    break;

                              case "PUT":
                                    app.put(apiUrl, tasks).descriptor({
                                          name: permissionName,
                                    });
                                    tasks.splice(1, filters.length + 1);
                                    break;

                              case "DELETE":
                                    app.delete(apiUrl, tasks).descriptor({
                                          name: permissionName,
                                    });
                                    tasks.splice(1, filters.length + 1);
                                    break;

                              default:
                                    break;
                        }
                  });
            }
            tasks = [];
            return;
      };

      return {
            model: function (apiType) {
                  if (
                        apiType.charAt(apiType.length - 1) !== "s" &&
                        apiType.substr(apiType.length - 2, apiType.length) !==
                              "es"
                  ) {
                        throw new Error("Enter correct api");
                  }

                  apiRoot = "/api/" + apiType;
                  modulePath = directoryPath + "api/" + apiType;
                  requiredModule = require(`${modulePath}`);

                  return { register: register, apiType: apiType };
            },
      };
};
