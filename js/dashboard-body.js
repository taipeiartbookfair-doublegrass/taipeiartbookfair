document.addEventListener("DOMContentLoaded", function () {
  // Copy to clipboard function
  window.copyToClipboard = function (id) {
    const el = document.getElementById(id);
    let text = el.innerText || el.textContent;
    text = text.trim();
    navigator.clipboard.writeText(text).then(() => {
      const btn = event.target;
      const original = btn.textContent;
      btn.textContent = "✅";
      setTimeout(() => {
        btn.textContent = original;
      }, 1000);
    });
  };

  // Logo rotation logic
  const logo = document.querySelector(".machine-rotate-logo");
  let isHovering = false;

  if (logo) {
    // Mouse tracking for rotation when NOT hovering
    document.addEventListener("mousemove", function (e) {
      if (isHovering) return;
      const rect = logo.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      logo.style.transform = `rotate(${angle + 90}deg)`;
    });

    // On hover: add animation class, remove inline transform
    logo.addEventListener("mouseenter", function () {
      isHovering = true;
      logo.style.transform = "";
      logo.classList.add("machine-rotate-animating");
    });

    // On leave: remove animation class, reset to follow mouse
    logo.addEventListener("mouseleave", function () {
      isHovering = false;
      logo.classList.remove("machine-rotate-animating");
    });
  }
});
