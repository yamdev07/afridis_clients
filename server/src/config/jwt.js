import dotenv from 'dotenv';

dotenv.config();

export default {
  secret: process.env.JWT_SECRET || 'change_this_secret_in_production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_this_refresh_secret_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
