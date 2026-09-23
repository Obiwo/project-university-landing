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

    const logo = document.querySelector(".card-logo");
    const corona = document.querySelector(".logo-corona");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (logo && corona && !reduceMotion) {
        const spinSeconds = () => {
            const duration = getComputedStyle(corona).animationDuration;
            const value = parseFloat(duration);
            if (!value) return 14;
            return duration.endsWith("ms") ? value / 1000 : value;
        };

        const currentAngle = () => {
            const transform = getComputedStyle(corona).transform;
            if (!transform || transform === "none") return 0;
            const values = transform.match(/matrix\(([^)]+)\)/);
            if (!values) return 0;
            const [a, b] = values[1].split(",").map(Number);
            let angle = Math.atan2(b, a) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            return angle;
        };

        const resumeSpin = () => {
            const angle = currentAngle() % 360;
            const duration = spinSeconds();
            corona.style.transition = "none";
            corona.style.transform = "";
            corona.style.animation = "none";
            corona.offsetWidth;
            corona.style.animation = `logo-spin ${duration}s linear infinite`;
            corona.style.animationDelay = `${-((angle / 360) * duration)}s`;
        };

        const returnToStart = () => {
            const angle = currentAngle();
            const delta = angle > 180 ? 360 - angle : angle;
            const from = angle > 180 ? angle - 360 : angle;
            const duration = (0.45 + (delta / 180) * 0.85).toFixed(2);

            corona.style.animation = "none";
            corona.style.animationDelay = "0s";
            corona.style.transition = "none";
            corona.style.transform = `rotate(${from}deg)`;
            corona.offsetWidth;
            corona.style.transition = `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`;
            corona.style.transform = "rotate(0deg)";
        };

        logo.addEventListener("mouseenter", returnToStart);
        logo.addEventListener("mouseleave", resumeSpin);
        logo.addEventListener("focusin", returnToStart);
        logo.addEventListener("focusout", (event) => {
            if (!logo.contains(event.relatedTarget)) resumeSpin();
        });
    }
});
