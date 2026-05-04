const express = require("express");
const router = express.Router();
const db = require("../db");
const { checkToken } = require("../middlewares/auth");

router.put("/:id", checkToken, async (req, res) => {
  try {
    let { texto } = req.body || {};
    if (!texto) {
      return res.status(400).json({ mgs: "Texto inválido" });
    }
    const comentario = await db.query("SELECT * FROM comentarios WHERE id = $1", [req.params.id]);
    if (!comentario.rows.length) {
      return res.status(400).json({ msg: "Comentario não existe" });
    }

    if (req.user != comentario.rows[0].usuario) {
      return res
        .status(403)
        .json({ msg: "Você está tentando editar um comentario de outro usuário" });
    }

    const r = await db.query(
      "UPDATE comentarios SET texto = $1, editado = TRUE WHERE id = $2 RETURNING *",
      [texto, req.params.id],
    );
    if (!r.rows.length) {
      return res.status(400).json({ msg: "Erro edição de comentário" });
    } else {
      return res.status(201).json(r.rows[0]);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.delete("/:id", checkToken, async (req, res) => {
  try {
    const existe = await db.query("SELECT * FROM comentarios WHERE id = $1", [req.params.id]);
    if (!existe.rows.length) {
      return res.status(400).json({ msg: "Não existe este comentário" });
    }

    if (existe.rows[0].usuario != req.user) {
      return res
        .status(400)
        .json({ msg: "Você está tentando deletar um comentário de outro usuário" });
    }

    const r = await db.query("DELETE FROM comentarios WHERE id = $1 RETURNING *", [req.params.id]);
    if (!r.rows.length) {
      return res.status(500).json({ msg: "Erro remover comentário" });
    }
    return res.status(200).json({ msg: "Comentário removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ msg: "error.msg" });
  }
});

module.exports = router;
