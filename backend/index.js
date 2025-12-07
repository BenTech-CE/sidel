const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("detection_data", (data) => {
    /*  
        data.image - base64 encoded JPEG
        data.detection - informação da detecção, exemplo:
        {
            detected: true,
            count: 3,
            objects: [ 'Head', 'Head', 'Head' ],
            summary: { Head: 3 }
        }
    */
    io.emit("detection_data", data);  // transmitir a imagem e os dados de detecção para todos os clientes conectados

    // o que fazer? 
    // detectar a quantidade de cabeças se for maior que Limite por um intervalo de tempo -> salvar no banco de dados e emitir alerta via socket.io
    // por exemplo se o limite é 3 cabeças, e por 10 segundos seguidos foram detectadas mais de 3 cabeças, emitir alerta
    // isso para previnir falsos alertas.
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
