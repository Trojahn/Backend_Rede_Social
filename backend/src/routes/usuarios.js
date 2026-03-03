const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    const { login, senha, nome } = req.body;
    if (!login) {
        return res.status(400).json({ mgs: "Login inválido" });
    }
    if (!senha) {
        return res.status(400).json({ mgs: "Login inválido" });
    }
    if (!nome) {
        return res.status(400).json({ mgs: "Login inválido" });
    }
    
});