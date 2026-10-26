/* ---------- configuração ---------- */
/* URL da Aplicação Web do Google Apps Script que guarda as encomendas (ver guardar-encomendas.gs). Vazio = não guarda. */
var ENCOMENDAS_URL = "";
var WHATSAPP       = "244935317863";
var FUSO           = "Africa/Luanda";
var HORA_LIMITE    = 16;   /* encomendas até às 16h podem ser entregues no mesmo dia */

/* galeria */
var FOTOS = [
  ["images/04.webp",          "As 3 caixas: 30 adesivos"],
  ["images/06-quantidade.webp",  "Os adesivos lacrados um a um"],
  ["images/02.webp",          "O adesivo depois de 8 horas de uso"],
  ["images/09.webp",          "Composição: extrato de folha, carvão de bambu e pó de gengibre"],
  ["images/11.webp",          "Modo de uso em 6 passos"],
  ["images/08.webp",          "Como o adesivo é montado: papel, adesivo e sachê"],
  ["images/10.webp",          "Medidas do adesivo e do sachê"],
  ["images/u-hero.webp",       "Casal com os adesivos antes de dormir"],
  ["images/01.webp",          "Caixa Kinoki Detox com os adesivos"]
];
var foto = document.getElementById('foto'), thumbs = document.getElementById('thumbs');
FOTOS.forEach(function(f, i){
  var b = thumbs.querySelectorAll('button')[i];
  if (!b) return;
  b.onclick = function(){
    foto.src = f[0]; foto.alt = f[1];
    var todos = thumbs.querySelectorAll('button');
    for (var j = 0; j < todos.length; j++) todos[j].classList.remove('on');
    b.classList.add('on');
  };
});

/* ---------- formulário de encomenda ---------- */
var form = document.getElementById('encomenda');
/* Lê um cookie do pixel do Facebook (_fbp / _fbc). Sem eles, metade das
   vendas não é atribuída a anúncio nenhum. */
function cookie(nome){
  var m = document.cookie.match('(^|; )' + nome + '=([^;]*)');
  return m ? decodeURIComponent(m[2]) : '';
}

function kz(n){ return n.toLocaleString('pt-PT').replace(/\s/g, '.') + ' Kz'; }
function kitEscolhido(){ return form.querySelector('input[name="kit"]:checked'); }

function atualizarTotal(){
  var k = kitEscolhido(), preco = Number(k.dataset.preco), pares = Number(k.dataset.pares);
  document.getElementById('total').textContent = kz(preco);
  document.getElementById('por-noite').innerHTML = 'São <b>' + kz(Math.round(preco / pares)) + ' por noite</b>, já com a entrega incluída.';
}
form.querySelectorAll('input[name="kit"]').forEach(function(r){ r.addEventListener('change', atualizarTotal); });
atualizarTotal();

var tel = document.getElementById('tel');
tel.addEventListener('input', function(){
  var d = tel.value.replace(/\D/g, '').slice(0, 9);
  tel.value = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' ');
});

/* hora e data de Luanda, seja qual for o fuso do telemóvel */
function agoraLuanda(){
  var p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).forEach(function(x){ p[x.type] = x.value; });
  return { data: p.year + '-' + p.month + '-' + p.day, hora: Number(p.hour) };
}
function somarDias(iso, n){
  var d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function dataBonita(iso){
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}

var campoData = document.getElementById('data'), dica = document.getElementById('dica-dia');
function prepararDias(){
  var agora = agoraLuanda(), hojeAceita = agora.hora < HORA_LIMITE;
  document.getElementById('op-hoje').hidden = !hojeAceita;
  var marcado = form.querySelector('input[name="dia"]:checked');
  if (!marcado || (marcado.value === 'hoje' && !hojeAceita)) {
    document.getElementById(hojeAceita ? 'dia-hoje' : 'dia-amanha').checked = true;
  }
  campoData.min = somarDias(agora.data, 1);
  campoData.max = somarDias(agora.data, 30);
  if (!campoData.value) campoData.value = campoData.min;
  dica.textContent = hojeAceita
    ? 'Encomendas até às 16h podem ser entregues hoje. Entregamos das 8h às 16h.'
    : 'Já passa das 16h, por isso a entrega fica para amanhã ou para a data que escolher.';
  campoData.hidden = form.querySelector('input[name="dia"]:checked').value !== 'outra';
}
form.querySelectorAll('input[name="dia"]').forEach(function(r){ r.addEventListener('change', prepararDias); });
prepararDias();
setInterval(prepararDias, 60000);

function erro(id, msg){ document.getElementById('erro-' + id).textContent = msg; }

form.addEventListener('submit', function(e){
  e.preventDefault();
  prepararDias();
  var nome = form.nome.value.trim(), numero = tel.value.replace(/\D/g, ''),
      bairro = form.bairro.value.trim(), ref = form.ref.value.trim(),
      dia = form.querySelector('input[name="dia"]:checked').value, agora = agoraLuanda(), ok = true;
  ['nome', 'tel', 'bairro', 'ref', 'dia'].forEach(function(id){ erro(id, ''); });
  if (nome.length < 3) { erro('nome', 'Escreva o seu nome para sabermos por quem perguntar.'); ok = false; }
  if (!/^9\d{8}$/.test(numero)) { erro('tel', 'O número deve ter 9 dígitos e começar por 9.'); ok = false; }
  if (bairro.length < 3) { erro('bairro', 'Indique o município e o bairro.'); ok = false; }
  if (ref.length < 4) { erro('ref', 'Indique um ponto de referência para o entregador.'); ok = false; }
  var dataEntrega = dia === 'hoje' ? agora.data : dia === 'amanha' ? somarDias(agora.data, 1) : campoData.value;
  if (dia === 'outra' && (!dataEntrega || dataEntrega < campoData.min || dataEntrega > campoData.max)) {
    erro('dia', 'Escolha uma data entre amanhã e os próximos 30 dias.'); ok = false;
  }
  if (!ok) { var p = form.querySelector('.erro:not(:empty)'); if (p) p.parentNode.scrollIntoView({ block: 'center' }); return; }

  var k = kitEscolhido();
  var pedido = {
    criado: new Date().toISOString(), nome: nome, telefone: '+244' + numero, bairro: bairro, referencia: ref,
    kit: k.value, total_kz: Number(k.dataset.preco), entrega: dataEntrega,
    periodo: form.querySelector('input[name="periodo"]:checked').value,
    origem: new URLSearchParams(location.search).get('utm_source') || ''
  };
  /* De onde veio esta pessoa. É isto que liga a venda ao anúncio que a
     trouxe: sem o fbclid, o Facebook não sabe que anúncio deu dinheiro. */
  pedido.fbclid = new URLSearchParams(location.search).get('fbclid') || '';
  pedido.fbp = cookie('_fbp');
  pedido.fbc = cookie('_fbc');
  pedido.url = location.href;

  var quando = dataEntrega === agora.data ? 'hoje' : dataEntrega === somarDias(agora.data, 1) ? 'amanhã' : dataBonita(dataEntrega);

  /* O ecrã de "encomenda recebida".
     O número do pedido entra quando a EVABot responder. Sem resposta, tudo
     aparece na mesma, só sem número: uma rede fraca não pode fazer o cliente
     pensar que a encomenda se perdeu. */
  function mostrarFeito(numero){
    document.getElementById('feito-titulo').textContent = 'Obrigado, ' + nome.split(' ')[0] + '!';
    document.getElementById('feito-texto').textContent =
      pedido.kit + ' de Kinoki · ' + kz(pedido.total_kz) + ' a pagar na entrega. Entrega ' + quando + ', ' + pedido.periodo.toLowerCase() + '.';

    /* A mensagem do botão muda conforme a encomenda chegou ou não.
       Com número, a encomenda JÁ está do nosso lado e o WhatsApp é só para
       quem quiser falar — por isso vai uma linha curta.
       Sem número, o WhatsApp é a última rede de segurança: aí a mensagem leva
       a encomenda inteira, para ela não se perder por causa de uma falha. */
    var msg = numero
      ? 'Olá! Fiz a encomenda ' + numero + ' pela página e queria falar convosco.'
      : 'Olá! Já fiz a minha encomenda pela página:\n' +
        pedido.kit + ' de Kinoki (' + kz(pedido.total_kz) + ')\nNome: ' + nome +
        '\nTelefone: ' + pedido.telefone + '\nMorada: ' + bairro + ', ' + ref + '\nEntrega: ' + quando + ', ' + pedido.periodo;
    document.getElementById('feito-wa').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
    document.getElementById('form-corpo').hidden = true;
    var feito = document.getElementById('feito');
    feito.hidden = false;

    /* A página fica só com o obrigado.
       Tudo o resto — os sintomas, os depoimentos, o preço, o rodapé — são
       argumentos para quem ainda NÃO comprou. A quem já comprou só lhe metem
       dúvida na cabeça. A caixa sai de dentro do formulário e fica sozinha. */
    var caixa = document.createElement('div');
    caixa.className = 'so-obrigado';
    document.body.insertBefore(caixa, document.body.firstChild);
    caixa.appendChild(feito);
    Array.prototype.slice.call(document.body.children).forEach(function(el){
      if (el !== caixa) el.style.display = 'none';
    });
    window.scrollTo(0, 0);
  }

  if (!ENCOMENDAS_URL) { mostrarFeito(null); return; }

  /* Enquanto a encomenda viaja, o botão diz que está a trabalhar — senão o
     cliente carrega outra vez, convencido de que não funcionou. */
  var botao = document.getElementById('cta1');
  var textoDoBotao = botao ? botao.textContent : '';
  if (botao) { botao.disabled = true; botao.textContent = 'A ENVIAR…'; }

  var jaPassou = false;
  function terminar(numero){
    if (jaPassou) return;
    jaPassou = true;
    if (botao) { botao.disabled = false; botao.textContent = textoDoBotao; }
    mostrarFeito(numero);
  }

  /* Sete segundos é o máximo que se faz um cliente esperar num 4G fraco.
     Passando disso, mostra-se o ecrã na mesma — a encomenda ainda pode estar
     a chegar, e prendê-lo mais tempo é que perde a venda de certeza. */
  var relogio = setTimeout(function(){ terminar(null); }, 7000);

  fetch(ENCOMENDAS_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(pedido)
  })
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(d){ clearTimeout(relogio); terminar(d && d.numero ? d.numero : null); })
    .catch(function(){ clearTimeout(relogio); terminar(null); });
});

/* barra fixa no mobile: aparece quando o formulário sai do ecrã, some no rodapé */
var oferta = document.querySelector('.oferta'), rodape = document.querySelector('footer'), sticky = document.getElementById('sticky');
function verSticky(){
  var passouOferta = oferta.getBoundingClientRect().bottom < 0;
  var chegouRodape = rodape.getBoundingClientRect().top < window.innerHeight;
  var feito = !document.getElementById('feito').hidden;
  sticky.classList.toggle('on', passouOferta && !chegouRodape && !feito);
}
window.addEventListener('scroll', verSticky, {passive:true});
window.addEventListener('resize', verSticky);
verSticky();
document.getElementById('ano').textContent = new Date().getFullYear();
