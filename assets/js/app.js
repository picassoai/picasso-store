/* Picasso Intelligence — storefront behaviour.
   Header/footer are injected from here so there is one copy of each.
   Each page declares its role with <body data-page="..."> and the
   matching initialiser runs on load. */

(function () {
  "use strict";

  var S = window.SITE, COLS = window.COLLECTIONS, PRODUCTS = window.PRODUCTS;
  var CART_KEY = "picassoai.cart.v1";

  /* ---------- small helpers ------------------------------------------ */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(cents) {
    return "$" + Number(cents).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  /* Generated static pages (tools/build-static.py) carry their route in
     window.ROUTE instead of a query string, so a crawler gets a real title and
     body in the source. A query string still wins when one is present. */
  function param(name) {
    var q = new URLSearchParams(location.search).get(name);
    if (q) return q;
    return (window.ROUTE && window.ROUTE[name]) || "";
  }
  /* Two pages send through Formspree now, so the POST lives in one place.
     Takes a FormData so callers can pass a real form or build one by hand. */
  function postForm(body) {
    if (!S.formEndpoint) {
      return Promise.reject(new Error("The form is not connected yet."));
    }
    return fetch(S.formEndpoint, {
      method: "POST", body: body, headers: { Accept: "application/json" }
    }).then(function (r) {
      if (r.ok) return true;
      return r.json().catch(function () { return {}; }).then(function (d) {
        throw new Error((d.errors || []).map(function (x) { return x.message; }).join(", ") ||
          "The form service returned " + r.status + ".");
      });
    });
  }

  /* The query-string URL and its generated twin serve the same page, so point
     the query-string one at the twin and let the duplicate collapse into it. */
  function canonical(path) {
    if (window.ROUTE) return;
    var l = document.querySelector('link[rel="canonical"]');
    if (!l) { l = document.createElement("link"); l.rel = "canonical"; document.head.appendChild(l); }
    l.href = location.origin + "/" + path;
  }

  function collection(id) { return COLS.filter(function (c) { return c.id === id; })[0]; }
  function product(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  /* One motor sold with or without its driver board is two ids — the cart and
     the worker need to price them separately — but a listing showing both reads
     as the same product twice. Listings show the cheapest; the product page
     offers the choice. */
  function variants(p) {
    if (!p.variantGroup) return [p];
    return PRODUCTS.filter(function (x) { return x.variantGroup === p.variantGroup; })
                   .slice().sort(function (a, b) { return a.price - b.price; });
  }
  function isLeadVariant(p) { return !p.variantGroup || variants(p)[0].id === p.id; }
  function collapseVariants(list) { return list.filter(isLeadVariant); }

  function inCollection(id) { return collapseVariants(PRODUCTS.filter(function (p) { return p.collection === id; })); }
  function application(id) { return (window.APPLICATIONS || []).filter(function (a) { return a.id === id; })[0]; }
  function inApplication(a) {
    return collapseVariants(a.products.map(product).filter(Boolean));
  }

  /* The four numbers people actually choose a motor on. Everything else is
     detail; these drive the cards, the filters, the sort, and the compare. */
  var CORE = {
    torque: "Rated Torque (N·m)",
    od:     "OD (mm)",
    weight: "Weight (g)",
    ratio:  "Reduction Ratio",
    kv:     "Kv (RPM/V)"
  };

  /* Direct-drive motors have no reduction ratio, which left two GL80 variants
     showing the same three figures at the same price when Kv — the thing that
     actually separates them — was the difference. Fall back to it. */
  function ratioOrKv(p) {
    var r = spec(p, CORE.ratio);
    if (r) return { value: r, label: "Gear ratio", unit: "" };
    var kv = spec(p, CORE.kv);
    if (kv) return { value: kv, label: "Kv", unit: "RPM/V" };
    return { value: "", label: "", unit: "" };
  }
  function spec(p, key) { return (p.specs && p.specs[key]) || ""; }
  /* Gimbal motors sit around 0.08 N·m, which reads as noise next to an
     actuator's 74. Below 1 N·m, switch to mN·m. */
  function torqueText(v) {
    var n = num(v);
    if (n == null) return { value: "", unit: "" };
    return n < 1
      ? { value: String(Math.round(n * 1000)), unit: "mN·m" }
      : { value: String(n), unit: "N·m" };
  }
  /* "9:1" and "1.3" both start with the number we want to sort on. */
  function num(v) { var m = String(v).match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; }
  function coreNum(p, which) { return num(spec(p, CORE[which])); }

  /* Compare selection survives the jump to compare.html but not the tab. */
  var COMPARE_KEY = "picassoai.compare.v1";
  var Compare = {
    read: function () {
      try { return JSON.parse(sessionStorage.getItem(COMPARE_KEY) || "[]"); }
      catch (e) { return []; }
    },
    write: function (ids) {
      try { sessionStorage.setItem(COMPARE_KEY, JSON.stringify(ids.slice(0, 4))); }
      catch (e) {}
    },
    toggle: function (id, on) {
      var ids = Compare.read().filter(function (x) { return x !== id; });
      if (on) ids.push(id);
      Compare.write(ids);
      return Compare.read();
    }
  };
  /* A product with no published price is quote-only: it never enters the cart. */
  function quoteOnly(p) { return p.price == null; }
  function quoteHref(p) { return "contact.html?model=" + encodeURIComponent(p.name); }

  var ICON = {
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.6L21 8H7"/><circle cx="10.5" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 9l7 7 7-7"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 3H21v8.5L11 21.5 2.5 13z"/><circle cx="17" cy="7" r="1.4"/></svg>',
    mark: '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#14181d"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="#1d64d8"/><path d="M16 1.4v5.2M16 25.4v5.2M1.4 16h5.2M25.4 16h5.2" stroke="#fff" stroke-width="2"/></svg>',
    /* Drawn rather than the 🇺🇸 emoji: Windows renders regional-indicator
       flags as the plain letters "US", so the emoji shows no flag at all. */
    flag: '<svg class="flag-svg" viewBox="0 0 38 20" aria-hidden="true">' +
      '<rect width="38" height="20" fill="#fff"/><g fill="#b22234">' +
      '<rect width="38" height="1.54"/><rect y="3.08" width="38" height="1.54"/>' +
      '<rect y="6.15" width="38" height="1.54"/><rect y="9.23" width="38" height="1.54"/>' +
      '<rect y="12.31" width="38" height="1.54"/><rect y="15.38" width="38" height="1.54"/>' +
      '<rect y="18.46" width="38" height="1.54"/></g>' +
      '<rect width="15.2" height="10.77" fill="#3c3b6e"/><g fill="#fff">' +
      '<circle cx="2.2" cy="1.7" r=".62"/><circle cx="5.2" cy="1.7" r=".62"/>' +
      '<circle cx="8.2" cy="1.7" r=".62"/><circle cx="11.2" cy="1.7" r=".62"/>' +
      '<circle cx="13.8" cy="1.7" r=".62"/><circle cx="3.7" cy="3.6" r=".62"/>' +
      '<circle cx="6.7" cy="3.6" r=".62"/><circle cx="9.7" cy="3.6" r=".62"/>' +
      '<circle cx="12.5" cy="3.6" r=".62"/><circle cx="2.2" cy="5.4" r=".62"/>' +
      '<circle cx="5.2" cy="5.4" r=".62"/><circle cx="8.2" cy="5.4" r=".62"/>' +
      '<circle cx="11.2" cy="5.4" r=".62"/><circle cx="13.8" cy="5.4" r=".62"/>' +
      '<circle cx="3.7" cy="7.2" r=".62"/><circle cx="6.7" cy="7.2" r=".62"/>' +
      '<circle cx="9.7" cy="7.2" r=".62"/><circle cx="12.5" cy="7.2" r=".62"/>' +
      '<circle cx="2.2" cy="9.1" r=".62"/><circle cx="5.2" cy="9.1" r=".62"/>' +
      '<circle cx="8.2" cy="9.1" r=".62"/><circle cx="11.2" cy="9.1" r=".62"/>' +
      '<circle cx="13.8" cy="9.1" r=".62"/></g></svg>'
  };

  /* ---------- cart ---------------------------------------------------- */

  var Cart = {
    read: function () {
      try {
        var raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        if (!Array.isArray(raw)) return [];
        // drop anything no longer in the catalogue, and anything quote-only
        // (no price) that should never have reached the cart
        return raw.filter(function (l) {
            return l && product(l.id) && product(l.id).price != null && l.qty > 0;
          })
          .map(function (l) { return { id: l.id, qty: Math.min(999, Math.max(1, Math.floor(l.qty))) }; });
      } catch (e) { return []; }
    },
    write: function (lines) {
      try { localStorage.setItem(CART_KEY, JSON.stringify(lines)); } catch (e) {}
      document.dispatchEvent(new CustomEvent("cart:change"));
    },
    add: function (id, qty) {
      var lines = Cart.read(), hit = lines.filter(function (l) { return l.id === id; })[0];
      if (hit) hit.qty = Math.min(999, hit.qty + (qty || 1));
      else lines.push({ id: id, qty: qty || 1 });
      Cart.write(lines);
    },
    setQty: function (id, qty) {
      var lines = Cart.read();
      if (qty <= 0) lines = lines.filter(function (l) { return l.id !== id; });
      else lines.forEach(function (l) { if (l.id === id) l.qty = Math.min(999, qty); });
      Cart.write(lines);
    },
    remove: function (id) { Cart.setQty(id, 0); },
    clear: function () { Cart.write([]); },
    count: function () { return Cart.read().reduce(function (n, l) { return n + l.qty; }, 0); },
    subtotal: function () {
      return Cart.read().reduce(function (n, l) { return n + product(l.id).price * l.qty; }, 0);
    }
  };

  /* ---------- toast ---------------------------------------------------- */

  var toastTimer;
  function toast(msg, link) {
    var node = $(".toast") || document.body.appendChild(el('<div class="toast" role="status" aria-live="polite"></div>'));
    node.innerHTML = esc(msg) + (link ? ' <a href="' + esc(link.href) + '">' + esc(link.label) + "</a>" : "");
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.classList.remove("show"); }, 3400);
  }

  /* ---------- header / footer ------------------------------------------ */

  function collectionHref(c) { return "collection.html?c=" + encodeURIComponent(c.id); }
  function applicationHref(a) { return "collection.html?a=" + encodeURIComponent(a.id); }

  function renderHeader() {
    var mount = $("#site-header");
    if (!mount) return;
    var here = param("c"), hereApp = param("a");
    var apps = window.APPLICATIONS || [];

    /* Two dropdowns, one per axis: the series you already know, or the machine
       you are building. Both land on the same catalogue page. */
    var seriesMenu = COLS.map(function (c) {
      return '<li><a href="' + collectionHref(c) + '">' + esc(c.name) +
        '<span class="sub-note">' + esc(c.tease) + "</span></a></li>";
    }).join("");

    var appMenu = apps.map(function (a) {
      return '<li><a href="' + applicationHref(a) + '">' + esc(a.name) + "</a></li>";
    }).join("");

    var seriesActive = COLS.some(function (c) { return c.id === here; });
    var appActive = apps.some(function (a) { return a.id === hereApp; });

    mount.outerHTML =
      '<div class="announce">' + S.announce.map(esc).join('<span>|</span>') + '</div>' +
      '<header class="site-header">' +
        '<div class="header-bar">' +
          '<button class="icon-btn burger" type="button" data-open-drawer aria-label="Open menu">' + ICON.burger + '</button>' +
          '<a class="brand" href="index.html" aria-label="' + esc(S.brand) + '">' +
            '<img class="brand-logo" src="assets/img/logo.svg" width="436" height="100" alt="' +
              esc(S.brand) + '">' +
            "</a>" +
          '<ul class="nav">' +
            '<li><a class="nav-link" href="collection.html?c=integrated"' + (seriesActive ? ' aria-current="page"' : "") +
              '>Product series' + ICON.chev + '</a><ul class="submenu">' + seriesMenu + '</ul></li>' +
            '<li><a class="nav-link" href="' + (apps[0] ? applicationHref(apps[0]) : "#") + '"' +
              (appActive ? ' aria-current="page"' : "") +
              '>Applications' + ICON.chev + '</a><ul class="submenu">' + appMenu + '</ul></li>' +
            '<li><a class="nav-link nav-tool" href="select.html"' +
              (document.body.getAttribute("data-page") === "select" ? ' aria-current="page"' : "") +
              ">Find by spec</a></li>" +
          '</ul>' +
          '<div class="header-tools">' +
            '<button class="icon-btn" type="button" data-toggle-search aria-label="Search products">' + ICON.search + '</button>' +
            '<a class="icon-btn" href="cart.html" aria-label="Cart">' + ICON.cart +
              '<span class="cart-count" data-cart-count data-empty="true">0</span></a>' +
          '</div>' +
        '</div>' +
        '<div class="header-search" id="header-search">' +
          '<form action="search.html" method="get" role="search">' +
            '<label class="sr" for="q-head">Search products</label>' +
            '<input class="field" id="q-head" name="q" type="search" placeholder="Search by model, torque, or category…" autocomplete="off">' +
            '<button class="btn" type="submit">Search</button>' +
          '</form>' +
        '</div>' +
      '</header>' +
      drawerMarkup();

    wireHeader();
    paintCartCount();
  }

  function drawerMarkup() {
    return '<div class="drawer" id="drawer">' +
      '<div class="drawer-scrim" data-close-drawer></div>' +
      '<nav class="drawer-panel" aria-label="Menu">' +
        '<button class="icon-btn close" type="button" data-close-drawer aria-label="Close menu">' + ICON.close + '</button>' +
        '<div class="drawer-group">Product series</div>' +
        COLS.map(function (c) { return '<a class="sub" href="' + collectionHref(c) + '">' + esc(c.name) + '</a>'; }).join("") +
        '<div class="drawer-group">Applications</div>' +
        (window.APPLICATIONS || []).map(function (a) {
          return '<a class="sub" href="' + applicationHref(a) + '">' + esc(a.name) + '</a>';
        }).join("") +
        '<div class="drawer-group">Store</div>' +
        '<a href="select.html">Find by spec</a>' +
        '<a href="search.html">Search</a><a href="cart.html">Cart</a>' +
        '<a href="contact.html">Contact us</a>' +
      '</nav></div>';
  }

  function wireHeader() {
    $$("[data-open-drawer]").forEach(function (b) {
      b.addEventListener("click", function () { $("#drawer").classList.add("open"); document.body.style.overflow = "hidden"; });
    });
    $$("[data-close-drawer]").forEach(function (b) {
      b.addEventListener("click", function () { $("#drawer").classList.remove("open"); document.body.style.overflow = ""; });
    });
    var sb = $("[data-toggle-search]");
    if (sb) sb.addEventListener("click", function () {
      var box = $("#header-search");
      box.classList.toggle("open");
      if (box.classList.contains("open")) $("#q-head").focus();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var d = $("#drawer");
      if (d && d.classList.contains("open")) { d.classList.remove("open"); document.body.style.overflow = ""; }
      var box = $("#header-search");
      if (box) box.classList.remove("open");
    });
  }

  function renderFooter() {
    var mount = $("#site-footer");
    if (!mount) return;
    var shopLinks = COLS.map(function (c) {
      return '<li><a href="' + collectionHref(c) + '">' + esc(c.name) + '</a></li>';
    }).join("");

    mount.outerHTML =
      '<footer class="site-footer">' +
        '<div class="wrap footer-grid">' +
          '<div class="footer-about">' +
            '<a class="brand" href="index.html" aria-label="' + esc(S.brand) + '">' +
              '<img class="brand-logo" src="assets/img/logo.svg" width="436" height="100" alt="' +
                esc(S.brand) + '">' +
              "</a>" +
            '<p>Robotic actuators, sized and supported in the US.</p>' +
          '</div>' +
          '<div><h4>Shop</h4><ul>' + shopLinks + '</ul></div>' +
          '<div><h4>Help</h4><ul>' +
            '<li><a href="contact.html">Contact us</a></li>' +
            '<li><a href="index.html#faq">FAQ</a></li>' +
            '<li><a href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a></li>' +
          '</ul></div>' +
          '<div class="news"><h4>Get updates</h4>' +
            '<p>New models, price breaks, and catalogue updates. Roughly monthly.</p>' +
            '<form data-newsletter novalidate>' +
              '<label class="sr" for="news-email">Email</label>' +
              '<input class="field" id="news-email" name="email" type="email" placeholder="you@company.com" required>' +
              '<button class="btn" type="submit">Subscribe</button>' +
            '</form>' +
            '<p class="note" data-newsletter-note>No spam, and we do not share your address.</p>' +
          '</div>' +
        '</div>' +
        '<div class="wrap footer-legal">' +
          '<span>&copy; ' + S.year + " " + esc(S.brand) + '</span>' +
          '<nav>' +
            '<a href="contact.html">Contact information</a>' +
            '<a href="' + esc(S.linkedin) + '">LinkedIn</a>' +
          '</nav>' +
        '</div>' +
      '</footer>';

    /* Signups go through the same Formspree endpoint as everything else, tagged
       so they are filterable in the inbox rather than mixed in with enquiries. */
    var form = $("[data-newsletter]");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("#news-email");
      var note = $("[data-newsletter-note]");
      if (!input.value || input.value.indexOf("@") < 0) { toast("Enter a valid email address."); return; }

      var btn = $('button[type="submit"]', form);
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "…"; }

      var fd = new FormData();
      fd.append("_subject", "Newsletter signup — " + input.value);
      fd.append("email", input.value);
      fd.append("form", "newsletter");

      postForm(fd).then(function () {
        note.textContent = "Thanks — you are on the list.";
        input.value = "";
        toast("You are subscribed.");
      }).catch(function (err) {
        /* Say it failed rather than let them think they subscribed. */
        note.textContent = "That did not go through. Email " + S.email + " and we will add you.";
        toast("Signup failed.");
      }).then(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      });
    });
  }

  /* Freight is a flat fee per order, waived above a threshold — the same rule
     the worker applies, stated here so the total is not a surprise at Stripe. */
  function shippingLabel(subtotalDollars) {
    var sh = S.shipping;
    if (!sh) return "Quoted per order";
    if (subtotalDollars >= sh.freeOver) return "Included";
    return money(sh.flat) + " — free over " + money(sh.freeOver);
  }

  /* Sends ids and quantities only. The worker prices them and hands back a
     Stripe URL; nothing here can influence what is charged. */
  function wirePayNow(root) {
    var btn = $("[data-pay-now]", root || document);
    if (!btn) return;
    var note = $("[data-pay-note]", root || document);
    btn.addEventListener("click", function () {
      var lines = Cart.read();
      if (!lines.length) return;
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Opening checkout…";

      fetch(S.checkoutEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: lines })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok || !d.url) throw new Error(d.error || "Checkout could not be started.");
          window.location.href = d.url;
        });
      }).catch(function (err) {
        btn.disabled = false;
        btn.textContent = label;
        if (note) {
          note.innerHTML = "<strong>" + esc(err.message) + "</strong> " +
            'You can still <a href="checkout.html">send us the order</a> and we will ' +
            "reply with a payment link or an invoice.";
        }
      });
    });
  }

  function paintCartCount() {
    var n = Cart.count();
    $$("[data-cart-count]").forEach(function (node) {
      node.textContent = n;
      node.setAttribute("data-empty", n === 0 ? "true" : "false");
    });
  }

  /* ---------- product card ------------------------------------------- */

  function productHref(p) { return "product.html?id=" + encodeURIComponent(p.id); }

  /* Real product photography from the manufacturer, at most three per model,
     in two cuts of the same shots:
       products/          CubeMars overlay logo painted out — used in listings,
                          where a wall of repeated manufacturer logos is noise
       products-branded/  untouched — used on the product page, where showing
                          it is a genuine CubeMars part is the point
     ART.render stays as the fallback for anything with no photo. */
  var IMG_DIR = "assets/img/products/";
  var IMG_DIR_BRANDED = "assets/img/products-branded/";
  function photos(p) { return (p && p.images) || []; }
  function photo(p, i, alt, lazy, branded) {
    var src = photos(p)[i || 0];
    if (!src) return window.ART.render(p.art, p.size, { alt: alt || p.name });
    return '<img src="' + (branded ? IMG_DIR_BRANDED : IMG_DIR) + esc(src) +
      '" alt="' + esc(alt || p.name) + '"' +
      (lazy === false ? "" : ' loading="lazy" decoding="async"') + ">";
  }
  /* One representative photo per group. Applications overlap heavily — the
     exoskeleton and quadruped lists start with the same actuator — so prefer a
     member no earlier group has already shown. */
  function groupPhotoPicker() {
    var used = {};
    return function (items, alt) {
      var withPhoto = items.filter(function (x) { return photos(x).length; });
      var p = withPhoto.filter(function (x) { return !used[x.id]; })[0] || withPhoto[0];
      if (!p) return "";
      used[p.id] = true;
      return photo(p, 0, alt);
    };
  }

  /* Rated torque leads, then the other three on one line. A buyer comparing
     twenty models should never have to open twenty pages to see these. */
  function cardSpecs(p) {
    var t = torqueText(spec(p, CORE.torque));
    var rest = [
      spec(p, CORE.od) && "Ф" + spec(p, CORE.od) + " mm",
      spec(p, CORE.weight) && spec(p, CORE.weight) + " g",
      (function () { var r = ratioOrKv(p); return r.value && (r.value + (r.unit ? " " + r.unit : "")); })()
    ].filter(Boolean);
    if (!t.value && !rest.length) return '<p class="spec-pending">Specifications on request</p>';
    return '<div class="card-specs">' +
      (t.value
        ? '<div class="card-torque">' + esc(t.value) +
          "<span>" + esc(t.unit) + " rated</span></div>"
        : "") +
      (rest.length ? '<div class="card-dims">' + esc(rest.join(" · ")) + "</div>" : "") +
      "</div>";
  }

  function card(p, opts) {
    var q = quoteOnly(p);
    var comparable = opts && opts.compare && !!p.specs && Object.keys(p.specs).length > 0;
    var checked = comparable && Compare.read().indexOf(p.id) >= 0;
    return '<article class="card">' +
      '<div class="card-media">' +
        /* The flag belongs to the support, not to the goods — the motors are
           made in China, so anything implying US origin or US stock is off. */
        '<span class="badge-us">' + ICON.flag + "<span>US-based<br>support</span></span>" +
        /* No "Available" label — stock is not guaranteed, so claiming it on
           every card would be a promise we cannot keep. The quote-only badge
           stays, because that is about pricing, not availability. */
        (q ? '<span class="badge quote">Quote</span>' : "") +
        '<a href="' + productHref(p) + '" tabindex="-1" aria-hidden="true">' +
          photo(p, 0) + '</a></div>' +
      '<div class="card-body">' +
        '<div class="card-series">' + esc(p.series) + "</div>" +
        '<h3 class="card-title"><a href="' + productHref(p) + '">' + esc(p.name) + '</a></h3>' +
        cardSpecs(p) +
        '<div class="card-price' + (q ? " is-quote" : "") + '">' +
          (q ? "Request a quote"
             : (variants(p).length > 1 ? "From " + money(p.price) : money(p.price))) + "</div>" +
        (q
          ? '<a class="btn btn-ghost" href="' + quoteHref(p) + '">Request a quote</a>'
          : '<button class="btn btn-ghost" type="button" data-add="' + esc(p.id) + '">Add to cart</button>') +
        (comparable
          ? '<label class="compare-check"><input type="checkbox" data-cmp="' + esc(p.id) + '"' +
            (checked ? " checked" : "") + ">Compare</label>"
          : "") +
      '</div></article>';
  }

  function wireAddButtons(root) {
    $$("[data-add]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var p = product(b.getAttribute("data-add"));
        if (!p) return;
        Cart.add(p.id, 1);
        toast(p.name + " added.", { href: "cart.html", label: "View cart" });
      });
    });
  }

  /* ---------- carousel rail ------------------------------------------- */

  function rail(items) {
    var wrap = el('<div class="rail-wrap">' +
      '<button class="rail-btn prev" type="button" aria-label="Scroll left">' + ICON.left + '</button>' +
      '<div class="rail">' + items.map(card).join("") + '</div>' +
      '<button class="rail-btn next" type="button" aria-label="Scroll right">' + ICON.right + '</button>' +
      '</div>');
    var track = $(".rail", wrap), prev = $(".prev", wrap), next = $(".next", wrap);
    function step() { return Math.max(240, track.clientWidth * 0.8); }
    prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    function sync() {
      prev.hidden = track.scrollLeft < 8;
      next.hidden = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    }
    track.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    setTimeout(sync, 0);
    return wrap;
  }

  /* ---------- page: home --------------------------------------------- */

  function pageHome() {
    /* Two ways in, stacked rather than side by side, and given different card
       shapes so the axes never read as one list shown twice: series cards carry
       a description and a model count, application cards are picture-led. */
    var pickCat = groupPhotoPicker();
    var cg = $("[data-cat-grid]");
    if (cg) cg.innerHTML = COLS.map(function (c) {
      var items = inCollection(c.id);
      var n = items.length;
      return '<a class="cat-card" href="' + collectionHref(c) + '">' +
        '<span class="badge-us compact">' + ICON.flag + "<span>US-based support</span></span>" +
        '<div class="thumb">' + pickCat(items, c.name) + "</div>" +
        "<h3>" + esc(c.name) + "</h3><p>" + esc(c.blurb) + "</p>" +
        '<span class="more">' + n + " model" + (n === 1 ? "" : "s") + " &rarr;</span></a>";
    }).join("");

    var pickApp = groupPhotoPicker();
    var ag = $("[data-app-grid]");
    if (ag) ag.innerHTML = (window.APPLICATIONS || []).map(function (a) {
      return '<a class="app-card" href="' + applicationHref(a) + '">' +
        '<span class="badge-us compact">' + ICON.flag + "<span>US-based support</span></span>" +
        '<span class="thumb">' + pickApp(inApplication(a), a.name) + "</span>" +
        "<h4>" + esc(a.name) + "</h4>" +
        "<p>" + esc(a.blurb) + "</p></a>";
    }).join("");

    $$("[data-rail]").forEach(function (mount) {
      var id = mount.getAttribute("data-rail");
      var c = collection(id);
      var head = el('<div class="section-head"><div><div class="eyebrow">' + esc(c.tease) + '</div>' +
        "<h2>" + esc(c.name) + '</h2><p>' + esc(c.blurb) + '</p></div>' +
        '<a href="' + collectionHref(c) + '">All ' + inCollection(id).length + " models &rarr;</a></div>");
      mount.appendChild(head);
      mount.appendChild(rail(inCollection(id)));
    });

    $("[data-faq]").innerHTML = window.FAQ.map(function (f, i) {
      return "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(f.q) + "</summary>" +
        '<div class="answer">' + esc(f.a) + "</div></details>";
    }).join("");

    /* Lead with the flagship rather than a drawing. Not lazy — it is the
       first thing on the page. */
    var star = product("ak80-9-v3-0-kv100") || PRODUCTS[0];
    $("[data-hero-art]").innerHTML = photo(star, 0, star.name, false);
    $$("[data-sku-count]").forEach(function (n) { n.textContent = PRODUCTS.length; });

    wireAddButtons(document);
  }

  /* ---------- page: collection ---------------------------------------- */

  /* Price bands were the wrong axis: nobody picks an actuator by price bracket.
     These are the four numbers people actually filter on.

     Torque needs two scales. Gimbal motors run 0.08–3 N·m and integrated
     actuators 1.3–74, so one fixed set of bands would drop every gimbal into
     "Under 5" and filter nothing. Thresholds stay in N·m; only the labels
     change. */
  var TORQUE_SCALES = {
    nm: { unit: "N·m", bands: [
      { key: "t1", label: "Under 5", lo: 0,  hi: 5 },
      { key: "t2", label: "5 – 20",  lo: 5,  hi: 20 },
      { key: "t3", label: "20 – 50", lo: 20, hi: 50 },
      { key: "t4", label: "Over 50", lo: 50, hi: Infinity }
    ] },
    mnm: { unit: "mN·m", bands: [
      { key: "t1", label: "Under 100",   lo: 0,   hi: 0.1 },
      { key: "t2", label: "100 – 300",   lo: 0.1, hi: 0.3 },
      { key: "t3", label: "300 – 1000",  lo: 0.3, hi: 1 },
      { key: "t4", label: "Over 1000",   lo: 1,   hi: Infinity }
    ] }
  };
  function torqueScale(values) {
    var max = values.length ? Math.max.apply(null, values) : 0;
    return max > 0 && max <= 5 ? TORQUE_SCALES.mnm : TORQUE_SCALES.nm;
  }

  var WEIGHT_BANDS = [
    { key: "w1", label: "Under 300 g", lo: 0,   hi: 300 },
    { key: "w2", label: "300 – 800 g", lo: 300, hi: 800 },
    { key: "w3", label: "Over 800 g",  lo: 800, hi: Infinity }
  ];

  /* Ratios span 6:1 to 64:1. Nine individual chips is a wall of numbers, and
     the choice people actually make is "backdrivable or not", so band them. */
  var RATIO_BANDS = [
    { key: "g1", label: "Under 10:1",  lo: 0,  hi: 10 },
    { key: "g2", label: "10:1 – 20:1", lo: 10, hi: 20 },
    { key: "g3", label: "20:1 – 50:1", lo: 20, hi: 50 },
    { key: "g4", label: "Over 50:1",   lo: 50, hi: Infinity }
  ];

  /* Diameters run 25 to 115 across 31 distinct values. The exact chips stay —
     people do shop for a specific Ф — but most of the time the question is
     "will it fit this bore", so offer coarse ranges alongside them. */
  var OD_BANDS = [
    { key: "d1", label: "Under 40",  lo: 0,   hi: 40 },
    { key: "d2", label: "40 – 60",   lo: 40,  hi: 60 },
    { key: "d3", label: "60 – 80",   lo: 60,  hi: 80 },
    { key: "d4", label: "80 – 100",  lo: 80,  hi: 100 },
    { key: "d5", label: "Over 100",  lo: 100, hi: Infinity }
  ];

  /* A row whose only option is "All" filters nothing — don't render it. */
  function chipRow(label, name, opts) {
    if (opts.length < 2) return "";
    return '<div class="filter-row"><span class="filter-label">' + esc(label) + "</span>" +
      '<div class="chips">' +
      [{ k: "all", l: "All" }].concat(opts).map(function (o) {
        if (o.sep) return '<span class="chip-sep" aria-hidden="true"></span>';
        return '<button class="chip" type="button" data-f="' + name + '" data-v="' + esc(o.k) +
          '" aria-pressed="' + (o.k === "all") + '">' + esc(o.l) + "</button>";
      }).join("") + "</div></div>";
  }

  /* Only offer the bands and values that actually occur in this set. */
  function filterMarkup(items) {
    var torques = [], ods = [], ratios = [];
    items.forEach(function (p) {
      var t = coreNum(p, "torque"); if (t != null) torques.push(t);
      var o = coreNum(p, "od");     if (o != null && ods.indexOf(o) < 0) ods.push(o);
      var r = num(spec(p, CORE.ratio)); if (r != null) ratios.push(r);
    });
    ods.sort(function (a, b) { return a - b; });
    var scale = torqueScale(torques);

    var html = "";
    if (torques.length) {
      html += chipRow("Rated torque (" + scale.unit + ")", "torque",
        scale.bands.filter(function (b) {
          return torques.some(function (t) { return t >= b.lo && t < b.hi; });
        }).map(function (b) { return { k: b.key, l: b.label }; }));
    }
    if (ods.length) {
      var odRanges = OD_BANDS.filter(function (b) {
        return ods.some(function (o) { return o >= b.lo && o < b.hi; });
      }).map(function (b) { return { k: b.key, l: b.label }; });
      /* One range covering everything is the same as "All" — skip the row. */
      var odOpts = odRanges.length > 1
        ? odRanges.concat([{ sep: true }]).concat(
            ods.map(function (o) { return { k: String(o), l: "Ф" + o }; }))
        : ods.map(function (o) { return { k: String(o), l: "Ф" + o }; });
      html += chipRow("Outer dia. (mm)", "od", odOpts);
    }
    /* Gear ratio only exists on geared families — an empty filter on the
       direct-drive sets would just be noise. */
    if (ratios.length) {
      html += chipRow("Gear ratio", "ratio", RATIO_BANDS.filter(function (b) {
        return ratios.some(function (r) { return r >= b.lo && r < b.hi; });
      }).map(function (b) { return { k: b.key, l: b.label }; }));
    }
    html += chipRow("Weight", "weight", WEIGHT_BANDS.filter(function (b) {
      return items.some(function (p) {
        var w = coreNum(p, "weight");
        return w != null && w >= b.lo && w < b.hi;
      });
    }).map(function (b) { return { k: b.key, l: b.label }; }));
    return { html: html, ods: ods, scale: scale };
  }

  function inBand(bands, key, v) {
    if (key === "all") return true;
    if (v == null) return false;
    var b = bands.filter(function (x) { return x.key === key; })[0];
    return b && v >= b.lo && v < b.hi;
  }

  /* picked.od is either "all", a band key ("d3"), or an exact value ("46.1"). */
  function odMatches(picked, v) {
    if (picked === "all") return true;
    if (v == null) return false;
    if (/^d[0-9]+$/.test(picked)) return inBand(OD_BANDS, picked, v);
    return String(v) === picked;
  }

  function matchesFilters(p, picked, scale) {
    var bands = (scale || TORQUE_SCALES.nm).bands;
    return inBand(bands, picked.torque, coreNum(p, "torque")) &&
           inBand(WEIGHT_BANDS, picked.weight, coreNum(p, "weight")) &&
           inBand(RATIO_BANDS, picked.ratio, num(spec(p, CORE.ratio))) &&
           odMatches(picked.od, coreNum(p, "od"));
  }

  function wireFilters(mount, picked, redraw) {
    if (!mount) return;
    $$("[data-f]", mount).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-f");
        picked[name] = btn.getAttribute("data-v");
        $$('[data-f="' + name + '"]', mount).forEach(function (o) {
          o.setAttribute("aria-pressed", o.getAttribute("data-v") === picked[name]);
        });
        redraw();
      });
    });
  }

  /* Real links, not buttons: the whole point of splitting humanoid work by
     joint is that "knee joint actuator" is something people search for, and a
     JS-only control is not a destination a crawler can reach. */
  function renderJointNav(app, active) {
    var mount = $("[data-joints]");
    if (!mount) return;
    if (!app || !app.joints || !app.joints.length) { mount.innerHTML = ""; return; }

    var base = applicationHref(app);
    var groups = [];
    app.joints.forEach(function (j) {
      var g = groups.filter(function (x) { return x.name === j.group; })[0];
      if (!g) { g = { name: j.group, joints: [] }; groups.push(g); }
      g.joints.push(j);
    });

    mount.innerHTML = '<nav class="joint-nav" aria-label="Joint">' +
      '<a class="chip" href="' + base + '"' + (active ? "" : ' aria-current="page"') +
        ">All joints</a>" +
      groups.map(function (g) {
        return '<span class="joint-group">' + esc(g.name) + "</span>" +
          g.joints.map(function (j) {
            var on = active && active.id === j.id;
            return '<a class="chip" href="' + base + "&j=" + encodeURIComponent(j.id) + '"' +
              (on ? ' aria-current="page"' : "") + ">" + esc(j.name) + "</a>";
          }).join("");
      }).join("") + "</nav>";
  }

  function pageCollection() {
    var app = application(param("a"));
    var c = app ? null : (collection(param("c")) || COLS[0]);
    /* A joint narrows the application set. It is a view, not a sub-collection:
       the same actuator legitimately appears under several joints. */
    var joint = app && app.joints
      ? app.joints.filter(function (j) { return j.id === param("j"); })[0]
      : null;
    var items = app
      ? (joint ? joint.products.map(product).filter(Boolean) : inApplication(app))
      : inCollection(c.id);
    var title = joint ? joint.name + " joint actuators" : (app ? app.name : c.name);
    var blurb = joint ? joint.note : (app ? app.blurb : c.long);

    if (!window.ROUTE) document.title = title + " — " + S.brand;
    if (joint) canonical(app.id + "-" + joint.id + "-joint-actuators.html");
    $("[data-col-name]").textContent = title;
    $("[data-col-blurb]").textContent = blurb;
    if (joint) {
      $("[data-crumb]").innerHTML = '<a href="' + applicationHref(app) + '">' + esc(app.name) +
        "</a><span>/</span>" + esc(joint.name);
    } else {
      $("[data-crumb]").textContent = title;
    }
    renderJointNav(app, joint);

    /* Every joint note is scale-dependent, so state the assumed machine size
       once rather than repeating the caveat in all seven. */
    var scale = $("[data-joint-scale]");
    if (scale) {
      scale.textContent = joint && app.jointScale ? app.jointScale : "";
      scale.hidden = !(joint && app.jointScale);
    }

    var torques = items.map(function (p) { return coreNum(p, "torque"); })
                       .filter(function (v) { return v != null; });
    var built = filterMarkup(items);
    var ods = built.ods;

    /* The live count already sits beside this, so give only the span it does
       not cover — repeating "N models" in both was pure duplication. */
    var range = $("[data-col-range]");
    if (range) {
      range.textContent = torques.length
        ? Math.min.apply(null, torques) + " to " + Math.max.apply(null, torques) + " N·m rated torque"
        : "";
    }

    var grid = $("[data-grid]");
    var mount = $("[data-filters]");
    var sort = $("[data-sort]");
    var picked = { torque: "all", od: "all", weight: "all", ratio: "all" };

    if (mount) mount.innerHTML = built.html;

    function keep(p) { return matchesFilters(p, picked, built.scale); }

    /* Products with no value for the sort key go last rather than sorting as 0. */
    function byNum(get, dir) {
      return function (a, b) {
        var x = get(a), y = get(b);
        if (x == null && y == null) return a.name.localeCompare(b.name);
        if (x == null) return 1;
        if (y == null) return -1;
        return dir * (x - y);
      };
    }
    var SORTS = {
      "od-asc":      byNum(function (p) { return coreNum(p, "od"); }, 1),
      "torque-asc":  byNum(function (p) { return coreNum(p, "torque"); }, 1),
      "torque-desc": byNum(function (p) { return coreNum(p, "torque"); }, -1),
      "weight-asc":  byNum(function (p) { return coreNum(p, "weight"); }, 1),
      "price-asc":   byNum(function (p) { return p.price; }, 1),
      "price-desc":  byNum(function (p) { return p.price; }, -1)
    };

    function draw() {
      var view = items.filter(keep);
      var mode = sort ? sort.value : "od-asc";
      if (SORTS[mode]) view = view.slice().sort(SORTS[mode]);

      if (!view.length) {
        grid.innerHTML = '<p class="muted">Nothing matches those filters. ' +
          '<button class="link-btn" type="button" data-reset>Clear filters</button></p>';
      } else if (mode === "od-asc" && ods.length) {
        /* Grouping only makes sense while the list is ordered by diameter;
           any other sort would have the rules cutting across the order. */
        var html = "", last = null;
        view.forEach(function (p) {
          var o = coreNum(p, "od");
          var head = o == null ? "Other" : "Ф" + o + " mm";
          if (head !== last) {
            if (last !== null) html += "</div>";
            html += '<div class="od-group"><b>' + esc(head) + "</b></div><div class=\"product-grid\">";
            last = head;
          }
          html += card(p, { compare: true });
        });
        grid.innerHTML = html + (last !== null ? "</div>" : "");
      } else {
        grid.innerHTML = '<div class="product-grid">' +
          view.map(function (p) { return card(p, { compare: true }); }).join("") + "</div>";
      }

      $("[data-col-count]").textContent = view.length + (view.length === 1 ? " model" : " models");
      wireAddButtons(grid);
      wireCompare(grid);
      var reset = $("[data-reset]", grid);
      if (reset) reset.addEventListener("click", function () {
        /* Mutate in place: wireFilters closed over this exact object. */
        Object.keys(picked).forEach(function (k) { picked[k] = "all"; });
        if (mount) $$("[data-f]", mount).forEach(function (b) {
          b.setAttribute("aria-pressed", b.getAttribute("data-v") === "all");
        });
        draw();
      });
    }

    wireFilters(mount, picked, draw);
    if (sort) sort.addEventListener("change", draw);
    draw();
    paintCompareBar();

    var sib = $("[data-siblings]");
    if (sib) sib.innerHTML = COLS.filter(function (x) { return !c || x.id !== c.id; }).map(function (x) {
      return '<a class="chip" href="' + collectionHref(x) + '">' + esc(x.name) + "</a>";
    }).join("");
  }

  /* ---------- compare selection --------------------------------------- */

  function wireCompare(root) {
    $$("[data-cmp]", root).forEach(function (box) {
      box.addEventListener("change", function () {
        var ids = Compare.toggle(box.getAttribute("data-cmp"), box.checked);
        if (box.checked && ids.indexOf(box.getAttribute("data-cmp")) < 0) {
          box.checked = false;
          toast("Compare up to four models at a time.");
        }
        paintCompareBar();
      });
    });
  }

  function paintCompareBar() {
    var bar = $("[data-compare-bar]");
    if (!bar) return;
    var ids = Compare.read();
    bar.hidden = ids.length < 1;
    var count = $(".count", bar);
    if (count) count.textContent = ids.length + " selected";
    var go = $("[data-compare-go]", bar);
    if (go) go.disabled = ids.length < 2;
  }

  /* ---------- page: product ------------------------------------------- */

  /* The four selection parameters, given the weight they deserve. Anything
     with no value at all is dropped rather than rendered as an em dash. */
  /* Each variant keeps its own page, price and cart line — the switch is a
     link, not state, so a shared or bookmarked URL is unambiguous about which
     one was priced. */
  function variantSwitch(p) {
    var vs = variants(p);
    if (vs.length < 2) return "";
    return '<div class="variant-row">' +
      '<span class="variant-label">' + esc(p.variantAxis || "Options") + "</span>" +
      vs.map(function (v) {
        var on = v.id === p.id;
        return '<a class="chip" href="' + productHref(v) + '"' +
          (on ? ' aria-current="page"' : "") + ">" + esc(v.variantLabel || v.name) +
          ' <span class="variant-price">' + money(v.price) + "</span></a>";
      }).join("") + "</div>";
  }

  function specTiles(p) {
    var t = torqueText(spec(p, CORE.torque));
    var tiles = [
      { v: t.value,              u: t.unit, l: "Rated torque" },
      { v: spec(p, CORE.od),     u: "mm",   l: "Outer diameter" },
      { v: spec(p, CORE.weight), u: "g",    l: "Weight" },
      (function () { var r = ratioOrKv(p); return { v: r.value, u: r.unit, l: r.label }; })()
    ].filter(function (x) { return x.v; });
    if (!tiles.length) return "";
    return '<div class="spec-tiles">' + tiles.map(function (t) {
      return '<div class="spec-tile"><b>' + esc(t.v) +
        (t.u ? " <em>" + esc(t.u) + "</em>" : "") + "</b>" +
        "<span>" + esc(t.l) + "</span></div>";
    }).join("") + "</div>";
  }

  function pageProduct() {
    var p = product(param("id"));
    if (!p) {
      $("[data-pdp]").innerHTML = '<div class="empty-state"><h2>Product not found</h2>' +
        '<p>That model is not in the catalogue.</p><a class="btn" href="index.html">Back to store</a></div>';
      return;
    }
    var c = collection(p.collection);
    if (!window.ROUTE) document.title = p.name + " — " + S.brand;
    canonical(p.id + ".html");

    /* At most three photos per model, so the thumb strip only appears when
       there is actually more than one view to switch between. */
    var views = photos(p);

    $("[data-pdp]").innerHTML =
      '<div class="pdp-media">' +
        /* Outside [data-main] on purpose — switching thumbnails replaces that
           element's contents, which would take the badge with it. */
        '<span class="badge-us">' + ICON.flag + "<span>US-based<br>support</span></span>" +
        '<div class="pdp-main" data-main>' + photo(p, 0, p.name, false, true) + "</div>" +
        (views.length > 1
          ? '<div class="pdp-thumbs" data-thumbs>' +
            views.map(function (_v, i) {
              return '<button type="button" data-view="' + i + '" aria-pressed="' + (i === 0) +
                '" aria-label="View ' + (i + 1) + '">' + photo(p, i, "", true, true) + "</button>";
            }).join("") +
            "</div>"
          : "") +
      "</div>" +
      "<div>" +
        '<div class="crumbs"><a href="index.html">Store</a><span>/</span>' +
          '<a href="' + collectionHref(c) + '">' + esc(c.name) + "</a><span>/</span>" + esc(p.name) + "</div>" +
        '<div class="pdp-brand"><span>' + esc(p.series) + "</span></div>" +
        "<h1>" + esc(p.name) + "</h1>" +
        '<p class="muted">' + esc(p.blurb) + "</p>" +
        (quoteOnly(p)
          ? '<div class="price is-quote">Price on request</div>' +
            '<div class="stock quote"><i></i>Quoted per order — reply within 2 business days</div>' +
            '<div class="buy"><a class="btn btn-accent" href="' + quoteHref(p) + '">Request a quote</a></div>' +
            '<p class="muted" style="font-size:13px">' + esc(p.brand) +
              ' prices this line per order rather than publishing a list price. Send the model and quantity and we will come back with a firm number.</p>'
          : variantSwitch(p) + '<div class="price">' + money(p.price) + "</div>" +
            '<div class="buy">' +
              '<div class="qty">' +
                '<button type="button" data-step="-1" aria-label="Decrease quantity">&minus;</button>' +
                '<input type="number" value="1" min="1" max="999" data-qty aria-label="Quantity">' +
                '<button type="button" data-step="1" aria-label="Increase quantity">+</button>' +
              "</div>" +
              '<button class="btn btn-accent" type="button" data-add-pdp>Add to cart</button>' +
              /* Only models with a Stripe Payment Link can be bought outright.
                 Quantity is chosen on Stripe's page, not by the stepper above,
                 so the note says so rather than letting the two disagree. */
              (p.buyLink
                ? '<a class="btn btn-buy" href="' + esc(p.buyLink) + '">Buy now</a>'
                : "") +
            "</div>" +
            (p.buyLink
              ? '<p class="muted" style="font-size:13px">Buy now opens our secure Stripe checkout, ' +
                  'where you can pay by card or US bank transfer and choose the quantity. ' +
                  'Price includes shipping within the United States. ' +
                  'Volume pricing from 10 units — <a href="' + quoteHref(p) + '">request a quote</a>.</p>'
              : '<p class="muted" style="font-size:13px">Add to cart to send us the order and we will ' +
                  'reply with an invoice you can pay by card or bank transfer. ' +
                  'Volume pricing from 10 units — <a href="' + quoteHref(p) + '">request a quote</a>.</p>')) +
        specTiles(p) +
        (Object.keys(p.specs).length
          ? '<details class="spec-all"><summary>Full technical specifications</summary>' +
              '<table class="spec-table"><caption class="sr">Specifications</caption><tbody>' +
              Object.keys(p.specs).map(function (k) {
                return "<tr><th scope=\"row\">" + esc(k) + "</th><td>" + esc(p.specs[k]) + "</td></tr>";
              }).join("") +
              "</tbody></table></details>"
          : '<div class="notice" style="margin-top:22px">Full specifications for this model are supplied ' +
            'with the quote, or on request — we have not published them here rather than reproduce numbers we ' +
            'have not verified against the current datasheet.</div>') +
      "</div>";

    var main = $("[data-main]");
    $$("[data-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = Number(btn.getAttribute("data-view"));
        main.innerHTML = photo(p, i, p.name, false, true);
        $$("[data-view]").forEach(function (b2) { b2.setAttribute("aria-pressed", b2 === btn); });
      });
    });

    var qty = $("[data-qty]");
    if (qty) {
      $$("[data-step]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var next = (Number(qty.value) || 1) + Number(btn.getAttribute("data-step"));
          qty.value = Math.min(999, Math.max(1, next));
        });
      });
      $("[data-add-pdp]").addEventListener("click", function () {
        var n = Math.min(999, Math.max(1, Math.floor(Number(qty.value) || 1)));
        Cart.add(p.id, n);
        toast(n + " × " + p.name + " added.", { href: "cart.html", label: "View cart" });
      });
    }

    var related = inCollection(p.collection).filter(function (x) { return x.id !== p.id; });
    if (related.length < 4) {
      related = related.concat(collapseVariants(PRODUCTS).filter(function (x) {
        return x.collection !== p.collection && related.indexOf(x) < 0;
      }).slice(0, 8));
    }
    var mount = $("[data-related]");
    mount.appendChild(el('<div class="section-head"><div><h2>Others reach for these</h2>' +
      '<p>Parts commonly ordered alongside the ' + esc(p.name) + ".</p></div></div>"));
    mount.appendChild(rail(related.slice(0, 10)));
    wireAddButtons(mount);
  }

  /* ---------- page: cart ---------------------------------------------- */

  function pageCart() {
    function draw() {
      var lines = Cart.read();
      var host = $("[data-cart]");
      if (!lines.length) {
        host.innerHTML = '<div class="empty-state"><h2>Your cart is empty</h2>' +
          "<p>Nothing here yet. Browse the catalogue and add what your build needs.</p>" +
          '<a class="btn" href="index.html">Browse components</a></div>';
        return;
      }
      host.innerHTML =
        '<div class="cart-layout"><div>' +
          lines.map(function (l) {
            var p = product(l.id);
            return '<div class="line-item">' +
              '<div class="li-media">' + photo(p, 0) + "</div>" +
              "<div><div class=\"li-title\"><a href=\"" + productHref(p) + "\">" + esc(p.name) + "</a></div>" +
                '<div class="li-meta">' + esc(collection(p.collection).name) + " &middot; " + money(p.price) + " each</div></div>" +
              '<div class="li-right">' +
                '<div class="qty"><button type="button" data-dec="' + esc(p.id) + '" aria-label="Decrease">&minus;</button>' +
                  '<input type="number" value="' + l.qty + '" min="1" max="999" data-line="' + esc(p.id) + '" aria-label="Quantity for ' + esc(p.name) + '">' +
                  '<button type="button" data-inc="' + esc(p.id) + '" aria-label="Increase">+</button></div>' +
                '<div class="li-price">' + money(p.price * l.qty) + "</div>" +
                '<button class="link-btn" type="button" data-rm="' + esc(p.id) + '">Remove</button>' +
              "</div></div>";
          }).join("") +
          '<p style="padding-top:18px"><button class="link-btn" type="button" data-clear>Empty cart</button></p>' +
        "</div>" + summaryMarkup(true) + "</div>";

      $$("[data-inc]").forEach(function (b) { b.addEventListener("click", function () { bump(b.getAttribute("data-inc"), 1); }); });
      $$("[data-dec]").forEach(function (b) { b.addEventListener("click", function () { bump(b.getAttribute("data-dec"), -1); }); });
      $$("[data-rm]").forEach(function (b) { b.addEventListener("click", function () { Cart.remove(b.getAttribute("data-rm")); draw(); }); });
      $$("[data-line]").forEach(function (input) {
        input.addEventListener("change", function () {
          Cart.setQty(input.getAttribute("data-line"), Math.floor(Number(input.value) || 0));
          draw();
        });
      });
      $("[data-clear]").addEventListener("click", function () { Cart.clear(); draw(); });
      wirePayNow();
    }

    function bump(id, d) {
      var line = Cart.read().filter(function (l) { return l.id === id; })[0];
      if (line) Cart.setQty(id, line.qty + d);
      draw();
    }

    draw();
  }

  function summaryMarkup(withCheckout) {
    var sub = Cart.subtotal();
    return '<aside class="summary"><h3>Order summary</h3>' +
      '<div class="row"><span>Subtotal</span><span>' + money(sub) + "</span></div>" +
      '<div class="row"><span>Shipping</span><span class="muted">' + shippingLabel(sub) + "</span></div>" +
      /* Freight is per order, so the useful thing to say is how much more it
         takes to stop paying it — not to discount the freight itself. */
      (S.shipping && sub > 0 && sub < S.shipping.freeOver
        ? '<p class="ship-nudge">Add ' + money(S.shipping.freeOver - sub) +
          " more and shipping is on us.</p>"
        : "") +
      '<div class="row"><span>Sales tax</span><span class="muted">Where applicable</span></div>' +
      '<div class="row total"><span>Total</span><span>' + money(sub) + "</span></div>" +
      (withCheckout
        ? (S.checkoutEndpoint
            ? '<button class="btn btn-accent btn-block" type="button" data-pay-now>Checkout</button>' +
              '<p class="note muted" style="font-size:12.5px;margin-top:10px" data-pay-note>' +
                'Pay by card or US bank transfer on our secure Stripe checkout.</p>'
            : '<a class="btn btn-accent btn-block" href="checkout.html">Send us this order</a>') +
          '<p class="note muted" style="font-size:12.5px;margin-top:12px">Need a volume quote? ' +
          '<a href="contact.html">Contact us</a>.</p>'
        : "") +
      "</aside>";
  }

  /* ---------- page: checkout ------------------------------------------ */

  /* The three ways to pay. ACH is marked "recommended" only once the order is
     large enough for the saving to be real — below that the label is noise. */
  function payOptionsMarkup(subtotal) {
    var methods = window.PAYMENT_METHODS || [];
    return methods.map(function (m, i) {
      var push = m.recommended && subtotal >= (S.achThreshold || 1000);
      return '<label class="pay-option' + (push ? " push" : "") + '">' +
        '<input type="radio" name="paymethod" value="' + esc(m.id) + '"' + (i === 0 ? " checked" : "") + ">" +
        '<span class="pay-body">' +
          '<span class="pay-head"><b>' + esc(m.label) + "</b>" +
            '<span class="pay-eyebrow">' + esc(push ? "Recommended for this order" : m.eyebrow) + "</span></span>" +
          '<span class="pay-blurb">' + esc(m.blurb) + "</span>" +
          '<span class="pay-detail">' + esc(m.detail) + "</span>" +
        "</span></label>";
    }).join("");
  }

  function pageCheckout() {
    var lines = Cart.read();
    var host = $("[data-checkout]");
    if (!lines.length) {
      host.innerHTML = '<div class="empty-state"><h2>Nothing to check out</h2>' +
        "<p>Your cart is empty.</p><a class=\"btn\" href=\"index.html\">Browse components</a></div>";
      return;
    }

    host.innerHTML =
      '<div class="cart-layout"><div>' +
        '<form data-order novalidate>' +
          "<h2>Contact</h2>" +
          '<div class="form-grid" style="margin:16px 0 30px">' +
            '<div class="full"><label class="lbl" for="f-email">Work email</label>' +
              '<input class="field" id="f-email" name="email" type="email" required autocomplete="email"></div>' +
            '<div><label class="lbl" for="f-first">First name</label>' +
              '<input class="field" id="f-first" name="first" required autocomplete="given-name"></div>' +
            '<div><label class="lbl" for="f-last">Last name</label>' +
              '<input class="field" id="f-last" name="last" required autocomplete="family-name"></div>' +
          "</div>" +
          "<h2>Shipping address</h2>" +
          '<div class="form-grid" style="margin:16px 0 30px">' +
            '<div class="full"><label class="lbl" for="f-co">Company (optional)</label>' +
              '<input class="field" id="f-co" name="company" autocomplete="organization"></div>' +
            '<div class="full"><label class="lbl" for="f-addr">Street address</label>' +
              '<input class="field" id="f-addr" name="address" required autocomplete="street-address"></div>' +
            '<div><label class="lbl" for="f-city">City</label>' +
              '<input class="field" id="f-city" name="city" required autocomplete="address-level2"></div>' +
            '<div><label class="lbl" for="f-state">State</label>' +
              '<input class="field" id="f-state" name="state" required autocomplete="address-level1"></div>' +
            '<div><label class="lbl" for="f-zip">ZIP</label>' +
              '<input class="field" id="f-zip" name="zip" required autocomplete="postal-code" inputmode="numeric"></div>' +
            '<div><label class="lbl" for="f-phone">Phone</label>' +
              '<input class="field" id="f-phone" name="phone" type="tel" autocomplete="tel"></div>' +
          "</div>" +
          "<h2>Payment method</h2>" +
          '<p class="muted" style="margin:6px 0 16px">Pick whichever suits how you buy. ' +
            'Nothing about the order changes — only how it gets paid for.</p>' +
          '<div class="pay-options">' + payOptionsMarkup(Cart.subtotal()) + "</div>" +
          '<div class="notice" style="margin:20px 0 22px">' +
            "<strong>No card details are entered here.</strong> Send us the order and we will reply " +
            "with a Stripe payment link or an invoice, whichever suits how you buy. To pay by card " +
            'straight away instead, use <a href="cart.html">Checkout</a> in the cart.' +
          "</div>" +
          '<button class="btn btn-accent" type="submit">Continue</button>' +
          '<p class="muted" style="font-size:13px;margin-top:12px">Takes you to a summary you can send us or print. Nothing is charged at this step.</p>' +
        "</form>" +
      "</div>" + summaryMarkup(false) + "</div>";

    $("[data-order]").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.target;
      var missing = $$("[required]", form).filter(function (i) { return !i.value.trim(); });
      if (missing.length) { missing[0].focus(); toast("Fill in the highlighted fields."); return; }

      var picked = $("[name=paymethod]:checked");
      var method = (window.PAYMENT_METHODS || []).filter(function (m) {
        return m.id === (picked && picked.value);
      })[0] || { label: "Card", id: "card" };

      /* sessionStorage, not query parameters: a name and a street address have
         no business sitting in the URL bar, the history, or a referer header.
         The cart is left alone — this is a summary, not a placed order. */
      var data = {
        contact: {
          name: [$("#f-first").value, $("#f-last").value].join(" ").trim(),
          email: $("#f-email").value.trim(),
          phone: $("#f-phone").value.trim()
        },
        ship: {
          company: $("#f-co").value.trim(),
          address: $("#f-addr").value.trim(),
          city: $("#f-city").value.trim(),
          state: $("#f-state").value.trim(),
          zip: $("#f-zip").value.trim()
        },
        method: method.label,
        lines: lines.map(function (l) {
          var p = product(l.id);
          return { name: p.name, series: p.series, qty: l.qty, price: p.price };
        })
      };
      try { sessionStorage.setItem(SUMMARY_KEY, JSON.stringify(data)); }
      catch (err) { toast("Your browser blocked local storage, so the summary cannot be shown."); return; }
      location.href = "summary.html";
    });
  }

  /* ---------- page: order summary ------------------------------------- */

  var SUMMARY_KEY = "picassoai.summary.v1";

  function pageSummary() {
    var host = $("[data-summary]");
    var raw;
    try { raw = sessionStorage.getItem(SUMMARY_KEY); } catch (e) { raw = null; }
    var d = raw && JSON.parse(raw);
    if (!d || !d.lines || !d.lines.length) {
      host.innerHTML = '<div class="empty-state"><h2>Nothing to summarise</h2>' +
        "<p>Start from the cart and fill in your details.</p>" +
        '<a class="btn" href="cart.html">Go to cart</a></div>';
      return;
    }

    var total = d.lines.reduce(function (t, l) { return t + (l.price || 0) * l.qty; }, 0);
    /* "Los Altos, CA 94022" — the ZIP follows the state on a space, not a comma. */
    var cityLine = [[d.ship.city, d.ship.state].filter(Boolean).join(", "), d.ship.zip]
                     .filter(Boolean).join(" ");
    var ship = [d.ship.company, d.ship.address, cityLine]
                 .filter(Boolean).map(esc).join("<br>");

    host.innerHTML =
      '<div class="doc-head">' +
        "<div><h1>" + esc(S.brand) + "</h1>" +
          (S.tagline ? '<p class="muted">' + esc(S.tagline) + "</p>" : "") + "</div>" +
        '<div class="doc-title">Order summary</div>' +
      "</div>" +
      '<div class="doc-parties">' +
        "<div><h4>Contact</h4><p>" +
          [d.contact.name, d.contact.email, d.contact.phone].filter(Boolean).map(esc).join("<br>") +
        "</p></div>" +
        "<div><h4>Ship to</h4><p>" + (ship || "&mdash;") + "</p></div>" +
      "</div>" +
      '<table class="doc-table"><thead><tr>' +
        "<th>Description</th><th class=\"num\">Qty</th>" +
        "<th class=\"num\">Unit price</th><th class=\"num\">Subtotal</th>" +
      "</tr></thead><tbody>" +
      d.lines.map(function (l) {
        return "<tr><td>" + esc(l.name) + '<br><span class="muted">' + esc(l.series) + "</span></td>" +
          '<td class="num">' + l.qty + "</td>" +
          '<td class="num">' + money(l.price) + "</td>" +
          '<td class="num">' + money((l.price || 0) * l.qty) + "</td></tr>";
      }).join("") +
      '<tr class="total"><td colspan="3">Total</td><td class="num">' + money(total) + "</td></tr>" +
      "</tbody></table>" +
      '<p class="note">Payment method selected: ' + esc(d.method) + ".</p>" +
      '<div class="doc-actions">' +
        '<button class="btn btn-accent" type="button" data-send-order>Email this to Picasso</button>' +
        '<button class="btn" type="button" data-print>Print</button>' +
        '<a class="btn" href="checkout.html">Back to checkout</a>' +
      "</div>" +
      '<div data-send-status></div>';

    $("[data-print]").addEventListener("click", function () { window.print(); });

    /* Nothing is charged here, so this button is how an order actually reaches
       us. Say "request" rather than "order placed" — the customer has not paid
       and we have not confirmed anything yet. */
    var sendBtn = $("[data-send-order]");
    var status = $("[data-send-status]");
    var sent = false;
    sendBtn.addEventListener("click", function () {
      if (sent) return;
      var mailto = '<a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a>";

      var lines = d.lines.map(function (l) {
        return "  " + l.qty + " x " + l.name + (l.series ? " (" + l.series + ")" : "") +
          " @ " + money(l.price) + " = " + money((l.price || 0) * l.qty);
      }).join("\n");

      var body = [
        "ORDER REQUEST from picassointelligence.com",
        "",
        "Contact",
        "  " + [d.contact.name, d.contact.email, d.contact.phone].filter(Boolean).join(" | "),
        "",
        "Ship to",
        "  " + [d.ship.company, d.ship.address, cityLine].filter(Boolean).join(" | "),
        "",
        "Items",
        lines,
        "",
        "Total: " + money(total),
        "Payment method selected: " + d.method
      ].join("\n");

      var fd = new FormData();
      fd.append("_subject", "Order request — " + (d.contact.name || "no name") + " — " +
        d.lines.length + (d.lines.length === 1 ? " line — " : " lines — ") + money(total));
      /* Named "email" so Formspree sets Reply-To and you can answer directly. */
      fd.append("email", d.contact.email || "");
      fd.append("name", d.contact.name || "");
      fd.append("message", body);

      sendBtn.disabled = true;
      sendBtn.textContent = "Sending…";
      status.innerHTML = "";

      postForm(fd).then(function () {
        sent = true;
        sendBtn.remove();
        status.innerHTML = '<div class="notice" style="margin-top:20px">' +
          "<strong>Sent. We have your request.</strong> An engineer will reply to " +
          esc(d.contact.email || "the address you gave") +
          " to confirm pricing and availability before anything is charged. " +
          "Print this page if you want a copy for your records.</div>";
      }).catch(function (err) {
        sendBtn.disabled = false;
        sendBtn.textContent = "Email this to Picasso";
        status.innerHTML = '<div class="notice" style="margin-top:20px">' +
          "<strong>That did not send.</strong> " + esc(err.message) +
          " Please email " + mailto + " instead — this page is still here, " +
          "and Print will give you something to attach.</div>";
      });
    });
  }

  /* ---------- page: find by spec --------------------------------------- */

  /* The third way in, for people who have a requirement rather than a part
     number or an application: every motor in one sortable table. Columns are
     the numbers people choose on, in that order. */
  var FINDER_COLS = [
    { key: "name",   label: "Model",        get: function (p) { return p.name; } },
    { key: "series", label: "Series",       get: function (p) { return p.series; } },
    { key: "torque", label: "Rated N·m",    num: true, get: function (p) { return coreNum(p, "torque"); } },
    { key: "peak",   label: "Peak N·m",     num: true, get: function (p) { return num(spec(p, "Peak Torque (N·m)")); } },
    { key: "od",     label: "OD mm",        num: true, get: function (p) { return coreNum(p, "od"); } },
    { key: "height", label: "Height mm",    num: true, get: function (p) { return num(spec(p, "Height (mm)")); } },
    { key: "weight", label: "Weight g",     num: true, get: function (p) { return coreNum(p, "weight"); } },
    { key: "ratio",  label: "Ratio",        get: function (p) { return spec(p, CORE.ratio); } },
    { key: "volts",  label: "V",            num: true, get: function (p) { return num(spec(p, "Rated Voltage (V)")); } },
    { key: "price",  label: "Price",        num: true, get: function (p) { return p.price; } }
  ];

  function pageSelect() {
    /* Accessories carry no specs, so they would be an all-dashes row. */
    var items = collapseVariants(PRODUCTS.filter(function (p) {
      return p.specs && Object.keys(p.specs).length > 0;
    }));
    var mount = $("[data-filters]");
    var host = $("[data-finder]");
    var picked = { torque: "all", od: "all", weight: "all", ratio: "all" };
    var sortKey = "torque", sortDir = 1;

    var built = filterMarkup(items);
    if (mount) mount.innerHTML = built.html;

    /* A filter, not a search: it narrows the table so families like AK80 can be
       compared side by side. The header search takes you off to one product. */
    var modelBox = $("[data-model-filter]");
    var modelClear = $("[data-model-clear]");
    function modelMatch(p) {
      var term = (modelBox && modelBox.value || "").trim().toLowerCase();
      if (!term) return true;
      /* Every series is named "XX Series", and "series" contains "ri" — leaving
         it in made a search for the RI family return the whole catalogue. */
      var hay = (p.name + " " + (p.series || "")).toLowerCase().replace(/series/g, "");
      return term.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
    }

    function draw() {
      var view = items.filter(function (p) {
        return matchesFilters(p, picked, built.scale) && modelMatch(p);
      });
      var col = FINDER_COLS.filter(function (c) { return c.key === sortKey; })[0];
      view.sort(function (a, b) {
        var x = col.get(a), y = col.get(b);
        if (x == null || x === "") return 1;
        if (y == null || y === "") return -1;
        if (col.num) return sortDir * (x - y);
        return sortDir * String(x).localeCompare(String(y));
      });

      $("[data-finder-count]").textContent =
        view.length + (view.length === 1 ? " model" : " models");

      /* Without this the page rendered bare column headers over an empty
         table — no explanation, and no way back to a full list. */
      if (!view.length) {
        host.innerHTML = '<div class="empty-state"><h2>Nothing matches those filters</h2>' +
          "<p>No model meets every condition at once. Try widening one of them.</p>" +
          '<button class="btn btn-accent" type="button" data-reset>Clear filters</button></div>';
        $("[data-reset]", host).addEventListener("click", function () {
          /* Mutate in place: wireFilters closed over this exact object. */
          Object.keys(picked).forEach(function (k) { picked[k] = "all"; });
          if (modelBox) { modelBox.value = ""; }
          if (modelClear) modelClear.hidden = true;
          if (mount) $$("[data-f]", mount).forEach(function (b) {
            b.setAttribute("aria-pressed", b.getAttribute("data-v") === "all");
          });
          draw();
        });
        return;
      }

      host.innerHTML = '<div class="compare-scroll"><table class="finder-table">' +
        "<thead><tr><th></th>" + FINDER_COLS.map(function (c) {
          var on = c.key === sortKey;
          return '<th' + (c.num ? ' class="num"' : "") + '>' +
            '<button type="button" data-sortkey="' + c.key + '" aria-pressed="' + on + '">' +
            esc(c.label) + (on ? (sortDir > 0 ? " ↑" : " ↓") : "") + "</button></th>";
        }).join("") + "</tr></thead><tbody>" +
        view.map(function (p) {
          var checked = Compare.read().indexOf(p.id) >= 0;
          return "<tr>" +
            '<td><input type="checkbox" data-cmp="' + esc(p.id) + '"' + (checked ? " checked" : "") +
              ' aria-label="Compare ' + esc(p.name) + '"></td>' +
            FINDER_COLS.map(function (c) {
              var v = c.get(p);
              if (c.key === "name") {
                return '<td><a href="' + productHref(p) + '">' + esc(p.name) + "</a></td>";
              }
              if (c.key === "price") {
                return '<td class="num">' + (p.price == null ? "Quote" : money(p.price)) + "</td>";
              }
              return "<td" + (c.num ? ' class="num"' : "") + ">" +
                esc(v == null || v === "" ? "—" : v) + "</td>";
            }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>";

      $$("[data-sortkey]", host).forEach(function (b) {
        b.addEventListener("click", function () {
          var k = b.getAttribute("data-sortkey");
          if (k === sortKey) sortDir = -sortDir; else { sortKey = k; sortDir = 1; }
          draw();
        });
      });
      wireCompare(host);
    }

    wireFilters(mount, picked, draw);
    if (modelBox) {
      modelBox.addEventListener("input", function () {
        if (modelClear) modelClear.hidden = !modelBox.value;
        draw();
      });
    }
    if (modelClear) modelClear.addEventListener("click", function () {
      modelBox.value = "";
      modelClear.hidden = true;
      modelBox.focus();
      draw();
    });
    draw();
    paintCompareBar();
  }

  /* ---------- page: compare -------------------------------------------- */

  function pageCompare() {
    var host = $("[data-compare]");
    var items = Compare.read().map(product).filter(Boolean);
    if (items.length < 2) {
      host.innerHTML = '<div class="empty-state"><h2>Pick two or more models</h2>' +
        "<p>Tick <em>Compare</em> on any model in the catalogue, then come back.</p>" +
        '<a class="btn" href="collection.html?c=integrated">Browse actuators</a></div>';
      return;
    }

    /* Union of every key any selected model has, kept in the first model's
       order so the four selection parameters stay at the top. */
    var keys = [];
    items.forEach(function (p) {
      Object.keys(p.specs).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); });
    });

    host.innerHTML = '<div class="compare-scroll"><table class="compare-table">' +
      "<thead><tr><th></th>" + items.map(function (p) {
        return '<th class="compare-head">' +
          '<a href="' + productHref(p) + '"><span class="thumb">' +
            photo(p, 0) + "</span></a>" +
          "<b>" + esc(p.name) + "</b><span>" +
          (quoteOnly(p) ? "Request a quote" : money(p.price)) + "</span></th>";
      }).join("") + "</tr></thead><tbody>" +
      keys.map(function (k) {
        var vals = items.map(function (p) { return spec(p, k); });
        var differs = vals.some(function (v) { return v !== vals[0]; });
        return '<tr class="' + (differs ? "differs" : "") + '"><th scope="row">' + esc(k) + "</th>" +
          vals.map(function (v) { return "<td>" + esc(v || "—") + "</td>"; }).join("") + "</tr>";
      }).join("") +
      "</tbody></table></div>" +
      '<div class="doc-actions"><button class="btn" type="button" data-clear>Clear selection</button></div>';

    $("[data-clear]").addEventListener("click", function () {
      Compare.write([]);
      location.reload();
    });
  }

  /* ---------- page: search -------------------------------------------- */

  function pageSearch() {
    var q = param("q");
    var input = $("#q-page");
    input.value = q;

    function draw(term) {
      term = term.trim().toLowerCase();
      var hits = !term ? [] : collapseVariants(PRODUCTS).filter(function (p) {
        var c = collection(p.collection);
        var hay = [p.name, p.blurb, c.name, c.tease, c.blurb,
          Object.keys(p.specs).map(function (k) { return k + " " + p.specs[k]; }).join(" ")].join(" ").toLowerCase();
        return term.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
      });

      $("[data-search-summary]").textContent = !term
        ? "Type a model number, a torque figure, or a category."
        : hits.length + (hits.length === 1 ? " result for “" : " results for “") + term + "”";

      $("[data-search-grid]").innerHTML = hits.map(card).join("") ||
        (term ? '<p class="muted">Nothing matched. We can usually source parts we do not stock — <a href="contact.html">tell us what you need</a>.</p>' : "");
      wireAddButtons($("[data-search-grid]"));
    }

    $("[data-search-form]").addEventListener("submit", function (e) {
      e.preventDefault();
      history.replaceState(null, "", "search.html?q=" + encodeURIComponent(input.value));
      draw(input.value);
    });
    input.addEventListener("input", function () { draw(input.value); });
    draw(q);
  }

  /* ---------- page: contact ------------------------------------------- */

  function pageContact() {
    var form = $("[data-contact]");
    if (!form) return;

    /* Arrived from a "Request a quote" button — prefill so the customer does
       not have to retype the model they just clicked. */
    var model = param("model");
    if (model) {
      var topic = $("#c-topic"), msg = $("#c-msg");
      if (topic) {
        var quoteOpt = $$("option", topic).filter(function (o) {
          return /quote|pricing/i.test(o.textContent);
        })[0];
        if (quoteOpt) topic.value = quoteOpt.value;
      }
      if (msg) msg.value = "Model: " + model + "\nQuantity: \nNeeded by: \n\n";
      var head = $("[data-contact-head]");
      if (head) head.textContent = "Quote request — " + model;
    }
    /* Posted with fetch rather than a plain form action so the customer stays
       on the site, and without Formspree's SDK so the page keeps its no-build,
       no-dependency footing. */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var missing = $$("[required]", form).filter(function (i) { return !i.value.trim(); });
      if (missing.length) { missing[0].focus(); toast("Fill in the highlighted fields."); return; }

      var mailto = '<a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a>";
      if (!S.formEndpoint) {
        form.innerHTML = '<div class="notice"><strong>The form is not connected yet.</strong> ' +
          "Please email " + mailto + " and we will come straight back to you.</div>";
        return;
      }

      var subject = $("#c-subject-holder") || $('[name="_subject"]', form);
      if (subject) {
        var topic = $("#c-topic");
        subject.value = (topic && topic.value ? topic.value : "Enquiry") +
          (model ? " — " + model : "") + " — picassointelligence.com";
      }

      var btn = $('button[type="submit"]', form);
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      var old = $("[data-form-error]", form);
      if (old) old.remove();

      postForm(new FormData(form)).then(function () {
        form.innerHTML = '<div class="notice"><strong>Thank you — your message has been sent.</strong> ' +
          "An engineer will reply to the address you gave. If it is urgent you can also reach us at " +
          mailto + ".</div>";
      }).catch(function (err) {
        /* Never claim a send that did not happen — say so and give the address. */
        if (btn) { btn.disabled = false; btn.textContent = label; }
        var box = document.createElement("div");
        box.className = "notice";
        box.setAttribute("data-form-error", "");
        box.style.marginTop = "16px";
        box.innerHTML = "<strong>That did not send.</strong> " + esc(err.message) +
          " Please email " + mailto + " instead — your text is still in the form above.";
        form.appendChild(box);
      });
    });
  }

  /* ---------- boot ----------------------------------------------------- */

  var PAGES = {
    home: pageHome,
    collection: pageCollection,
    product: pageProduct,
    cart: pageCart,
    checkout: pageCheckout,
    summary: pageSummary,
    select: pageSelect,
    compare: pageCompare,
    search: pageSearch,
    contact: pageContact
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    document.addEventListener("cart:change", paintCartCount);

    var page = document.body.getAttribute("data-page");
    if (PAGES[page]) PAGES[page]();

    // fill in brand-dependent text placeholders on static pages
    $$("[data-fill]").forEach(function (node) {
      var key = node.getAttribute("data-fill");
      if (S[key] == null) return;
      node.textContent = S[key];
      if (key === "email" && node.tagName === "A") node.setAttribute("href", "mailto:" + S.email);
    });
  });
})();
