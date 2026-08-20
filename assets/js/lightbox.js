/* Лайтбокс галереи: клавиатура, свайп, счётчик, предзагрузка соседей */
(function () {
  "use strict";

  var links = Array.prototype.slice.call(
    document.querySelectorAll(".jgrid a[data-full]")
  );
  if (!links.length) return;

  var dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-label", "Просмотр фотографии");
  dlg.innerHTML =
    '<div class="lb-scrim"></div>' +
    '<div class="lb-stage"><img alt=""></div>' +
    '<span class="lb-counter" aria-live="polite"></span>' +
    '<button class="lb-arrow -prev" type="button" aria-label="Предыдущее фото">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M15 4l-8 8 8 8"/></svg></button>' +
    '<button class="lb-arrow -next" type="button" aria-label="Следующее фото">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 4l8 8-8 8"/></svg></button>' +
    '<button class="lb-close" type="button" aria-label="Закрыть">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 5l14 14M19 5L5 19"/></svg></button>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector(".lb-stage img");
  img.draggable = false;
  dlg.addEventListener("dragstart", function (e) {
    e.preventDefault();
  });
  var counter = dlg.querySelector(".lb-counter");
  var stage = dlg.querySelector(".lb-stage");
  var current = 0;
  var swapTimer = null;

  function preload(i) {
    [i - 1, i + 1, i + 2].forEach(function (k) {
      var link = links[(k + links.length) % links.length];
      new Image().src = link.dataset.full;
    });
  }

  function render(i, instant) {
    current = (i + links.length) % links.length;
    var link = links[current];
    var show = function () {
      img.src = link.dataset.full;
      img.alt = link.querySelector("img").alt || "";
      dlg.classList.remove("-swap");
    };
    counter.textContent = current + 1 + " / " + links.length;
    if (instant) {
      show();
    } else {
      dlg.classList.add("-swap");
      clearTimeout(swapTimer);
      swapTimer = setTimeout(show, 170);
    }
    preload(current);
  }

  function open(i) {
    render(i, true);
    dlg.classList.remove("-closing");
    if (!dlg.open) dlg.showModal();
    document.body.style.overflow = "hidden";
  }

  function close() {
    dlg.classList.add("-closing");
    setTimeout(function () {
      dlg.close();
      dlg.classList.remove("-closing");
      document.body.style.overflow = "";
    }, 300);
  }

  links.forEach(function (link, i) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      open(i);
    });
  });

  dlg.querySelector(".lb-close").addEventListener("click", close);
  dlg.querySelector(".lb-arrow.-prev").addEventListener("click", function () {
    render(current - 1);
  });
  dlg.querySelector(".lb-arrow.-next").addEventListener("click", function () {
    render(current + 1);
  });

  /* Esc с анимацией закрытия */
  dlg.addEventListener("cancel", function (e) {
    e.preventDefault();
    close();
  });

  /* клик по фону закрывает, по фото — нет */
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg || e.target === stage || e.target.classList.contains("lb-scrim")) {
      close();
    }
  });

  addEventListener("keydown", function (e) {
    if (!dlg.open) return;
    if (e.key === "ArrowLeft") render(current - 1);
    if (e.key === "ArrowRight") render(current + 1);
  });

  /* свайп и вертикальный drag-to-close */
  var startX = 0;
  var startY = 0;
  var startT = 0;
  var tracking = false;

  stage.addEventListener("pointerdown", function (e) {
    tracking = true;
    startX = e.clientX;
    startY = e.clientY;
    startT = Date.now();
  });

  stage.addEventListener("pointerup", function (e) {
    if (!tracking) return;
    tracking = false;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    var dt = Math.max(Date.now() - startT, 1);
    var vx = Math.abs(dx) / dt;
    if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      close();
    } else if (Math.abs(dx) > 48 || vx > 0.35) {
      render(current + (dx < 0 ? 1 : -1));
    }
  });
})();
