# Firebase Setup Guide - Angia Certificate

## Step 1: Firebase Console se Configuration Values Lein

1. **Firebase Console mein jayein:**
   - https://console.firebase.google.com/ par jayein
   - Apna "Angia-Certificate" project select karein

2. **Project Settings kholen:**
   - Left sidebar mein gear icon (⚙️) par click karein
   - "Project settings" select karein

3. **Web App Configuration:**
   - "General" tab mein scroll karein
   - "Your apps" section mein web app icon (</>) par click karein
   - Agar app nahi hai, to "Add app" button par click karein aur "Web" select karein
   - App ka naam dein (e.g., "Angia Certificate Web")

4. **Config Values Copy karein:**
   - Firebase aapko ek config object dega, jisme ye values hongi:
     - `apiKey`
     - `authDomain`
     - `projectId`
     - `storageBucket`
     - `messagingSenderId`
     - `appId`

## Step 2: Environment Variables Set Karein

1. **`.env.local` file kholen** (project root mein)

2. **Firebase values ko replace karein:**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=angia-certificate.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=angia-certificate
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=angia-certificate.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
   ```

   **Note:** `your_actual_api_key`, `your_actual_sender_id`, aur `your_actual_app_id` ko Firebase Console se mili values se replace karein.

## Step 3: Firebase Authentication Enable Karein

1. **Firebase Console mein:**
   - Left sidebar mein "Authentication" select karein
   - "Get started" button par click karein (agar pehli baar hai)

2. **Sign-in method enable karein:**
   - "Sign-in method" tab par jayein
   - "Email/Password" par click karein
   - Toggle ko "Enable" par set karein
   - "Save" button par click karein

3. **Users add karein (optional):**
   - "Users" tab par jayein
   - "Add user" button par click karein
   - Email aur password dein
   - Is user se login kar sakte hain

## Step 4: Firestore Database Setup

1. **Firestore Database create karein:**
   - Left sidebar mein "Firestore Database" select karein
   - "Create database" button par click karein
   - "Start in test mode" select karein (development ke liye)
   - Location select karein (nearest region)
   - "Enable" button par click karein

2. **Security Rules (Production ke liye):**
   - "Rules" tab par jayein
   - Production mein proper security rules add karein

## Step 5: Firebase Storage Setup

1. **Storage enable karein:**
   - Left sidebar mein "Storage" select karein
   - "Get started" button par click karein
   - "Start in test mode" select karein
   - Location select karein
   - "Done" button par click karein

## Step 6: Application Run Karein

1. **Dependencies install karein (agar nahi kiye):**
   ```bash
   npm install
   ```

2. **Development server start karein:**
   ```bash
   npm run dev
   ```

3. **Browser mein check karein:**
   - http://localhost:3000 par jayein
   - Login page par Firebase authentication kaam karega

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- `.env.local` file mein sabhi values properly set hain ya nahi check karein
- Server restart karein (`npm run dev`)

### Error: "Firebase: Error (auth/unauthorized-domain)"
- Firebase Console > Authentication > Settings > Authorized domains
- `localhost` add karein (agar nahi hai)

### Error: "Firebase: Error (auth/user-not-found)"
- Firebase Console mein user create karein
- Ya sign-up functionality add karein

## Next Steps

1. **Sign-up functionality add karein** (agar chahiye)
2. **Firestore collections setup karein** (clients, certificates, etc.)
3. **File upload functionality** Firebase Storage ke saath connect karein
4. **Security rules** production ke liye properly configure karein

## Important Notes

- `.env.local` file ko **NEVER** git mein commit na karein
- Production mein proper security rules use karein
- Firebase quotas aur pricing check karein

