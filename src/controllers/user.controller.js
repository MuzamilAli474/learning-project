import { asyncHandler } from '../utils/error.util.js';
import { successResponse, errorResponse } from '../utils/response.util.js';
import * as userService from '../services/user.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  return successResponse(res, { user }, 'Profile fetched successfully');
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  return successResponse(res, result, 'Users fetched successfully');
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (String(req.params.id) !== String(req.user._id)) {
    return errorResponse(res, 'You can only update your own profile', 403);
  }
  const { user } = await userService.updateProfile(req.user._id, req.body);
  return successResponse(res, { user }, 'Profile updated successfully');
});

export const blockUser = asyncHandler(async (req, res) => {
  const { user } = await userService.blockUser(req.params.id);
  return successResponse(res, { user }, 'User blocked successfully');
});

export const unblockUser = asyncHandler(async (req, res) => {
  const { user } = await userService.unblockUser(req.params.id);
  return successResponse(res, { user }, 'User unblocked successfully');
});

export const changePassword = asyncHandler(async (req, res) => {
  if (String(req.params.id) !== String(req.user._id)) {
    return errorResponse(res, 'You can only change your own password', 403);
  }
  const { user } = await userService.changePassword(req.user._id, req.body);
  return successResponse(res, { user }, 'Password changed successfully');
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return successResponse(res, user, 'User fetched successfully');
});