require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const authCheck = require("./middleware/auth");

const UserSchema = require("./models/user");
const AlertSchema = require("./models/alert");
const SettingsSchema = require("./models/settings");

const app = express();

app.use(cors());
app.use(express.json());

const URI_MONGODB_CONNECTION = process.env.URI_MONGODB_CONNECTION
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(URI_MONGODB_CONNECTION)
  .then(() => console.log("MongoDB conectado!"))
  .catch((e) => console.log("Ocorreu um erro ao conectar com o MongoDB: ", e))

const User = mongoose.model("User", UserSchema)
const Alert = mongoose.model("Alert", AlertSchema)
const Settings = mongoose.model("Settings", SettingsSchema)

Settings.findOne().then(async (data) => {
  if (!data) {
    await Settings.create({});
    console.log("Settings padrão criados")
  }
})

// AUTH

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "Senha inválida" });

  const token = jwt.sign({ id: user._id, email }, JWT_SECRET, {
    expiresIn: "1d"
  })

  res.status(201).token({ token })
})

// ALERTS HISTORY

app.get("/alerts", authCheck, async (req, res) => {
  const alerts = await Alert.find().sort({ timestamp: -1 });
  res.status(200).json(alerts)
})

app.post("/alerts", authCheck, async (req, res) => {
  const alert = await Alert.create().sort(req.body);
  res.status(201).json(alert)
})

// SETTINGS

app.get("/settings", authCheck, async (req, res) => {
  const settings = await Alert.fondOne();
  res.status(200).json(settings)
})

app.post("/settings", authCheck, async (req, res) => {
  const { headLimit, durationSeconds } = req.body
  const settings = await Settings.findOne();
  settings.headLimit = headLimit
  settings.durationSeconds = durationSeconds
  await settings.save();
  res.status(201).json(settings)
})

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let overLimitSince = null;

io.on("connection", (socket) => {
  socket.on("detection_data",  async (data) => {
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
    // detectar a quantidade de cabeças
    const heads = data?.objects?.filter(o => o === "Head").length || 0;
    //  se for maior que Limite por um intervalo de tempo -> salvar no banco de dados e emitir alerta via socket.io
    const settings = await Settings.findOne();
    const LIMIT = settings.headLimit;
    const DURATION = settings.durationSeconds * 1000;

    if (heads > LIMIT) {
      if (!overLimitSince) {
        overLimitSince = Date.now();
      } else {
        const elapsed = Date.now() - overLimitSince;
        if (elapsed >= DURATION) {
          const alert = await Alert.create({
            count: heads,
            ...data,
          });

          io.emit("alert_triggered", alert);
          overLimitSince = null;
        }
      }
    } else {
      overLimitSince = null;
    }

    // por exemplo se o limite é 3 cabeças, e por 10 segundos seguidos foram detectadas mais de 3 cabeças, emitir alerta
    // isso para previnir falsos alertas.
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
