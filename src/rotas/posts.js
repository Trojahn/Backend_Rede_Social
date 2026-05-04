const express = require("express");
const router = express.Router();
const db = require("../db");
const { checkToken } = require("../middlewares/auth");

router.post("/", checkToken, async (req, res) => {
  try {
    const { texto, img } = req.body || {};
    if (!texto && !img) {
      return res.status(400).json({ mgs: "Você deve enviar uma imagem e/ou um texto!" });
    }
    const r = await db.query(
      "INSERT INTO posts(usuario, texto, img) VALUES ($1, $2, $3) RETURNING *",
      [req.user, texto, img],
    );
    if (!r.rows.length) {
      return res.status(400).json({ msg: "Erro inserção de post" });
    } else {
      return res.status(201).json(r.rows[0]);
    }
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await db.query("SELECT * FROM posts ORDER BY data");
    if (!posts.rows.length) {
      return res.status(400).json({ msg: "Nenhum post cadastrado" });
    }

    const retorno = [];
    for (let post of posts.rows) {
      const comentarios = await db.query(
        "SELECT id, usuario, texto, data FROM comentarios WHERE post = $1 ORDER BY DATA",
        [post.id],
      );
      const likes = await db.query(
        "SELECT id, usuario, data  FROM likes WHERE post = $1 ORDER BY data",
        [post.id],
      );

      retorno.push({
        ...post,
        comentarios: comentarios.rows,
        likes: likes.rows,
      });
    }

    res.status(200).json(retorno);
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (!post.rows.length) {
      return res.status(400).json({ msg: "Post não encontrado" });
    }

    const comentarios = await db.query(
      "SELECT id, usuario, texto, data FROM comentarios WHERE post = $1 ORDER BY data",
      [post.rows[0].id],
    );
    const likes = await db.query(
      "SELECT id, usuario, data FROM likes WHERE post = $1 ORDER BY data",
      [post.rows[0].id],
    );

    res.status(200).json({
      ...post.rows[0],
      comentarios: comentarios.rows,
      likes: likes.rows,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.post("/:id/likes", checkToken, async (req, res) => {
  try {
    const existeP = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (!existeP.rows.length) {
      return res.status(400).json({ msg: "Post não existe" });
    }

    const r = await db.query("SELECT * FROM likes WHERE post = $1 AND usuario = $2", [
      req.params.id,
      req.user,
    ]);
    if (!r.rows.length) {
      const ins = await db.query("INSERT INTO likes(usuario, post) VALUES ($1, $2) RETURNING *", [
        req.user,
        req.params.id,
      ]);
      if (ins.rows.length) {
        return res.status(201).json({ msg: "Like adicionado com sucesso!" });
      } else {
        return res.status(500).json({ msg: "Erro ao adicionar o like!" });
      }
    } else {
      const del = await db.query("DELETE FROM likes WHERE usuario = $1 AND post = $2 RETURNING *", [
        req.user,
        req.params.id,
      ]);
      if (del.rows.length) {
        return res.status(201).json({ msg: "Like removido com sucesso!" });
      } else {
        return res.status(500).json({ msg: "Erro ao remover o like!" });
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.get("/:id/likes", async (req, res) => {
  try {
    const existeP = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (!existeP.rows.length) {
      return res.status(400).json({ msg: "Post não existe" });
    }
    const r = await db.query("SELECT * FROM likes WHERE post = $1 ", [req.params.id]);

    const lista = [];
    for (let item of r.rows) {
      const { post, ...like } = item;
      lista.push(like);
    }
    return res.status(200).json(lista);
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.put("/:id", checkToken, async (req, res) => {
  try {
    let { texto, img } = req.body || {};

    if (!texto && !img) {
      return res.status(400).json({ mgs: "Você deve enviar uma imagem e ou um texto!" });
    }

    const post = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (!post.rows.length) {
      return res.status(400).json({ msg: "Post não existe" });
    }

    if (req.user != post.rows[0].usuario) {
      return res.status(403).json({ msg: "Você está tentando editar um post de outro usuário" });
    }

    texto = texto || post.rows[0].texto;
    img = img || post.rows[0].img;

    const r = await db.query(
      "UPDATE posts SET texto = $1, img = $2, editado = TRUE WHERE id = $3 RETURNING *",
      [texto, img, req.params.id],
    );
    if (!r.rows.length) {
      return res.status(400).json({ msg: "Erro edição de post" });
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
    const post = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (!post.rows.length) {
      return res.status(400).json({ msg: "Post não encontrado" });
    }
    if (req.user != post.rows[0].usuario) {
      return res.status(403).json({ msg: "Você está tentando deletar um post de outro usuário" });
    }
    const r = await db.query("DELETE FROM posts WHERE id = $1 RETURNING *", [req.params.id]);
    if (!r.rows.length) {
      return res.status(500).json({ msg: "Erro ao deletar post!" });
    }
    return res.status(200).json({ msg: "Post deletado com sucesso!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Erro geral" });
  }
});

// Comentários
router.post("/:id/comentarios", checkToken, async (req, res) => {
  try {
    const { texto } = req.body || {};
    if (!texto) {
      return res.status(400).json({ mgs: "Texto inválido" });
    }

    const existeP = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (!existeP.rows.length) {
      return res.status(400).json({ msg: "Post não existe" });
    }
    const r = await db.query(
      "INSERT INTO comentarios(usuario, texto, post) VALUES ($1, $2, $3) RETURNING *",
      [req.user, texto, req.params.id],
    );
    if (!r.rows.length) {
      return res.status(500).json({ msg: "Erro inserção de comentário" });
    } else {
      const { post, ...comentario } = r.rows[0];
      return res.status(201).json(comentario);
    }
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.get("/:id/comentarios", async (req, res) => {
  try {
    const existeP = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (!existeP.rows.length) {
      return res.status(400).json({ msg: "Post não existe" });
    }
    const r = await db.query("SELECT * FROM comentarios WHERE post = $1", [req.params.id]);
    let lista = [];
    for (let item of r.rows) {
      const { post, ...comentario } = item;
      lista.push(comentario);
    }
    res.status(200).json(lista);
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

module.exports = router;
