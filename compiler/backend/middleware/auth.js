const verifyToken = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No token provided or invalid format");
      return res.status(401).json({ error: 'No token provided or invalid format' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log("Token received:", token.substring(0, 10) + "...");
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log("Decoded token:", decoded);
    
    // Add user info to request
    req.userId = decoded.userId || decoded._id;
    req.isAdmin = decoded.isAdmin || false;
    
    console.log("User ID extracted:", req.userId);
    
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};