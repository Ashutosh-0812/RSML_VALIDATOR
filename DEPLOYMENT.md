# Deployment Guide

This guide covers deploying the RSML Validator application to Render with MongoDB Atlas.

## Prerequisites

1. **MongoDB Atlas Account**: Set up a cluster and get the connection string
2. **Render Account**: Create an account at render.com
3. **Git Repository**: Push your code to a Git repository (GitHub, GitLab, etc.)

## Environment Variables

### Backend Environment Variables (Set in Render Dashboard)

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `NODE_ENV`: production
- `PORT`: 10000 (automatically set by Render)
- `CORS_ORIGIN`: Your frontend domain (e.g., https://your-frontend-app.onrender.com)

### Frontend Environment Variables

- `VITE_API_URL`: Your backend domain (e.g., https://your-backend-app.onrender.com)

## Deployment Steps

### 1. Deploy Backend

1. Connect your Git repository to Render
2. Create a new Web Service
3. Select your repository and set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Region**: Oregon (or your preferred region)
   - **Plan**: Starter (or higher)
4. Add environment variables in the Environment section
5. Deploy

### 2. Deploy Frontend

1. Create another Web Service in Render
2. Select your repository and set:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `./dist`
   - **Environment**: Static Site
4. Add the `VITE_API_URL` environment variable
5. Deploy

### 3. Update CORS Configuration

After deploying both services:

1. Update the backend's `CORS_ORIGIN` environment variable with your frontend's actual URL
2. Update the frontend's `VITE_API_URL` with your backend's actual URL
3. Redeploy both services

## Alternative: Using Docker

If you prefer to use Docker for deployment:

### Backend Docker Deployment

```bash
cd backend
docker build -t rsml-validator-backend .
docker run -p 5000:5000 -e MONGODB_URI=your_atlas_uri -e JWT_SECRET=your_secret rsml-validator-backend
```

### Frontend Docker Deployment

```bash
cd frontend
docker build -t rsml-validator-frontend .
docker run -p 3000:80 rsml-validator-frontend
```

## Local Development

Use the provided docker-compose.yml for local development:

```bash
# Copy environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your local MongoDB URI and JWT secret

# Start all services
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## MongoDB Atlas Setup

1. Create a cluster in MongoDB Atlas
2. Create a database user
3. Add your application's IP addresses to the IP whitelist (use 0.0.0.0/0 for Render)
4. Copy the connection string and add it to your environment variables

## Security Notes

- Never commit environment variables containing secrets to Git
- Use strong, randomly generated JWT secrets
- Regularly rotate your database credentials
- Enable MongoDB Atlas security features (IP whitelisting, user authentication)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `CORS_ORIGIN` matches your frontend domain exactly
2. **Database Connection**: Verify MongoDB Atlas connection string and IP whitelist
3. **Environment Variables**: Ensure all required variables are set in Render dashboard
4. **Build Failures**: Check build logs in Render dashboard for specific error messages

### Logs

Check application logs in the Render dashboard to debug deployment issues.
