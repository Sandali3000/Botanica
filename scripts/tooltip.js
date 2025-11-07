document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    const t = btn.getAttribute("title");
    if (t) {
      btn.setAttribute("data-title", t);
      if (!btn.hasAttribute("aria-label")) btn.setAttribute("aria-label", t);
      btn.removeAttribute("title"); // prevent browser native tooltip
    }
  });
});
