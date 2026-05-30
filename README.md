# Rede Social Backend

> Repositório contendo um Backend didático de uma rede social.

## ⚠️ Avisos

Este sistema foi configurado para ambiente de desenvolvimento. Para implantação em produção, revise as variáveis de ambiente, configurações de CORS e segurança do banco de dados.

## 🚀 Executando o Sistema

Para subir o banco de dados e o servidor Node.js automaticamente, utilize o terminal na raiz do projeto e execute:

```
docker compose up --build -d
```

## 🚀 Reiniciando o servidor

Caso queira reiniciar o servidor em algum momento, sem perder os arquivos desenvolvidos, execute os seguintes comandos...

```
docker compose down -v
docker compose up --build -d
```

## ☕ Endereços para acesso

A documentação swagger do backend pode ser acessada no endereço abaixo:

```
http://localhost:3000/
```

A página inicial do website pode ser encontrada em:

## Deploy

Configure os detalhes de deploy no arquivo `.env`, seguindo o exemplo presente em `.env.example`.