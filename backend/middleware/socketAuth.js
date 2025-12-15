const socketAuthCheck = (socket, next) => {
  const session = socket.request.session;

  if (!session || !session.user) {
    return next(new Error("Usuário não autenticado"));
  }

  socket.user = session.user;
  next();
};

module.exports = socketAuthCheck;