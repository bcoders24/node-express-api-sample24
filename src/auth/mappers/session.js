'use strict';
exports.toModel = (entity) => {
    const model = {
        accessToken: entity.accessToken,
        refreshToken: entity.refreshToken
    };
    return model;
};