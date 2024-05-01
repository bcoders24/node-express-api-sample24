const auth = require("../../../middlewares/auth");
const mediaValidation = require('../validators/media');
const validate = require('../../../middlewares/validate');

let routes = [
    {
        action: "POST",
        method: "imageUpload",
        url: "/upload"

    },
    {
        action: "POST",
        method: "bulkUpload",
        url: "/bulk/upload"

    },
    {
        action: "POST",
        method: "delete",
        url: "/delete"

    }

]

module.exports = { apiType: 'images', routes } 