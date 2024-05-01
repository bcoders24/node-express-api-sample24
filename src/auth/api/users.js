'use strict';
const base = require('../../../api/api-base')(__dirname, 'users', 'user');
const userService = require('../services/users');
const userMapper = require('../mappers/user');

exports.create = async (req, res) => {
    let retVal = await base.create(req);
    return res.data(retVal);
};

exports.update = async (req, res) => {
    let retVal = await base.update(req);
    return res.data(retVal);
};

exports.search = async (req, res) => {
    let retVal = await base.search(req);
    return res.page(retVal);
};

exports.get = async (req, res) => {
    let retVal = await base.get(req);
    return res.data(retVal);
};

exports.delete = async (req, res) => {
    let retVal = await base.delete(req);
    return res.success(retVal);
};

exports.connectWithProfile = async (req, res) => {
    let retVal = await userService.connectWithProfile(req.body, req.user)
    return res.data(userMapper.toModel(retVal))
}

exports.connectedProfileRemove = async (req, res) => {
    await userService.connectedProfileRemove(req.body, req.user)
    return res.success('Connected profile removed successfully')
}
