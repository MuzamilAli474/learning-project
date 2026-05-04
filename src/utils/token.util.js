import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from './error.util.js';

export const generateAccessToken = (payload) => {
  return jwt.sign({ ...payload, type: 'access' }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign({ ...payload, type: 'refresh' }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, config.jwt.refreshSecret);
  if (decoded.type !== 'refresh') {
    throw new AppError(
      'Use the refresh token from login, not the access token',
      401
    );
  }
  return decoded;
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export const generateTokens = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};

export const generateVerifyEmailToken = (payload) => {
  return jwt.sign({ ...payload, type: 'verify-email' }, config.jwt.accessSecret, {
    expiresIn: '24h',
  });
};

export const generateResetPasswordToken = (payload) => {
  return jwt.sign({ ...payload, type: 'reset-password' }, config.jwt.accessSecret, {
    expiresIn: '15m',
  });
};

export const verifyTokenType = (token, expectedType) => {
  const decoded = jwt.verify(token, config.jwt.accessSecret);
  if (decoded.type !== expectedType) {
    throw new Error(`Invalid token type. Expected ${expectedType} but got ${decoded.type || 'none'}`);
  }
  return decoded;
};
