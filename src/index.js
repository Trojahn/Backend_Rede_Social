const express = require("express");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const usuario = require("./rotas/usuarios");
const comentario = require("./rotas/comentarios");
const post = require("./rotas/posts");
const like = require("./rotas/likes");
app.use("/usuarios", usuario);
app.use("/comentarios", comentario);
app.use("/posts", post);
app.use("/likes", like);

app.use(["/usuarios", "/comentarios", "/posts", "/likes"], (req, res) => {
  res.status(404).json({ msg: "Rota ou método não encontrado na API" });
});

app.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Backend Rede Social",
  }),
);

app.listen(port, () => {
  console.log(`[Container] Servidor executando internamente na porta ${port}`);
});
