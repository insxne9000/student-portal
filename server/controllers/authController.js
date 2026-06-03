import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export const login = async (req, res) => {
  try {
    const { matric, password } = req.body;

    // We can also allow admin logins via this endpoint for simplicity if they use matric/username
    let user = await User.findOne({ matricNo: matric });
    
    // For admin, if the matric didn't match, maybe they typed 'admin' which we map to email admin@example.com
    if (!user && matric === 'admin') {
      user = await User.findOne({ email: 'admin@example.com' });
    }

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Token payload
    const payload = {
      userId: user._id,
      role: user.role
    };

    // Sign token, expires in 2 hours
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    return res.json({
      message: 'Login successful',
      token,
      user: payload
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
