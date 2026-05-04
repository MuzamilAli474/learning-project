import { AppError } from '../utils/error.util.js';

const formatMongooseValidation = (err) =>
  Object.values(err.errors || {})
    .map((e) => e.message)
    .join(', ') || err.message;

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = formatMongooseValidation(err);
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  } else {
    statusCode = statusCode || 500;
  }

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
  });
};
