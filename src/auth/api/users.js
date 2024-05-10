'use strict';

import base from '../../../api/api-base';
import userService from '../services/users';
import userMapper from '../mappers/user';

const __dirname = new URL('.', import.meta.url).pathname;
const apiBase = base(__dirname, 'users', 'user');

export const create = async (req, res) => {
  let retVal = await apiBase.create(req);
  return res.data(retVal);
};

export const update = async (req, res) => {
  let retVal = await apiBase.update(req);
  return res.data(retVal);
};

export const search = async (req, res) => {
  let retVal = await apiBase.search(req);
  return res.page(retVal);
};

export const get = async (req, res) => {
  let retVal = await apiBase.get(req);
  return res.data(retVal);
};

export const remove = async (req, res) => {
  let retVal = await apiBase.delete(req);
  return res.success(retVal);
};

export const connectWithProfile = async (req, res) => {
  let retVal = await userService.connectWithProfile(req.body, req.user);
  return res.data(userMapper.toModel(retVal));
};

export const connectedProfileRemove = async (req, res) => {
  await userService.connectedProfileRemove(req.body, req.user);
  return res.success('Connected profile removed successfully');
};