import User from '../models/user.model.js';
import { sendOTPEmail } from '../utils/email.util.js';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp = {
    code: otp,
    expiresAt,
  };
  await user.save();

  await sendOTPEmail({
    to: user.email,
    otp,
    name: user.name,
  });

  return { message: 'OTP sent successfully' };
};

export const verifyOTP = async (userId, code) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (!user.otp || !user.otp.code) throw new Error('OTP not requested');

  if (user.otp.code !== code) throw new Error('Invalid OTP');
  if (new Date() > user.otp.expiresAt) throw new Error('OTP expired');

  user.isVerified = true;
  user.otp = undefined;
  await user.save();

  return { message: 'Email verified successfully' };
};
