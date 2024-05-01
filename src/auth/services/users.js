/**
 * @module user
 */

const httpStatus = require("http-status");
const updateEntities = require("../../../helpers/updateEntities");


const populate = [
  { path: "connectedProfile.profile" },
  { path: "organization",populate:{ path: "userPlan", populate: { path: "plan" } } },
  { path: "userPlan", populate: { path: "plan" } },
];

const getById = async (id) => {
  return await db.user.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
  return await db.user.findOne(condition).populate(populate);
};

const get = async (query) => {
  if (typeof query === "string") {
    if (query.isObjectId()) {
      return getById(query);
    }
  }
  if (query.id) {
    return getById(query.id);
  }
  if (query.email) {
    return getByCondition({ email: query.email });
  }
  if (query.phone) {
    return getByCondition({ phone: query.phone });
  }
  if (query.username) {
    return getByCondition({ userName: query.username });
  }
  return null;
};

const set = (model, entity) => {
  return updateEntities.update(model, entity);
};

/**
 * Create a new user entity based on the provided body data.
 * @function create
 * @param {Object} body - The body containing details to create the user entity.
 * @returns {Promise<Object>} Returns a Promise that resolves to the newly created user entity.
 * @throws {ApiError} Throws an error if the email or phone number is already taken.
 */
const create = async (body) => {
  const isTaken =
    body.authMethod === "email" && (await db.user.isEmailTaken(body.email));

  if (isTaken) {
    const errorMessage =
      body.authMethod === "email"
        ? "Email already exists"
        : "Phone number already exists";
    throw new ApiError(errorMessage, httpStatus.BAD_REQUEST);
  }

  let data = await db.user.newEntity(body);
  let entity = await db.user.create(data);
 
  return entity;
};

/**
 * Update a user entity based on the provided Id and model data.
 * @function update
 * @param {String} id - The Id of the user entity to be updated.
 * @param {Object} model - The model containing the updated data for the user entity.
 * @returns {Promise<Object>} Returns a Promise that resolves to the updated user entity.
 */
const update = async (id, model) => {
  let entity = await db.user.findById(id);
  set(model, entity);
  if (model.isProfileCompleted) {
    entity.status = "active";
    entity.isEmailVerified = true;
  }
  entity = await entity.save();
  if (model.isProfileCompleted) {
    await notification.newUser(entity);
  }
  return entity;
};

/**
 * Search for user entities based on the provided query parameters and pagination settings.
 * @function search
 * @param {Object} query - The query parameters for filtering users (e.g., search, status).
 * @param {Object} page - The pagination settings (skip and limit).
 * @param {Object} user - The authenticated user performing the search.
 * @returns {Promise<Object>} Returns a Promise that resolves to an object containing the count of users and the user items.
 */
const search = async (query, page, user) => {
  let where = {
    _id: { $ne: user._id },
  };
  if (query.search) {
    where["$or"] = [
      { fullName: new RegExp(query.search, "i") },
      { phone: new RegExp(query.search, "i") },
      { email: new RegExp(query.search, "i") },
      { username: new RegExp(query.search, "i") },
      { planName: new RegExp(query.search, "i") },
      { planStatus: query.search },
    ];
  }

  if (query.planName) {
    where.planName = new RegExp(query.planName, "i");
  }

  if (query.organization) {
    where.organization = query.organization;
  }

  if (query.planStatus) {
    where.planStatus = query.planStatus;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.sortOrder) {
    sort = sortOrder(query.sortOrder);
  } else {
    sort = { createdAt: -1 };
  }
  const count = await db.user.countDocuments(where);
  let items;
  if (page) {
    items = await db.user
      .find(where)
      .sort(sort)
      .skip(page.skip)
      .limit(page.limit)
      .populate(populate);
  } else {
    items = await db.user.find(where).sort(sort).populate(populate);
  }
 
  return {
    count,
    items,
  };
};

/**
 * Remove a user entity based on the provided ID, considering the user's status is not 'deleted'.
 * @function remove
 * @param {string} id - The Id of the user to be removed.
 * @returns {Promise<Object|null>} Returns a Promise that resolves to null if the user is not found or deletes the user entity.
 */
const remove = async (id) => {
  let entity = await db.user.findOne({ _id: id, status: { $ne: "deleted" } });
  if (entity) {
    let connectedProfileUser = await db.user.findOne({
      connectedProfile: {
        $elemMatch: {
          profile: entity.id,
        },
      },
    });
    if (
      connectedProfileUser &&
      connectedProfileUser.connectedProfile.length > 0
    ) {
      connectedProfileUser.connectedProfile = [];
      await connectedProfileUser.save();
    }
    return await db.user.deleteOne({ _id: entity.id });
  }
  return null;
};

/**
 * Connects a user with another profile based on the provided model and user details.
 * @function connectWithProfile
 * @param {Object} model - The model containing the referral code for connection.
 * @param {Object} user - The user object to connect with another profile.
 * @returns {Promise<Object>} Returns a Promise that resolves to the updated user entity if the connection is successful.
 * @throws {ApiError} Throws an error if the referral code user is not found or more than one profile is already connected.
 */
const connectWithProfile = async (model, user) => {
  if (model.referralCode) {
    let alreadyUsed = await db.referralCodeHistory.findOne({
      referralCode: model.referralCode,
      user: user.id,
    });
    if (alreadyUsed) {
      throw new ApiError(
        "You have already used this referral code",
        httpStatus.BAD_REQUEST
      );
    }
    let parentUserUser = await db.user
      .findOne({ referralCode: model.referralCode })
      .populate(populate);
    let connectedUser = await db.user.findById(user.id);
    if (!parentUserUser) {
      throw new ApiError("ReferralCode user not found", httpStatus.NOT_FOUND);
    }
    if (
      parentUserUser.connectedProfile.length < 1 &&
      connectedUser.connectedProfile.length < 1
    ) {
      parentUserUser.connectedProfile.push({
        profile: user.id,
        isPlanPurchased: false,
      });
      connectedUser.connectedProfile.push({
        profile: parentUserUser.id,
        isPlanPurchased: true,
      });
      connectedUser.userPlan = parentUserUser.userPlan.id;
      connectedUser.planName = parentUserUser.userPlan.plan.name;
      connectedUser.planExpiryDate = parentUserUser.userPlan.endDate;
      connectedUser.planStatus = parentUserUser.userPlan.status;
      connectedUser.isSubscriptionScreen = false;
      await db.referralCodeHistory.create({
        referralCode: model.referralCode,
        user: user.id,
      });
      await parentUserUser.save();
      return await connectedUser.save();
    } else {
      throw new ApiError(
        "Only one profile can be connected.",
        httpStatus.BAD_REQUEST
      );
    }
  }
};

/**
 * Removes the connected profile association between two users based on the provided model and user details.
 * @function connectedProfileRemove
 * @param {Object} model - The model containing details required to remove the connection.
 * @param {Object} user - The user object initiating the removal of the connection.
 * @returns {Promise<Object>} Returns a Promise that resolves to the updated parent user entity after removing the connection.
 * @throws {ApiError} Throws an error if the connect user profile is not found or if there are no connected profiles.
 */
const connectedProfileRemove = async (model, user) => {
  let parentUser, connectUser;
  if (model.userType === "parentUser") {
    parentUser = await db.user.findById(user.id);
    connectUser = await db.user.findById(model.connectUserId);
  } else if (model.userType === "connectedUser") {
    parentUser = await db.user.findById(model.connectUserId);
    connectUser = await db.user.findById(user.id);
  }
  if (!connectUser) {
    throw new ApiError("Connect user profile not found", httpStatus.NOT_FOUND);
  }
  if (
    parentUser &&
    parentUser.connectedProfile.length > 0 &&
    connectUser &&
    connectUser.connectedProfile.length > 0
  ) {
    parentUser.connectedProfile = [];
    connectUser.connectedProfile = [];
    connectUser.isSubscriptionScreen = true;
    parentUser.isSubscriptionScreen = true;
    connectUser.userPlan = null;
    connectUser.planStatus = null;
    connectUser.planName = null;
    connectUser.planExpiryDate = null;
    await connectUser.save();
    return await parentUser.save();
  }
};

module.exports = {
  get,
  create,
  update,
  search,
  remove,
  connectWithProfile,
  connectedProfileRemove,
};
