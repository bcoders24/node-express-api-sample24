'use strict';
const httpStatus = require('http-status');
const jwtHelper = require('../helpers/jwt');
const sessionService = require('../src/auth/services/sessions');
const _ = require('underscore');

const tokenValidator = async (token) => {
     try {
          return jwtHelper.verifyToken(token);
     } catch (err) {
          if (err.name === 'TokenExpiredError') {
               throw new ApiError("Token Expired", httpStatus.UNAUTHORIZED);
          }
          throw new ApiError(err);
     }
};

const sessionValidator = async (sessionId) => {
     let session = await sessionService.get(sessionId);
     if (!session) {
          throw new ApiError('Session not found', httpStatus.UNAUTHORIZED);
     };
     if (session.status === 'expired') {
          throw new ApiError('Session expired', httpStatus.UNAUTHORIZED);
     }
     return session;
};

const userValidator = async (userId) => {
     let user = await db.user.findById(userId).populate({
          path: "userPlan",
          populate: {
               path: 'plan'
          }
     });
     // can include role in future
     if (!user) {
          throw new ApiError('User not found', httpStatus.UNAUTHORIZED);
     };
     if (user.status == 'inactive') {
          throw new ApiError('User status is inactive.', httpStatus.UNAUTHORIZED);
     }
     if (user.status == 'deleted') {
          throw new ApiError('User status is deleted.', httpStatus.UNAUTHORIZED);
     }
     if (user.status == 'blocked') {
          throw new ApiError('User status is blocked.', httpStatus.UNAUTHORIZED);
     }
     if (user.userPlan && user.userPlan.status === 'expired') {
          throw new ApiError('User plan has expired', httpStatus.PAYMENT_REQUIRED);
     }
     return user;
};

// const permissionValidator = async (req) => {
//      if (req.route.hasOwnProperty('o')) {
//           const permission = await db.permission.findOne({
//                name: req.route['o'].name,
//           });
//           if (!permission) {
//                return false;
//           }
//           let permissionExist = null;

//           if (!req.user.roleId) {
//                throw new Error('roleId not assigned');
//           }
//           permissionExist = await db.rolePermission.countDocuments({
//                permissionId: permission.id,
//                roleId: req.user.roleId,
//           });

//           if (!permissionExist) {
//                return false;
//           }
//           return true;
//      } else {
//           return false;
//      }
// };


// if (req.user && req.user.role) {
//      var hasPermissions = await db.rolePermission.find({ role: req.role.id }).populate({path:"permission"});

//      let retVal = _.rest(req.originalUrl.split('/'), 2);

//      let permissionToCheck = retVal[0];
//      let permissionToChecks = permissionToCheck.split('?', 2);
//      let permissionToCheck1 =permissionToChecks[0];
//      var hasEntry = _.find(hasPermissions, (hasPermission) => hasPermission.permission.entityName ===permissionToCheck1);
//      });
//      if (!hasEntry) {
//           return res.status(403).send({
//                success: false,
//                message: 'permission not added.',
//           });
//      }
//      switch (req.method) {
//           case 'POST':
//                if (!hasEntry.create) {
//                     return res.status(403).send({
//                          success: false,
//                          message: 'access forbidden.',
//                     });
//                }
//                break;
//           case 'GET':
//                if (!hasEntry.read) {
//                     return res.status(403).send({
//                          success: false,
//                          message: 'access forbidden.',
//                     });
//                }
//                break;
//           case 'PUT':
//                if (!hasEntry.edit) {
//                     return res.status(403).send({
//                          success: false,
//                          message: 'access forbidden.',
//                     });
//                }
//                break;
//           case 'DELETE':
//                if (!hasEntry.delete) {
//                     return res.status(403).send({
//                          success: false,
//                          message: 'access forbidden.',
//                     });
//                }
//                break;
//      }
// }

exports.validate = async (req, res, next) => {
     try {
          var token =
               req.body.token ||
               req.query.token ||
               req.headers['x-access-token'];
          if (!token) return res.accessDenied();

          let claims = await tokenValidator(token);
          req.sessionId = claims.session;
          req.userId = claims.user;

          let session = await sessionValidator(req.sessionId);
          req.session = session;

          let user = await userValidator(req.userId);
          req.user = user;

          // TODO permissin validate pending

          next();
     } catch (err) {
          next(err)
     }
};

exports.validateTokenOptional = (req, res, next) => {
     var token =
          req.body.token ||
          req.query.token ||
          req.headers['x-access-token'];
     if (!token) return this.validate(req, res, next);

     req.sessionId = null;
     req.userId = null;
     req.session = null;
     req.user = null;
     next();
};

exports.validateRefreshToken = (req, res, next) => {
     var refreshToken = req.cookies.refreshToken || req.headers['refreshToken'];

     if (!refreshToken) {
          return res.status(403).send({
               success: false,
               message: 'refreshToken is required.',
          });
     }

     let claims = jwtHelper.verifyToken(token);
     req.user = claims;
     next();
};