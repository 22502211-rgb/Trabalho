// Exemplo de número: "5511999999999"
const WHATSAPP_NUMBER = "";

const STORAGE_KEY = "maison-saveur-carrinho";

const abrirCarrinho = document.getElementById("abrir-carrinho");
const fecharCarrinho = document.getElementById("fechar-carrinho");
const fundoModal = document.getElementById("fundo-modal");
const contadorCarrinho = document.getElementById("contador-carrinho");
const itensCarrinho = document.getElementById("itens-carrinho");
const totalCarrinho = document.getElementById("total-carrinho");
const limparCarrinho = document.getElementById("limpar-carrinho");
const finalizarPedido = document.getElementById("finalizar-pedido");

function carregarCarrinho() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}



document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formularios");
    const inputEmail = document.getElementById("email");
  
    formulario.addEventListener("submit", (event) => {
      event.preventDefault();
  
      const valorEmail = inputEmail.value;
      localStorage.setItem("emailSalvo", valorEmail);
  
      window.location.href = "index.html";
    });
  });
  

let carrinho = carregarCarrinho();

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function salvarCarrinho() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinho));
  renderizarCarrinho();
}

function renderizarCarrinho() {
  itensCarrinho.replaceChildren();

  const produtos = Object.values(carrinho);

  const quantidadeTotal = produtos.reduce(
    (soma, produto) => soma + produto.quantidade,
    0
  );

  const valorTotal = produtos.reduce(
    (soma, produto) => soma + produto.preco * produto.quantidade,
    0
  );

  contadorCarrinho.textContent = quantidadeTotal;
  totalCarrinho.textContent = formatarPreco(valorTotal);

  finalizarPedido.disabled = produtos.length === 0;
  limparCarrinho.disabled = produtos.length === 0;

  if (produtos.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.className = "carrinho-vazio";
    mensagem.textContent = "Seu carrinho está vazio.";
    itensCarrinho.appendChild(mensagem);
    return;
  }

  produtos.forEach((produto) => {
    const item = document.createElement("div");
    item.className = "item-carrinho";

    const informacoes = document.createElement("div");

    const nome = document.createElement("strong");
    nome.textContent = produto.nome;

    const preco = document.createElement("small");
    preco.textContent = `${formatarPreco(produto.preco)} cada`;

    informacoes.append(nome, preco);

    const controles = document.createElement("div");
    controles.className = "controles-item";

    const botaoMenos = document.createElement("button");
    botaoMenos.type = "button";
    botaoMenos.textContent = "−";
    botaoMenos.setAttribute(
      "aria-label",
      `Remover uma unidade de ${produto.nome}`
    );
    botaoMenos.dataset.acao = "diminuir";
    botaoMenos.dataset.id = produto.id;

    const quantidade = document.createElement("span");
    quantidade.textContent = produto.quantidade;

    const botaoMais = document.createElement("button");
    botaoMais.type = "button";
    botaoMais.textContent = "+";
    botaoMais.setAttribute(
      "aria-label",
      `Adicionar uma unidade de ${produto.nome}`
    );
    botaoMais.dataset.acao = "aumentar";
    botaoMais.dataset.id = produto.id;

    controles.append(botaoMenos, quantidade, botaoMais);
    item.append(informacoes, controles);
    itensCarrinho.appendChild(item);
  });
}

document.querySelectorAll(".adicionar").forEach((botao) => {
  botao.addEventListener("click", () => {
    const id = botao.dataset.id;
    const nome = botao.dataset.nome;
    const preco = Number(botao.dataset.preco);

    if (!id || !nome || !Number.isFinite(preco)) {
      return;
    }

    if (carrinho[id]) {
      carrinho[id].quantidade += 1;
    } else {
      carrinho[id] = {
        id,
        nome,
        preco,
        quantidade: 1
      };
    }

    salvarCarrinho();
  });
});

itensCarrinho.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-acao]");

  if (!botao) {
    return;
  }

  const produto = carrinho[botao.dataset.id];

  if (!produto) {
    return;
  }

  if (botao.dataset.acao === "aumentar") {
    produto.quantidade += 1;
  } else {
    produto.quantidade -= 1;
  }

  if (produto.quantidade <= 0) {
    delete carrinho[botao.dataset.id];
  }

  salvarCarrinho();
});

abrirCarrinho.addEventListener("click", () => {
  fundoModal.hidden = false;
});

fecharCarrinho.addEventListener("click", () => {
  fundoModal.hidden = true;
});

fundoModal.addEventListener("click", (evento) => {
  if (evento.target === fundoModal) {
    fundoModal.hidden = true;
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && !fundoModal.hidden) {
    fundoModal.hidden = true;
  }
});

limparCarrinho.addEventListener("click", () => {
  carrinho = {};
  salvarCarrinho();
});

finalizarPedido.addEventListener("click", () => {
  const produtos = Object.values(carrinho);

  if (produtos.length === 0) {
    return;
  }

  const numero = WHATSAPP_NUMBER.replace(/\D/g, "");

  if (!numero) {
    alert("Preencha o número do WhatsApp no início do arquivo script.js.");
    return;
  }

  const valorTotal = produtos.reduce(
    (soma, produto) => soma + produto.preco * produto.quantidade,
    0
  );

  const linhasPedido = produtos.map((produto) => {
    const subtotal = produto.preco * produto.quantidade;

    return `• ${produto.nome} — ${produto.quantidade}x ${formatarPreco(subtotal)}`;
  });

  const mensagem = [
    "Olá! Gostaria de fazer este pedido:",
    "",
    ...linhasPedido,
    "",
    `Total: ${formatarPreco(valorTotal)}`
  ].join("\n");

  const linkWhatsApp =
    `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  window.open(linkWhatsApp, "_blank", "noopener,noreferrer");
});

renderizarCarrinho();
