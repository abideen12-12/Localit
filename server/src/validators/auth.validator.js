function validateRegister(req, res, next) {
  const { name, email, password, phone, role } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  if (role && !['CUSTOMER', 'SHOP_OWNER'].includes(role)) {
    // Only customer or shop owner can be self-registered (ADMIN cannot self-register)
    return res.status(400).json({ success: false, message: 'Invalid role for self-registration.' });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.phone = phone ? phone.trim() : null;

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

function validateChangePassword(req, res, next) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
};
