const authCheck = (req, res, next) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: "Usuário não encontrado" });
  next();
};

module.exports = authCheck;
