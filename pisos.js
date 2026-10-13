document.addEventListener("DOMContentLoaded", () => {
    const EXTRA_KEY = "pu-pisos-publicados";
    const ZONES = [
        "Campos San Francisco",
        "Río Ebro",
        "Campus Plaza",
        "Romareda",
        "Centro",
        "Actur",
        "Delicias",
        "San José",
    ];

    const seed = [
        {
            id: "p1",
            type: "piso",
            featured: true,
            title: "Habitación luminosa a cuatro minutos de la facultad",
            zone: "Campos San Francisco",
            price: 320,
            companions: 3,
            detail: "Piso de estudiantes · gastos aparte",
            phone: "34611000001",
        },
        {
            id: "p2",
            type: "piso",
            featured: false,
            title: "Ático con terraza para compartir",
            zone: "Centro",
            price: 410,
            companions: 2,
            detail: "Dos habitaciones libres",
            phone: "34611000002",
        },
        {
            id: "p3",
            type: "piso",
            featured: false,
            title: "Habitación exterior junto al campus",
            zone: "Río Ebro",
            price: 275,
            companions: 3,
            detail: "A un paseo de la Escuela",
            phone: "34611000003",
        },
        {
            id: "p4",
            type: "piso",
            featured: false,
            title: "Piso reformado al lado del campo",
            zone: "Romareda",
            price: 350,
            companions: 4,
            detail: "Cocina nueva · wifi incluido",
            phone: "34611000004",
        },
        {
            id: "p5",
            type: "piso",
            featured: false,
            title: "Estudio individual en el campus",
            zone: "Campus Plaza",
            price: 490,
            companions: 0,
            detail: "Para quien quiere ir por libre",
            phone: "34611000005",
        },
        {
            id: "p6",
            type: "piso",
            featured: false,
            title: "Habitación tranquila en el Actur",
            zone: "Actur",
            price: 250,
            companions: 2,
            detail: "Tranvía hasta el centro",
            phone: "34611000006",
        },
        {
            id: "p7",
            type: "piso",
            featured: false,
            title: "Piso con patio en Delicias",
            zone: "Delicias",
            price: 240,
            companions: 3,
            detail: "Bici hasta San Francisco",
            phone: "34611000007",
        },
        {
            id: "p8",
            type: "piso",
            featured: false,
            title: "Habitación amplia en San José",
            zone: "San José",
            price: 260,
            companions: 1,
            detail: "Solo un compañero",
            phone: "34611000008",
        },
        {
            id: "r1",
            type: "residencia",
            featured: true,
            title: "Habitación individual con media pensión",
            zone: "Río Ebro",
            price: 575,
            companions: 0,
            detail: "Residencia del campus · limpieza incluida",
            phone: "34612000001",
        },
        {
            id: "r2",
            type: "residencia",
            featured: false,
            title: "Colegio mayor junto a la facultad",
            zone: "Campos San Francisco",
            price: 620,
            companions: 0,
            detail: "Habitación individual",
            phone: "34612000002",
        },
        {
            id: "r3",
            type: "residencia",
            featured: false,
            title: "Residencia en habitación doble",
            zone: "Campus Plaza",
            price: 540,
            companions: 1,
            detail: "Un compañero de habitación",
            phone: "34612000003",
        },
        {
            id: "r4",
            type: "residencia",
            featured: false,
            title: "Residencia en pleno centro",
            zone: "Centro",
            price: 590,
            companions: 0,
            detail: "Habitación individual",
            phone: "34612000004",
        },
        {
            id: "r5",
            type: "residencia",
            featured: false,
            title: "Residencia a un paso de Romareda",
            zone: "Romareda",
            price: 510,
            companions: 1,
            detail: "Habitación doble",
            phone: "34612000005",
        },
        {
            id: "r6",
            type: "residencia",
            featured: false,
            title: "Residencia del Actur",
            zone: "Actur",
            price: 470,
            companions: 0,
            detail: "Habitación individual",
            phone: "34612000006",
        },
    ];

    const PHOTOS = {
        p1: "assets/pisos/piso-san-francisco.jpg",
        p2: "assets/pisos/piso-atico.jpg",
        p3: "assets/pisos/piso-rio.jpg",
        p4: "assets/pisos/piso-romareda.jpg",
        p5: "assets/pisos/piso-estudio.jpg",
        p6: "assets/pisos/piso-actur.jpg",
        p7: "assets/pisos/piso-delicias.jpg",
        p8: "assets/pisos/piso-sanjose.jpg",
        r1: "assets/pisos/resi-rio.jpg",
        r2: "assets/pisos/resi-mayor.jpg",
        r3: "assets/pisos/resi-doble.jpg",
        r4: "assets/pisos/resi-centro.jpg",
        r5: "assets/pisos/resi-romareda.jpg",
        r6: "assets/pisos/resi-actur.jpg",
    };
    const FALLBACK_PHOTO = "assets/pisos/piso-estudio.jpg";

    const listEl = document.getElementById("piso-list");
    const countEl = document.getElementById("piso-count");
    const zonesEl = document.getElementById("zones");
    const minInput = document.getElementById("price-min");
    const maxInput = document.getElementById("price-max");
    const dialog = document.getElementById("publish-dialog");
    const form = document.getElementById("publish-form");
    const formError = form.querySelector("[data-form-error]");
    const zoneSelect = form.querySelector("select[name=zona]");
    const publishTitle = document.getElementById("publish-title");

    let type = "piso";
    let sort = "precio";
    const zones = new Set();
    let extras = readExtras();

    ZONES.forEach((zone) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "zone-chip";
        button.textContent = zone;
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => {
            if (zones.has(zone)) zones.delete(zone);
            else zones.add(zone);
            button.setAttribute("aria-pressed", zones.has(zone) ? "true" : "false");
            render();
        });
        zonesEl.append(button);

        const option = document.createElement("option");
        option.value = zone;
        option.textContent = zone;
        zoneSelect.append(option);
    });

    document.querySelectorAll(".mode-switch button").forEach((button) => {
        button.addEventListener("click", () => {
            type = button.dataset.type;
            document.querySelectorAll(".mode-switch button").forEach((item) => {
                item.setAttribute("aria-pressed", item === button ? "true" : "false");
            });
            render();
        });
    });

    document.querySelectorAll(".sort-switch button").forEach((button) => {
        button.addEventListener("click", () => {
            sort = button.dataset.sort;
            document.querySelectorAll(".sort-switch button").forEach((item) => {
                item.setAttribute("aria-pressed", item === button ? "true" : "false");
            });
            render();
        });
    });

    minInput.addEventListener("input", render);
    maxInput.addEventListener("input", render);

    document.getElementById("open-publish").addEventListener("click", () => {
        formError.hidden = true;
        publishTitle.textContent = type === "piso" ? "Publica un piso" : "Publica una residencia";
        dialog.showModal();
    });

    dialog.querySelectorAll("[data-close]").forEach((button) => {
        button.addEventListener("click", () => dialog.close());
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        formError.hidden = true;
        const data = new FormData(form);
        const title = String(data.get("titulo") || "").trim();
        const zone = String(data.get("zona") || "");
        const price = Number(data.get("precio"));
        const companions = Number(data.get("companeros"));
        const phone = String(data.get("whatsapp") || "").replace(/\D/g, "");

        if (title.length < 4) {
            showError("Escribe un título un poco más claro.");
            return;
        }
        if (!ZONES.includes(zone)) {
            showError("Elige una zona.");
            return;
        }
        if (!Number.isFinite(price) || price < 1) {
            showError("El precio tiene que ser un número.");
            return;
        }
        if (!Number.isInteger(companions) || companions < 0) {
            showError("Indica cuántos compañeros hay.");
            return;
        }
        if (phone.length < 9 || phone.length > 15) {
            showError("El WhatsApp tiene que ser un teléfono válido.");
            return;
        }

        extras.push({
            id: `pub-${Date.now()}`,
            type,
            featured: false,
            title,
            zone,
            price,
            companions,
            detail: "Publicado por un estudiante",
            phone: phone.startsWith("34") ? phone : `34${phone.replace(/^0+/, "")}`,
            photo: FALLBACK_PHOTO,
        });
        writeExtras();
        form.reset();
        dialog.close();
        zones.clear();
        zonesEl.querySelectorAll(".zone-chip").forEach((chip) => chip.setAttribute("aria-pressed", "false"));
        minInput.value = "";
        maxInput.value = "";
        render();
        listEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    render();

    function readExtras() {
        try {
            const parsed = JSON.parse(localStorage.getItem(EXTRA_KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function writeExtras() {
        try {
            localStorage.setItem(EXTRA_KEY, JSON.stringify(extras));
        } catch {
            showError("No hemos podido guardar la oferta en este navegador.");
        }
    }

    function showError(message) {
        formError.hidden = false;
        formError.textContent = message;
    }

    function allListings() {
        return seed.concat(extras);
    }

    function render() {
        const min = numberOrNull(minInput.value);
        const max = numberOrNull(maxInput.value);
        let items = allListings().filter((item) => item.type === type);
        if (zones.size) items = items.filter((item) => zones.has(item.zone));
        if (min !== null) items = items.filter((item) => item.price >= min);
        if (max !== null) items = items.filter((item) => item.price <= max);

        items.sort((a, b) => {
            if (sort === "companeros") {
                return a.companions - b.companions || a.price - b.price;
            }
            return a.price - b.price || a.companions - b.companions;
        });

        const featured = items.find((item) => item.featured) || items[0] || null;
        const rest = featured ? items.filter((item) => item !== featured) : [];
        const noun = labelCount(items.length, type);

        countEl.textContent = items.length ? `${items.length} ${noun}` : `Ningún ${type === "piso" ? "piso" : "residencia"} con esos filtros`;
        listEl.replaceChildren();

        if (!featured) {
            const empty = document.createElement("p");
            empty.className = "piso-empty";
            empty.textContent = "Prueba con otra zona o abre un poco el precio.";
            listEl.append(empty);
            return;
        }

        listEl.append(featureCard(featured));
        if (!rest.length) return;

        const grid = document.createElement("div");
        grid.className = "piso-grid";
        rest.forEach((item) => grid.append(offerCard(item)));
        listEl.append(grid);
    }

    function featureCard(item) {
        const article = document.createElement("article");
        article.className = "piso-feature";

        const copy = document.createElement("div");
        copy.className = "piso-feature-copy";

        const eyebrow = document.createElement("p");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = `DESTACADO · ${item.zone}`;

        const title = document.createElement("h2");
        title.textContent = item.title;

        const detail = document.createElement("p");
        detail.className = "piso-detail";
        detail.textContent = `${item.detail} · ${companionsLabel(item.companions)}`;

        const price = document.createElement("p");
        price.className = "piso-feature-price";
        const amount = document.createElement("strong");
        amount.textContent = `${item.price} €`;
        const month = document.createElement("span");
        month.textContent = "/mes";
        price.append(amount, month);

        copy.append(eyebrow, title, detail, price, waLink(item, "btn btn-on-black wa-btn"));

        const photoWrap = document.createElement("div");
        photoWrap.className = "piso-feature-photo";
        photoWrap.append(listingPhoto(item));

        article.append(photoWrap, copy);
        return article;
    }

    function offerCard(item) {
        const article = document.createElement("article");
        article.className = "piso-card";

        const body = document.createElement("div");
        body.className = "piso-card-body";

        const eyebrow = document.createElement("p");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = item.zone;

        const title = document.createElement("h3");
        title.textContent = item.title;

        const detail = document.createElement("p");
        detail.className = "piso-detail";
        detail.textContent = item.detail;

        const meta = document.createElement("p");
        meta.className = "piso-meta";
        meta.textContent = companionsLabel(item.companions);

        const price = document.createElement("p");
        price.className = "piso-price";
        price.textContent = `${item.price} €`;
        const month = document.createElement("span");
        month.textContent = "/mes";
        price.append(month);

        body.append(eyebrow, title, detail, meta, price, waLink(item, "btn btn-solid wa-btn"));
        article.append(listingPhoto(item, "piso-card-photo"), body);
        return article;
    }

    function listingPhoto(item, className = "piso-photo") {
        const img = document.createElement("img");
        img.className = className;
        img.src = item.photo || PHOTOS[item.id] || FALLBACK_PHOTO;
        img.alt = item.title;
        return img;
    }

    function waLink(item, className) {
        const link = document.createElement("a");
        link.className = className;
        link.href = waHref(item);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.append(phoneIcon(), document.createTextNode("Contactar por WhatsApp"));
        return link;
    }

    function waHref(item) {
        const text = `Hola, me interesa «${item.title}» en ${item.zone} (${item.price} €/mes).`;
        return `https://wa.me/${item.phone}?text=${encodeURIComponent(text)}`;
    }

    function phoneIcon() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("width", "22");
        svg.setAttribute("height", "22");
        svg.setAttribute("aria-hidden", "true");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("fill", "currentColor");
        path.setAttribute("d", "M8.2 3.6h2.1c.4 0 .8.3.9.7l.6 2.4c.1.4 0 .8-.3 1.1L10.2 9c.9 1.7 2.2 3.1 3.9 4l1.2-1.3c.3-.3.7-.4 1.1-.3l2.4.6c.4.1.7.5.7.9v2.1c0 .5-.4 1-1 1C12.4 16 5.9 9.6 5.9 4.6c0-.5.4-1 1-1h1.3z");
        svg.append(path);
        return svg;
    }

    function companionsLabel(count) {
        if (count === 0) return "Sin compañeros";
        if (count === 1) return "1 compañero";
        return `${count} compañeros`;
    }

    function labelCount(count, kind) {
        if (kind === "piso") return count === 1 ? "piso" : "pisos";
        return count === 1 ? "residencia" : "residencias";
    }

    function numberOrNull(value) {
        if (value === "") return null;
        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }
});
