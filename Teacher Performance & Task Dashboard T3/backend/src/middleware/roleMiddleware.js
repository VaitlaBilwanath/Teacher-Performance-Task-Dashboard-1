const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user missing',
      });
    }

    const userRoleStr = req.user.role.toUpperCase();
    const authorizedRoles = roles.map((r) => r.toUpperCase());

    if (!authorizedRoles.includes(userRoleStr)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { authorize };
