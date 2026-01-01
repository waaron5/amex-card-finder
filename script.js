const cardsContainer = document.querySelector(".cards");
const searchInput = document.querySelector("#search");
const typeSelect = document.querySelector("#card-type");
const rewardsSelect = document.querySelector("#rewards-category");
const feeSelect = document.querySelector("#annual-fee");
const clearButton = document.querySelector(".clear-filters");

let allCards = [];

function loadCards() {
    return fetch("data/amex_cards.json")
        .then((res) => res.json())
        .then((data) => {
            allCards = data.filter((card) => card.visibility !== false);
            renderCards(allCards);
        })
        .catch((err) => {
            console.error("Failed to load cards:", err);
            cardsContainer.textContent = "Failed to load card data.";
        });
}

function createCard(card) {
    const article = document.createElement("article");
    article.className = "card";

    const img = document.createElement("img");
    img.src = card.image;
    img.alt = card.name;
    img.loading = "lazy";
    img.addEventListener("error", () => {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = "true";
        img.src = card.image.replace(/(\.\w+)$/, " copy$1");
    });

    const title = document.createElement("h3");
    title.textContent = card.name;

    const bullets = document.createElement("ul");
    const rewards = (card.rewards || []).slice(0, 4);
    rewards.forEach((reward) => {
        const li = document.createElement("li");
        li.textContent = reward.description;
        bullets.appendChild(li);
    });

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const fee = document.createElement("p");
    fee.className = "card-fee";
    fee.textContent =
        card.annual_fee === 0
            ? "No annual fee"
            : `Annual fee: $${card.annual_fee}`;

    const tag = document.createElement("span");
    tag.className = `card-tag ${card.is_business ? "card-tag--business" : "card-tag--personal"}`;
    tag.textContent = card.is_business ? "Business" : "Personal";

    footer.append(fee, tag);
    article.append(img, title, bullets, footer);
    return article;
}

function renderCards(cards) {
    cardsContainer.innerHTML = "";
    if (cards.length === 0) {
        cardsContainer.textContent = "No cards match your filters.";
        return;
    }
    cards.forEach((card) => cardsContainer.appendChild(createCard(card)));
}

function matchesRewards(card, value) {
    if (value === "all" || value === "") return true;
    const haystack = [
        card.name,
        card.card_type,
        ...(card.rewards || []).map((reward) => reward.category),
        ...(card.rewards || []).map((reward) => reward.description),
        ...(card.quiz_metadata?.manual_tags || []),
    ]
        .join(" ")
        .toLowerCase();

    return haystack.includes(value);
}

function matchesFee(card, value) {
    if (value === "" || value === "all") return true;
    if (value === "no-fee") return card.annual_fee === 0;
    if (value === "under-100") return card.annual_fee > 0 && card.annual_fee < 100;
    if (value === "premium") return card.annual_fee >= 100;
    return true;
}

function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const type = typeSelect.value;
    const rewards = rewardsSelect.value;
    const fee = feeSelect.value;

    const filtered = allCards.filter((card) => {
        const matchesSearch = card.name.toLowerCase().includes(query);
        const matchesType =
            type === "all" ||
            type === "" ||
            (type === "business" ? card.is_business : !card.is_business);

        return (
            matchesSearch &&
            matchesType &&
            matchesRewards(card, rewards) &&
            matchesFee(card, fee)
        );
    });

    renderCards(filtered);
}

function setupFilters() {
    searchInput.addEventListener("input", applyFilters);
    typeSelect.addEventListener("change", applyFilters);
    rewardsSelect.addEventListener("change", applyFilters);
    feeSelect.addEventListener("change", applyFilters);
    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        typeSelect.value = "all";
        rewardsSelect.value = "all";
        feeSelect.value = "";
        applyFilters();
    });
}

loadCards().then(setupFilters);
