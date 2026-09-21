(function () {
  "use strict";

  var cfg = window.LS_CONFIG || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Contato: WhatsApp e rodapé ---------- */
  function aplicarContato() {
    var numero = (cfg.whatsapp && cfg.whatsapp.numero || "").replace(/\D/g, "");

    if (numero) {
      var texto = encodeURIComponent((cfg.whatsapp && cfg.whatsapp.mensagem) || "");
      var url = "https://wa.me/" + numero + (texto ? "?text=" + texto : "");
      document.querySelectorAll(".js-whatsapp").forEach(function (el) {
        el.href = url;
        el.target = "_blank";
        el.rel = "noopener";
      });
    }

    var valores = {
      whatsapp: numero ? formatarTelefone(numero) : "",
      email: cfg.email || "",
      endereco: cfg.endereco || "",
      instagram: cfg.instagram || "",
      linkedin: cfg.linkedin || "",
      oab: cfg.oab || "",
      cnpj: cfg.cnpj || "",
      razao: cfg.razaoSocial || ""
    };

    document.querySelectorAll("[data-contato]").forEach(function (el) {
      var chave = el.dataset.contato;
      var valor = valores[chave];

      if (!valor) {
        // itens marcados como opcionais somem do rodapé enquanto não houver dado
        var item = el.closest("[data-opcional]");
        if (item) {
          item.hidden = true;
          return;
        }
        el.textContent = "A definir";
        el.style.opacity = ".45";
        if (el.tagName === "A") el.removeAttribute("target");
        return;
      }

      if (chave === "instagram" || chave === "linkedin") {
        el.href = valor;
        el.textContent = "@" + valor.replace(/\/+$/, "").split("/").pop();
      } else if (chave === "email") {
        el.href = "mailto:" + valor;
        el.textContent = valor;
      } else {
        el.textContent = valor;
      }
    });

    // coluna sem nenhum item visível não deve aparecer
    document.querySelectorAll(".footer__col").forEach(function (col) {
      var itens = col.querySelectorAll("li");
      var visiveis = Array.prototype.filter.call(itens, function (li) { return !li.hidden; });
      if (itens.length && !visiveis.length) col.hidden = true;
    });
  }

  function formatarTelefone(n) {
    var m = n.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
    return m ? "(" + m[1] + ") " + m[2] + "-" + m[3] : "+" + n;
  }

  /* ---------- Header ---------- */
  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function onScroll() {
    header.classList.toggle("is-stuck", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function fecharMenu() {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menu");
    document.body.style.overflow = "";
  }

  burger.addEventListener("click", function () {
    var aberto = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(aberto));
    burger.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = aberto ? "hidden" : "";
  });

  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", fecharMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      fecharMenu();
      burger.focus();
    }
  });

  /* ---------- Link ativo no menu ---------- */
  var mapaSecoes = {
    inicio: "inicio",
    dor: "inicio",
    posicionamento: "solucoes",
    execucao: "solucoes",
    endividamento: "solucoes",
    caminhos: "solucoes",
    solucoes: "solucoes",
    diferenciais: "diferenciais",
    sobre: "sobre",
    segmentos: "sobre",
    contato: "contato",
    faq: "faq"
  };

  var linksNav = {};
  nav.querySelectorAll(".nav__list a").forEach(function (a) {
    linksNav[a.getAttribute("href").slice(1)] = a;
  });

  var spy = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      var alvo = mapaSecoes[entrada.target.id];
      Object.keys(linksNav).forEach(function (k) {
        linksNav[k].classList.toggle("is-active", k === alvo);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });

  /* ---------- Reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("is-in");
        obs.unobserve(entrada.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- FAQ ---------- */
  document.querySelectorAll(".faq__q").forEach(function (botao) {
    var painel = document.getElementById(botao.getAttribute("aria-controls"));

    botao.addEventListener("click", function () {
      var aberto = botao.getAttribute("aria-expanded") === "true";

      // sanfona: mantém apenas uma resposta aberta por vez
      if (!aberto) {
        document.querySelectorAll('.faq__q[aria-expanded="true"]').forEach(function (outro) {
          if (outro !== botao) fechar(outro, document.getElementById(outro.getAttribute("aria-controls")));
        });
      }

      aberto ? fechar(botao, painel) : abrir(botao, painel);
    });
  });

  function abrir(botao, painel) {
    botao.setAttribute("aria-expanded", "true");
    painel.hidden = false;
    if (reduced) return;
    painel.style.height = "0px";
    painel.style.transition = "height .4s cubic-bezier(.22,.61,.36,1)";
    requestAnimationFrame(function () {
      painel.style.height = painel.scrollHeight + "px";
    });
    painel.addEventListener("transitionend", function fim() {
      painel.style.height = "";
      painel.style.transition = "";
      painel.removeEventListener("transitionend", fim);
    });
  }

  function fechar(botao, painel) {
    botao.setAttribute("aria-expanded", "false");
    if (reduced) { painel.hidden = true; return; }
    painel.style.height = painel.scrollHeight + "px";
    painel.style.transition = "height .35s cubic-bezier(.22,.61,.36,1)";
    requestAnimationFrame(function () {
      painel.style.height = "0px";
    });
    painel.addEventListener("transitionend", function fim() {
      painel.hidden = true;
      painel.style.height = "";
      painel.style.transition = "";
      painel.removeEventListener("transitionend", fim);
    });
  }

  /* ---------- Rodapé ---------- */
  document.getElementById("ano").textContent = new Date().getFullYear();

    aplicarContato();

    var site = (cfg.siteUrl || "").replace(/\/+$/, "");
    if (site) {
      var capa = site + "/assets/og/og-cover.jpg";
      document.querySelectorAll('link[rel="canonical"], meta[property="og:url"]').forEach(function (el) {
        if (el.tagName === "LINK") el.href = site + "/";
        else el.setAttribute("content", site + "/");
      });
      document.querySelectorAll('meta[property="og:image"], meta[property="og:image:secure_url"], meta[name="twitter:image"], link[rel="image_src"]').forEach(function (el) {
        if (el.tagName === "LINK") el.href = capa;
        else el.setAttribute("content", capa);
      });
    }
})();
