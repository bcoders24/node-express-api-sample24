'use strict';
const authService = require('../services/auths');
const sessionService = require('../services/sessions');
const mapper = require('../mappers/user');
const httpStatus = require('http-status');
const moment = require('moment');
const userService = require('../services/users')

exports.registerViaEmail = async (req, res) => {
     let user = await authService.registerWithEmail(req.body);
     const session = await sessionService.createSession(user, req.body);

     user.lastAccess = moment.utc();
     if (req.body.referralCode) {
          await userService.connectWithProfile(req.body, user)
     }
     user = await user.save();
     user.session = session;
     res.cookie('refreshToken', user.refreshToken, {
          secure: false,
          httpOnly: true,
     });
     return res.data(mapper.toAuthModel(user));
};

exports.registerViaPhone = async (req, res) => {
     let user = await authService.registerWithPhone(req.body);
     return res.data(mapper.toModel(user), httpStatus.CREATED);
};

exports.verifyOTP = async (req, res) => {
     let user = await authService.verifyOTP(req.body);
     user.deviceId = req.body.deviceId;
     user.deviceType = req.body.deviceType;
     const session = await sessionService.createSession(user, req.body);

     user.lastAccess = moment.utc();
     user = await user.save();

     user.session = session;
     res.cookie('refreshToken', user.refreshToken, {
          secure: false,
          httpOnly: true,
     });
     return res.data(mapper.toAuthModel(user));
};

exports.login = async (req, res) => {
     const { verificationType } = req.body;

     let user = await authService.login(req.body);
     user.deviceId = req.body.deviceId;
     user.deviceType = req.body.deviceType;

     switch (verificationType) {
          case 'password':
               const session = await sessionService.createSession(user, req.body);

               user.lastAccess = moment.utc();
               user = await user.save();

               user.session = session;
               res.cookie('refreshToken', session.refreshToken, {
                    secure: false,
                    httpOnly: true,
               });
               break;
     }
     return res.data(mapper.toAuthModel(user));
};

exports.resendOtp = async (req, res) => {
     await authService.resendOtp(req.body);
     return res.success('OTP resent successfully');
}

exports.forgotPassword = async (req, res) => {
     let user = await authService.forgotPassword(req.body);
     return res.data(mapper.toModel(user), httpStatus.CREATED);
}

exports.updatePassword = async (req, res) => {
     await authService.updatePassword(req.params.id, req.body);
     return res.success('New Password updated');
}

exports.resetPassword = async (req, res) => {
     await authService.resetPassword(req.params.id, req.body);
     return res.success('Password reset');
}

exports.logout = async (req, res) => {
     await authService.logout(req.params.id);
     return res.success('User logout successfully!');
}

exports.socialLogin = async (req, res) => {
     let user = await authService.socialLogin(req.body, req.user)
     user.deviceId = req.body.deviceId;
     user.deviceType = req.body.deviceType;
     const session = await sessionService.createSession(user, req.body);
     user.lastAccess = moment.utc();
     user = await user.save();

     user.session = session;
     res.cookie('refreshToken', session.refreshToken, {
          secure: false,
          httpOnly: true,
     });
     return res.data(mapper.toAuthModel(user));
}



