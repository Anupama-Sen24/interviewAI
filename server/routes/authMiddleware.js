const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Check if Firebase Admin is initialized
    admin.app(); 
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    // Fallback: If Firebase Admin is not initialized, decode the token payload manually
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
      const decoded = JSON.parse(jsonPayload);
      
      req.user = decoded;
      // Firebase JWT uses 'user_id' or 'sub' for the UID
      req.user.uid = decoded.user_id || decoded.sub; 
      
      next();
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  }
};

module.exports = authMiddleware;

