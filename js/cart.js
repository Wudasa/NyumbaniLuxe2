// Cart + wishlist, backed by localStorage — same storage key the original
// React app used ("nyumbani-luxe-cart") so nothing is lost in the switch.
(function () {
  const CART_KEY = "nyumbani-luxe-cart";
  const WISHLIST_KEY = "nyumbani-luxe-wishlist";

  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateBagBadges();
  }
  function readWishlist() {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function writeWishlist(ids) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  }

  function addItem(product, quantity) {
    quantity = quantity || 1;
    const items = readCart();
    const existing = items.find((i) => i.id === product.id);
    if (existing) existing.quantity += quantity;
    else items.push(Object.assign({}, product, { quantity }));
    writeCart(items);
  }
  function removeItem(id) {
    writeCart(readCart().filter((i) => i.id !== id));
  }
  function updateQuantity(id, quantity) {
    let items = readCart();
    if (quantity < 1) items = items.filter((i) => i.id !== id);
    else items = items.map((i) => (i.id === id ? Object.assign({}, i, { quantity }) : i));
    writeCart(items);
  }
  function clearCart() {
    writeCart([]);
  }
  function count() {
    return readCart().reduce((sum, i) => sum + i.quantity, 0);
  }
  function subtotal() {
    return readCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  function toggleWishlist(id) {
    const ids = readWishlist();
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1);
    else ids.push(id);
    writeWishlist(ids);
    return ids.includes(id);
  }
  function isWishlisted(id) {
    return readWishlist().includes(id);
  }

  function updateBagBadges() {
    const n = count();
    document.querySelectorAll("[data-bag-count]").forEach((el) => {
      el.textContent = n;
      el.classList.toggle("hide", n === 0);
    });
    document.querySelectorAll("[data-bag-count-padded]").forEach((el) => {
      el.textContent = String(n).padStart(2, "0");
    });
  }

  window.Cart = {
    readCart, addItem, removeItem, updateQuantity, clearCart, count, subtotal, updateBagBadges,
  };
  window.Wishlist = { toggleWishlist, isWishlisted, readWishlist };

  document.addEventListener("DOMContentLoaded", updateBagBadges);
})();
