const cardsContainer = document.querySelector(".cards");
cardsContainer.textContent = "Hello!";

const card = document.createElement("article");
card.textContent = "this is within the card";

cardsContainer.appendChild(card);


for (let i = 0; i < 3; i++) {
    const card = document.createElement("article");
    card.textContent = `Card ${i + 1}`;
    cardsContainer.appendChild(card);
}


