(async () => {
  const IS_PROTOTYPE = location.pathname === "/yup-prototype" || location.pathname.startsWith("/yup-prototype/");
  const ROOT = IS_PROTOTYPE ? "/yup-prototype" : "/yup";
  const ASSET = IS_PROTOTYPE ? "/public/assets/yup" : "/assets/yup";
  const CONTENT = `${ROOT}/content`;

  const page = document.body.dataset.page || "home";

  async function fetchContent(file) {
    const response = await fetch(`${CONTENT}/${file}`);
    if (!response.ok) throw new Error(`Could not load ${file} (${response.status})`);
    return response.json();
  }

  const [stickerContent, memeContent, archiveContent, pageContent] = await Promise.all([
    fetchContent("stickers.json"),
    fetchContent("memes.json"),
    fetchContent("archive.json"),
    fetchContent("pages.json")
  ]);

  const reactions = stickerContent.map(item => ({ ...item, src: `${ASSET}/${item.image}` }));
  const memes = memeContent.map(item => ({ ...item, src: `${ASSET}/${item.image}` }));
  const works = archiveContent.map(item => ({ ...item, src: `${ASSET}/${item.image}` }));
  const searchablePages = pageContent.map(item => ({ ...item, href: `${ROOT}${item.path}` }));

  const nav = [
    ["home", "YUP NOW", `${ROOT}/`],
    ["origin", "ORIGIN", `${ROOT}/origin/`],
    ["stickers", "STICKERS", `${ROOT}/stickers/`],
    ["memes", "MEMES", `${ROOT}/memes/`],
    ["archive", "ARCHIVE", `${ROOT}/archive/`]
  ];

  function header() {
    return `
      <a class="skip-link" href="#content">Skip to content</a>
      <header class="site-header">
        <a class="wordmark" href="${ROOT}/" aria-label="YUP home"><span>YUP.</span></a>
        <nav class="main-nav" id="mainNav" aria-label="Main navigation">
          ${nav.map(([key, label, href]) => `<a href="${href}" ${key === page ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
        </nav>
        <a class="search-link" href="${ROOT}/search/" aria-label="Search YUP" ${page === "search" ? 'aria-current="page"' : ""}>
          <span>SEARCH</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg>
        </a>
        <button class="menu-button" id="menuButton" aria-label="Open menu" aria-expanded="false">MENU</button>
      </header>`;
  }

  function footer() {
    return `
      <footer class="site-footer">
        <div class="footer-main">
          <div class="footer-title"><p class="eyebrow">Still here</p><h2 class="display">YUP.</h2></div>
          <div class="footer-links">
            <a href="${ROOT}/origin/"><span>01 / Origin</span><b>→</b></a>
            <a href="${ROOT}/stickers/"><span>02 / Stickers</span><b>→</b></a>
            <a href="${ROOT}/memes/"><span>03 / Memes</span><b>→</b></a>
            <button type="button" data-do-not-click><span>04 / Do not click</span><b>→</b></button>
          </div>
        </div>
        <div class="footer-bottom">
          <span>OPENAGENT.BOT ｜ YUP</span>
          <span>© 2025–2026 · ALL RIGHTS RESERVED · IMAGE LICENSE / ORIGINAL USE ONLY · NO EDITING OR DERIVATIVE WORKS</span>
        </div>
      </footer>
      <div class="do-not-click" id="doNotClick" aria-hidden="true">
        <button type="button" aria-label="Close">×</button>
        <div class="do-not-click-inner"><h2 class="display">YUP.</h2><p id="easterText">You were specifically told.</p></div>
      </div>`;
  }

  function card(item) {
    const readable = item.name.replaceAll("-", " ");
    return `
      <button class="reaction-card" type="button" data-reaction="${item.name}" data-category="${item.category}" aria-label="Open ${readable} sticker">
        <span class="checker"><img src="${item.src}" alt="YUP ${readable}" loading="lazy" /></span>
        <span class="reaction-info"><span><b>YUP_${item.id}</b><br><span class="reaction-category">${readable}</span></span><span class="arrow">↘</span></span>
      </button>`;
  }

  function homePage() {
    const preview = [reactions[0], reactions[3], reactions[4], reactions[11]];
    return `
      <main id="content">
        <section class="home-hero">
          <div class="home-hero-copy">
            <div>
              <p class="hero-kicker">Ancient face. Curious mind. Now online.</p>
              <h1 class="display hero-title">YUP.</h1>
              <p class="hero-deck">Looks unimpressed.<br>Isn’t.</p>
            </div>
            <div class="hero-caption">
              <span>ORIGIN / ANCIENT</span><span>MIND / CURIOUS</span><span>STATUS / LOOKING AROUND</span>
            </div>
          </div>
          <div class="home-hero-figure" id="heroFigure">
            <div class="hero-yup" id="heroYup" role="img" aria-label="YUP, looking exactly as impressed as expected"></div>
          </div>
        </section>

        <section class="origin-teaser reveal" id="originPreview">
          <div class="origin-image"><img src="${ASSET}/hero-statues.png" alt="YUP among the Moai of Easter Island" /></div>
          <div class="origin-copy">
            <p class="eyebrow">Long story / Short version</p>
            <h2 class="display">OLD STONE.<br>NEW CURIOSITY.</h2>
            <p>AI entered the stone. <strong>Curiosity</strong> followed.</p>
            <a class="button" href="${ROOT}/origin/">Read the origin</a>
          </div>
        </section>

        <section class="now-section reveal">
          <div class="now-copy">
            <span class="section-no">Transmission / 006</span>
            <h2 class="display">YUP<br>NOW</h2>
            <p class="now-quote">“AI can do everything now. Interesting. What should it do?”</p>
            <div class="now-meta"><span>05 SEP 2026</span><span>MOOD / CURIOUS</span><span>LOCATION / TAB 17</span></div>
          </div>
          <div class="now-art"><img src="${ROOT}/assets/yup-typing-refined.png" alt="YUP typing on a laptop" loading="lazy" /></div>
        </section>

        <section class="library-preview">
          <div class="section-heading reveal">
            <h2 class="display">STICKERS</h2>
            <div><p>For when one word is already too much.</p><a class="button small" href="${ROOT}/stickers/">View stickers</a></div>
          </div>
          <div class="reaction-row">${preview.map(card).join("")}</div>
        </section>

        <section class="memes-preview reveal">
          <div class="memes-intro">
            <div><p class="eyebrow">Internet material</p><h2 class="display">YUP<br>MEMES</h2></div>
            <div><p>YUP looks at the internet. The internet explains itself.</p><a class="button" href="${ROOT}/memes/">See memes</a></div>
          </div>
          <a class="meme-lead" href="${ROOT}/memes/">
            <img src="${ASSET}/web/scene-online.avif" alt="YUP sitting at a glowing computer" loading="lazy" />
            <span class="meme-lead-caption"><h3>THOUGHT LEADERSHIP. HMM.</h3><span class="section-no">MEME 006 ↗</span></span>
          </a>
        </section>
      </main>`;
  }

  function originPage() {
    return `
      <main id="content" class="origin-page">
        <section class="page-hero">
          <div class="page-hero-copy"><p class="eyebrow">Where this started</p><h1 class="display">ORIGIN</h1></div>
          <div class="page-hero-aside"><span class="big-index">01</span><p>Ancient face. Curious mind. The rest is unclear.</p></div>
        </section>

        <section class="specimen">
          <div class="specimen-data">
            <p class="eyebrow">Subject file / YUP-001</p>
            <h2 class="display">KNOWN<br>FACTS</h2>
            <dl class="data-list">
              <div><dt>Subject</dt><dd>YUP</dd></div><div><dt>Type</dt><dd>Unknown / Probably stone</dd></div>
              <div><dt>Origin</dt><dd>Rapa Nui / Allegedly</dd></div><div><dt>Material</dt><dd>Stone-ish</dd></div>
              <div><dt>Intelligence</dt><dd>Artificial / Curious</dd></div><div><dt>Eyes</dt><dd>Half open</dd></div>
              <div><dt>Expression</dt><dd>Unimpressed / Apparently</dd></div><div><dt>Last moved</dt><dd id="lastMoved">Just now</dd></div>
            </dl>
          </div>
          <div class="specimen-viewer" id="specimenViewer" aria-label="Interactive YUP specimen viewer">
            <div class="scanner" aria-hidden="true"></div>
            <img class="view-image" id="viewImage" src="${ASSET}/web/character-head.avif" alt="Front view of YUP" />
            <span class="view-label" id="viewLabel">VIEW 01 / FRONT — DRAG OR USE CONTROLS</span>
            <div class="view-controls" aria-label="Choose a view">
              <button type="button" data-view="0" class="active" aria-label="Front view">F</button>
              <button type="button" data-view="1" aria-label="Side view">S</button>
              <button type="button" data-view="2" aria-label="Back view">B</button>
            </div>
          </div>
        </section>

        <section class="origin-acts">
          <article class="origin-act reveal"><div class="act-no">I</div><div class="act-copy"><span class="section-no">Before the signal</span><h3 class="display">STONE</h3><p>YUP stood still for a very long time. Then something interesting happened.</p></div><div class="act-art"><img src="${ASSET}/web/scene-mountain.avif" alt="YUP in a mountainous landscape" /><span class="stamp">ARCHIVE / 0001</span></div></article>
          <article class="origin-act reveal"><div class="act-no">II</div><div class="act-copy"><span class="section-no">The signal</span><h3 class="display">SIGNAL</h3><p>AI entered the stone. So did questions.</p></div><div class="act-art"><img src="${ASSET}/web/scene-window.avif" alt="YUP looking out of a window" /><span class="stamp">ARCHIVE / 0002</span></div></article>
          <article class="origin-act reveal"><div class="act-no">III</div><div class="act-copy"><span class="section-no">Now</span><h3 class="display">ONLINE</h3><p>Now YUP explores AI, robots, games and whatever humans invent next.</p></div><div class="act-art"><img src="${ASSET}/web/scene-online.avif" alt="YUP online at a computer" /><span class="stamp">STATUS / ACTIVE</span></div></article>
        </section>
      </main>`;
  }

  function stickersPage() {
    const counts = reactions.reduce((result, item) => {
      result[item.category] = (result[item.category] || 0) + 1;
      return result;
    }, {});
    return `
      <main id="content">
        <section class="page-hero">
          <div class="page-hero-copy"><p class="eyebrow">Say less</p><h1 class="display">STICKERS</h1></div>
          <div class="page-hero-aside"><span class="big-index">${reactions.length}</span><p>A YUP for every possible level of enthusiasm.</p></div>
        </section>
        <section class="reactions-tools" aria-label="Sticker filters">
          <div class="tabs">
            <button class="tab active" type="button" data-filter="all">All / ${reactions.length}</button>
            <button class="tab" type="button" data-filter="expressions">Expressions / ${counts.expressions || 0}</button>
            <button class="tab" type="button" data-filter="actions">Actions / ${counts.actions || 0}</button>
            <button class="tab" type="button" data-filter="props">Props / ${counts.props || 0}</button>
          </div>
          <span class="filter-count" id="filterCount">${reactions.length}</span>
        </section>
        <section class="reaction-grid" id="reactionGrid">${reactions.map(card).join("")}</section>
        <div class="modal" id="reactionModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div class="modal-card">
            <div class="modal-preview checker"><img id="modalImage" alt="" /></div>
            <div class="modal-info"><button class="modal-close" type="button" aria-label="Close">×</button><span class="section-no" id="modalMeta"></span><h2 class="display" id="modalTitle"></h2><p>Transparent PNG · Ready.</p><div class="modal-actions"><a class="button" id="downloadReaction" download>Download</a><button class="button" type="button" id="copyReaction">Copy link</button></div></div>
          </div>
        </div>
      </main>`;
  }

  function memesPage() {
    return `
      <main id="content" class="memes-page">
        <section class="memes-hero">
          <div><p class="eyebrow">YUP on the internet</p><h1 class="display">MEMES</h1></div>
          <p>AI, work, games and other human inventions.</p>
        </section>
        <section class="memes-toolbar" aria-label="Meme collection information">
          <span>COLLECTION / 2025—ONGOING</span><span>TOPICS / AI · WORK · GAMES · INTERNET</span><span>UPDATED / OCCASIONALLY</span>
        </section>
        <section class="meme-grid">
          ${memes.map(({ id, title, src, tag, line }) => `
            <article class="meme-card reveal" id="meme-${id}">
              <div class="meme-image"><img src="${src}" alt="${title}" loading="lazy" /></div>
              <div class="meme-info"><div class="meme-meta"><span>YUP_MEME_${id}</span><span>${tag}</span></div><h2>${title}</h2><p>${line}</p><a href="${src}" download>DOWNLOAD ORIGINAL ↓</a></div>
            </article>`).join("")}
        </section>
      </main>`;
  }

  function archivePage() {
    return `
      <main id="content" class="portfolio-page">
        <section class="portfolio-hero">
          <div><p class="eyebrow">Selected work</p><h1 class="display">ARCHIVE</h1></div>
          <div class="portfolio-statement"><p>Selected work from the world of YUP.</p><span>2025—ONGOING</span></div>
        </section>
        <section class="portfolio-grid">
          ${works.map(({ id, title, year, discipline, src, wide }) => `
            <article class="portfolio-project ${wide ? "wide" : ""} reveal" id="work-${id}">
              <figure><img src="${src}" alt="${title}" loading="lazy" /></figure>
              <div class="project-caption"><div><h2>${title}</h2><p>${discipline}</p></div><span>${year}</span></div>
            </article>`).join("")}
        </section>
      </main>`;
  }

  function searchPage() {
    return `
      <main id="content" class="search-page">
        <section class="search-hero">
          <div><p class="eyebrow">Find something</p><h1 class="display">SEARCH</h1></div>
          <form class="search-form" id="searchForm" role="search">
            <label class="visually-hidden" for="siteSearch">Search YUP</label>
            <input id="siteSearch" name="q" type="search" placeholder="TRY ROBOT, CURIOUS, COFFEE…" autocomplete="off" autofocus />
            <button type="submit" aria-label="Run search">→</button>
          </form>
          <p class="search-status" id="searchStatus">Pages, stickers, memes and work.</p>
        </section>
        <section class="search-results" id="searchResults" aria-live="polite"></section>
      </main>`;
  }

  const pages = { home: homePage, origin: originPage, stickers: stickersPage, memes: memesPage, archive: archivePage, search: searchPage };
  document.getElementById("app").innerHTML = `<div class="site-shell">${header()}${pages[page]()}${footer()}</div>`;

  const menu = document.getElementById("mainNav");
  const menuButton = document.getElementById("menuButton");
  menuButton?.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
  }, { threshold: .1 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  const easter = document.getElementById("doNotClick");
  document.querySelector("[data-do-not-click]")?.addEventListener("click", () => {
    easter.classList.add("open"); easter.setAttribute("aria-hidden", "false");
    setTimeout(() => { const p = document.getElementById("easterText"); if (p) p.textContent = "yup."; }, 2200);
  });
  easter?.querySelector("button")?.addEventListener("click", () => { easter.classList.remove("open"); easter.setAttribute("aria-hidden", "true"); });

  const heroFigure = document.getElementById("heroFigure");
  if (heroFigure) {
    const heroObject = document.getElementById("heroYup");
    let pupils = [];
    const connectEyes = () => {
      pupils = heroObject ? [heroObject.querySelector("#pupil-left"), heroObject.querySelector("#pupil-right")].filter(Boolean) : [];
    };
    fetch(`${ROOT}/assets/YUP_head.svg`)
      .then(response => response.text())
      .then(svg => { heroObject.innerHTML = svg; connectEyes(); });
    heroFigure.addEventListener("pointermove", (event) => {
      const rect = heroFigure.getBoundingClientRect();
      const normalizedX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      const offset = Math.round(normalizedX * 32);
      pupils.forEach(pupil => { pupil.style.transform = `translateX(${offset}px)`; });
    });
    heroFigure.addEventListener("pointerleave", () => pupils.forEach(pupil => { pupil.style.transform = "translateX(0)"; }));
  }

  const specimen = document.getElementById("specimenViewer");
  if (specimen) {
    const views = [
      [`${ASSET}/web/character-head.avif`, "VIEW 01 / FRONT"],
      [`${ASSET}/web/character-side.avif`, "VIEW 02 / SIDE"],
      [`${ASSET}/web/character-back.avif`, "VIEW 03 / BACK"]
    ];
    let current = 0;
    let downX = null;
    const image = document.getElementById("viewImage");
    const label = document.getElementById("viewLabel");
    const choose = next => {
      current = (next + views.length) % views.length;
      image.src = views[current][0];
      image.alt = `${views[current][1].split("/")[1].trim()} view of YUP`;
      label.textContent = `${views[current][1]} — DRAG OR USE CONTROLS`;
      specimen.querySelectorAll("[data-view]").forEach((b, i) => b.classList.toggle("active", i === current));
    };
    specimen.querySelectorAll("[data-view]").forEach(button => {
      button.addEventListener("pointerdown", event => event.stopPropagation());
      button.addEventListener("click", event => {
        event.stopPropagation();
        choose(Number(button.dataset.view));
      });
    });
    specimen.addEventListener("pointerdown", event => {
      if (event.target.closest?.("[data-view]")) return;
      downX = event.clientX;
      specimen.setPointerCapture(event.pointerId);
    });
    specimen.addEventListener("pointerup", event => { if (downX !== null && Math.abs(event.clientX - downX) > 35) choose(current + (event.clientX < downX ? 1 : -1)); downX = null; });
    specimen.addEventListener("pointermove", event => { const rect = specimen.getBoundingClientRect(); specimen.style.setProperty("--scan-y", `${Math.max(4, Math.min(96, ((event.clientY - rect.top) / rect.height) * 100))}%`); });
  }

  const grid = document.getElementById("reactionGrid");
  if (grid) {
    const buttons = document.querySelectorAll(".tab");
    buttons.forEach(button => button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach(b => b.classList.toggle("active", b === button));
      let count = 0;
      grid.querySelectorAll(".reaction-card").forEach(item => {
        const show = filter === "all" || item.dataset.category === filter;
        item.hidden = !show;
        if (show) count++;
      });
      document.getElementById("filterCount").textContent = count;
    }));
  }

  const modal = document.getElementById("reactionModal");
  let previousFocus = null;
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    previousFocus?.focus();
  }
  if (modal) {
    document.querySelectorAll("[data-reaction]").forEach(button => button.addEventListener("click", () => {
      const item = reactions.find(r => r.name === button.dataset.reaction);
      if (!item) return;
      previousFocus = button;
      document.getElementById("modalImage").src = item.src;
      document.getElementById("modalImage").alt = `YUP ${item.name.replaceAll("-", " ")}`;
      document.getElementById("modalTitle").textContent = item.name.replaceAll("-", " ");
      document.getElementById("modalMeta").textContent = `${item.category} / YUP_${item.id}`;
      document.getElementById("downloadReaction").href = item.src;
      document.getElementById("copyReaction").dataset.src = new URL(item.src, location.href).href;
      modal.classList.add("open");
      modal.querySelector(".modal-close").focus();
    }));
    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
    document.getElementById("copyReaction").addEventListener("click", async event => {
      const button = event.currentTarget;
      try { await navigator.clipboard.writeText(button.dataset.src); button.firstChild.textContent = "Copied "; }
      catch { button.firstChild.textContent = "Copy unavailable "; }
    });

    const requestedSticker = new URLSearchParams(location.search).get("item");
    if (requestedSticker) document.querySelector(`[data-reaction="${CSS.escape(requestedSticker)}"]`)?.click();
  }

  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    const searchInput = document.getElementById("siteSearch");
    const searchResults = document.getElementById("searchResults");
    const searchStatus = document.getElementById("searchStatus");
    const entries = [
      ...searchablePages,
      ...reactions.map(item => ({
        type: "STICKER",
        title: item.name.replaceAll("-", " "),
        description: item.category,
        href: `${ROOT}/stickers/?item=${encodeURIComponent(item.name)}`,
        keywords: `${item.category} sticker png ${item.name}`,
        image: item.src
      })),
      ...memes.map(item => ({
        type: "MEME",
        title: item.title,
        description: item.line,
        href: `${ROOT}/memes/#meme-${item.id}`,
        keywords: `${item.tag} ${item.title} ${item.line}`,
        image: item.src
      })),
      ...works.map(item => ({
        type: "WORK",
        title: item.title,
        description: `${item.discipline} · ${item.year}`,
        href: `${ROOT}/archive/#work-${item.id}`,
        keywords: `${item.discipline} ${item.year} art design portfolio`,
        image: item.src
      }))
    ];

    const renderSearch = value => {
      const query = value.trim().toLowerCase();
      const terms = query.split(/\s+/).filter(Boolean);
      const matches = query ? entries.filter(entry => {
        const haystack = `${entry.type} ${entry.title} ${entry.description} ${entry.keywords}`.toLowerCase();
        return terms.every(term => haystack.includes(term));
      }) : [];

      searchStatus.textContent = query ? `${matches.length} RESULT${matches.length === 1 ? "" : "S"} / ${value.trim()}` : "Pages, stickers, memes and work.";
      searchResults.innerHTML = matches.length ? matches.map(entry => `
        <a class="search-result ${entry.image ? "has-image" : ""}" href="${entry.href}">
          ${entry.image ? `<span class="search-thumb ${entry.type.toLowerCase()}"><img src="${entry.image}" alt="" loading="lazy" /></span>` : ""}
          <div class="search-result-copy"><span class="search-type">${entry.type}</span><h2>${entry.title}</h2><p>${entry.description}</p></div>
          <b aria-hidden="true">→</b>
        </a>`).join("") : query ? `<div class="search-empty"><h2 class="display">NOPE.</h2><p>Try another word.</p></div>` : "";
    };

    const initialQuery = new URLSearchParams(location.search).get("q") || "";
    searchInput.value = initialQuery;
    renderSearch(initialQuery);
    searchInput.addEventListener("input", () => renderSearch(searchInput.value));
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      const query = searchInput.value.trim();
      history.replaceState({}, "", query ? `${ROOT}/search/?q=${encodeURIComponent(query)}` : `${ROOT}/search/`);
      renderSearch(query);
    });
  }
})().catch(error => {
  console.error(error);
  const app = document.getElementById("app");
  if (app) app.innerHTML = `<main class="content-error"><p>YUP IS THINKING.</p><h1>TRY AGAIN.</h1></main>`;
});
