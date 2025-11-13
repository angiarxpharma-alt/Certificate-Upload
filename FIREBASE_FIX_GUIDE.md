# Firebase Setup Fix Guide - Urgent Issues

## 🔴 Current Errors:

1. **Firestore 400 Error** - Firestore database enable nahi hai ya rules issue
2. **Storage CORS Error** - Firebase Storage enable nahi hai ya CORS issue
3. **`auth/configuration-not-found`** - Firebase Authentication enable nahi hai

## ✅ Quick Fix Steps:

### Step 1: Enable Firebase Authentication

1. **Firebase Console kholen:**
   - https://console.firebase.google.com/
   - "Angia-Certificate" project select karein

2. **Authentication Enable karein:**
   - Left sidebar → **"Authentication"** par click karein
   - Agar "Get started" dikhe to click karein
   - **"Sign-in method"** tab par jayein
   - **"Email/Password"** provider par click karein
   - Toggle ko **"Enable"** par set karein
   - **"Save"** button par click karein

3. **Authorized Domains check karein:**
   - "Settings" tab par jayein
   - "Authorized domains" section mein `localhost` add karein (agar nahi hai)

### Step 2: Enable Firebase Storage (IMPORTANT - CORS fix ke liye)

1. **Storage Enable karein:**
   - Left sidebar → **"Storage"** par click karein
   - Agar "Get started" dikhe to click karein
   - **"Start in test mode"** select karein (development ke liye)
   - **SAME LOCATION select karein** jo Firestore mein select ki thi (important!)
   - **"Done"** button par click karein
   - Wait karein storage bucket create hone tak

2. **Storage Rules set karein (CRITICAL):**
   - "Rules" tab par jayein
   - Yeh rules paste karein:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /certificates/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

   - **"Publish"** button par click karein
   - Confirm karein ki rules published ho gaye hain

3. **Storage Bucket Name Verify karein:**
   - Project Settings → General tab
   - "Your apps" section mein web app ka config check karein
   - Storage bucket name verify karein:
     - Agar `angia-certificate.firebasestorage.app` hai to theek hai
     - Agar `angia-certificate.appspot.com` hai to `.env.local` mein update karein

### Step 3: Enable Firestore Database (IMPORTANT - Ye pehle karein)

1. **Firestore Enable karein:**
   - Left sidebar → **"Firestore Database"** par click karein
   - Agar "Create database" dikhe to:
     - **"Create database"** button par click karein
     - **"Start in test mode"** select karein (development ke liye)
     - Location select karein (nearest region - e.g., `asia-south1` ya `us-central1`)
     - **"Enable"** button par click karein
   - Wait karein database create hone tak (1-2 minutes)

2. **Firestore Rules set karein (CRITICAL):**
   - "Rules" tab par jayein
   - Agar default rules hain to unhein replace karein
   - Yeh rules paste karein:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

   - **"Publish"** button par click karein
   - Confirm karein ki rules published ho gaye hain

### Step 4: Test Karein

1. **Browser console clear karein** (F12 → Console → Clear)
2. **Page refresh karein** (Ctrl+F5 ya Cmd+Shift+R)
3. **Login try karein:**
   - Email: `admin@angia.com`
   - Password: `Angia@2024`
   - "Login" button par click karein
   - Account automatically create ho jayega

4. **File upload test karein:**
   - Dashboard → Add Client
   - Certificate upload karein
   - Upload successful hona chahiye

## ⚠️ Important Notes:

- **Browser extension errors ignore karein** - wo aapke app se related nahi hain
- **Server restart ki zarurat nahi** - bas page refresh karein
- **Test mode rules** development ke liye theek hain, production mein proper rules set karein

## 🔍 Verification Checklist:

- [ ] **Firestore Database** = **Created** aur **Enabled**
- [ ] **Firestore Rules** = **Published** (test mode)
- [ ] **Storage** = **Created** aur **Enabled**
- [ ] **Storage Rules** = **Published** (test mode)
- [ ] **Authentication** > Sign-in method > Email/Password = **Enabled**
- [ ] **Storage Bucket Name** = `.env.local` mein sahi hai
- [ ] Login successful ho gaya
- [ ] File upload successful ho gaya (CORS error nahi aana chahiye)
- [ ] Client add successful ho gaya (Firestore error nahi aana chahiye)

## 🆘 Agar Abhi Bhi Error Aaye:

### Firestore 400 Error:
1. **Firestore Database create ho gaya hai verify karein**
2. **Rules published hain verify karein**
3. **Location same hai verify karein** (Storage aur Firestore dono mein)
4. **Browser console clear karein** aur page refresh karein

### Storage CORS Error:
1. **Storage bucket create ho gaya hai verify karein**
2. **Storage rules published hain verify karein**
3. **Storage bucket name check karein** - `.env.local` mein sahi hai ya nahi
4. **Location same hai verify karein** (Storage aur Firestore dono mein)
5. **Browser cache clear karein** (Ctrl+Shift+Delete)
6. **Incognito mode mein test karein** (extensions ke bina)

### General Troubleshooting:
1. **Console mein exact error code check karein**
2. **Firebase Console mein sab services enabled hain verify karein**
3. **Server restart karein** (`npm run dev`)
4. **`.env.local` file verify karein** - sabhi values sahi hain

---

**Note:** Pehli baar login par account automatically create ho jayega. Uske baad inhi credentials se login kar sakte hain.

