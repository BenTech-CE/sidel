require("dotenv").config()
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const authCheck = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) return res.status(401).json({ error: "Token não encontrado" })

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next()
    } catch {
        return res.status(403).json({ error: "Token inválido" })
    }
}

module.exports = authCheck