document.addEventListener("DOMContentLoaded", async () => {
  const PAGE_SIZE = 24;
  const PRICE_MIN = 0;
  const PRICE_MAX = 50000;
  const priceRanges = [
    { label: "All prices", value: "all" },
    { label: "Under KSh 5,000", value: "under-5000" },
    { label: "KSh 5,000–15,000", value: "5000-15000" },
    { label: "Over KSh 15,000", value: "over-15000" },
  ];

  const products = await getProducts();
  const categories = ["All pieces", ...Array.from(new Set(products.map((p) => p.collection)))];

  // ---- read state from URL (so home/category links like catalogue.html?collection=Dining work) ----
  const params = new URLSearchParams(location.search);

  const state = {
    activeCategory: params.get("collection") || "All pieces",
    sort: "Featured",
    search: params.get("q") || "",
    priceRange: "all",
    minPrice: PRICE_MIN,
    maxPrice: PRICE_MAX,
    inStockOnly: false,
    page: 1,
  };

  // ---- DOM refs ----
  const categoryPills = document.getElementById("categoryPills");
  const filtersToggle = document.getElementById("filtersToggle");
  const filtersPanel = document.getElementById("filtersPanel");
  const searchInput = document.getElementById("searchInput");
  const searchSuggestions = document.getElementById("searchSuggestions");
  const sortSelect = document.getElementById("sortSelect");
  const quickPrice = document.getElementById("quickPrice");
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");
  const sliderRange = document.getElementById("sliderRange");
  const priceRangeLabel = document.getElementById("priceRangeLabel");
  const inStockOnly = document.getElementById("inStockOnly");
  const clearFiltersBtn = document.getElementById("clearFilters");
  const emptyClearBtn = document.getElementById("emptyClear");
  const resultsCount = document.getElementById("resultsCount");
  const pageOfLabel = document.getElementById("pageOfLabel");
  const productGrid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");
  const pagination = document.getElementById("pagination");

  // ---- category pills ----
  categoryPills.innerHTML = categories.map((c) =>
    `<button data-category="${escapeHtml(c)}" class="${c === state.activeCategory ? "active" : ""}">${escapeHtml(c)}</button>`
  ).join("");
  categoryPills.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-category]");
    if (!btn) return;
    state.activeCategory = btn.getAttribute("data-category");
    state.page = 1;
    syncCategoryPills();
    render();
  });
  function syncCategoryPills() {
    categoryPills.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-category") === state.activeCategory);
    });
  }

  // ---- quick price buttons ----
  quickPrice.innerHTML = `<span>Quick price</span>` + priceRanges.map((r) =>
    `<button data-range="${r.value}" class="${state.priceRange === r.value ? "active" : ""}">${r.label}</button>`
  ).join("");
  quickPrice.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-range]");
    if (!btn) return;
    const value = btn.getAttribute("data-range");
    state.priceRange = value;
    if (value === "all") { state.minPrice = PRICE_MIN; state.maxPrice = PRICE_MAX; }
    else if (value === "under-5000") { state.minPrice = PRICE_MIN; state.maxPrice = 5000; }
    else if (value === "5000-15000") { state.minPrice = 5000; state.maxPrice = 15000; }
    else { state.minPrice = 15000; state.maxPrice = PRICE_MAX; }
    syncQuickPrice();
    syncSlider();
    state.page = 1;
    render();
  });
  function syncQuickPrice() {
    quickPrice.querySelectorAll("button[data-range]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-range") === state.priceRange);
    });
  }

  // ---- filters toggle (mobile) ----
  filtersToggle.addEventListener("click", () => filtersPanel.classList.toggle("open"));

  // ---- search ----
  searchInput.value = state.search;
  searchInput.addEventListener("input", () => {
    state.search = searchInput.value;
    state.page = 1;
    render();
    renderSuggestions();
  });
  function renderSuggestions() {
    const q = state.search.trim().toLowerCase();
    if (q.length < 2) { searchSuggestions.classList.add("hidden"); return; }
    const matches = products.filter((p) => `${p.name} ${p.category} ${p.collection} ${p.sku}`.toLowerCase().includes(q)).slice(0, 6);
    searchSuggestions.classList.remove("hidden");
    searchSuggestions.innerHTML = matches.length
      ? matches.map((p) => `
        <a href="product.html?id=${encodeURIComponent(p.id)}">
          <img src="${p.image}" alt="">
          <span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.collection)} &middot; ${formatPrice(p.price)}</small></span>
        </a>`).join("")
      : `<p>No matching pieces yet</p>`;
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-field")) searchSuggestions.classList.add("hidden");
  });

  // ---- sort ----
  sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; render(); });

  // ---- price slider (dual thumb) ----
  function syncSlider() {
    minPriceInput.value = state.minPrice;
    maxPriceInput.value = state.maxPrice;
    const left = (state.minPrice / PRICE_MAX) * 100;
    const right = 100 - (state.maxPrice / PRICE_MAX) * 100;
    sliderRange.style.left = left + "%";
    sliderRange.style.right = right + "%";
    priceRangeLabel.textContent = `${formatPrice(state.minPrice)} – ${state.maxPrice >= PRICE_MAX ? formatPrice(PRICE_MAX) + "+" : formatPrice(state.maxPrice)}`;
  }
  minPriceInput.addEventListener("input", () => {
    state.priceRange = "custom";
    state.minPrice = Math.min(Number(minPriceInput.value), state.maxPrice - 500);
    syncQuickPrice(); syncSlider(); state.page = 1; render();
  });
  maxPriceInput.addEventListener("input", () => {
    state.priceRange = "custom";
    state.maxPrice = Math.max(Number(maxPriceInput.value), state.minPrice + 500);
    syncQuickPrice(); syncSlider(); state.page = 1; render();
  });

  // ---- in stock ----
  inStockOnly.addEventListener("change", () => { state.inStockOnly = inStockOnly.checked; state.page = 1; render(); });

  // ---- clear filters ----
  function clearFilters() {
    state.search = ""; state.activeCategory = "All pieces"; state.priceRange = "all";
    state.minPrice = PRICE_MIN; state.maxPrice = PRICE_MAX; state.inStockOnly = false; state.sort = "Featured"; state.page = 1;
    searchInput.value = ""; sortSelect.value = "Featured"; inStockOnly.checked = false;
    syncCategoryPills(); syncQuickPrice(); syncSlider(); render();
  }
  clearFiltersBtn.addEventListener("click", clearFilters);
  emptyClearBtn.addEventListener("click", clearFilters);

  // ---- filtering / sorting / pagination ----
  function getFiltered() {
    const q = state.search.trim().toLowerCase();
    let list = products.filter((p) => {
      const categoryMatch = state.activeCategory === "All pieces" || p.collection === state.activeCategory;
      const searchMatch = !q || `${p.name} ${p.category} ${p.collection} ${p.sku}`.toLowerCase().includes(q);
      const pricePresetMatch = state.priceRange === "all"
        || (state.priceRange === "under-5000" && p.price < 5000)
        || (state.priceRange === "5000-15000" && p.price >= 5000 && p.price <= 15000)
        || (state.priceRange === "over-15000" && p.price > 15000)
        || state.priceRange === "custom";
      const sliderMatch = p.price >= state.minPrice && p.price <= state.maxPrice;
      const stockMatch = !state.inStockOnly || p.stock > 0;
      return categoryMatch && searchMatch && pricePresetMatch && sliderMatch && stockMatch;
    });
    if (state.sort === "Price: low to high") list = [...list].sort((a, b) => a.price - b.price);
    else if (state.sort === "Price: high to low") list = [...list].sort((a, b) => b.price - a.price);
    else if (state.sort === "Name: A–Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (state.sort === "Name: Z–A") list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }

  function render() {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const start = filtered.length ? (state.page - 1) * PAGE_SIZE : 0;
    const visible = filtered.slice(start, start + PAGE_SIZE);

    resultsCount.textContent = filtered.length
      ? `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} pieces`
      : "No pieces found";
    pageOfLabel.textContent = `Page ${state.page} of ${totalPages}`;

    productGrid.innerHTML = visible.map(productCardHTML).join("");
    emptyState.classList.toggle("hidden", visible.length > 0);
    productGrid.classList.toggle("hidden", visible.length === 0);

    // pagination
    if (totalPages > 1) {
      pagination.classList.remove("hidden");
      const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((n) => totalPages <= 5 || n === 1 || n === totalPages || Math.abs(n - state.page) <= 1);
      let html = `<button data-page="prev" ${state.page === 1 ? "disabled" : ""} aria-label="Previous page">${ICONS.arrowLeft(15)}</button>`;
      let last = 0;
      pageNumbers.forEach((n) => {
        if (last && n - last > 1) html += `<span style="padding:0 .25rem;color:rgba(37,30,25,.4);">&hellip;</span>`;
        html += `<button data-page="${n}" class="${n === state.page ? "active" : ""}">${n}</button>`;
        last = n;
      });
      html += `<button data-page="next" ${state.page === totalPages ? "disabled" : ""} aria-label="Next page">${ICONS.arrowRight(15)}</button>`;
      pagination.innerHTML = html;
    } else {
      pagination.classList.add("hidden");
      pagination.innerHTML = "";
    }
  }

  pagination.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-page]");
    if (!btn || btn.disabled) return;
    const p = btn.getAttribute("data-page");
    if (p === "prev") state.page = Math.max(1, state.page - 1);
    else if (p === "next") state.page += 1;
    else state.page = Number(p);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  bindProductGridEvents(productGrid);

  // ---- init ----
  syncCategoryPills();
  syncQuickPrice();
  syncSlider();
  render();
});

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
