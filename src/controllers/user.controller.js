import { asyncHandler } from '../utils/error.util.js';
import { successResponse } from '../utils/response.util.js';
import * as userService from '../services/user.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  return successResponse(res, { user }, 'Profile fetched successfully');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  return successResponse(res, { user }, 'Profile updated successfully');
});
