(function () {
  "use strict";

  var configLiga = {
    whatsappNumero: "5511999999999",
    mensagemPadrao: "Olá! Quero conhecer a Liga ForDoctor e entender mais sobre PJ médica e início da carreira."
  };

  var reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temObserver = "IntersectionObserver" in window;

  function porId(id) {
    return document.getElementById(id);
  }

  function gerarUrlWhatsapp(texto) {
    return "https://wa.me/" + configLiga.whatsappNumero + "?text=" + encodeURIComponent(texto);
  }

  /* whatsapp: links com a mensagem padrão */
  var linkFlutuante = porId("wa-flutuante");
  var linkRetorno = porId("wa-retorno");
  linkFlutuante.href = gerarUrlWhatsapp(configLiga.mensagemPadrao);
  linkRetorno.href = gerarUrlWhatsapp(configLiga.mensagemPadrao);

  /* cabeçalho: estado ao rolar, tema adaptativo e barra de progresso */
  var topbar = porId("topo");
  var progresso = porId("progresso");
  var decor = porId("hero-decor");
  var heroAltura = porId("inicio").offsetHeight;
  var secoesEscuras = document.querySelectorAll(".hero, .escuro, .cta-final, footer");
  var aguardandoFrame = false;

  function checarTemaCabecalho(y) {
    var pontoChecagem = y + 42;
    var estaNoEscuro = false;
    for (var i = 0; i < secoesEscuras.length; i++) {
      var s = secoesEscuras[i];
      var topoSecao = s.offsetTop;
      var fundoSecao = topoSecao + s.offsetHeight;
      if (pontoChecagem >= topoSecao && pontoChecagem <= fundoSecao) {
        estaNoEscuro = true;
        break;
      }
    }
    topbar.classList.toggle("tema-escuro", estaNoEscuro);
    topbar.classList.toggle("tema-claro", !estaNoEscuro);
  }

  function atualizarRolagem() {
    var y = window.pageYOffset;
    var total = document.documentElement.scrollHeight - window.innerHeight;

    topbar.classList.toggle("scrolled", y > 24);
    progresso.style.transform = "scaleX(" + (total > 0 ? Math.min(y / total, 1) : 0) + ")";

    checarTemaCabecalho(y);

    if (!reduzMovimento && y < heroAltura) {
      decor.style.transform = "translate3d(0," + Math.round(y * 0.14) + "px,0)";
    }
    aguardandoFrame = false;
  }

  window.addEventListener("scroll", function () {
    if (!aguardandoFrame) {
      aguardandoFrame = true;
      window.requestAnimationFrame(atualizarRolagem);
    }
  }, { passive: true });

  window.addEventListener("resize", function () {
    heroAltura = porId("inicio").offsetHeight;
  });

  atualizarRolagem();

  /* menu mobile */
  var botaoMenu = porId("menu-toggle");
  var menu = porId("menu");

  function definirMenu(abrir) {
    menu.classList.toggle("aberto", abrir);
    topbar.classList.toggle("menu-aberto", abrir);
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    botaoMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  }

  botaoMenu.addEventListener("click", function () {
    definirMenu(!menu.classList.contains("aberto"));
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      definirMenu(false);
    });
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && menu.classList.contains("aberto")) {
      definirMenu(false);
      botaoMenu.focus();
    }
  });

  document.addEventListener("click", function (evento) {
    if (menu.classList.contains("aberto") && !menu.contains(evento.target) && !botaoMenu.contains(evento.target)) {
      definirMenu(false);
    }
  });

  /* rolagem suave personalizada com desconto da barra superior */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (evento) {
      var href = link.getAttribute("href");
      if (href === "#" || href === "") return;
      var destino = document.querySelector(href);
      if (!destino) return;

      evento.preventDefault();
      if (menu.classList.contains("aberto")) {
        definirMenu(false);
      }

      var alturaCabecalho = 72;
      var topoDestino = Math.max(0, destino.getBoundingClientRect().top + window.pageYOffset - alturaCabecalho);
      var topoAtual = window.pageYOffset;
      var distancia = topoDestino - topoAtual;
      var duracao = 450;
      var inicio = null;

      function animarRolagem(agora) {
        if (inicio === null) inicio = agora;
        var t = Math.min((agora - inicio) / duracao, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        window.scrollTo(0, topoAtual + distancia * ease);
        if (t < 1) {
          window.requestAnimationFrame(animarRolagem);
        } else {
          window.scrollTo(0, topoDestino);
          if (history.pushState) {
            history.pushState(null, "", href);
          }
        }
      }

      if (reduzMovimento) {
        window.scrollTo(0, topoDestino);
      } else {
        window.requestAnimationFrame(animarRolagem);
      }
    });
  });

  /* contadores animados */
  var formatador = new Intl.NumberFormat("pt-BR");

  function escreverValor(el, valor) {
    el.textContent = (el.dataset.prefixo || "") + formatador.format(valor);
  }

  function animarContador(el) {
    var alvo = Number(el.dataset.valor);
    if (reduzMovimento) {
      escreverValor(el, alvo);
      return;
    }
    var duracao = 1600;
    var inicio = null;

    function passo(agora) {
      if (inicio === null) inicio = agora;
      var t = Math.min((agora - inicio) / duracao, 1);
      var suave = 1 - Math.pow(1 - t, 4);
      escreverValor(el, Math.round(alvo * suave));
      if (t < 1) window.requestAnimationFrame(passo);
    }
    window.requestAnimationFrame(passo);
  }

  var contadores = document.querySelectorAll(".contador");

  if (temObserver && !reduzMovimento) {
    contadores.forEach(function (el) {
      escreverValor(el, 0);
    });
    var observadorContador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          animarContador(entrada.target);
          observadorContador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.6 });
    contadores.forEach(function (el) {
      observadorContador.observe(el);
    });
  }

  /* animações de entrada ao rolar */
  var animados = document.querySelectorAll("[data-anim]");

  if (temObserver && !reduzMovimento) {
    var observadorEntrada = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var el = entrada.target;
        el.classList.add("visivel");
        observadorEntrada.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -12% 0px" });

    animados.forEach(function (el) {
      observadorEntrada.observe(el);
    });
  } else {
    animados.forEach(function (el) {
      el.classList.add("visivel");
    });
  }

  /* navegação: destaque da seção atual */
  var linksMenu = menu.querySelectorAll("a");
  var secoes = [];

  linksMenu.forEach(function (link) {
    var secao = document.querySelector(link.getAttribute("href"));
    if (secao) secoes.push({ link: link, secao: secao });
  });

  if (temObserver) {
    var observadorSecao = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        secoes.forEach(function (item) {
          if (item.secao === entrada.target) {
            item.link.setAttribute("aria-current", "true");
          } else {
            item.link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    secoes.forEach(function (item) {
      observadorSecao.observe(item.secao);
    });
  }

  /* faq em acordeão */
  function definirEstadoFaq(item, abrir) {
    item.classList.toggle("aberto", abrir);
    var botao = item.querySelector(".faq-gatilho");
    var painel = item.querySelector(".faq-painel");
    if (botao) botao.setAttribute("aria-expanded", String(abrir));
    if (painel) painel.setAttribute("aria-hidden", String(!abrir));
  }

  document.querySelectorAll(".faq-gatilho").forEach(function (gatilho) {
    gatilho.addEventListener("click", function () {
      var item = gatilho.closest(".faq-item");
      var estavaAberto = item.classList.contains("aberto");

      document.querySelectorAll(".faq-item.aberto").forEach(function (aberto) {
        definirEstadoFaq(aberto, false);
      });

      if (!estavaAberto) definirEstadoFaq(item, true);
    });
  });

  /* máscara e validação de whatsapp */
  var campoWhatsapp = porId("whatsapp");

  function extrairDigitosTelefone(valor) {
    var digitos = String(valor || "").replace(/\D/g, "");
    if (digitos.length >= 12 && digitos.indexOf("55") === 0) digitos = digitos.slice(2);
    if (digitos.length === 12 && digitos.charAt(0) === "0") digitos = digitos.slice(1);
    return digitos.slice(0, 11);
  }

  function formatarTelefone(valor) {
    var digitos = extrairDigitosTelefone(valor);
    var formatado = digitos;

    if (digitos.length > 2) {
      formatado = "(" + digitos.slice(0, 2) + ") " + digitos.slice(2);
    }
    if (digitos.length > 6) {
      var corte = digitos.length === 11 ? 7 : 6;
      formatado = "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, corte) + "-" + digitos.slice(corte);
    }
    return formatado;
  }

  function telefoneValido(valor) {
    var digitos = extrairDigitosTelefone(valor);
    if (digitos.length < 10 || digitos.length > 11) return false;
    if (!/^[1-9]{2}/.test(digitos)) return false;
    if (/^(\d)\1+$/.test(digitos)) return false;
    if (digitos.length === 11 && digitos.charAt(2) !== "9") return false;
    return true;
  }

  campoWhatsapp.addEventListener("input", function (evento) {
    evento.target.value = formatarTelefone(evento.target.value);
  });

  /* formulário */
  var formulario = porId("lead-form");
  var retorno = porId("form-retorno");
  var regexEmail = /^[^\s@.]+(?:\.[^\s@.]+)*@(?:[^\s@.]+\.)+[^\s@.]{2,}$/;

  function definirErro(campo, invalido) {
    var mensagem = porId("erro-" + campo.id);
    campo.setAttribute("aria-invalid", invalido ? "true" : "false");
    if (mensagem) mensagem.classList.toggle("visivel", invalido);
  }

  formulario.querySelectorAll("input, select").forEach(function (campo) {
    var evento = campo.tagName === "SELECT" ? "change" : "input";
    campo.addEventListener(evento, function () {
      if (campo.getAttribute("aria-invalid") === "true") definirErro(campo, false);
    });
  });

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var nome = porId("nome");
    var email = porId("email");
    var faculdade = porId("faculdade");
    var periodo = porId("periodo");

    var invalidos = [
      [nome, nome.value.trim().length < 2],
      [email, !regexEmail.test(email.value.trim())],
      [campoWhatsapp, !telefoneValido(campoWhatsapp.value)],
      [faculdade, faculdade.value.trim().length < 2],
      [periodo, periodo.value === ""]
    ];

    var primeiroInvalido = null;
    invalidos.forEach(function (par) {
      definirErro(par[0], par[1]);
      if (par[1] && !primeiroInvalido) primeiroInvalido = par[0];
    });

    if (primeiroInvalido) {
      retorno.classList.remove("visivel");
      primeiroInvalido.focus();
      return;
    }

    var mensagem =
      "Olá! Me cadastrei na Liga ForDoctor. Nome: " + nome.value.trim() +
      " | WhatsApp: " + campoWhatsapp.value.trim() +
      " | Faculdade: " + faculdade.value.trim() +
      " (" + periodo.value + ") | E-mail: " + email.value.trim();

    linkRetorno.href = gerarUrlWhatsapp(mensagem);
    retorno.classList.add("visivel");
    formulario.reset();
    retorno.scrollIntoView({ behavior: reduzMovimento ? "auto" : "smooth", block: "nearest" });
  });

  /* chamadas para o formulário: foco sem interromper a rolagem suave */
  document.querySelectorAll('a[href="#entrar"]').forEach(function (chamada) {
    chamada.addEventListener("click", function () {
      window.setTimeout(function () {
        porId("nome").focus({ preventScroll: true });
      }, 500);
    });
  });
})();