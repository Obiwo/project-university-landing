document.addEventListener("DOMContentLoaded", () => {
    const scrollLink = document.querySelector(".hero-scroll");
    if (scrollLink) {
        scrollLink.addEventListener("click", (event) => {
            const target = document.querySelector("#bento");
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        });
    }

    const cards = document.querySelectorAll(".card[data-section]");

    cards.forEach((card) => {
        if (card.dataset.section === "home" || card.dataset.section === "multifuncion") {
            return;
        }

        card.addEventListener("click", (event) => {
            if (event.target.closest("a")) return;
            const link = card.querySelector(".btn");
            if (link) link.click();
        });
    });
});
