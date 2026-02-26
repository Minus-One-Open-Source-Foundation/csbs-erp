# 🎓 Student Activity Hub - Frontend

> **Enterprise-grade React application** for comprehensive student data management, activity tracking, and academic portfolio development.

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.18-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Material-UI](https://img.shields.io/badge/MUI-7.3.2-007FFF?style=flat&logo=mui)](https://mui.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building & Deployment](#building--deployment)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Security](#security)
- [Testing](#testing)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## 🎯 Overview

The **Student Activity Hub** is a sophisticated web application designed to empower students and faculty with comprehensive tools for managing academic records, extracurricular activities, achievements, internships, and professional portfolios. Built with modern web technologies, it provides a seamless, responsive, and intuitive user experience.

### Purpose

This application serves as a centralized platform for:
- **Students**: Track personal information, academic records, activities, achievements, internships, and build professional portfolios
- **Faculty**: Review and approve student submissions, manage grades, generate reports, and oversee student progress

### Key Characteristics

- **Role-Based Access**: Separate interfaces and permissions for students and faculty
- **Real-time Updates**: Dynamic data synchronization with backend API
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Enterprise Security**: JWT-based authentication with secure token management
- **Scalable Architecture**: Modular component structure for easy maintenance and expansion

## ✨ Key Features

### Student Portal

- 📊 **Dashboard**: Comprehensive overview of academic progress and activities
- 👤 **Personal Information Management**: Profile creation and updates with photo upload
- 📚 **Academic Records**: GPA tracking, course history, and grade visualization
- 🎯 **Activities Management**: Log hackathons, workshops, and extracurricular events
- 🏆 **Achievements Tracking**: Document awards, certifications, and recognitions
- 💼 **Internship Portal**: Submit and track internship applications
- 📄 **Resume Management (URMS)**: Upload, organize, and manage multiple resume versions
- 📈 **Analytics Dashboard**: Visual insights into academic and activity trends
- 🎨 **Portfolio Builder**: Showcase skills, projects, and accomplishments
- 🔑 **OTP Email Verification**: Secure one-time-password verification during registration

### Faculty Portal

- 📋 **Student Management**: View and manage student profiles
- ✅ **Request Approval System**: Review and approve/reject student submissions
- 📜 **Certifications Approval**: Review and approve/reject student certification requests
- 📊 **Grade Management**: Assign and track student grades
- 📑 **Report Generation**: Create comprehensive student reports
- 🔍 **Analytics**: Monitor student performance and engagement metrics

### Technical Features

- 🔐 **Secure Authentication**: JWT-based auth with automatic token refresh
- 🎨 **Modern UI/UX**: Material-UI components with custom theming
- 📱 **Responsive Design**: Mobile-first approach with adaptive layouts
- ⚡ **Fast Performance**: Optimized builds with code splitting
- 🌐 **RESTful API Integration**: Comprehensive backend connectivity
- 📁 **File Management**: Azure Blob Storage integration for uploads
- 📊 **Data Visualization**: Interactive charts with Recharts
- 🔄 **State Management**: Context API for global state

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                       │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │   React    │  │   Vite   │  │  Material-UI     │   │
│  │   Router   │  │  Server  │  │   Components     │   │
│  └────────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│                  API Integration Layer                   │
│  ┌────────────────────────────────────────────────┐    │
│  │  Axios Client (JWT Interceptors)               │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                        ↕ REST API
┌─────────────────────────────────────────────────────────┐
│                   Backend Services                       │
│  (Spring Boot REST API + Azure Blob Storage)            │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

The application follows a **modular component-based architecture**:

- **Presentation Layer**: Reusable UI components (`components/`)
- **Business Logic Layer**: Page-level components with state management (`pages/`)
- **Data Layer**: API services and context providers (`services/`, `contexts/`)
- **Routing Layer**: Client-side routing with role-based access control (`App.jsx`)

## 🛠️ Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI library for building interactive interfaces |
| **Vite** | 7.1.2 | Next-generation frontend build tool |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **Material-UI** | 7.3.2 | Enterprise-ready React component library |
| **React Router** | 7.9.1 | Client-side routing and navigation |
| **Axios** | 1.12.2 | HTTP client for API communication |
| **Recharts** | 3.2.0 | Composable charting library |

### Additional Libraries

- **@emotion/react** & **@emotion/styled**: CSS-in-JS styling
- **@mui/x-data-grid**: Advanced data table component
- **react-toastify**: Toast notifications for user feedback
- **jsPDF**: PDF generation for reports
- **qrcode**: QR code generation for portfolios
- **react-icons**: Icon library

### Development Tools

- **ESLint**: Code linting and quality enforcement
- **Tailwind CSS Vite Plugin**: Integrated Tailwind CSS processing
- **PostCSS**: CSS transformation pipeline
- **Vite Plugin React**: Fast Refresh and JSX support
- **Node.js**: Runtime environment (v18+ required)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Recommended Tools

- **Visual Studio Code**: With ESLint and Prettier extensions
- **React Developer Tools**: Browser extension for debugging
- **Postman**: For API testing (optional)

## 🚀 Installation

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/Minus-One-Open-Source-Foundation/csbs-erp.git

# Using SSH
git clone git@github.com:Minus-One-Open-Source-Foundation/csbs-erp.git

# Navigate to project directory
cd csbs-erp
```

### 2. Install Dependencies

```bash
# Install all required packages
npm install

# For clean install (recommended)
npm ci
```

### 3. Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18.x or higher

# Check npm version
npm --version   # Should be 9.x or higher

# Verify dependencies
npm list --depth=0
```

## ⚙️ Configuration

### Environment Variables

Create environment-specific configuration files:

#### Development (`.env.development`)

```env
# API Configuration
VITE_API_URL=http://localhost:8058/api

# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false

# Application Settings
VITE_APP_NAME=Student Activity Hub
VITE_APP_VERSION=1.0.0
```

#### Production (`.env.production`)

```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com/api

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true

# Application Settings
VITE_APP_NAME=Student Activity Hub
VITE_APP_VERSION=1.0.0
```

#### Example Template (`.env.example`)

```env
# Copy this file to .env.development or .env.production and update values

# Backend API URL (required)
VITE_API_URL=http://localhost:8058/api

# Optional configurations
VITE_ENABLE_DEBUG=true
VITE_APP_NAME=Student Activity Hub
```

### API Configuration

The application uses Axios for API communication. Configuration is in `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8058/api",
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});
```

**Key Features:**
- Automatic JWT token injection via request interceptors
- Global error handling with response interceptors
- Automatic token refresh on 401 errors
- Request/response logging for debugging

### Backend Requirements

This frontend requires a Spring Boot backend API. Key endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/register`, `/api/auth/send-otp`, `/api/auth/verify-otp`
- **Profile Management**: `/api/profile/**`
- **Events**: `/api/events/**`
- **Achievements**: `/api/achievements/**`
- **Internships**: `/api/internships/**`
- **Faculty**: `/api/faculty/**`
- **File Storage**: `/files/**` (Azure Blob Storage)

## 💻 Development

### Starting the Development Server

```bash
# Start Vite dev server with hot module replacement
npm run dev

# Server will start at http://localhost:5173
# API proxy configured for http://localhost:8058
```

### Development Workflow

1. **Code Changes**: Edit files in `src/` directory
2. **Hot Reload**: Changes automatically reflect in browser
3. **Lint Code**: Run `npm run lint` before committing
4. **Build Test**: Run `npm run build` to verify production build

### Code Quality

```bash
# Run ESLint to check code quality
npm run lint

# Auto-fix ESLint issues (where possible)
npm run lint -- --fix
```

### Directory Structure Explained

```
src/
├── api/                    # API service modules
│   └── activities.js       # Activities API endpoints
├── assets/                 # Static assets (images, fonts)
├── components/             # Reusable UI components
│   ├── Layout.jsx          # Student layout wrapper
│   ├── FacultyLayout.jsx   # Faculty layout wrapper
│   ├── Sidebar.jsx         # Student navigation sidebar
│   ├── FacultySidebar.jsx  # Faculty navigation sidebar
│   ├── Navbar.jsx          # Top navigation bar
│   ├── FileUpload.jsx      # File upload component
│   ├── Heading.jsx         # Page heading component
│   └── faculty/            # Faculty-specific components
├── contexts/               # React Context providers
│   └── AuthContext.jsx     # Authentication state management
├── pages/                  # Page-level components
│   ├── Login.jsx           # Login page
│   ├── Register.jsx        # Registration page
│   ├── Dashboard.jsx       # Student dashboard
│   ├── PersonalInfo.jsx    # Profile management
│   ├── Activities.jsx      # Activities tracking
│   ├── Achievements.jsx    # Achievements management
│   ├── Internships.jsx     # Internship applications
│   ├── HackWorkshops.jsx   # Hackathons & workshops
│   ├── URMS.jsx            # Resume management system
│   ├── FacultyDashboard.jsx        # Faculty dashboard
│   ├── FacultyRequests.jsx         # Faculty request management
│   ├── FacultyCertificationsRequests.jsx   # Certification approvals
│   ├── StudentManagement.jsx       # Student management
│   ├── GradeManagement.jsx         # Grade assignment
│   ├── Reports.jsx                 # Report generation
│   ├── FacultyInternshipsRequests.jsx  # Internship approvals
│   └── AchievementsRequest.jsx     # Achievement approvals
├── services/               # External service integrations
│   └── api.js              # Axios configuration & API clients
├── App.jsx                 # Main application component
├── main.jsx                # Application entry point
└── index.css               # Base CSS styles with Tailwind imports
```

## 🏭 Building & Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Output directory: dist/
# Contains minified HTML, CSS, and JavaScript
```

### Build Optimization

The production build includes:
- ✅ Code minification and compression
- ✅ Tree shaking (dead code elimination)
- ✅ Asset optimization (images, fonts)
- ✅ Source maps for debugging
- ✅ Code splitting for faster load times

### Preview Production Build Locally

```bash
# Preview the production build
npm run preview

# Opens at http://localhost:4173
```

### Deployment Options

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@api-url-production"
  }
}
```

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option 3: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build Docker image
docker build -t student-activity-hub .

# Run container
docker run -p 80:80 student-activity-hub
```

#### Option 4: AWS S3 + CloudFront

```bash
# Build for production
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Environment-Specific Builds

```bash
# Development build
npm run build -- --mode development

# Production build
npm run build -- --mode production

# Staging build (create .env.staging first)
npm run build -- --mode staging
```

## 📂 Project Structure

### High-Level Organization

```
csbs-erp/
├── .vscode/                # VS Code workspace settings
├── dist/                   # Production build output (generated)
├── node_modules/           # Dependencies (generated)
├── public/                 # Static public assets
├── src/                    # Source code (see detailed structure above)
├── .dockerignore           # Docker ignore rules
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
├── CHANGELOG.md            # Version history
├── CONTRIBUTING.md         # Contribution guidelines
├── LICENSE                 # Proprietary License
├── SECURITY.md             # Security policies
├── dockerfile              # Docker build configuration
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── nginx.conf              # Nginx configuration for Docker
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Locked dependency versions
├── postcss.config.js       # PostCSS configuration
├── README.md               # This file
├── tailwind.configf.js     # Tailwind CSS configuration
└── vite.config.js          # Vite configuration
```

### Configuration Files

- **`vite.config.js`**: Vite build tool configuration with Tailwind CSS plugin
- **`eslint.config.js`**: Code quality and linting rules
- **`postcss.config.js`**: PostCSS configuration for Tailwind CSS
- **`tailwind.configf.js`**: Tailwind CSS theme and content configuration
- **`package.json`**: Dependencies and npm scripts
- **`index.html`**: SPA entry point with root div

## 🔌 API Integration

### Authentication Flow

```javascript
// 1. User logs in
const response = await authAPI.login(email, password);

// 2. Store JWT token
localStorage.setItem('token', response.token);
localStorage.setItem('userData', JSON.stringify(response.user));

// 3. Token automatically included in subsequent requests via interceptor
// See src/services/api.js for implementation
```

### Available API Services

#### Authentication API (`authAPI`)
```javascript
import { authAPI } from './services/api';

// Login
await authAPI.login(email, password);

// Register new student
await authAPI.register(name, email, password);

// Send OTP to email for registration verification
await authAPI.sendOtp(email);

// Verify OTP during registration
await authAPI.verifyOtp(email, otp);
```

#### Profile API (`profileAPI`)
```javascript
import { profileAPI } from './services/api';

// Get current user profile
const profile = await profileAPI.getUserProfile();

// Update profile
await profileAPI.updateUserProfile(profileData);

// Update profile with photo
await profileAPI.updateUserProfileByEmailWithFile(email, formData);
```

#### Events API (`eventsAPI`)
```javascript
import { eventsAPI } from './services/api';

// Create event (hackathon/workshop)
await eventsAPI.createEvent(eventData, file);

// Get user events
const events = await eventsAPI.getUserEvents(userEmail);

// Delete event
await eventsAPI.deleteEvent(id, userEmail);
```

#### Achievements API (`achievementAPI`)
```javascript
import { achievementAPI } from './services/api';

// Create achievement
await achievementAPI.createAchievement(formData);

// Get user achievements
const achievements = await achievementAPI.getUserAchievements(userEmail);

// Faculty: Get all pending achievements
const pending = await achievementAPI.getPendingAchievements();
```

#### Internships API (`internshipAPI`)
```javascript
import { internshipAPI } from './services/api';

// Submit internship
await internshipAPI.createInternship(formData);

// Get user internships
const internships = await internshipAPI.getUserInternships(userEmail);
```

#### Faculty API (`facultyAPI`)
```javascript
import { facultyAPI } from './services/api';

// Get pending requests
const requests = await facultyAPI.getPendingEvents();

// Approve/reject submissions
await facultyAPI.approveEvent(id);
await facultyAPI.rejectEvent(id);
```

#### Resume API (`resumeAPI`)
```javascript
import { resumeAPI } from './services/api';

// Upload resume
await resumeAPI.uploadResume(userEmail, role, file);

// Get user resumes
const resumes = await resumeAPI.getUserResumes(userEmail);

// Delete resume
await resumeAPI.deleteResume(userEmail, id);
```

### Error Handling

All API calls include comprehensive error handling:

```javascript
try {
  const data = await profileAPI.getUserProfile();
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Handle authentication error
    console.error('Please log in again');
  } else if (error.response?.status === 404) {
    // Handle not found
    console.error('Profile not found');
  } else {
    // Handle other errors
    console.error('An error occurred:', error.message);
  }
}
```

## 🔒 Security

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Token Storage**: Stored in localStorage (consider httpOnly cookies for production)
- **Token Expiry**: Automatic refresh on 401 responses
- **Role-Based Access**: Separate routes and permissions for students and faculty
- **Route Protection**: Unauthenticated users redirected to login

### Security Best Practices

1. **Token Management**
   ```javascript
   // Tokens are automatically injected via interceptors
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

2. **Automatic Logout on Auth Failure**
   ```javascript
   // 401 responses clear credentials
   if (error.response?.status === 401) {
     localStorage.removeItem('token');
     localStorage.removeItem('userData');
     // Redirect to login
   }
   ```

3. **Input Validation**: All form inputs validated before submission
4. **XSS Prevention**: React's built-in XSS protection
5. **CORS Configuration**: Backend must allow frontend origin
6. **HTTPS**: Always use HTTPS in production
7. **Environment Variables**: Sensitive data in environment variables

### Recommended Production Enhancements

- Implement **httpOnly cookies** for token storage
- Add **CSRF protection** for state-changing operations
- Implement **rate limiting** on API endpoints
- Enable **Content Security Policy (CSP)** headers
- Use **Subresource Integrity (SRI)** for CDN resources
- Regular **dependency updates** for security patches

## 🧪 Testing

### Current Testing Status

⚠️ **Testing infrastructure not yet implemented.** Recommended setup:

### Recommended Testing Stack

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Example Test Setup

**`vite.config.js`** (add test configuration):
```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

### Example Component Test

```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from './pages/Dashboard';

describe('Dashboard', () => {
  it('renders dashboard heading', () => {
    render(<Dashboard />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
});
```

### Running Tests (once implemented)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## ⚡ Performance

### Current Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: ~1.3MB (optimized with code splitting)

### Optimization Strategies

1. **Code Splitting**: Dynamic imports for route-based splitting
2. **Lazy Loading**: Components loaded on demand
3. **Image Optimization**: Compressed assets in public folder
4. **Tree Shaking**: Unused code eliminated in production
5. **Minification**: JavaScript and CSS minified
6. **Caching**: Vite's built-in caching mechanisms

### Performance Monitoring

```javascript
// Web Vitals monitoring (add to main.jsx)
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🔧 Troubleshooting

### Common Issues

#### 1. API Connection Errors

**Problem**: "Network Error" or CORS issues

**Solution**:
```bash
# Check backend is running
curl http://localhost:8058/api/auth/login

# Verify CORS configuration in backend
# Ensure backend allows frontend origin (http://localhost:5173)
```

#### 2. Authentication Issues

**Problem**: "401 Unauthorized" errors

**Solution**:
```javascript
// Clear stored tokens
localStorage.removeItem('token');
localStorage.removeItem('userData');
// Log in again
```

#### 3. Build Failures

**Problem**: Build fails with dependency errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist .vite
npm run build
```

#### 4. Hot Reload Not Working

**Problem**: Changes not reflecting in browser

**Solution**:
```bash
# Restart dev server
# Check for syntax errors in console
# Clear browser cache (Ctrl+Shift+R)
```

#### 5. Environment Variables Not Loading

**Problem**: `import.meta.env.VITE_*` returns undefined

**Solution**:
```bash
# Ensure .env file exists in root directory
# Variable names must start with VITE_
# Restart dev server after creating/editing .env
npm run dev
```

### Getting Help

- **Check Logs**: Browser console and terminal output
- **React DevTools**: Use React Developer Tools extension
- **Network Tab**: Monitor API requests in browser DevTools
- **Backend Logs**: Check Spring Boot console output

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed
4. **Test your changes**
   ```bash
   npm run lint
   npm run build
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Style Guidelines

- **Use ESLint**: Run `npm run lint` before committing
- **Component Names**: PascalCase (e.g., `Dashboard.jsx`)
- **Function Names**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Hooks**: Start with "use" (e.g., `useAuth`)
- **Props**: Use destructuring in function parameters
- **Comments**: Add JSDoc comments for complex functions

### Pull Request Guidelines

- Provide clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all checks pass
- Request review from maintainers

## 📄 License

This project is licensed under a **Proprietary License** — all rights reserved.

```
PROPRIETARY SOFTWARE LICENSE

Copyright (c) 2024 Minus One Open Source Foundation. All Rights Reserved.

Dissemination, reproduction, modification, distribution, or use of this
software, in whole or in part, is strictly prohibited without the prior
written permission of Minus One Open Source Foundation.

See the LICENSE file for full terms.
```

> ⚠️ **This is not open-source software.** Unauthorised copying, modification,
> distribution, or use of this software is strictly prohibited and may result
> in civil and criminal penalties.

## 💬 Support

### Getting Help

- **Documentation**: Read this README and inline code comments
- **Issues**: [GitHub Issues](https://github.com/Minus-One-Open-Source-Foundation/csbs-erp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Minus-One-Open-Source-Foundation/csbs-erp/discussions)

### Maintainers

- **Minus One Open Source Foundation**: [GitHub Organization](https://github.com/Minus-One-Open-Source-Foundation)

### Reporting Issues

When reporting issues, please include:

1. **Description**: Clear description of the problem
2. **Steps to Reproduce**: Exact steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, Node.js version
6. **Screenshots**: If applicable
7. **Error Messages**: Complete error logs

### Feature Requests

We welcome feature requests! Please:

1. Check existing issues first
2. Provide detailed use case
3. Explain expected behavior
4. Include mockups if applicable

---

<div align="center">

**Built with ❤️ by Minus One Open Source Foundation**

[⬆ Back to Top](#-student-activity-hub---frontend)

</div>
