// Sample configuration file - copy to config.js and fill in your values
module.exports = {
  // Database Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-events'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production',
    expiresIn: '24h'
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },

  // Frontend URL
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Cloudinary Configuration (for media uploads)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloudinary_cloud_name',
    apiKey: process.env.CLOUDINARY_API_KEY || 'your_cloudinary_api_key',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'your_cloudinary_api_secret'
  },

  // Email Configuration (for notifications)
  email: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_email_app_password',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587
  },

  // Google Maps API Key (for venue location)
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || 'your_google_maps_api_key'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
    maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100
  },

  // File Upload Limits
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || 10485760, // 10MB
    maxFiles: process.env.MAX_FILES || 10
  },

  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    helmetEnabled: process.env.HELMET_ENABLED !== 'false',
    compressionEnabled: process.env.COMPRESSION_ENABLED !== 'false'
  }
};

