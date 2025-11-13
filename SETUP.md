# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password provider)
   - Create a Firestore database
   - Set up Firebase Storage
   - Copy your Firebase config values

3. **Create `.env.local` file**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Set Firebase Security Rules**

   **Firestore Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /clients/{clientId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   **Storage Rules:**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /certificates/{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

5. **Create Admin User**
   - Go to Firebase Console > Authentication
   - Click "Add user"
   - Enter email and password
   - This will be your admin login

6. **Run the Application**
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - Open http://localhost:3000
   - Login with your admin credentials

## Features Overview

### Dashboard
- View total clients and certificates count
- Quick navigation to all features

### Add Client
- Enter client information (name, contact person, email, phone)
- Upload certificates:
  - Drug License Certificate (required)
  - GST Certificate (required)
  - Agreement Certificate (required)
  - Other documents (optional)
- Drag-and-drop file upload with progress indicator
- Support for PDF, Images, and DOC files

### View Clients
- List all clients with their information
- Search clients by name, contact person, or email
- Expand to view all certificates for each client
- Preview, download, or delete certificates
- Edit or delete clients

### Edit Client
- Update client information
- View existing certificates
- Add new certificates
- Delete existing certificates

## File Structure

```
├── app/
│   ├── dashboard/          # Dashboard pages
│   ├── login/              # Login page
│   └── layout.js           # Root layout
├── components/             # Reusable components
├── contexts/               # React contexts
├── lib/                    # Utilities and configs
└── public/                 # Static files
```

## Important Notes

- All routes are protected - only authenticated users can access
- File uploads are limited to 10MB per file
- Supported file types: PDF, Images (JPG, PNG, GIF), DOC, DOCX
- Certificates are stored in Firebase Storage
- Client data is stored in Firestore
- Storage paths are saved for proper file deletion

## Troubleshooting

### Login Issues
- Make sure you've created an admin user in Firebase Authentication
- Check that Email/Password provider is enabled

### Upload Issues
- Verify Firebase Storage is set up correctly
- Check Storage security rules allow authenticated users
- Ensure file size is under 10MB
- Verify file type is supported

### Database Issues
- Check Firestore security rules
- Verify Firestore is enabled in Firebase Console

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Vercel, Netlify, or your preferred platform

3. Set environment variables in your hosting platform

4. Update Firebase security rules for production if needed

