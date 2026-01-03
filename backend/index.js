require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require("nodemailer");

const authCheck = require("./middleware/auth");
const socketAuthCheck = require("./middleware/socketAuth");

const UserSchema = require("./models/user");
const AlertSchema = require("./models/alert");
const SettingsSchema = require("./models/settings");

const app = express();

const FRONTEND_URL = "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

const URI_MONGODB_CONNECTION = process.env.URI_MONGODB_CONNECTION;
const JWT_SECRET = process.env.JWT_SECRET;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
})

const sessionMiddleware = session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
});

app.use(sessionMiddleware);

const User = mongoose.model("User", UserSchema);
const Alert = mongoose.model("Alert", AlertSchema);
const Settings = mongoose.model("Settings", SettingsSchema);

let getSettings = null;

mongoose
  .connect(URI_MONGODB_CONNECTION, { dbName: "sidel" })
  .then(async () => {
    console.log("MongoDB conectado!");

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    getSettings = settings;
    console.log("Settings carregados");
  })
  .catch((e) => console.log("Ocorreu um erro ao conectar com o MongoDB: ", e));

// async function createAdminIfNotExists() {
//     const hash = await bcrypt.hash("IfceSiDel@5432", 10);

//     await User.create({
//       email: "sidel@admin.com",
//       password: hash,
//       role: "admin"
//     });

//     console.log("Usuário admin criado automaticamente");
// }

// createAdminIfNotExists();

// AUTH

app.get("/me", authCheck, (req, res) => {
  res.status(200).json(req.session.user);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "Senha inválida" });

  req.session.user = {
    id: user._id,
    email: user.email,
  };

  res
    .status(201)
    .json({ message: "Login realizado com sucesso", user: req.session.user });
});

app.post("/logout", authCheck, async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Erro ao fazer logout" });

    res.status(201).json({ message: "Logout realizado com sucesso" });
  });
});

// ALERTS HISTORY

app.get("/alerts", authCheck, async (req, res) => {
  const alerts = await Alert.find().sort({ timestamp: -1 });
  res.status(200).json(alerts);
});

app.get("/alert/:id", authCheck, async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  res.status(200).json(alert);
});

app.delete("/alerts/:id", authCheck, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID do alerta é obrigatório" });
    }

    await Alert.deleteOne({ _id: id });

    res.status(200).json({ message: "Alerta deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: `Erro ao deletar alerta: ${err.message}` });
  }
});

// app.post("/alerts", authCheck, async (req, res) => {
//   const alert = await Alert.create(req.body);
//   res.status(201).json(alert);
// });

// SETTINGS

app.get("/settings", authCheck, async (req, res) => {
  const settings = await Settings.findOne();
  res.status(200).json(settings);
});

app.post("/settings", authCheck, async (req, res) => {
  const { headLimit, durationSeconds, cooldownSeconds, emailRecipient } = req.body;
  const settings = await Settings.findOne();
  settings.headLimit = headLimit;
  settings.durationSeconds = durationSeconds;
  settings.cooldownSeconds = cooldownSeconds;
  settings.emailRecipient = emailRecipient;
  await settings.save();
  getSettings = settings;
  res.status(201).json(settings);
});

// Rota para enviar e-mail

app.post("/send-alert", authCheck, async (req, res) => {
  const {id} = req.body;

  const alert =  await Alert.findById(id);

  const htmlEmail = `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; color: #000000; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      
      <div style="background-color: #000000; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 4px; font-weight: 900;">SIDEL</h1>
        <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8;">Sistema Inteligente de Detecção de Lotação</p>
      </div>

      <div style="padding: 40px;">
        <div style="border-left: 4px solid #000000; padding-left: 20px; margin-bottom: 30px;">
          <h2 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">Relatório de Incidente</h2>
          <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">Um excesso de lotação foi detectado pelo sensor.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666666; font-size: 13px; text-transform: uppercase;">ID do Alerta</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-family: monospace; font-weight: bold;">${alert._id}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666666; font-size: 13px; text-transform: uppercase;">Data e Horário</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: bold;">${new Date(alert.timestamp).toLocaleString('pt-BR')}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666666; font-size: 13px; text-transform: uppercase;">Pessoas Detectadas</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 22px; font-weight: 900; color: #e53e3e;">${alert.countHeads}</td>
          </tr>
        </table>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #666666;">A imagem da captura de segurança foi anexada a este e-mail para análise detalhada.</p>
        </div>
      </div>

      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">&copy; 2025 BENTECH SOLUÇÕES DIGITAIS LTDA</p>
      </div>
    </div>
  </div>
`;
  const settings = getSettings

  const mailOptions = {
    from: EMAIL_USER,
    to: settings.emailRecipient,
    subject: `⚠️ ALERTA SIDEL: Lotação Detectada`,
    html: htmlEmail,
    attachments: [
      {
        filename: 'captura.jpg',
        content: alert.image,
        encoding: 'base64'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('E-mail enviado com sucesso!');
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    res.status(500).send("Erro ao enviar notificação.");
  }
})

// SOCKET IO

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
io.use(socketAuthCheck);

io.on("connection", (socket) => {
  let alertTimer = null;
  let cooldownTimer = null;
  let lastHeads = 0;

  socket.on("detection_data", async (data) => {
    if (!data?.detection) return;
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
    io.emit("detection_data", data); // transmitir a imagem e os dados de detecção para todos os clientes conectados

    // o que fazer?
    // detectar a quantidade de cabeças
    const heads = data?.detection?.summary?.Head || 0;
    lastHeads = heads;
    //  se for maior que Limite por um intervalo de tempo -> salvar no banco de dados e emitir alerta via socket.io
    const settings = getSettings;
    if (!settings) return;

    const LIMIT = settings?.headLimit;
    const DURATION = settings?.durationSeconds * 1000;
    const COOLDOWN = settings?.cooldownSeconds * 1000;

    if (heads > LIMIT) {
      if (!alertTimer && !cooldownTimer) {
        alertTimer = setTimeout(async () => {
          const alert = await Alert.create({
            countHeads: lastHeads,
            image: data.image,
            detected: data.detection.detected,
            objects: data.detection.objects,
            summary: data.detection.summary,
          });

          io.emit("alert_triggered", alert);

          alertTimer = null;

          cooldownTimer = setTimeout(() => {
            cooldownTimer = null;
          }, COOLDOWN);
        }, DURATION);
      }

      return;
    }

    if (alertTimer) {
      clearTimeout(alertTimer);
      alertTimer = null;
    }

    // por exemplo se o limite é 3 cabeças, e por 10 segundos seguidos foram detectadas mais de 3 cabeças, emitir alerta
    // isso para previnir falsos alertas.
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});