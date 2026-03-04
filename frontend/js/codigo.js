function carregarPosts() {
  fetch("http://localhost:3000/post")
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error("Erro na requisição");
      }
      return resposta.json();
    })
    .then((posts) => {
      console.log(posts);
    })
    .catch((erro) => {
      console.error(erro);
    });
}

carregarPosts();
