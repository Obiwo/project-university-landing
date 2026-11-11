// Carrusel del bloque multifunción. Lee las tarjetas del panel y las noticias
// marcadas como destacadas. Si una tarjeta no trae imagen, usa el póster genérico.
// Si no hay ninguna visible, se queda la imagen de matrícula.
;(function () {
    var poster = document.getElementById("multi-poster");
    if (!poster || !window.firebase) return;

    var KIND = { noticia: "Noticia", evento: "Evento", grupo: "Grupo", campana: "Campaña" };
    var DEFAULT_IMAGE = "assets/destacado-default.svg";

    firebase.initializeApp({
        apiKey: "AIzaSyDdM2Y3FrkKxkXppk7SmUAWWmOV5aay8fo",
        authDomain: "project-university-fire.firebaseapp.com",
        projectId: "project-university-fire",
        storageBucket: "project-university-fire.firebasestorage.app",
        messagingSenderId: "1084197803636",
        appId: "1:1084197803636:web:10dfc754c924af1a8be321",
    });

    var db = firebase.firestore();

    var isHttps = function (value) {
        return /^https:\/\/\S+$/i.test(value || "");
    };

    var millis = function (value) {
        if (typeof value === "number" && value > 0) return value;
        if (value && typeof value.toMillis === "function") return value.toMillis();
        return null;
    };

    var isVisible = function (item, now) {
        if (item.startsAt && item.startsAt > now) return false;
        if (item.endsAt && item.endsAt < now) return false;
        return true;
    };

    var slideFromCard = function (card, news) {
        var data = news || {};
        var image = isHttps(card.imageUrl) ? card.imageUrl : isHttps(data.photo) ? data.photo : "";
        var href = isHttps(card.url) ? card.url : isHttps(data.sourceUrl) ? data.sourceUrl : "";
        return {
            id: card.id,
            kind: card.kind,
            title: (data.title || card.title || KIND[card.kind] || "Destacado").trim(),
            kicker: card.kicker || KIND[card.kind] || "",
            image: image,
            href: href,
        };
    };

    var loadNews = function (id) {
        return db
            .collection("news")
            .doc(id)
            .get()
            .then(function (snap) {
                if (!snap.exists) return null;
                var data = snap.data() || {};
                var publishedAt = millis(data.publishedAt);
                if (data.status !== "publicada" || (publishedAt && publishedAt > Date.now())) return null;
                return data;
            })
            .catch(function () {
                return null;
            });
    };

    var loadManual = function () {
        return db
            .collection("multisection_cards")
            .get()
            .then(function (snapshot) {
                var now = Date.now();
                var cards = snapshot.docs
                    .map(function (doc) {
                        var data = doc.data() || {};
                        return {
                            id: doc.id,
                            kind: data.kind || "campana",
                            refId: data.refId || "",
                            title: data.title || "",
                            kicker: data.kicker || "",
                            url: data.url || "",
                            imageUrl: data.imageUrl || "",
                            startsAt: millis(data.startsAt),
                            endsAt: millis(data.endsAt),
                            order: typeof data.order === "number" ? data.order : 0,
                        };
                    })
                    .filter(function (card) {
                        return isVisible(card, now);
                    })
                    .sort(function (a, b) {
                        return a.order - b.order;
                    });

                var newsIds = cards
                    .filter(function (card) {
                        return (card.kind === "noticia" || card.kind === "evento") && card.refId;
                    })
                    .map(function (card) {
                        return card.refId;
                    });

                return Promise.all(
                    cards.map(function (card) {
                        if ((card.kind !== "noticia" && card.kind !== "evento") || !card.refId) {
                            return slideFromCard(card, null);
                        }
                        return loadNews(card.refId).then(function (news) {
                            if (!news) return null;
                            return slideFromCard(card, news);
                        });
                    })
                ).then(function (slides) {
                    return { slides: slides.filter(Boolean), newsIds: newsIds };
                });
            });
    };

    var loadAutomatic = function (takenIds) {
        var now = firebase.firestore.Timestamp.now();
        return db
            .collection("news")
            .where("status", "==", "publicada")
            .where("publishedAt", "<=", now)
            .get()
            .then(function (snapshot) {
                return snapshot.docs
                    .map(function (doc) {
                        return { id: doc.id, data: doc.data() || {} };
                    })
                    .filter(function (item) {
                        return item.data.flags && item.data.flags.destacada === true && takenIds.indexOf(item.id) === -1;
                    })
                    .sort(function (a, b) {
                        return millis(b.data.publishedAt) - millis(a.data.publishedAt);
                    })
                    .map(function (item) {
                        var kind = item.data.flags.evento ? "evento" : "noticia";
                        return slideFromCard(
                            {
                                id: "news_" + item.id,
                                kind: kind,
                                title: item.data.title || "",
                                kicker: kind === "evento" ? "Evento" : "Noticia",
                                url: "",
                                imageUrl: "",
                            },
                            item.data
                        );
                    });
            })
            .catch(function () {
                return [];
            });
    };

    var render = function (slides) {
        if (!slides.length) return;

        poster.classList.add("has-slides");
        poster.setAttribute("aria-roledescription", "carrusel");
        poster.setAttribute("aria-label", "Destacados");
        var fallback = poster.querySelector(".multi-fallback");
        if (fallback) fallback.setAttribute("aria-hidden", "true");

        var nodes = slides.map(function (slide, index) {
            var el = document.createElement(slide.href ? "a" : "div");
            el.className = "multi-slide" + (index === 0 ? " is-active" : "");
            if (slide.href) {
                el.href = slide.href;
                el.target = "_blank";
                el.rel = "noopener noreferrer";
            }
            el.setAttribute("aria-hidden", index === 0 ? "false" : "true");
            var img = document.createElement("img");
            img.src = slide.image || DEFAULT_IMAGE;
            img.alt = "";
            if (!slide.image) el.classList.add("is-default");
            el.appendChild(img);
            var copy = document.createElement("span");
            copy.className = "multi-slide-copy";
            copy.innerHTML =
                '<span class="multi-kicker"></span><span class="multi-title"></span>';
            copy.querySelector(".multi-kicker").textContent = slide.kicker;
            copy.querySelector(".multi-title").textContent = slide.title;
            el.appendChild(copy);
            poster.appendChild(el);
            return el;
        });

        if (nodes.length < 2) return;

        var dots = document.createElement("div");
        dots.className = "multi-dots";
        var current = 0;
        var timer = null;
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        var show = function (index) {
            current = (index + nodes.length) % nodes.length;
            nodes.forEach(function (node, i) {
                var on = i === current;
                node.classList.toggle("is-active", on);
                node.setAttribute("aria-hidden", on ? "false" : "true");
            });
            Array.prototype.forEach.call(dots.children, function (dot, i) {
                if (i === current) dot.setAttribute("aria-current", "true");
                else dot.removeAttribute("aria-current");
            });
        };

        slides.forEach(function (slide, index) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", "Ver " + slide.title);
            if (index === 0) dot.setAttribute("aria-current", "true");
            dot.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                show(index);
            });
            dots.appendChild(dot);
        });
        poster.appendChild(dots);

        var play = function () {
            if (reduce) return;
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        };
        var stop = function () {
            if (timer) window.clearInterval(timer);
            timer = null;
        };

        poster.addEventListener("mouseenter", stop);
        poster.addEventListener("mouseleave", play);
        poster.addEventListener("focusin", stop);
        poster.addEventListener("focusout", function (event) {
            if (!poster.contains(event.relatedTarget)) play();
        });
        play();
    };

    loadManual()
        .then(function (manual) {
            return loadAutomatic(manual.newsIds).then(function (automatic) {
                return manual.slides.concat(automatic);
            });
        })
        .then(render)
        .catch(function () {});
})();
