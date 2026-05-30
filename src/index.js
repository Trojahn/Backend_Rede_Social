const express = require("express");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const usuario = require("./rotas/usuarios");
const comentario = require("./rotas/comentarios");
const post = require("./rotas/posts");
app.use("/usuarios", usuario);
app.use("/comentarios", comentario);
app.use("/posts", post);

app.use(["/usuarios", "/comentarios", "/posts"], (req, res) => {
  res.status(404).json({ msg: "Rota ou método não encontrado na API" });
});

app.use(
  "/",
  (req, res, next) => {
    const originalUri = req.headers["x-original-uri"];
    let prefix = "";

    if (originalUri) {
      const pathOriginal = originalUri.split("?")[0];
      const pathInternal = req.originalUrl.split("?")[0];
      if (pathOriginal.endsWith(pathInternal)) {
        prefix = pathOriginal.substring(0, pathOriginal.length - pathInternal.length);
      }

      if (prefix.endsWith("/")) prefix = prefix.slice(0, -1);
    }

    const dynamicSpecs = JSON.parse(JSON.stringify(specs));

    dynamicSpecs.servers = [
      {
        url: prefix || "/",
        description: prefix ? `Proxy (${prefix})` : "Servidor local",
      },
    ];

    req.swaggerDoc = dynamicSpecs;
    next();
  },
  swaggerUi.serve,
  (req, res) => {
    swaggerUi.setup(null, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Backend Produtos e Fornecedores",
    })(req, res);
  },
);

app.listen(port, () => {
  console.log(`[Container] Servidor executando internamente na porta ${port}`);
});
