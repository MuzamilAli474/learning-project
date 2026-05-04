import * as authService from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';
import { asyncHandler, AppError } from '../utils/error.util.js';

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  return successResponse(res, user, 'User registered successfully', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
  return successResponse(res, { user, accessToken, refreshToken }, 'Login successful');
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Authorization token is required');
  if (!req.body || !req.body.otp) throw new Error('OTP is required in request body');
  
  const { otp } = req.body;
  const result = await authService.verifyEmail(token, otp);
  return successResponse(res, result, 'Email verified successfully');
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new Error('Email is required in request body');
  const result = await authService.resendOTP(email);
  return successResponse(res, result, 'OTP resent successfully');
});

export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(email,"email");
  if (!email) throw new Error('Email is required in request body');
  const result = await authService.forgetpassword(email);
  return successResponse(res, result, 'Forget password email sent successfully');
});


export const verifyForgetPasswordOTP = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Authorization token is required');
  if (!req.body || !req.body.otp) throw new Error('OTP is required in request body');
  
  const { otp } = req.body;
  const result = await authService.verfifyForgetPasswordotp(token, otp);
  return successResponse(res, result, 'Forget password OTP verified successfully');
});

export const resetPassword = asyncHandler(async (req, res) => {
  if (!req.body || !req.body.password) throw new Error('Password is required in request body')
  if(!req.headers.authorization) throw new Error('Authorization header is required');
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Authorization token is required');
  const { password } = req.body;
  const result = await authService.resetPassword(token, password);
  return successResponse(res, result, 'Password reset successfully');
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken || typeof refreshToken !== 'string') {
    throw new AppError('Refresh token is required in request body', 400);
  }
  const result = await authService.refreshAccessToken(refreshToken);
  return successResponse(res, result, 'Access token refreshed successfully');
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || typeof email !== 'string') {
    throw new AppError('Email is required in request body', 400);
  }
  if (!password || typeof password !== 'string') {
    throw new AppError('Password is required in request body', 400);
  }
  const result = await authService.adminLogin(email, password);
  return successResponse(res, result, 'Admin login successful');
});