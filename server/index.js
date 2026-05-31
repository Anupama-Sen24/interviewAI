const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin Initialized');
} else {
  console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_PATH not found in .env. Authentication middleware may not work.');
}


app.use(cors({
  origin: ['https://interviewai-1client.onrender.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


const interviewRoutes = require('./routes/interviewRoutes');
app.use('/api/interview', interviewRoutes);

app.get('/', (req, res) => {
  res.send('InterviewAI API is running...');
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
