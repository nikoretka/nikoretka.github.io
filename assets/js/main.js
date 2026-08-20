/* Шапка, меню, reveal-анимации, параллакс, видео-хиро */
(function () {
  "use strict";

  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- шапка: фон после прокрутки --- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    header.classList.toggle("-scrolled", scrollY > 40);
  }
  addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
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

  /* --- видео-хиро: убрать постер после старта --- */
  var hero = document.querySelector(".hero");
  var video = hero && hero.querySelector("video");
  if (video) {
    if (reduceMotion) {
      video.removeAttribute("autoplay");
      video.pause();
    } else {
      video.addEventListener("playing", function () {
        hero.classList.add("-playing");
      });
      /* если autoplay уже случился до подписки */
      if (!video.paused && video.currentTime > 0) {
        hero.classList.add("-playing");
      }
    }
  }
})();
