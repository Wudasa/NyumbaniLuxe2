document.addEventListener("DOMContentLoaded", () => {
  const cartEmpty = document.getElementById("cartEmpty");
  const cartLayout = document.getElementById("cartLayout");
  const cartItemsEl = document.getElementById("cartItems");
  const clearBagBtn = document.getElementById("clearBagBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");

  function render() {
    const items = Cart.readCart();
    clearBagBtn.classList.toggle("hidden", items.length === 0);

    if (items.length === 0) {
      cartEmpty.classList.remove("hidden");
      cartLayout.classList.add("hidden");
      return;
    }
    cartEmpty.classList.add("hidden");
    cartLayout.classList.remove("hidden");

    cartItemsEl.innerHTML = items.map((item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${escapeHtml(item.name)}">
        <div class="cart-item-body">
          <div>
            <div class="cart-item-top">
              <div>
                <p class="coll">${escapeHtml(item.collection)}</p>
                <a href="product.html?id=${encodeURIComponent(item.id)}">${escapeHtml(item.name)}</a>
              </div>
              <p>${formatPrice(item.price)}</p>
            </div>
            <p class="cart-item-desc">${escapeHtml((item.description || "").slice(0, 140))}${(item.description || "").length > 140 ? "…" : ""}</p>
          </div>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button data-action="dec">${ICONS.minus(13)}</button>
              <span>${item.quantity}</span>
              <button data-action="inc">${ICONS.plus(13)}</button>
            </div>
            <button class="remove-btn" data-action="remove">Remove</button>
          </div>
        </div>
      </div>`).join("");

    const subtotal = Cart.subtotal();
    const delivery = subtotal >= 15000 || subtotal === 0 ? 0 : 650;
    const total = subtotal + delivery;
    document.getElementById("summarySubtotal").textContent = formatPrice(subtotal);
    document.getElementById("summaryDelivery").textContent = delivery ? formatPrice(delivery) : "Complimentary";
    document.getElementById("summaryTotal").textContent = formatPrice(total);
  }

  cartItemsEl.addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;
    const id = row.getAttribute("data-id");
    const action = e.target.closest("button")?.getAttribute("data-action");
    if (!action) return;
    const items = Cart.readCart();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (action === "inc") Cart.updateQuantity(id, item.quantity + 1);
    if (action === "dec") Cart.updateQuantity(id, item.quantity - 1);
    if (action === "remove") Cart.removeItem(id);
    render();
  });

  clearBagBtn.addEventListener("click", () => {
    Cart.clearCart();
    toast.success("Your bag has been cleared.");
    render();
  });

  checkoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (Cart.readCart().length === 0) return;
    toast.success("Checkout is coming soon — our concierge team will be in touch.");
  });

  render();
});

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
