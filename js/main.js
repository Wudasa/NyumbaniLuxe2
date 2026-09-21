// Shared header/footer behaviour used on every page.
function formatPrice(price) {
  return "KSh " + Number(price).toLocaleString("en-KE");
}

function siteHeader(active) {
  return `
  <div class="topbar">
    <span>Delivering across Kenya</span>
    <span class="mid">Nairobi &middot; Mombasa &middot; Kisumu &middot; Countrywide</span>
    <a href="mailto:hello@nyumbaniluxe.co.ke" class="contact">Client services</a>
  </div>
  <header class="site-header">
    <div class="bar">
      <div class="header-left">
        <button class="icon-btn menu-toggle" id="menuToggle" aria-label="Toggle menu">${ICONS.menu(20)}</button>
        <a href="index.html" class="wordmark" aria-label="Nyumbani Luxe home">
          <strong>Nyumbani Luxe</strong>
          <span>Beautiful spaces</span>
        </a>
        <nav class="desktop-nav">
          <a href="catalogue.html" class="nav-link editorial-nav">New collection</a>
          <a href="index.html#categories" class="nav-link editorial-nav">Categories</a>
          <a href="index.html#about" class="nav-link editorial-nav">About Nyumbani</a>
        </nav>
      </div>
      <div class="header-right">
        <button class="icon-btn" id="searchToggle" aria-label="Search collection">${ICONS.search(19)}</button>
        <a href="cart.html" class="bag-link" aria-label="View bag">
          ${ICONS.bag(18)}
          <span class="bag-badge hide" data-bag-count>0</span>
        </a>
      </div>
    </div>
    <div class="header-search" id="headerSearch">
      <div class="row">
        <div class="search-field">
          ${ICONS.search(15)}
          <input type="text" id="headerSearchInput" placeholder="Search the collection" aria-label="Search products">
          <div class="search-suggestions hidden" id="headerSuggestions"></div>
        </div>
        <button class="icon-btn" id="searchClose" aria-label="Close search">${ICONS.close(18)}</button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobileNav">
      <a href="catalogue.html">New collection</a>
      <a href="index.html#categories">Categories</a>
      <a href="index.html#about">About Nyumbani</a>
    </nav>
  </header>`;
}

function siteFooter() {
  return `
  <footer class="site-footer">
    <div class="row">
      <span>&copy; 2026 Nyumbani Luxe &middot; Nairobi, Kenya</span>
      <span>Designed for living.</span>
    </div>
  </footer>`;
}

function initHeader() {
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
      menuToggle.innerHTML = mobileNav.classList.contains("open") ? ICONS.close(20) : ICONS.menu(20);
    });
  }
  const searchToggle = document.getElementById("searchToggle");
  const searchClose = document.getElementById("searchClose");
  const headerSearch = document.getElementById("headerSearch");
  const searchInput = document.getElementById("headerSearchInput");
  const suggestions = document.getElementById("headerSuggestions");
  if (searchToggle) {
    searchToggle.addEventListener("click", () => {
      headerSearch.classList.toggle("open");
      if (headerSearch.classList.contains("open")) searchInput.focus();
    });
  }
  if (searchClose) {
    searchClose.addEventListener("click", () => headerSearch.classList.remove("open"));
  }
  if (searchInput) {
    searchInput.addEventListener("input", async () => {
      const q = searchInput.value.trim().toLowerCase();
      if (q.length < 2) { suggestions.classList.add("hidden"); return; }
      const products = await getProducts();
      const matches = products.filter((p) =>
        `${p.name} ${p.category} ${p.collection} ${p.sku}`.toLowerCase().includes(q)
      ).slice(0, 6);
      suggestions.classList.remove("hidden");
      suggestions.innerHTML = matches.length
        ? matches.map((p) => `
          <a href="product.html?id=${encodeURIComponent(p.id)}">
            <img src="${p.image}" alt="">
            <span>
              <strong>${p.name}</strong>
              <small>${p.collection} &middot; ${formatPrice(p.price)}</small>
            </span>
          </a>`).join("")
        : `<p>No matching pieces yet</p>`;
    });
  }
}

let _productsPromise = null;
function getProducts() {
  if (!_productsPromise) {
    // Uses the embedded PRODUCTS_DATA (see data/products.js) rather than fetch(),
    // so the catalogue works even when pages are opened directly from disk
    // (file://), where browsers block fetch() of local JSON files.
    _productsPromise = Promise.resolve(window.PRODUCTS_DATA || []);
  }
  return _productsPromise;
}

function productCardHTML(product) {
  const wishlisted = window.Wishlist && Wishlist.isWishlisted(product.id);
  return `
  <article class="product-card" data-id="${product.id}">
    <div class="product-media">
      <a href="product.html?id=${encodeURIComponent(product.id)}">
        <div class="imgwrap"><img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy"></div>
      </a>
      ${product.tag ? `<span class="product-tag">${escapeHtml(product.tag)}</span>` : ""}
      <button class="wishlist-btn${wishlisted ? " active" : ""}" aria-label="Save ${escapeHtml(product.name)}" data-wishlist="${product.id}">${ICONS.heart(16, wishlisted)}</button>
      <button class="add-bag-btn" data-add-to-bag="${product.id}">Add to bag ${ICONS.bag(14)}</button>
    </div>
    <a href="product.html?id=${encodeURIComponent(product.id)}">
      <div class="product-info">
        <div>
          <h2>${escapeHtml(product.name)}</h2>
          <p class="cat">${escapeHtml(product.category)}</p>
        </div>
        <p class="price">${formatPrice(product.price)}</p>
      </div>
    </a>
  </article>`;
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function bindProductGridEvents(container) {
  container.addEventListener("click", (e) => {
    const bagBtn = e.target.closest("[data-add-to-bag]");
    if (bagBtn) {
      e.preventDefault();
      const id = bagBtn.getAttribute("data-add-to-bag");
      getProducts().then((products) => {
        const product = products.find((p) => p.id === id);
        if (product) {
          Cart.addItem(product, 1);
          toast.success(`${product.name} added to your bag`);
        }
      });
      return;
    }
    const wishBtn = e.target.closest("[data-wishlist]");
    if (wishBtn) {
      e.preventDefault();
      const id = wishBtn.getAttribute("data-wishlist");
      const active = Wishlist.toggleWishlist(id);
      wishBtn.classList.toggle("active", active);
      wishBtn.innerHTML = ICONS.heart(16, active);
      toast.success(active ? "Saved to your personal edit" : "Removed from saved pieces");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const headerMount = document.getElementById("site-header-mount");
  if (headerMount) headerMount.innerHTML = siteHeader();
  const footerMount = document.getElementById("site-footer-mount");
  if (footerMount) footerMount.innerHTML = siteFooter();
  initHeader();
  if (window.Cart) Cart.updateBagBadges();
});
