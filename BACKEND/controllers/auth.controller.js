//validation-adminuser.js,parkingslot.js,slotuage.js<schema level
//slotcontroller-checkIn, checkout, maintananceStart, maintatanceEnd



const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../model/AdminUser');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const user = await AdminUser.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.me = async (req, res) => {
  // req.user is set by middleware
  res.json({ user: req.user });
};
