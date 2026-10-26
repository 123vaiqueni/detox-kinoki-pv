# Detox Kinoki — página de vendas (Angola)

A página que recebe o tráfego dos anúncios do Facebook para o Detox Kinoki.
Vive em **detoxkinoki.rotanorte.com**.

## O que é

Uma página estática — HTML, CSS, imagens e um ficheiro de JavaScript. Não há
aplicação nenhuma a correr por trás, de propósito: quem vem de um anúncio não
espera, e numa rede fraca de Luanda cada segundo custa vendas.

```
index.html          a página
kinoki.css          o aspecto
kinoki-scripts.js   a galeria, o formulário e o ecrã de obrigado
images/             as fotografias (as t-*.webp são as miniaturas da galeria)
```

## Peso

| | |
|---|---|
| Primeiro ecrã | ~259 KB |
| Página inteira, tudo carregado | ~955 KB |

Medido a 375 px de largura. A regra da casa é ficar abaixo de 1 MB — medir
sempre antes de publicar.

⚠️ **`images/demo-retirada.webp` é um vídeo**, não uma fotografia: 42 imagens
seguidas do adesivo a ser retirado do pé. Comprimi-lo com uma ferramenta de
imagens deixa-o parado numa só imagem. Já aconteceu uma vez.

## Onde vão parar as encomendas

No topo do `kinoki-scripts.js`:

```js
var ENCOMENDAS_URL = "";   // endereço da EVABot: Empresa → Anúncios e páginas
var WHATSAPP       = "244935317863";
```

Com `ENCOMENDAS_URL` preenchido, cada encomenda entra sozinha na lista de
Pedidos da EVABot e o dono é avisado. Em branco, a página só mostra o ecrã de
obrigado e oferece o botão de WhatsApp — e um pedido só chega se a cliente
carregar nesse botão.

## Preços

Vêm da ficha do produto no painel da EVABot e **são sempre recalculados do lado
de lá**. O total que esta página mostra é uma sugestão: ela corre no telemóvel
do cliente e qualquer pessoa o consegue alterar antes de o enviar.

Mudar o preço aqui obriga a mudá-lo também em Produtos → Detox Kinoki, senão a
página promete uma coisa e a factura cobra outra.

| Kit | Riscado | Paga |
|---|---|---|
| 1 caixa | 7.500 Kz | 6.000 Kz |
| 2 caixas | 15.000 Kz | 11.000 Kz |
| 3 caixas | 22.500 Kz | 16.500 Kz |

As âncoras são todas 7.500 × quantidade — quem fizer a conta de cabeça vê que
bate certo, e é isso que faz um preço riscado ser acreditado.
