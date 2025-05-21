# Barangay Management System

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## Executive Summary

The Barangay Management System represents a comprehensive digital transformation solution designed to modernize administrative operations within Philippine barangay (village) governance structures. This full-stack web application facilitates efficient resident registration, document processing, event management, and community communication through an integrated platform architecture.

## Table of Contents

1. [System Overview](#system-overview)
2. [Technical Architecture](#technical-architecture)
3. [Installation Requirements](#installation-requirements)
4. [Deployment Instructions](#deployment-instructions)
5. [System Features](#system-features)
6. [API Documentation](#api-documentation)
7. [Security Considerations](#security-considerations)
8. [Contributing Guidelines](#contributing-guidelines)
9. [License Information](#license-information)

## System Overview

### Project Objectives

The primary objectives of this system include:

1. **Digital Resident Registry**: Maintain comprehensive resident and family head databases with QR code identification
2. **Document Management**: Streamline certificate requests and document processing workflows
3. **Community Engagement**: Facilitate event management and announcement dissemination
4. **Administrative Efficiency**: Provide role-based access control for administrators and residents

### Technology Stack

#### Backend Architecture
- **Runtime Environment**: Node.js (Express.js framework)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcrypt.js for password hashing
- **QR Code Generation**: qrcode library

#### Frontend Architecture
- **Framework**: React.js (v18.2.0)
- **UI Components**: React Bootstrap
- **State Management**: React Context API
- **Data Visualization**: Recharts
- **HTTP Client**: Axios
- **QR Code Integration**: @yudiel/react-qr-scanner

## Installation Requirements

### Prerequisites

1. **Node.js**: Version 14.x or higher
2. **MongoDB**: Version 4.4 or higher
3. **Package Manager**: npm or yarn
4. **Git**: For version control

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+ recommended)
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 2GB available space

## Deployment Instructions

### Backend Configuration

1. **Clone Repository**
   ```bash
   git clone https://github.com/[your-username]/barangay-management-system.git
   cd barangay-management-system
   ```

2. **Backend Setup**
   ```bash
   cd mongodb-backend
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file in `mongodb-backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/barangay_db
   JWT_SECRET=your_secure_jwt_secret_key
   JWT_EXPIRATION=24h
   ADMIN_CREATION_KEY=your_admin_creation_key
   ```

4. **Database Initialization**
   ```bash
   # Ensure MongoDB is running
   mongod --dbpath /path/to/data/directory
   
   # Start backend server
   npm start
   ```

### Frontend Configuration

1. **Frontend Setup**
   ```bash
   cd ../mongodb-frontend
   npm install
   ```

2. **Environment Configuration**
   Create `.env` file in `mongodb-frontend` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_ENV=development
   ```

3. **Launch Frontend Application**
   ```bash
   npm start
   ```

### Initial Administrator Setup

Execute POST request to `/api/auth/create-admin`:
```json
{
  "username": "admin",
  "password": "secure_password",
  "name": "System Administrator",
  "secretKey": "your_admin_creation_key"
}
```

## System Features

### Administrative Modules

1. **Resident Management**
   - Complete CRUD operations for resident records
   - Family association tracking
   - QR code generation for identification

2. **Document Processing**
   - Certificate request workflow management
   - Status tracking (pending, approved, completed, rejected)
   - QR code verification for authenticated documents

3. **Event Management**
   - Event creation and scheduling
   - Attendee registration system
   - QR code-based event check-in

4. **Communication Platform**
   - Announcement broadcasting
   - Category-based information dissemination
   - Priority-based notification system

### Resident Portal Features

1. **Profile Management**
   - Personal information viewing and editing
   - Family association display
   - Digital ID with QR code

2. **Document Services**
   - Online certificate requests
   - Request status tracking
   - Multiple delivery options

3. **Community Engagement**
   - Event browsing and registration
   - Announcement viewing
   - Category-based filtering

### System Tools

1. **Data Backup and Restore**
   - JSON and CSV export formats
   - Complete system data archival
   - Restore functionality

2. **QR Code Verification**
   - Universal QR code scanner
   - Multi-type verification support
   - Real-time validation

## API Documentation

### Authentication Endpoints

```
POST   /api/auth/login              - User authentication
POST   /api/auth/register           - Resident registration
POST   /api/auth/change-password    - Password modification
POST   /api/auth/create-admin       - Administrator creation
GET    /api/auth/me                 - Current user retrieval
```

### Resource Endpoints

```
# Residents
GET    /api/residents               - List all residents
POST   /api/residents               - Create resident
GET    /api/residents/:id           - Get resident details
PUT    /api/residents/:id           - Update resident
DELETE /api/residents/:id           - Delete resident
GET    /api/residents/:id/qrcode    - Get resident QR code

# Family Heads
GET    /api/familyHeads             - List all family heads
POST   /api/familyHeads             - Create family head
GET    /api/familyHeads/:id         - Get family head details
PUT    /api/familyHeads/:id         - Update family head
DELETE /api/familyHeads/:id         - Delete family head
GET    /api/familyHeads/:id/members - Get family members

# Document Requests
GET    /api/documents               - List document requests
POST   /api/documents               - Create request
GET    /api/documents/:id           - Get request details
PUT    /api/documents/:id/status    - Update request status

# Events
GET    /api/events                  - List all events
POST   /api/events                  - Create event
GET    /api/events/:id              - Get event details
PUT    /api/events/:id              - Update event
DELETE /api/events/:id              - Delete event
POST   /api/events/:id/register     - Register for event

# Announcements
GET    /api/announcements           - List all announcements
POST   /api/announcements           - Create announcement
GET    /api/announcements/:id       - Get announcement details
PUT    /api/announcements/:id       - Update announcement
DELETE /api/announcements/:id       - Delete announcement
```

## Security Considerations

### Authentication Mechanism
- JWT-based stateless authentication
- Token expiration management
- Secure password hashing with bcrypt

### Authorization Framework
- Role-based access control (RBAC)
- Middleware-enforced permissions
- Resource ownership validation

### Data Protection
- HTTPS enforcement in production
- Input validation and sanitization
- SQL injection prevention through Mongoose ODM

## Project Structure

```
barangay-management-system/
├── mongodb-backend/
│   ├── models/
│   │   ├── Announcement.js
│   │   ├── DocumentRequest.js
│   │   ├── Event.js
│   │   ├── FamilyHead.js
│   │   ├── Resident.js
│   │   └── User.js
│   ├── routes/
│   │   ├── announcements.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── documents.js
│   │   ├── events.js
│   │   ├── familyHeads.js
│   │   ├── qrcode.js
│   │   └── residents.js
│   ├── middleware/
│   │   └── auth.js
│   ├── index.js
│   └── package.json
├── mongodb-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── app.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Contributing Guidelines

### Development Workflow

1. **Fork Repository**: Create personal fork
2. **Feature Branch**: Create branch from `main`
3. **Code Standards**: Follow ESLint configuration
4. **Testing**: Ensure all features are tested
5. **Pull Request**: Submit with detailed description

### Coding Standards

- **JavaScript Style**: ES6+ syntax
- **React Components**: Functional components with hooks
- **API Design**: RESTful principles
- **Documentation**: JSDoc comments for functions

## License Information

This project is licensed under the MIT License. See `LICENSE` file for details.

## Acknowledgments

- Built for Philippine barangay administrative requirements
- Designed with community management best practices
- Implements modern web development standards

---

**Note**: This system is designed specifically for Philippine barangay administrative requirements and may require customization for other jurisdictions.
