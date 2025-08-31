# 🚀 Campus Event Management System - Setup Guide

This guide will walk you through setting up the complete Campus Event Management System with all its enhanced features.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🏗️ Project Structure

```
campus-event-management/
├── backend/                 # Node.js/Express backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & validation
│   ├── lib/                # External service configurations
│   ├── uploads/            # Temporary file storage
│   └── server.js           # Main server file
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── dashboards/     # Role-specific dashboards
│   │   └── common/         # Shared components
│   └── public/             # Static assets
└── README.md               # Project documentation
```

## 🔧 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd campus-event-management
```

### 2. Backend Setup

#### 2.1 Install Dependencies
```bash
cd backend
npm install
```

#### 2.2 Environment Configuration
Create a `.env` file in the backend directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/campus-events

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration (for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Google Maps API Key (for venue location)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_FILE_SIZE=10485760
MAX_FILES=10

# Security
CORS_ORIGIN=http://localhost:3000
HELMET_ENABLED=true
COMPRESSION_ENABLED=true
```

#### 2.3 External Services Setup

**Cloudinary (Media Storage):**
1. Go to [Cloudinary](https://cloudinary.com/) and create an account
2. Get your Cloud Name, API Key, and API Secret
3. Add them to your `.env` file

**Google Maps API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Maps JavaScript API and Geocoding API
4. Create credentials (API Key)
5. Add the API key to your `.env` file

**Email Service (Gmail):**
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in your `.env` file

#### 2.4 Start Backend Server
```bash
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

#### 3.1 Install Dependencies
```bash
cd ../frontend
npm install
```

#### 3.2 Environment Configuration
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

#### 3.3 Start Frontend Application
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 🗄️ Database Setup

### 1. MongoDB Installation

**Windows:**
1. Download MongoDB Community Server
2. Run the installer
3. Add MongoDB to your system PATH
4. Create data directory: `mkdir C:\data\db`

**macOS:**
```bash
brew install mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mongodb
```

### 2. Start MongoDB Service

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Verify Connection
```bash
mongosh
# or
mongo
```

## 🧪 Testing the Setup

### 1. Backend Health Check
Visit `http://localhost:5000` in your browser. You should see:
```json
{
  "message": "Campus Event Management API"
}
```

### 2. Frontend Application
Visit `http://localhost:3000` in your browser. You should see the login page.

### 3. Create Test User
1. Go to `http://localhost:3000/register`
2. Create a test account
3. Try logging in

## 🔐 Default Admin Setup

### 1. Create Admin User
Use the provided script to create an admin user:

```bash
cd backend
node add-admin.js
```

### 2. Admin Credentials
Default admin credentials:
- Email: `admin@campus.com`
- Password: `admin123`

**⚠️ Change these credentials immediately after first login!**

## 🚀 Production Deployment

### 1. Environment Variables
Update your `.env` files with production values:

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://yourdomain.com
```

### 2. Build Frontend
```bash
cd frontend
npm run build
```

### 3. Deploy Backend
```bash
cd backend
npm start
```

### 4. Recommended Hosting Platforms

**Backend:**
- Heroku
- Railway
- DigitalOcean
- AWS EC2

**Frontend:**
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
- Ensure MongoDB service is running
- Check connection string in `.env`
- Verify MongoDB is installed correctly

**2. Port Already in Use**
- Change PORT in `.env` file
- Kill process using the port: `lsof -ti:5000 | xargs kill -9`

**3. CORS Error**
- Check FRONTEND_URL in backend `.env`
- Ensure CORS_ORIGIN matches your frontend URL

**4. File Upload Issues**
- Verify Cloudinary credentials
- Check file size limits
- Ensure uploads directory exists

**5. Email Notifications Not Working**
- Verify Gmail credentials
- Check if 2FA is enabled
- Use App Password instead of regular password

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=*
```

## 📱 Mobile Testing

### 1. Responsive Design
- Use browser dev tools to test mobile views
- Test on actual mobile devices
- Verify touch interactions work correctly

### 2. QR Code Testing
- Test QR code generation
- Verify QR code scanning works on mobile
- Test attendance tracking

## 🔒 Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Enable security headers (Helmet)
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## 📊 Performance Optimization

### 1. Database
- Add proper indexes
- Use database connection pooling
- Implement query optimization

### 2. Frontend
- Enable code splitting
- Use lazy loading for components
- Optimize bundle size

### 3. Media
- Implement image compression
- Use CDN for media delivery
- Enable caching headers

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** - Backend console and browser console
2. **Verify configuration** - Environment variables and service credentials
3. **Check dependencies** - Ensure all packages are installed
4. **Search issues** - Look for similar problems in the repository
5. **Create issue** - Provide detailed error information and steps to reproduce

## 🎯 Next Steps

After successful setup:

1. **Customize the system** - Modify themes, add custom categories
2. **Add more features** - Implement additional functionality
3. **Set up monitoring** - Add logging and performance monitoring
4. **Create backups** - Set up database backup procedures
5. **User training** - Train users on system features

---

**🎉 Congratulations! Your Campus Event Management System is now running with all enhanced features!**

For more information, check the main [README.md](README.md) file.

