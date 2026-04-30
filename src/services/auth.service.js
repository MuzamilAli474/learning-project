import User from '../models/user.model.js';
import { generateTokens, verifyAccessToken } from '../utils/token.util.js';
import { sendOTP, verifyOTP } from './otp.service.js';

export const registerUser = async (userData) => {
   
  if(!userData.email || !userData.password || !userData.name) {
    throw new Error('Email, password and name are required');
  }
  const existingUser = await User.findOne({ email: userData.email });
  
  if (existingUser) throw new Error('User already exists');
  
  const user = await User.create(userData);
  const userObject = user.toObject();
  delete userObject.password;

  // Send OTP for email verification
  const otpResult = await sendOTP(user._id);

  const { verifyEmailToken } = generateTokens({ id: user._id });

  return { user: userObject, verifyEmailToken };
};


export const verifyEmail = async (token, otp) => {
  if(!token || !otp) {
    throw new Error('Token and OTP are required');
  }
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);
  if (!user) throw new Error('User not found');
  
  if (!user.otp || !user.otp.code) throw new Error('OTP not requested');
  if (user.otp.code !== otp) throw new Error('Invalid OTP');
  if (new Date() > user.otp.expiresAt) throw new Error('OTP expired');
  
  user.isVerified = true;
  user.otp = undefined;
  await user.save();
  
  return { user };
};



export const resendOTP = async (email) => {
  const user = await User.findOne({ email }).select('-otp -password');
  if (!user) throw new Error('User not found');
  
  const { accessToken, refreshToken } = generateTokens({ id: user._id });
  const otpResult = await sendOTP(user._id);
  
  return { user, token:accessToken };
};



export const loginUser = async (email, password) => {
  console.log(email, password,"req.body");
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokens({ id: user._id });
  return { user, accessToken, refreshToken };
};

export const forgetpassword = async (email) => {
  const user = await User.findOne({ email }).select('-otp -password');
  if (!user) throw new Error('User not found');

  await sendOTP(user._id);
  
  const { accessToken } = generateTokens({ id: user._id });

  
  return { user, forgetPasswordToken:accessToken };
};


export const verfifyForgetPasswordotp = async (token,otp) => {
  if(!token || !otp) {
    throw new Error('Token and OTP are required');
  }
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);
  if (!user) throw new Error('User not found');
  await verifyOTP(user._id, otp);

  const { accessToken } = generateTokens({ id: user._id });
  
  return { user, resetPasswordToken:accessToken };
};




export const resetPassword = async (token, password) => {
  if(!token || !password) {
    throw new Error('Token and password are required');
  }
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);
  if (!user) throw new Error('User not found');
  
  user.password = password;
  await user.save();
  
  return { user };
};
