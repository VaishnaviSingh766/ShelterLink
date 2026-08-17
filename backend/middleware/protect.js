import jwt from "jsonwebtoken";
import User from "../models/User.js";

async function protect(req, res, next) {
  let token;

  // Tokens are sent in the Authorization header, formatted as "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      // Split "Bearer <token>" and take just the token part
      token = authHeader.split(" ")[1];

      // Verify the token is valid and wasn't tampered with
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Look up the user this token belongs to, and attach it to the request
      // Exclude the password field, even though it's hashed, we simply don't need it here
      req.user = await User.findById(decoded.id).select("-password");

      // Token is valid and user exists - allow the request to continue
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
}

export default protect;