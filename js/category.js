// Category metadata — mirrors the original CategoryLanding.tsx copy, updated to
// match the collections that actually exist in the real catalogue data.
const CATEGORY_META = {
  living: { name: "Living", eyebrow: "The living edit", title: "Rooms with a point of view.", description: "Sculptural objects, mirrors, vases and tactile accents for living spaces that feel collected—not completed.", image: "assets/products/big-120-cm-by-80-crystal-glass-3d-decorative-mirror/rn-image_picker_lib_temp_c6304a54-155f-4088-8fdd-96138656b9da.jpg" },
  dining: { name: "Dining", eyebrow: "The dining edit", title: "Gather beautifully.", description: "Dinner sets, glassware, tea services and serving pieces made for generous tables and everyday rituals.", image: "assets/products/16-pcs-quadra-square-dinner-set/451030374_493633336385154_6405314070748279848_n-1_9389854a-9ac3-42e4-903e-43903b99aa9d.jpg" },
  kitchen: { name: "Kitchen", eyebrow: "The kitchen edit", title: "The heart, made beautiful.", description: "Practical pieces with an editorial point of view—from organizers to considered kitchenware and tools.", image: "assets/products/12-pc-square-air-tight-canister-containers-with-stickers-and/rn-image_picker_lib_temp_8c7952b9-576a-44b1-b306-548b760cbdc2.jpg" },
  bedroom: { name: "Bedroom", eyebrow: "The bedroom edit", title: "Rest, considered.", description: "Quiet bedside pieces and bedroom accessories for a room that helps the day soften at the edges.", image: "assets/products/3-in-1-bamboo-serviette-box-2/rn-image_picker_lib_temp_1569450a-bf64-4e8d-a551-3d8fa254a348.jpg" },
  bathroom: { name: "Bathroom", eyebrow: "The bathroom edit", title: "Small comforts, well placed.", description: "Bath-time details and considered bathroom accessories that turn a routine into a small ritual.", image: "assets/products/5-pcs-bathroom-set-no-drilling-bathroom-set/473342782_3190455764425446_503236003225722891_n-1.jpg" },
  lighting: { name: "Lighting", eyebrow: "The lighting edit", title: "A warmer kind of glow.", description: "Bedside lamps and ambient lighting pieces chosen for how a room feels after dark.", image: "assets/products/3-d-moving-sand-table-lamp/rn-image_picker_lib_temp_e62a1cc9-82a2-4a94-8103-d7619463ba28.jpg" },
  rituals: { name: "Rituals", eyebrow: "The rituals edit", title: "Make time for the little things.", description: "Candles, diffusers and bath-time details that turn an ordinary evening into a ritual worth keeping.", image: "assets/products/3-arm-crystal-bowl-candle-holders/326431448_1574168476382335_1587428149476663634_n_440a92ff-02f0-4c1c-a322-22e9ccaeb229.jpg" },
};

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug") || "living";
  const meta = CATEGORY_META[slug] || CATEGORY_META.living;
  document.title = `${meta.name} Décor in Kenya — Nyumbani Luxe`;

  const products = await getProducts();
  const collectionProducts = products.filter((p) => p.collection === meta.name);

  const main = document.getElementById("categoryMain");
  main.innerHTML = `
    <section class="cat-banner">
      <img src="${meta.image}" alt="${escapeHtml(meta.name)} home décor collection">
      <div class="fade"></div>
      <div class="inner">
        <div class="cat-banner-copy">
          <p class="eyebrow">${escapeHtml(meta.eyebrow)}</p>
          <h1 class="font-display">${escapeHtml(meta.title)}</h1>
          <p>${escapeHtml(meta.description)}</p>
        </div>
      </div>
    </section>
    <div class="wrap" style="padding-top:3rem;padding-bottom:4rem;">
      <a href="catalogue.html" class="pd-back">${ICONS.arrowLeft(14)} All pieces</a>
      <div class="filter-pills" style="margin-top:2rem;border-bottom:1px solid rgba(37,30,25,.15);padding-bottom:2rem;" id="categoryLandingPills"></div>
      <div style="margin-top:3rem;display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
        <div>
          <p style="font-size:.63rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--brass);margin:0;">The collection</p>
          <h2 class="font-display" style="margin:.75rem 0 0;font-size:2.75rem;">${escapeHtml(meta.name)} pieces</h2>
        </div>
        <span style="font-size:.75rem;color:rgba(37,30,25,.5);">${collectionProducts.length} considered pieces</span>
      </div>
      <div class="product-grid" id="categoryGrid" style="margin-top:2rem;"></div>
      <div style="margin-top:4rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;border-top:1px solid rgba(37,30,25,.15);padding-top:1.5rem;">
        <p style="display:flex;align-items:center;gap:.5rem;font-size:.75rem;color:rgba(37,30,25,.55);margin:0;">${ICONS.check(14)} Complimentary Nairobi delivery over KSh 15,000</p>
        <a href="catalogue.html" style="display:flex;align-items:center;gap:.5rem;font-size:.64rem;font-weight:700;text-transform:uppercase;letter-spacing:.16em;">Shop all ${ICONS.arrowRight(14)}</a>
      </div>
    </div>
  `;

  const pillsEl = document.getElementById("categoryLandingPills");
  pillsEl.innerHTML = Object.entries(CATEGORY_META).map(([s, m]) =>
    `<a href="category.html?slug=${s}" class="${m.name === meta.name ? "active" : ""}" style="display:inline-flex;padding:.5rem 1rem;font-size:.64rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;${m.name === meta.name ? "background:var(--espresso);color:var(--bone);" : "border:1px solid rgba(37,30,25,.15);color:rgba(37,30,25,.6);"}">${escapeHtml(m.name)}</a>`
  ).join("");

  const grid = document.getElementById("categoryGrid");
  grid.innerHTML = collectionProducts.length
    ? collectionProducts.map(productCardHTML).join("")
    : `<p style="grid-column:1/-1;padding:3rem 0;text-align:center;font-family:'Cormorant Garamond',serif;font-size:1.75rem;color:rgba(37,30,25,.5);">More ${escapeHtml(meta.name.toLowerCase())} pieces are on their way.</p>`;
  bindProductGridEvents(grid);
});

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
