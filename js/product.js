document.addEventListener("DOMContentLoaded", async () => {
  const main = document.getElementById("productMain");
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || "";
  const products = await getProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    main.className = "pd-not-found";
    main.innerHTML = `
      <a href="catalogue.html" style="color:var(--brass);font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.16em;">Return to catalogue</a>
      <h1>Piece not found.</h1>`;
    return;
  }

  document.title = `${product.name} — Nyumbani Luxe`;

  let activeImage = 0;
  let quantity = 1;
  const gallery = product.gallery && product.gallery.length ? product.gallery : [product.image];
  const available = product.stock || 0;
  const soldOut = available < 1;

  main.innerHTML = `
    <a href="catalogue.html" class="pd-back">${ICONS.arrowLeft(14)} Back to collection</a>
    <div class="pd-grid">
      <div>
        <button class="pd-gallery-main" id="pdMainImg" aria-label="Open image gallery">
          <img id="pdMainImgTag" src="${gallery[0]}" alt="${escapeHtml(product.name)} — view 1">
          <span class="pd-zoom-hint">${ICONS.zoom(13)} View larger</span>
          <span class="pd-gallery-tag">${escapeHtml(product.tag || "Nyumbani Luxe")}</span>
          <span class="pd-gallery-count" id="pdCount">01 / ${String(gallery.length).padStart(2, "0")}</span>
        </button>
        ${gallery.length > 1 ? `<div class="pd-thumbs" id="pdThumbs">${gallery.map((img, i) => `
          <button data-index="${i}" class="${i === 0 ? "active" : ""}" aria-label="View image ${i + 1}">
            <img src="${img}" alt="">
          </button>`).join("")}</div>` : ""}
      </div>
      <div class="pd-info">
        <p class="eyebrow">${escapeHtml(product.collection)} / ${escapeHtml(product.category)}</p>
        <h1 class="font-display">${escapeHtml(product.name)}</h1>
        <div class="pd-price-row">
          <p class="price">${formatPrice(product.price)}</p>
          <span class="sku">SKU ${escapeHtml(product.sku)}</span>
        </div>
        <p class="pd-desc">${escapeHtml(product.description)}</p>
        <div class="pd-stock">
          <span class="dot" style="background:${soldOut ? "rgba(37,30,25,.3)" : available < 5 ? "var(--brass)" : "var(--sage)"}"></span>
          <strong>${soldOut ? "Currently unavailable" : available < 5 ? `Only ${available} left` : "In stock"}</strong>
          ${!soldOut ? `<span class="sub">Ready to dispatch from Nairobi</span>` : ""}
        </div>
        <div class="pd-details">
          <p class="label">The details</p>
          <ul>${product.details.map((d) => `<li>${ICONS.check(14)}${escapeHtml(d)}</li>`).join("")}</ul>
        </div>
        <div class="pd-actions">
          <div class="qty-control">
            <button id="qtyMinus" ${soldOut ? "disabled" : ""}>${ICONS.minus(15)}</button>
            <span id="qtyValue">1</span>
            <button id="qtyPlus" ${soldOut ? "disabled" : ""}>${ICONS.plus(15)}</button>
          </div>
          <button class="btn btn-dark" id="addToBagBtn" ${soldOut ? "disabled" : ""} style="flex:1;">
            ${soldOut ? "Out of stock" : "Add to bag"} ${ICONS.bag(16)}
          </button>
          <button class="wishlist-toggle${Wishlist.isWishlisted(product.id) ? " active" : ""}" id="wishlistToggle" aria-label="Save to wishlist">
            ${ICONS.heart(18, Wishlist.isWishlisted(product.id))}
          </button>
        </div>
        <div class="pd-perks">
          <div class="pd-perk">
            ${ICONS.truck(18)}
            <div><strong>Delivery across Kenya</strong><p>Nairobi 2–3 working days &middot; Countrywide available</p></div>
          </div>
          <div class="pd-perk">
            ${ICONS.check(18)}
            <div><strong>Considered packaging</strong><p>Your piece is carefully wrapped before it leaves us.</p></div>
          </div>
        </div>
        <details class="pd-care">
          <summary>Care & delivery ${ICONS.chevronDown(16)}</summary>
          <p>Your piece will be carefully wrapped and delivered across Nairobi and countrywide. Keep natural materials away from prolonged moisture and direct heat. For care guidance or delivery beyond Nairobi, contact our concierge team.</p>
        </details>
      </div>
    </div>
  `;

  const mainImgTag = document.getElementById("pdMainImgTag");
  const countLabel = document.getElementById("pdCount");
  const thumbs = document.getElementById("pdThumbs");

  function setActiveImage(i) {
    activeImage = (i + gallery.length) % gallery.length;
    mainImgTag.src = gallery[activeImage];
    mainImgTag.alt = `${product.name} — view ${activeImage + 1}`;
    countLabel.textContent = `${String(activeImage + 1).padStart(2, "0")} / ${String(gallery.length).padStart(2, "0")}`;
    if (thumbs) {
      thumbs.querySelectorAll("button").forEach((b) => b.classList.toggle("active", Number(b.getAttribute("data-index")) === activeImage));
    }
    if (lightboxImg) {
      lightboxImg.src = gallery[activeImage];
      lightboxCaption.textContent = `${product.name} · ${activeImage + 1} / ${gallery.length}`;
    }
  }
  if (thumbs) {
    thumbs.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-index]");
      if (btn) setActiveImage(Number(btn.getAttribute("data-index")));
    });
  }

  // quantity
  const qtyValue = document.getElementById("qtyValue");
  document.getElementById("qtyMinus").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    qtyValue.textContent = quantity;
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    quantity = Math.min(available, quantity + 1);
    qtyValue.textContent = quantity;
  });

  // add to bag
  document.getElementById("addToBagBtn").addEventListener("click", () => {
    if (soldOut) return;
    Cart.addItem(product, quantity);
    toast.success(`${product.name} added to your bag`);
  });

  // wishlist
  document.getElementById("wishlistToggle").addEventListener("click", (e) => {
    const active = Wishlist.toggleWishlist(product.id);
    e.currentTarget.classList.toggle("active", active);
    e.currentTarget.innerHTML = ICONS.heart(18, active);
    toast.success(active ? "Saved to your personal edit" : "Removed from saved pieces");
  });

  // ---- lightbox ----
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close image gallery">${ICONS.close(20)}</button>
    <button class="lightbox-prev" aria-label="Previous image">${ICONS.chevronLeft(24)}</button>
    <img src="${gallery[0]}" alt="${escapeHtml(product.name)} — enlarged view">
    <button class="lightbox-next" aria-label="Next image">${ICONS.chevronRight(24)}</button>
    <p class="lightbox-caption" id="lightboxCaption">${escapeHtml(product.name)} · 1 / ${gallery.length}</p>
  `;
  document.body.appendChild(lightbox);
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = document.getElementById("lightboxCaption");

  function openLightbox() {
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
  function updateLightboxCaption() {
    lightboxCaption.textContent = `${product.name} · ${activeImage + 1} / ${gallery.length}`;
  }
  document.getElementById("pdMainImg").addEventListener("click", openLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", (e) => { e.stopPropagation(); setActiveImage(activeImage - 1); updateLightboxCaption(); });
  lightbox.querySelector(".lightbox-next").addEventListener("click", (e) => { e.stopPropagation(); setActiveImage(activeImage + 1); updateLightboxCaption(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") { setActiveImage(activeImage + 1); updateLightboxCaption(); }
    if (e.key === "ArrowLeft") { setActiveImage(activeImage - 1); updateLightboxCaption(); }
  });
});

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
