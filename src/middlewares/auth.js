const jwt = require("jsonwebtoken");
const db = require("../db");

const senhaJWT = "senhaMuitoSecretaDoToken";

function checkToken(req, res, next) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(403).json({ msg: "Token inválido" });

    jwt.verify(token, senhaJWT, async (err, decoded) => {
      if (err) return res.status(403).json({ msg: "Token inválido" });

      const r = await db.query("SELECT COUNT(*) as qtde FROM usuarios WHERE id = $1", [
        decoded.data,
      ]);
      if (!r.rows[0].qtde) return res.status(403).json({ msg: "Token inválido" });

      req.user = decoded.data;
      next();
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

module.exports = { checkToken, senhaJWT };
