import User from '../models/user.model.js';
import { AppError } from '../utils/error.util.js';

export const getProfile = async (userId) => {
  if (!userId) {
    throw new AppError('User ID is required', 400);
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return { user: user.toObject() } || null;
};


const PROFILE_UPDATE_FIELDS = ['name', 'dob', 'gender', 'profileUrl'];

export const updateProfile = async (userId, updateData) => {
  if (!userId) {
    throw new AppError('User ID is required', 400);
  }
  if (!updateData || typeof updateData !== 'object') {
    throw new AppError('Update data is required', 400);
  }

  const disallowedKeys = Object.keys(updateData).filter(
    (key) => !PROFILE_UPDATE_FIELDS.includes(key)
  );
  if (disallowedKeys.length > 0) {
    throw new AppError(
      `Only these fields are allowed: ${PROFILE_UPDATE_FIELDS.join(', ')}. Remove: ${disallowedKeys.join(', ')}`,
      400
    );
  }

  const patch = {};
  for (const key of PROFILE_UPDATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) {
      patch[key] = updateData[key];
    }
  }
  if (Object.keys(patch).length === 0) {
    throw new AppError('Update data for the profile is empty', 400);
  }

  const userToUpdate = await User.findById(userId);
  if (!userToUpdate) {
    throw new AppError('User not found', 404);
  }
  Object.assign(userToUpdate, patch);
  await userToUpdate.save();
  return { user: userToUpdate.toObject() } || null;
};


export const blockUser = async (userId) => {
  if (!userId) {
    throw new AppError('User ID is required', 400);
  }
  const userToUpdate = await User.findById(userId);
  if (!userToUpdate) {
    throw new AppError('User not found', 404);
  }
  if (userToUpdate.isBlocked) {
    throw new AppError('User is already blocked', 400);
  }
  userToUpdate.isBlocked = true;
  await userToUpdate.save();
  return { user: userToUpdate.toObject() };
};

export const unblockUser = async (userId) => {
  const userToUpdate = await User.findById(userId);
  if (!userToUpdate) {
    throw new AppError('User not found', 404);
  }
  if (!userToUpdate.isBlocked) {
    throw new AppError('User is not blocked', 400);
  }
  userToUpdate.isBlocked = false;
  await userToUpdate.save();
  return { user: userToUpdate.toObject() };
};

const CHANGE_PASSWORD_FIELDS = ['password', 'currentPassword'];

export const changePassword = async (userId, body) => {
  if (!userId) {
    throw new AppError('User ID is required', 400);
  }
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400);
  }
  
  const disallowedKeys = Object.keys(body).filter(
    (key) => !CHANGE_PASSWORD_FIELDS.includes(key)
  );
  if (disallowedKeys.length > 0) {
    throw new AppError(
      `Only these fields are allowed: ${CHANGE_PASSWORD_FIELDS.join(', ')}. Remove: ${disallowedKeys.join(', ')}`,
      400
    );
  }

  const { password: newPassword, currentPassword } = body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    throw new AppError('Current password is required', 400);
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new AppError('New password is required and must be at least 8 characters long', 400);
  }

  const userToUpdate = await User.findById(userId).select('+password');
  if (!userToUpdate) {
    throw new AppError('User not found', 404);
  }

  const currentMatches = await userToUpdate.comparePassword(currentPassword);
  if (!currentMatches) {
    throw new AppError('Current password is incorrect', 400);
  }

  if (await userToUpdate.comparePassword(newPassword)) {
    throw new AppError('New password must be different from your current password', 400);
  }

  userToUpdate.password = newPassword;
  userToUpdate.lastLogin = new Date();
  await userToUpdate.save();
  return { user: userToUpdate.toObject() };
};

const startOfUtcDay = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const endOfUtcDay = (d) => {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildUserListDateFilter = (query) => {
  const startRaw = query.startDate;
  const endRaw = query.endDate;
  const hasStart = startRaw != null && String(startRaw).trim() !== '';
  const hasEnd = endRaw != null && String(endRaw).trim() !== '';

  if (hasStart || hasEnd) {
    if (!hasStart || !hasEnd) {
      throw new AppError(
        'Both startDate and endDate are required when filtering by date range',
        400
      );
    }
    const rangeStart = new Date(startRaw);
    const rangeEnd = new Date(endRaw);
    if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
      throw new AppError('Invalid startDate or endDate', 400);
    }
    const from = startOfUtcDay(rangeStart);
    const to = endOfUtcDay(rangeEnd);
    if (from > to) {
      throw new AppError('startDate must be before or equal to endDate', 400);
    }
    return { createdAt: { $gte: from, $lte: to } };
  }

  const daysVal = query.days;
  const daysStr = daysVal == null ? '' : String(daysVal).trim().toLowerCase();

  if (daysStr === '' || daysStr === 'all') {
    return {};
  }

  const now = new Date();

  const n = Number(daysVal);
  if (!Number.isInteger(n) || n < 1) {
    throw new AppError(
      'Invalid days parameter; use a positive integer (e.g. 7, 30) or "all"',
      400
    );
  }

  const end = endOfUtcDay(now);
  const start = startOfUtcDay(now);
  start.setUTCDate(start.getUTCDate() - (n - 1));
  return { createdAt: { $gte: start, $lte: end } };
};

/**
 * Query: days (omit or all = everyone | 7 | 30 | …), startDate & endDate (both, ISO),
 * search (name/email), page (default 1), limit (default 10, max 100).
 */
export const listUsers = async (query = {}) => {
  const dateFilter = buildUserListDateFilter(query);
  const filter = { ...dateFilter };

  const search =
    typeof query.search === 'string' ? query.search.trim() : '';
  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
    ];
  }

  const page = Math.max(1, parseInt(String(query.page), 10) || 1);
  const limitRaw = parseInt(String(query.limit), 10);
  const limit = Math.min(
    100,
    Math.max(1, Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10)
  );

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -otp')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((u) => u.toObject()),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

export const alluser = listUsers;

export const getUserById = async (userId) => {
  if (!userId) {
    throw new AppError('User ID is required', 400);
  }
  const user = await User.findById(userId).select('-password -otp');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return { user: user.toObject() } || null;
};