'use strict';
const _ = require('underscore');
const sessionMapper = require('./session');

exports.toModel = (entity) => {
     const model = {
          id: entity._id,
          firstName: entity.firstName,
          lastName: entity.lastName,
          fullName: entity.fullName,
          countryCode: entity.countryCode,
          ISOCode: entity.ISOCode,
          imgUrl: entity.imgUrl,
          coverImgUrl: entity.coverImgUrl,
          userName: entity.userName,
          phone: entity.phone,
          email: entity.email,
          isEmailVerified: entity.isEmailVerified,
          isPhoneVerified: entity.isPhoneVerified,
          status: entity.status,
          isProfileCompleted: entity.isProfileCompleted,
          googleId: entity.googleId,
          appleId: entity.appleId,
          facebookId: entity.facebookId,
          canUpdateUsername: entity.canUpdateUsername,
          role: entity.role,
          authMethod: entity.authMethod,
          additionalInformation: entity.additionalInformation,
          areas: entity.areas,
          expectations: entity.expectations,
          referralCode: entity.referralCode,
          planExpiryDate: entity.planExpiryDate,
          isTrialPlan: entity.isTrialPlan,
          planStatus: entity.planStatus,
          planName: entity.planName,
          customerId: entity.customerId,
          isSubscriptionScreen: entity.isSubscriptionScreen,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
          organization: entity.organization,

     };
   
 
     return model;
};

exports.toSearchModel = (entities) => {
     return _.map(entities, exports.toModel);
};

exports.toAuthModel = (entity) => {
     let model = exports.toModel(entity);
     if (entity.session) {
          model.session = sessionMapper.toModel(entity.session);
     }
     return model;
};
