// Load environment variables if not already loaded
import dotenv from 'dotenv';
dotenv.config();

// Define all URLs in one place
export const FRONTEND_URL = process.env.FRONTEND_URL || 'https://online-judge-sandy.vercel.app';
export const CRUD_URL = process.env.CRUD_URL || 'https://online-judge-crud.onrender.com';
export const AUTH_URL = process.env.AUTH_URL || 'https://online-judge-backend-bqbr.onrender.com';

// Define allowed origins for CORS
export const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://online-judge-sandy.vercel.app',
  'https://online-judge-compiler-tzuv.onrender.com'
];

// Other configuration values
export const PORT = process.env.PORT || 8000;
export const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGOURL;
export const JWT_SECRET = process.env.JWT_SECRET_KEY;

// Log configuration on startup
console.log('Configuration loaded:');
console.log(`- Environment: ${process.env.NODE_ENV || 'not set'}`);
console.log(`- Frontend URL: ${FRONTEND_URL}`);
console.log(`- CRUD URL: ${CRUD_URL}`);
console.log(`- AUTH URL: ${AUTH_URL}`);





