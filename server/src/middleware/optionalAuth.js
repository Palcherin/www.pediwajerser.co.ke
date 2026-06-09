// authMiddleware.js — add this
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
    } catch (_) {
      // bad token — continue as guest, don't block
    }
  }
  next();
};