async function loadComponent(id, file) {
  const container = document.getElementById(id);
  if (!container) return false;
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    container.innerHTML = await response.text();
    return true;
  } catch (error) {
    container.innerHTML = '<div class="container component-error" role="alert"><p>공통 영역을 불러오지 못했습니다. 새로고침해 주세요. 로컬 파일로 열었다면 HTTP 서버에서 실행해 주세요.</p><nav aria-label="페이지 바로가기"><a href="index.html">홈</a> · <a href="about.html">중점학교 소개</a> · <a href="curriculum.html">교육과정</a> · <a href="activity.html">특색 활동</a> · <a href="awards.html">수상 실적</a></nav></div>';
    console.error(error);
    return false;
  }
}

function initializeHeader() {
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".menu-toggle");
  const backdrop = document.querySelector(".menu-backdrop");
  const links = [...nav.querySelectorAll("a")];
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  links.forEach((link) => {
    const active = link.getAttribute("href") === currentPage;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const logo = document.querySelector(".brand-logo");
  const showFallback = () => {
    logo.hidden = true;
    document.querySelector(".brand-fallback").hidden = false;
  };
  logo.addEventListener("error", showFallback);
  if (logo.complete && !logo.naturalWidth) showFallback();

  const mobile = window.matchMedia("(max-width: 767px)");
  let menuOpen = false;
  function setMenu(open, restoreFocus = true) {
    const wasOpen = menuOpen;
    menuOpen = open && mobile.matches;
    document.body.classList.toggle("menu-open", menuOpen);
    toggle.setAttribute("aria-expanded", String(menuOpen));
    toggle.setAttribute("aria-label", menuOpen ? "메뉴 닫기" : "메뉴 열기");
    backdrop.hidden = !menuOpen;
    nav.inert = mobile.matches && !menuOpen;
    if (menuOpen) links[0].focus();
    else if (wasOpen && restoreFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => setMenu(!menuOpen));
  backdrop.addEventListener("click", () => setMenu(false));
  links.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  mobile.addEventListener("change", () => {
    const focused = document.activeElement;
    setMenu(false, false);
    if (mobile.matches && nav.contains(focused)) {
      toggle.focus();
    } else if (!mobile.matches && focused === toggle) {
      (links.find((link) => link.classList.contains("active")) || links[0]).focus();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(false);
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
  setMenu(false, false);
}

Promise.all([
  loadComponent("header-container", "header.html").then((loaded) => {
    if (loaded) initializeHeader();
  }),
  loadComponent("footer-container", "footer.html"),
]);
