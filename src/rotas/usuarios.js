const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { senhaJWT, checkToken } = require("../middlewares/auth");

router.get("/", async (req, res) => {
  const r = await db.query("SELECT id, login, nome, img FROM usuarios");
  return res.status(200).json(r.rows);
});

router.get("/check", checkToken, async (req, res) => {
  res.status(200).json({ msg: "Usuário logado" });
});

router.post("/", async (req, res) => {
  try {
    const { login, senha, nome, img } = req.body || {};
    if (!login) {
      return res.status(400).json({ mgs: "Login inválido" });
    }
    if (!senha) {
      return res.status(400).json({ mgs: "Senha inválida" });
    }
    if (!nome) {
      return res.status(400).json({ mgs: "Nome inválido" });
    }
    const existe = await db.query("SELECT * FROM usuarios WHERE login = $1", [login]);
    if (existe.rows.length) {
      return res.status(400).json({ msg: "Usuário já existe" });
    }
    const hash = await bcrypt.hash(senha, 10);
    const r = await db.query(
      "INSERT INTO usuarios(login, senha, nome, img) VALUES ($1,$2,$3,$4) RETURNING *",
      [login, hash, nome, img],
    );
    if (!r.rows.length) {
      return res.status(500).json({ msg: "Erro inserção de usuário" });
    } else {
      const { senha, ...usuario } = r.rows[0];
      return res.status(201).json(usuario);
    }
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { login, senha } = req.body || {};
    if (!login) {
      return res.status(400).json({ mgs: "Login inválido" });
    }
    if (!senha) {
      return res.status(400).json({ mgs: "Senha inválida" });
    }
    const data = await db.query("SELECT * FROM usuarios WHERE login = $1", [login]);
    if (!data.rows.length) {
      return res.status(400).json({ msg: "Usuário não existe" });
    }
    const ok = await bcrypt.compare(senha, data.rows[0].senha);
    if (ok) {
      let jwtAssinado = await jwt.sign({ data: data.rows[0].id }, senhaJWT, {
        expiresIn: "5m",
        subject: data.rows[0].login,
      });
      const { senha, ...usuario } = data.rows[0];
      return res
        .status(200)
        .json({ msg: "Login realizado com sucesso", token: jwtAssinado, usuario: usuario });
    }
    return res.status(403).json({ msg: "Senha incorreta" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Erro geral" });
  }
});

module.exports = router;
