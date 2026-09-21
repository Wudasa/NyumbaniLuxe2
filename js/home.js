document.addEventListener("DOMContentLoaded", async () => {
  // Featured products: one hand-picked piece per key category, pulled from the real catalogue.
  const featuredIds = [
    "16-pcs-quadra-square-dinner-set",
    "8-pcs-ceramic-tea-set",
    "12-pc-square-air-tight-canister-containers-with-stickers-and",
    "3-arm-crystal-bowl-candle-holders",
  ];
  const products = await getProducts();
  const grid = document.getElementById("featuredGrid");
  const featured = featuredIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  grid.innerHTML = featured.map(productCardHTML).join("");
  bindProductGridEvents(grid);

  const form = document.getElementById("newsletterForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("newsletterEmail").value.trim();
      if (!email.includes("@")) { toast.error("Please enter a valid email address."); return; }
      document.getElementById("newsletterEmail").value = "";
      toast.success("Welcome to the inner circle.");
    });
  }
});
