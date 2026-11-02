# HighOnYou

A simple, fast, and modern fitness tracking web app for two athletes (Rohit & Vybhavi) to track:
1. **Gym Exercises**: Exercise Name, Sets, Weights (kg), and Reps.
2. **Running**: Distance, time, and auto-calculated pace.
3. **Daily Nutrition**: Calories, protein, and water hydration.
4. **Cloud Firestore Sync**: Real-time multi-device cloud synchronization powered by Firebase.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=highonyou.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=highonyou
VITE_FIREBASE_STORAGE_BUCKET=highonyou.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## ☁️ Deployment on Vercel
1. Connect your repository to [Vercel](https://vercel.com).
2. Set the framework preset to **Vite**.
3. Add your `VITE_FIREBASE_*` environment variables in the Vercel project settings.
4. Click **Deploy**!
