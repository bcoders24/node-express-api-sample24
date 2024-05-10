'use strict';

import authService from '../services/auths';
import sessionService from '../services/sessions';
import mapper from '../mappers/user';
import httpStatus from 'http-status';
import moment from 'moment';
import userService from '../services/users';

export const registerViaEmail = async (req, res) => {
  let user = await authService.registerWithEmail(req.body);
  const session = await sessionService.createSession(user, req.body);
  user.lastAccess = moment.utc();
  if (req.body.referralCode) {
    await userService.connectWithProfile(req.body, user);
  }
  user = await user.save();
  user.session = session;
  res.cookie('refreshToken', user.refreshToken, { secure: false, httpOnly: true, });
  return res.data(mapper.toAuthModel(user));
};

export const registerViaPhone = async (req, res) => {
  let user = await authService.registerWithPhone(req.body);
  return res.data(mapper.toModel(user), httpStatus.CREATED);
};

export const verifyOTP = async (req, res) => {
  let user = await authService.verifyOTP(req.body);
  user.deviceId = req.body.deviceId;
  user.deviceType = req.body.deviceType;
  const session = await sessionService.createSession(user, req.body);
  user.lastAccess = moment.utc();
  user = await user.save();
  user.session = session;
  res.cookie('refreshToken', user.refreshToken, { secure: false, httpOnly: true, });
  return res.data(mapper.toAuthModel(user));
};

export const login = async (req, res) => {
  let user = await authService.login(req.body);
  user.deviceId = req.body.deviceId;
  user.deviceType = req.body.deviceType;

      const session = await sessionService.createSession(user, req.body);
      user.lastAccess = moment.utc();
      user = await user.save();
      user.session = session;
      res.cookie('refreshToken', session.refreshToken, { secure: false, httpOnly: true, });
 
  return res.data(mapper.toAuthModel(user));
};

export const resendOtp = async (req, res) => {
  await authService.resendOtp(req.body);
  return res.success('OTP resent successfully');
};

export const forgotPassword = async (req, res) => {
  let user = await authService.forgotPassword(req.body);
  return res.data(mapper.toModel(user), httpStatus.CREATED);
};

export const updatePassword = async (req, res) => {
  await authService.updatePassword(req.params.id, req.body);
  return res.success('New Password updated');
};

export const resetPassword = async (req, res) => {
  await authService.resetPassword(req.params.id, req.body);
  return res.success('Password reset');
};

export const logout = async (req, res) => {
  await authService.logout(req.params.id);
  return res.success('User logout successfully!');
};

export const socialLogin = async (req, res) => {
  let user = await authService.socialLogin(req.body, req.user);
  user.deviceId = req.body.deviceId;
  user.deviceType = req.body.deviceType;
  const session = await sessionService.createSession(user, req.body);
  user.lastAccess = moment.utc();
  user = await user.save();
  user.session = session;
  res.cookie('refreshToken', session.refreshToken, { secure: false, httpOnly: true, });
  return res.data(mapper.toAuthModel(user));
};