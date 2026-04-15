const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
const cartCount = document.querySelector(".cart-count");

let totalItems = 0;

addToCartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const productName = button.dataset.product || "Item";

    totalItems += 1;
    cartCount.textContent = totalItems;

    alert(`${productName} added to cart!`);
  });
});
