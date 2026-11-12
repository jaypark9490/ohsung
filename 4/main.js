(async () => {
  async function loadComponent(id, file) {
    const container = document.getElementById(id);
    if (!container) return false;
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
      container.innerHTML = await response.text();
      return true;
    } catch (error) {
      container.innerHTML = '<div class="container component-error" role="status">공통 영역을 불러오지 못했습니다. 로컬에서는 HTTP 서버로 실행해 주세요. <a href="index.html">홈으로 이동</a></div>';
      console.warn("공통 영역 로드 실패:", error);
      return false;
    }
  }

  function initHeader() {
    const nav = document.getElementById("main-nav");
    const toggle = document.querySelector(".menu-toggle");
    const overlay = document.getElementById("menu-overlay");
    const links = [...nav.querySelectorAll("a[data-page]")];
    const page = window.location.pathname.split("/").pop() || "index.html";
    links.forEach(link => {
      const current = link.dataset.page === page;
      link.classList.toggle("active", current);
      if (current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    const logo = document.querySelector(".brand-logo");
    const fallback = document.querySelector(".brand-fallback");
    const showLogo = () => {
      logo.hidden = !logo.naturalWidth;
      fallback.hidden = !!logo.naturalWidth;
    };
    logo.addEventListener("load", showLogo);
    logo.addEventListener("error", showLogo);
    if (logo.complete) showLogo();

    const mobile = window.matchMedia("(max-width: 767px)");
    let open = false;
    function setOpen(next, restoreFocus = false) {
      open = next && mobile.matches;
      nav.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
      overlay.hidden = !open;
      nav.inert = mobile.matches && !open;
      if (open) links[0].focus();
      else if (restoreFocus) toggle.focus();
    }
    toggle.addEventListener("click", () => setOpen(!open));
    overlay.addEventListener("click", () => setOpen(false, true));
    links.forEach(link => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", event => {
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false, true);
      }
      if (event.key === "Tab") {
        const first = toggle;
        const last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    mobile.addEventListener("change", () => {
      const focusWasInside = nav.contains(document.activeElement);
      setOpen(false, mobile.matches && focusWasInside);
      if (!mobile.matches && document.activeElement === toggle) links[0].focus();
    });
    setOpen(false);
  }

  await Promise.all([
    loadComponent("header-container", "header.html").then(loaded => { if (loaded) initHeader(); }),
    loadComponent("footer-container", "footer.html")
  ]);
})();
