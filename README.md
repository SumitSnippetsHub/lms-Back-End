# LMS (Learning Management System) - Server

A comprehensive Learning Management System backend built with Node.js, Express.js, and MongoDB. This system provides APIs for user management, course management, payment processing, and more.

## 🚀 Features

- **User Management**: Registration, login, profile management, password reset
- **Course Management**: Create, read, update, delete courses with multimedia support
- **Authentication & Authorization**: JWT-based authentication with role-based access
- **Payment Integration**: Razorpay payment gateway integration
- **File Upload**: Cloudinary integration for image/video uploads
- **Email Service**: Nodemailer for email notifications
- **Error Handling**: Centralized error handling middleware
- **Security**: CORS, cookie parsing, bcrypt password hashing

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **Payment Gateway**: Razorpay
- **Email Service**: Nodemailer
- **Password Hashing**: bcryptjs
- **Development**: Nodemon for auto-restart

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (v4.4 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## ⚙️ Environment Variables

Create a `.env` file in the server directory and add the following environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/lms

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=24h

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

# Email Configuration (Nodemailer)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USERNAME=your_email_username
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@yourdomain.com
```
