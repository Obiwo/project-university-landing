document.addEventListener("DOMContentLoaded", () => {
    const RECORD_KEY = "pu-viajes-record";
    const LIST_KEY = "pu-viajes-lista";
    const PX_PER_KM = 3400;

    const canvas = document.getElementById("flight");
    const stage = document.getElementById("flight-stage");
    const ctx = canvas.getContext("2d");
    const kmEl = document.querySelector("[data-km]");
    const recordEl = document.querySelector("[data-record]");
    const statusEl = document.querySelector("[data-status]");
    const scorelineEl = document.querySelector("[data-scoreline]");
    const hintEl = document.querySelector("[data-hint]");
    const dialog = document.getElementById("waitlist-dialog");
    const form = document.getElementById("waitlist-form");
    const thanks = document.querySelector("[data-thanks]");
    const formError = document.querySelector("[data-form-error]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const palette = { k: "#000000", w: "#ffffff", r: "#ff0100" };
    const scale = 3;
    const planeSprite = [
        "......kk..........",
        ".....kwwk.........",
        "....kwwwk.........",
        ".kkkwwwwwwkkkkkk..",
        "kwwwwrrwwwwwwwwwk.",
        ".kkkwwwwwwkkkkkk..",
        "....kwwwk..k......",
        ".....kwwk..k......",
        "......kk..........",
    ];
    const birdA = [
        "..kk......",
        ".kwwk.kk..",
        "kwwwwkwwk.",
        ".kwwwwwwk.",
        "..kkwwkk..",
    ];
    const birdB = [
        "....kk....",
        "..kwwk.kk.",
        ".kwwwwkwwk",
        "kwwwwwwwk.",
        ".kkwwkk...",
    ];
    const suitcaseSprite = [
        "....kk....",
        "...kwwk...",
        "..kwwwk...",
        ".kwwwwwk..",
        "kwwwwwwwk.",
        "kwkwwwkwk.",
        "kwwwwwwwk.",
        ".kkkkkkk..",
    ];
    const coneSprite = [
        "....rr....",
        "....rr....",
        "...kwwk...",
        "...krrk...",
        "..kwwwk...",
        "..krrrk...",
        ".kwwwwwk..",
        "kkkkkkkkkk",
    ];

    const spriteSize = (rows) => ({
        w: rows[0].length * scale,
        h: rows.length * scale,
    });

    const planeSize = spriteSize(planeSprite);
    let width = 640;
    let height = 320;
    let groundY = 280;
    let distance = 0;
    let speed = 250;
    let gap = 0;
    let nextGap = 520;
    let lastKind = "";
    let obstacles = [];
    let clouds = [];
    let state = "ready";
    let paused = false;
    let recordPx = readRecord();
    let raf = 0;
    let lastTime = 0;

    const plane = {
        x: 56,
        y: 0,
        w: planeSize.w,
        h: planeSize.h,
        vy: 0,
        onGround: true,
    };

    function readRecord() {
        try {
            return Number(localStorage.getItem(RECORD_KEY)) || 0;
        } catch {
            return 0;
        }
    }

    function writeRecord(value) {
        try {
            localStorage.setItem(RECORD_KEY, String(value));
        } catch {
            /* el récord se queda en esta partida si el navegador bloquea el almacenamiento */
        }
    }

    function formatKm(px) {
        return (px / PX_PER_KM).toFixed(1);
    }

    function paintMeters() {
        kmEl.textContent = formatKm(distance);
        recordEl.textContent = formatKm(recordPx);
    }

    function layout() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.max(rect.width, 280);
        height = Math.max(rect.height, 200);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;
        groundY = height - 36;
        if (plane.onGround) plane.y = groundY - plane.h;
    }

    function resetRun() {
        distance = 0;
        speed = 250;
        gap = 0;
        nextGap = 560;
        lastKind = "";
        obstacles = [];
        plane.vy = 0;
        plane.onGround = true;
        plane.y = groundY - plane.h;
        state = "play";
        statusEl.hidden = true;
        scorelineEl.hidden = true;
        hintEl.hidden = true;
        paintMeters();
    }

    function jump() {
        if (paused || dialog.open) return;
        if (state === "ready" || state === "crash") {
            resetRun();
        }
        if (plane.onGround) {
            plane.vy = -760;
            plane.onGround = false;
        }
    }

    function spawn() {
        const roll = Math.random();
        let kind = roll < 0.34 ? "maleta" : roll < 0.67 ? "cono" : "pajaro";
        if (lastKind.startsWith("pajaro") && kind === "pajaro") kind = "maleta";

        let sprite = suitcaseSprite;
        let lift = 0;
        if (kind === "cono") sprite = coneSprite;
        if (kind === "pajaro") {
            sprite = birdA;
            const high = lastKind !== "maleta" && lastKind !== "cono" && Math.random() < 0.55;
            lift = high ? 118 : 4;
            lastKind = high ? "pajaro-alto" : "pajaro";
        } else {
            lastKind = kind;
        }

        const size = spriteSize(sprite);
        obstacles.push({
            kind,
            x: width + 8,
            w: size.w,
            h: size.h,
            lift,
        });
    }

    function obstacleY(item) {
        return groundY - item.h - item.lift;
    }

    function overlaps(item) {
        const padX = 8;
        const padY = 6;
        const ax = plane.x + padX;
        const ay = plane.y + padY;
        const aw = plane.w - padX * 2;
        const ah = plane.h - padY * 2;
        const by = obstacleY(item);
        return ax < item.x + item.w && ax + aw > item.x && ay < by + item.h && ay + ah > by;
    }

    function crash() {
        state = "crash";
        const beaten = distance > recordPx && distance > 80;
        if (distance > recordPx) {
            recordPx = distance;
            writeRecord(recordPx);
        }
        statusEl.hidden = false;
        scorelineEl.hidden = false;
        scorelineEl.textContent = beaten
            ? `Nuevo récord · ${formatKm(distance)} km`
            : `${formatKm(distance)} km`;
        hintEl.hidden = false;
        hintEl.textContent = "Espacio o toca para reintentar";
        paintMeters();
    }

    function drawSprite(rows, x, y) {
        const ox = Math.round(x);
        const oy = Math.round(y);
        for (let row = 0; row < rows.length; row += 1) {
            for (let col = 0; col < rows[row].length; col += 1) {
                const color = palette[rows[row][col]];
                if (!color) continue;
                ctx.fillStyle = color;
                ctx.fillRect(ox + col * scale, oy + row * scale, scale, scale);
            }
        }
    }

    function draw() {
        ctx.fillStyle = "#ff0100";
        ctx.fillRect(0, 0, width, height);

        clouds.forEach((cloud) => {
            ctx.fillStyle = "rgb(255 255 255 / 28%)";
            ctx.fillRect(cloud.x, cloud.y, cloud.w, 8);
            ctx.fillRect(cloud.x + 10, cloud.y - 8, cloud.w * 0.55, 8);
        });

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, groundY, width, height - groundY);
        ctx.fillStyle = "#ffffff";
        const dash = distance % 46;
        for (let x = -dash; x < width; x += 46) {
            ctx.fillRect(x, groundY + 14, 20, 4);
        }

        obstacles.forEach((item) => {
            const y = obstacleY(item);
            if (item.kind === "maleta") drawSprite(suitcaseSprite, item.x, y);
            else if (item.kind === "cono") drawSprite(coneSprite, item.x, y);
            else drawSprite(Math.floor(distance / 18) % 2 ? birdB : birdA, item.x, y);
        });

        drawSprite(planeSprite, plane.x, plane.y);
    }

    function driftClouds(step) {
        clouds.forEach((cloud) => {
            cloud.x -= step;
            if (cloud.x + cloud.w < 0) {
                cloud.x = width + Math.random() * 120;
                cloud.y = 24 + Math.random() * Math.max(40, groundY * 0.35);
            }
        });
    }

    function update(dt) {
        if (paused) return;
        if (state !== "play") {
            if (!reduceMotion) driftClouds(18 * dt);
            return;
        }

        speed = 250 + Math.min(distance / 14, 340);
        const step = speed * dt;
        distance += step;
        gap += step;

        plane.vy += 2300 * dt;
        plane.y += plane.vy * dt;
        const floor = groundY - plane.h;
        if (plane.y >= floor) {
            plane.y = floor;
            plane.vy = 0;
            plane.onGround = true;
        }

        if (gap > nextGap) {
            spawn();
            gap = 0;
            nextGap = speed * 0.9 + 80 + Math.random() * 140;
        }

        obstacles.forEach((item) => {
            item.x -= step;
        });
        obstacles = obstacles.filter((item) => item.x + item.w > -20);
        if (obstacles.some(overlaps)) crash();

        driftClouds(step * 0.2);

        paintMeters();
    }

    function frame(now) {
        const dt = Math.min(0.032, (now - lastTime) / 1000 || 0);
        lastTime = now;
        if (!document.hidden) update(dt);
        draw();
        raf = requestAnimationFrame(frame);
    }

    function seedClouds() {
        clouds = [0, 1, 2].map((index) => ({
            x: 80 + index * 220,
            y: 28 + index * 26,
            w: 54 + index * 16,
        }));
    }

    function onAction(event) {
        const target = event.target;
        if (target instanceof Element && target.closest("a, button, input, textarea, select, label")) return;
        event.preventDefault();
        jump();
    }

    window.addEventListener("keydown", (event) => {
        if (event.code !== "Space" && event.code !== "ArrowUp") return;
        if (event.repeat) return;
        const target = event.target;
        if (target instanceof Element && target.closest("input, textarea, select, button, a")) return;
        if (dialog.open) return;
        event.preventDefault();
        jump();
    });

    stage.addEventListener("pointerdown", onAction);

    new ResizeObserver(layout).observe(canvas);
    seedClouds();
    layout();
    paintMeters();
    hintEl.textContent = "Pulsa espacio o toca la pantalla para saltar";
    raf = requestAnimationFrame(frame);

    if (reduceMotion) {
        hintEl.textContent = "Pulsa espacio o toca la pantalla para saltar";
    }

    const openButton = document.getElementById("open-waitlist");
    openButton.addEventListener("click", () => {
        paused = state === "play";
        form.hidden = false;
        thanks.hidden = true;
        formError.hidden = true;
        dialog.showModal();
    });

    dialog.addEventListener("close", () => {
        paused = false;
        openButton.blur();
    });

    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
    });

    dialog.querySelectorAll("[data-close]").forEach((button) => {
        button.addEventListener("click", () => dialog.close());
    });

    function validContact(value) {
        const text = value.trim();
        const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
        const digits = text.replace(/\D/g, "");
        const phone = digits.length >= 9 && digits.length <= 15;
        return email || phone;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        formError.hidden = true;
        const data = new FormData(form);
        const nombre = String(data.get("nombre") || "").trim();
        const contacto = String(data.get("contacto") || "").trim();
        const universidad = String(data.get("universidad") || "").trim();
        const tipo = String(data.get("tipo") || "");
        const privacidad = data.get("privacidad") === "on";

        if (nombre.length < 2) {
            showError("Escribe tu nombre.");
            return;
        }
        if (!validContact(contacto)) {
            showError("Deja un WhatsApp o un email válido.");
            return;
        }
        if (universidad.length < 2) {
            showError("Escribe tu universidad.");
            return;
        }
        if (!tipo) {
            showError("Elige el tipo de viaje.");
            return;
        }
        if (!privacidad) {
            showError("Tienes que aceptar la privacidad para apuntarte.");
            return;
        }

        const entry = {
            nombre,
            contacto,
            universidad,
            tipo,
            at: new Date().toISOString(),
        };

        try {
            const current = JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
            const list = Array.isArray(current) ? current : [];
            list.push(entry);
            localStorage.setItem(LIST_KEY, JSON.stringify(list));
        } catch {
            showError("No hemos podido guardar el aviso en este navegador.");
            return;
        }

        form.reset();
        form.hidden = true;
        thanks.hidden = false;
    });

    function showError(message) {
        formError.hidden = false;
        formError.textContent = message;
    }
});
