'use strict';
var jwt = require('jsonwebtoken');
var auth = require('config').get('auth');

exports.getAccessToken = (user, session) => {
     const claims = {
          session: session.id,
          user: user.id,

     };
     // if (session && session.deviceType == 'web') {
     //      claims.userModel = user;
     // }
     return jwt.sign(claims, auth.secret, {
          expiresIn: `${auth.tokenPeriod}m`,
     });
};

exports.getRefreshToken = (user, session) => {
     const claims = {
          user: user.id,
     };
     // if (session && session.deviceType == 'web') {
     //      claims.userModel = user;
     // }
     return jwt.sign(claims, auth.refreshSecret, {
          expiresIn: `${auth.refreshPeriod}d`
     });
};

exports.verifyToken = (token) => {
     return jwt.verify(token, auth.secret);
};
