CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    login VARCHAR(255) UNIQUE NOT NULL,
    senha CHAR(60) NOT NULL,
    img VARCHAR(255),
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    usuario INTEGER NOT NULL,
    texto VARCHAR(255),
    img VARCHAR(255),
    editado BOOLEAN NOT NULL DEFAULT FALSE,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_usuario FOREIGN KEY (usuario) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    usuario INTEGER NOT NULL,
    post INTEGER NOT NULL,
    texto VARCHAR(255) NOT NULL,
    editado BOOLEAN NOT NULL DEFAULT FALSE,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comentarios_usuario FOREIGN KEY (usuario) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_comentarios_post FOREIGN KEY (post) REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    usuario INTEGER NOT NULL,
    post INTEGER NOT NULL,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_likes_usuario FOREIGN KEY (usuario) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_likes_post FOREIGN KEY (post) REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT unique_user_post_like UNIQUE (usuario, post)
);


INSERT INTO usuarios (id, nome, login, senha)
VALUES
(1, 'João Silva', 'joao', '$2b$10$6exLzLK/0OvfxGIRQDq7b.JwYneYDzLgV.T.BcVPRwDRJG6Jdmb82'),
(2, 'Maria Souza', 'maria', '$2b$10$WuOOtzxSK8J55o8CqeuBROHsfDJAHAP.qTtbt1mpvz4iblkZsSJxO'),
(3, 'Carlos Lima', 'carlos', '$2b$10$AvzkulBn6HJW2oarBHcEuOHtH8ju70dfpKU39DqE1nHTcoVjmZMPK')
ON CONFLICT (id) DO NOTHING;

INSERT INTO posts (id, usuario, texto, img)
VALUES
(1, 1, 'Primeiro post do João!', NULL),
(2, 2, 'Maria compartilhando algo interessante.', NULL),
(3, 3, 'Carlos chegou na rede social 🚀', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO comentarios (id, usuario, post, texto)
VALUES
(1, 2, 1, 'Muito bom, João!'),
(2, 3, 1, 'Concordo!'),
(3, 1, 2, 'Legal, Maria!'),
(4, 3, 2, 'Excelente ponto!'),
(5, 1, 3, 'Bem-vindo, Carlos!')
ON CONFLICT (id) DO NOTHING;

INSERT INTO likes (usuario, post)
VALUES
(2, 1), (3, 1), (1, 2), (3, 2), (1, 3), (2, 3)
ON CONFLICT (usuario, post) DO NOTHING;

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));
SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts));
SELECT setval('comentarios_id_seq', (SELECT MAX(id) FROM comentarios));
SELECT setval('likes_id_seq', (SELECT MAX(id) FROM likes));