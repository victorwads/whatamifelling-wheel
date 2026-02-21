# Roda das Emoções (Emotion Wheel)

Uma aplicação web offline e independente que renderiza uma **Roda das Emoções** interativa usando HTML Canvas + JavaScript puro.

## Como usar

1. Abra o arquivo `index.html` diretamente no navegador (não precisa de servidor).
2. Clique em qualquer fatia da roda para selecionar/desselecionar uma emoção.
3. As emoções selecionadas aparecem na barra lateral à direita.

## Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| **6 setores** | Medo, Raiva, Tristeza, Surpresa, Alegria, Amor |
| **4 anéis** | Intensidade crescente do centro para fora |
| **Seleção por clique** | Cada fatia pode ser selecionada individualmente |
| **Limpar seleção** | Botão para remover todas as seleções |
| **Copiar lista** | Copia as emoções selecionadas para a área de transferência |
| **Exportar PNG** | Baixa a roda como imagem PNG |
| **Exportar PDF** | Abre janela de impressão para salvar como PDF |
| **Responsivo** | Adapta-se a diferentes tamanhos de tela |

## Estrutura do projeto

```
fellingroll/
├── index.html   ← Página principal (abrir no navegador)
├── style.css    ← Estilos
├── main.js      ← Lógica da roda (Canvas, dados, interação)
└── README.md    ← Este arquivo
```

## Dependências

**Nenhuma.** Tudo é vanilla HTML/CSS/JS. Não precisa de npm, Node.js, build ou servidor.

## Navegadores testados

- Chrome / Edge (recomendado)
- Firefox
- Safari
