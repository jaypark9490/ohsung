"use strict";

async function loadComponent(id, file) {
  const container = document.getElementById(id);
  if (!container) return false;
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    container.innerHTML = await response.text();
    return true;
  } catch (error) {
    console.error("공통 영역 로딩 실패:", error);
    const message = document.createElement("p");
    message.className = "container load-error";
    message.setAttribute("role", "alert");
    message.textContent = "공통 영역을 불러오지 못했습니다. HTTP 서버에서 실행 중인지 확인한 뒤 새로고침해 주세요. ";
    const home = document.createElement("a");
    home.href = "index.html";
    home.textContent = "홈으로 이동";
    message.append(home);
    container.replaceChildren(message);
    return false;
  }
}

function setupNavigation() {
  const nav = document.getElementById("main-nav");
  const toggle = document.querySelector(".menu-toggle");
  const mobile = window.matchMedia("(max-width: 767px)");
  const links = [...nav.querySelectorAll("a")];
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const active = new URL(link.href).pathname.split("/").pop() === currentPage;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  function setOpen(open, returnFocus = false) {
    const isOpen = mobile.matches && open;
    nav.classList.toggle("is-open", isOpen);
    nav.inert = mobile.matches && !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    setOpen(open);
    if (open) links[0].focus();
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false, true);
    }
  });
  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  document.addEventListener("focusin", (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener("change", () => setOpen(false, mobile.matches && nav.contains(document.activeElement)));
  setOpen(false);
  document.querySelector(".site-header").classList.add("navigation-ready");

  const logo = document.querySelector(".brand img");
  const hideMissingLogo = () => { logo.hidden = true; };
  logo.addEventListener("error", hideMissingLogo);
  if (logo.complete && logo.naturalWidth === 0) hideMissingLogo();
}

async function initializeSite() {
  await Promise.all([
    loadComponent("header-container", "header.html").then((loaded) => {
      if (loaded) setupNavigation();
    }),
    loadComponent("footer-container", "footer.html").then((loaded) => {
      if (loaded) document.getElementById("copyright-year").textContent = new Date().getFullYear();
    })
  ]);
}

initializeSite();
