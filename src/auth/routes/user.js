const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const userValidation = require("../validators/user");

let routes = [
    {
        action: "GET",
        method: "get",
        url: "/:id",
        filters: [auth.validate, validate(userValidation.get)]
    },
    {
        action: "POST",
        method: "create",
        filters: [auth.validate, validate(userValidation.createUser)]
    },
    {
        action: "PUT",
        method: "update",
        url: "/:id",
        filters: [auth.validate, validate(userValidation.updateUser)]
    },
    {
        action: "GET",
        method: "search",
        filters: [auth.validate, validate(userValidation.search)]
    },
    {
        action: "DELETE",
        method: "delete",
        url: "/:id",
        filters: [auth.validate, validate(userValidation.remove)]
    },
    {
        action: "POST",
        method: "connectedProfileRemove",
        url: "/profile/remove",
        filters: [auth.validate, validate(userValidation.connectedProfileRemove)]
    },
    {
        action: "POST",
        method: "connectWithProfile",
        url: "/profile/connect",
        filters: [auth.validate, validate(userValidation.connectWithProfile)]
    },
]

module.exports = { apiType: 'users', routes } 