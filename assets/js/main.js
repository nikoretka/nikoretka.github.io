/* Шапка, меню, reveal-анимации, параллакс, видео-хиро */
(function () {
  "use strict";

  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* страховка: если переход между страницами завис — принудительно завершить */
  addEventListener("pagereveal", function (e) {
    if (e.viewTransition) {
      setTimeout(function () {
        try {
          e.viewTransition.skipTransition();
        } catch (err) {
          /* уже завершён */
        }
      }, 900);
    }
  });

  /* --- шапка: фон после прокрутки --- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScrollHeader = function () {
      header.classList.toggle("-scrolled", scrollY > 40);
    };
    addEventListener("scroll", onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /* --- мобильное меню --- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* --- reveal при скролле --- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* --- параллакс (хиро-видео и квота) --- */
  var pEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-parallax]")
  );
  if (pEls.length && !reduceMotion) {
    var ticking = false;
    var update = function () {
      pEls.forEach(function (el) {
        var box = el.getBoundingClientRect();
        if (box.bottom < 0 || box.top > innerHeight) return;
        var speed = parseFloat(el.dataset.parallax) || 0.25;
        var center = box.top + box.height / 2 - innerHeight / 2;
        el.style.transform =
          "translate3d(0," + (-center * speed).toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* --- стрелка вниз в хиро --- */
  var scrollDown = document.querySelector(".scroll-down");
  if (scrollDown) {
    scrollDown.addEventListener("click", function () {
      var heroEl = document.querySelector(".hero");
      var next = heroEl && heroEl.nextElementSibling;
      (next || document.body).scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  /* --- аккордеон (FAQ, доп. услуги) с плавным раскрытием --- */
  document.querySelectorAll(".faq details").forEach(function (d) {
    var summary = d.querySelector("summary");
    var body = d.querySelector(".faq-body");
    if (!summary || !body) return;
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      if (reduceMotion || !body.animate) {
        d.open = !d.open;
        return;
      }
      if (d.dataset.animating) return;
      d.dataset.animating = "1";
      body.style.overflow = "hidden";
      var done = function () {
        body.style.overflow = "";
        delete d.dataset.animating;
        d.classList.remove("closing");
      };
      if (d.open) {
        d.classList.add("closing");
        var h = body.offsetHeight;
        var closeAnim = body.animate(
          [
            { height: h + "px", paddingBottom: "1.7rem", opacity: 1 },
            { height: "0px", paddingBottom: "0rem", opacity: 0 },
          ],
          { duration: 300, easing: "cubic-bezier(.4,0,.22,1)" }
        );
        closeAnim.onfinish = function () {
          d.open = false;
          done();
        };
      } else {
        d.open = true;
        var h2 = body.offsetHeight;
        var openAnim = body.animate(
          [
            { height: "0px", paddingBottom: "0rem", opacity: 0 },
            { height: h2 + "px", paddingBottom: "1.7rem", opacity: 1 },
          ],
          { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" }
        );
        openAnim.onfinish = done;
      }
    });
  });

  /* --- кладка: раскидываем кадры по колонкам слева направо --- */
  var jgrid = document.querySelector(".jgrid");
  if (jgrid) {
    var tiles = [].slice.call(jgrid.children);
    tiles.forEach(function (a, i) {
      a.dataset.i = i;
    });
    var jcols = 0;
    var relayout = function () {
      var n = parseInt(getComputedStyle(jgrid).getPropertyValue("--jcols"), 10);
      if (!n || n === jcols) return;
      jcols = n;
      var cols = [];
      var fill = [];
      for (var i = 0; i < n; i++) {
        var col = document.createElement("div");
        col.className = "jgrid-col";
        cols.push(col);
        fill.push(0);
      }
      tiles.forEach(function (a) {
        var im = a.querySelector("img");
        /* высота в долях ширины колонки: width/height проставлены у всех кадров */
        var ratio =
          (+im.getAttribute("height") || 3) / (+im.getAttribute("width") || 2);
        var k = fill.indexOf(Math.min.apply(null, fill));
        cols[k].appendChild(a);
        fill[k] += ratio;
      });
      jgrid.replaceChildren.apply(jgrid, cols);
      jgrid.classList.add("-flow");
    };
    relayout();
    addEventListener("resize", relayout);
  }

  /* --- плавное появление фото галереи по мере загрузки --- */
  document.querySelectorAll(".jgrid img").forEach(function (im) {
    if (im.complete) return;
    im.classList.add("pending");
    var show = function () {
      im.classList.remove("pending");
    };
    im.addEventListener("load", show, { once: true });
    im.addEventListener("error", show, { once: true });
  });

  /* --- видео-хиро: убрать постер после старта --- */
  var hero = document.querySelector(".hero");
  var video = hero && hero.querySelector("video");
  if (video) {
    if (reduceMotion) {
      /* показываем постер и не качаем видео */
      video.removeAttribute("autoplay");
      video.addEventListener("playing", function () {
        video.pause();
      });
      video.pause();
      var src = video.querySelector("source");
      if (src) {
        src.remove();
        video.load();
      }
    } else {
      video.addEventListener("playing", function () {
        hero.classList.add("-playing");
      });
      /* если autoplay уже случился до подписки */
      if (!video.paused) {
        hero.classList.add("-playing");
      }
    }
  }
})();
