// ==========================================================================
// Horizon Web — Scripts du site
// ==========================================================================

document.documentElement.classList.remove("no-js");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  const navLinks = document.querySelectorAll(".nav a");

  // ---------- Année dans le pied de page ----------
  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Ombre de l'en-tête au défilement ----------
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // ---------- Menu mobile ----------
  const closeMenu = () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Ouvrir le menu");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  // ---------- Apparition des éléments au défilement ----------
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Compteurs animés (chiffres clés de l'accueil) ----------
  const counters = document.querySelectorAll("[data-count]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animateCounter = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!reduceMotion && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  // ---------- Mode sombre ----------
  // Le thème initial est déjà appliqué par le script placé dans <head>.
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const themeColors = { light: "#ffffff", dark: "#0f0d1f" };

  const getSavedTheme = () => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  };

  const applyTheme = (theme) => {
    const isDark = theme === "dark";
    root.setAttribute("data-theme", theme);
    themeMeta.setAttribute("content", themeColors[theme]);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("title", isDark ? "Activer le mode clair" : "Activer le mode sombre");
  };

  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

    // Transition douce, uniquement pendant le changement de thème
    if (!reduceMotion) {
      root.classList.add("theme-transition");
      setTimeout(() => root.classList.remove("theme-transition"), 350);
    }

    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Stockage indisponible (navigation privée…) : le choix vaut pour cette visite
    }
  });

  // Tant que la personne n'a rien choisi sur le site, on suit son appareil en direct
  systemDark.addEventListener("change", (event) => {
    if (!getSavedTheme()) applyTheme(event.matches ? "dark" : "light");
  });

  // ---------- Lien actif selon la section visible ----------
  const sections = document.querySelectorAll("main section[id]");
  const sectionLinks = document.querySelectorAll(".nav__link");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  // ---------- Formulaire de contact (démonstration, sans envoi réel) ----------
  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("form-feedback");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Retire l'erreur dès que l'utilisateur corrige un champ
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => field.classList.remove("is-invalid"));
  });
});
