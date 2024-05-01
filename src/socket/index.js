const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const authConfig = require('config').get('auth');

const authenticateSocket = async (socket, next) => {
  try {
    const headers = socket.handshake.query;
    if (!headers || !headers.token || headers.token === 'null') {
      socket.disconnect();
      throw new Error('Authorization token not found');
    }

    const token = headers.token;
    const claims = jwt.verify(token, authConfig.secret, {
      ignoreExpiration: true,
    });

    const entity = await db.user.findOne({
      // @ts-ignore
      where: { id: claims.userId },
    });

    if (!entity) {
      socket.disconnect();
      throw new Error('User not found');
    }

    socket.user = entity;
    next();
  } catch (error) {
    if (
      ['TokenExpiredError', 'jwt malformed', 'JsonWebTokenError'].includes(
        error.name
      )
    ) {
      return next(error.message);
    }
    next(error);
  }
};

const handleSocketConnection = async (socket, io) => {
  console.log('A user connected');

  socket.on('message', (data) => {
    console.log(data);
  });

  socket.on('reconnect', () => {
    console.log('User reconnected');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
};

module.exports = (server) => {
  const io = new Server(server);
  const socketNamespace = io.of('/api/socket');
  // socketNamespace.use(authenticateSocket);
  socketNamespace.on('connection', (socket) => {
    handleSocketConnection(socket, socketNamespace);
  });
};
