// route/auth.route.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AdminUser = require('../model/AdminUser');

// sanity check: GET /api/auth/ping -> { ok: true }
router.get('/ping', (req, res) => res.json({ ok: true }));

// POST /api/auth/login { username, password }
router.post('/login', async (req, res) => {
  try {
    const { username = '', password = '' } = req.body || {};
    const user = await AdminUser.findOne({ username: username.trim() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
//idhu password correct a ndu check pannum authentication
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role || 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
