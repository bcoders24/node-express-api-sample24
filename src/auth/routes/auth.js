const validate = require("../../../middlewares/validate");
const authValidation = require("../validators/auth");

let routes = [
    {
        action: "POST",
        method: "registerViaEmail",
        url: "/register/email",
        filters: [validate(authValidation.registerViaEmail)],
    },
    {
        action: "POST",
        method: "registerViaPhone",
        url: "/register/phone",
        filters: [validate(authValidation.registerViaPhone)],
    },
    {
        action: "POST",
        method: "verifyOTP",
        url: "/verifyOTP",
        filters: [validate(authValidation.verifyOTP)],
    },
    {
        action: "POST",
        method: "login",
        url: "/login",
        filters: [validate(authValidation.login)],
    },
    {
        action: "POST",
        method: "resendOtp",
        url: "/resendOtp",
        filters: [validate(authValidation.resendOtp)],
    },
    {
        action: "POST",
        method: "forgotPassword",
        url: "/forgotPassword",
        filters: [validate(authValidation.forgotPassword)],
    },
    {
        action: "PUT",
        method: "updatePassword",
        url: "/updatePassword/:id",
        filters: [validate(authValidation.updatePassword)],
    },
    {
        action: "PUT",
        method: "resetPassword",
        url: "/resetPassword/:id",
        filters: [validate(authValidation.resetPassword)],
    },
    {
        action: "PUT",
        method: "logout",
        url: "/logout/:id"
    },
    {
        action: "POST",
        method: "socialLogin",
        url: "/socialLogin",
        filters: [validate(authValidation.socialLogin)],
    },
    {
        action: "POST",
        method: "sendMail",
        url: "/send/mail"
    },
]

module.exports = { apiType: 'auths', routes } 