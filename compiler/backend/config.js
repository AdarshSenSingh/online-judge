// Determine the appropriate CRUD URL based on environment
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const defaultCrudUrl = isDevelopment 
  ? 'http://localhost:2000' 
  : 'https://online-judge-crud.onrender.com';

// Export the CRUD URL with proper fallback
export const CRUD_URL = process.env.CRUD_URL || defaultCrudUrl;

console.log(`Config loaded - Environment: ${process.env.NODE_ENV}, CRUD URL: ${CRUD_URL}`);