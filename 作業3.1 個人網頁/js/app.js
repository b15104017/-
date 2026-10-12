/**
 * 晨星書房 (Morningstar Lit) · 核心互動邏輯
 * 實作特色：
 * 1. 頂部固定搜索與分類標籤即時篩選
 * 2. 首頁主打作品立體書本輪播展示 (佔比一個螢幕)
 * 3. 主題分區作品網格與沉浸試讀模式
 * 4. 專屬預留長條形按鈕自訂指引與互動
 * 5. 底部社群帳號追蹤卡片與點擊反饋
 * 6. 書架收藏與閱讀偏好保存 (localStorage)
 */

(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // 1. 全域狀態管理 (State)
  // ---------------------------------------------------------------------------
  const state = {
    activeCategory: "all",
    searchQuery: "",
    featuredIndex: 0,
    featuredNovels: NOVELS_DATA.filter((n) => n.isFeatured),
    filteredNovels: [...NOVELS_DATA],
    savedBookshelf: JSON.parse(localStorage.getItem("aether_bookshelf") || "[]"),
    activeReaderBook: null,
    activeReaderChapterIndex: 0,
    readerFontSize: localStorage.getItem("aether_font_size") || "md",
    readerTheme: localStorage.getItem("aether_reader_theme") || "theme-cream",
    isAuthorAuthenticated: localStorage.getItem("aether_author_auth") === "true",
    authorPasscode: "0314"
  };

  // ---------------------------------------------------------------------------
  // 2. DOM 節點快取
  // ---------------------------------------------------------------------------
  const DOM = {
    // Header
    header: document.getElementById("site-header"),
    brandLogo: document.getElementById("brand-logo"),
    searchInput: document.getElementById("search-input"),
    searchClearBtn: document.getElementById("search-clear-btn"),
    categoryFilterBar: document.getElementById("category-filter-bar"),
    openBookshelfBtn: document.getElementById("open-bookshelf-btn"),
    shelfCountBadge: document.getElementById("shelf-count-badge"),

    // Hero Spotlight
    spotlightCard: document.getElementById("spotlight-card"),
    spotlightInfo: document.querySelector(".spotlight-info"),
    bookShowcaseWrapper: document.querySelector(".book-showcase-wrapper"),
    spotlightBadge: document.getElementById("spotlight-badge"),
    spotlightCategory: document.getElementById("spotlight-category"),
    spotlightStatus: document.getElementById("spotlight-status"),
    spotlightReadtime: document.getElementById("spotlight-readtime"),
    spotlightEnTitle: document.getElementById("spotlight-en-title"),
    spotlightTitle: document.getElementById("spotlight-title"),
    spotlightQuote: document.getElementById("spotlight-quote"),
    spotlightSynopsis: document.getElementById("spotlight-synopsis"),
    spotlightWords: document.getElementById("spotlight-words"),
    spotlightUpdated: document.getElementById("spotlight-updated"),
    spotlightHighlight: document.getElementById("spotlight-highlight"),
    spotlightReadBtn: document.getElementById("spotlight-read-btn"),
    spotlightSaveBtn: document.getElementById("spotlight-save-btn"),
    spotlightSaveText: document.getElementById("spotlight-save-text"),
    spotlightBook3d: document.getElementById("spotlight-book-3d"),
    spotlightCoverImg: document.getElementById("spotlight-cover-img"),
    carouselIndicators: document.getElementById("carousel-indicators"),
    prevFeaturedBtn: document.getElementById("prev-featured-btn"),
    nextFeaturedBtn: document.getElementById("next-featured-btn"),

    // Thematic Catalog
    currentSectionTitle: document.getElementById("current-section-title"),
    resultCountLabel: document.getElementById("result-count-label"),
    novelsGrid: document.getElementById("novels-grid"),

    // Strip Buttons
    stripButtonsList: document.getElementById("strip-buttons-list"),

    // Quotes & Social
    quotesGrid: document.getElementById("quotes-grid"),
    socialChannelsGrid: document.getElementById("social-channels-grid"),

    // Reader Modal
    readerModalOverlay: document.getElementById("reader-modal-overlay"),
    readerModalContent: document.getElementById("reader-modal-content"),
    readerModalTitle: document.getElementById("reader-modal-title"),
    readerChapterName: document.getElementById("reader-chapter-name"),
    readerCloseBtn: document.getElementById("reader-close-btn"),
    readerChapterTabs: document.getElementById("reader-chapter-tabs"),
    readerBodyScroll: document.getElementById("reader-body-scroll"),
    fontSizeBtns: document.querySelectorAll(".font-btn"),
    colorDots: document.querySelectorAll(".color-dot"),

    // Bookshelf Drawer
    drawerOverlay: document.getElementById("drawer-overlay"),
    drawerCloseBtn: document.getElementById("drawer-close-btn"),
    drawerBody: document.getElementById("drawer-body"),

    // Custom Guide Modal
    guideModalOverlay: document.getElementById("guide-modal-overlay"),
    guideModalConfirmBtn: document.getElementById("guide-modal-confirm-btn"),

    // Book Detail Modal
    bookDetailOverlay: document.getElementById("book-detail-overlay"),
    detailCloseBtn: document.getElementById("detail-close-btn"),
    detailCoverImg: document.getElementById("detail-cover-img"),
    detailCategoryBadge: document.getElementById("detail-category-badge"),
    detailStatus: document.getElementById("detail-status"),
    detailReadtime: document.getElementById("detail-readtime"),
    detailEnTitle: document.getElementById("detail-en-title"),
    detailTitle: document.getElementById("detail-title"),
    detailQuote: document.getElementById("detail-quote"),
    detailSynopsis: document.getElementById("detail-synopsis"),
    detailTags: document.getElementById("detail-tags"),
    detailWords: document.getElementById("detail-words"),
    detailUpdated: document.getElementById("detail-updated"),
    detailHighlight: document.getElementById("detail-highlight"),
    detailReadBtn: document.getElementById("detail-read-btn"),
    detailSaveBtn: document.getElementById("detail-save-btn"),
    detailSaveText: document.getElementById("detail-save-text"),
    detailBook3d: document.getElementById("detail-book-3d"),

    // Admin Author Modal
    openAdminBtn: document.getElementById("open-admin-btn"),
    adminModalOverlay: document.getElementById("admin-modal-overlay"),
    adminCloseBtn: document.getElementById("admin-close-btn"),
    adminBookForm: document.getElementById("admin-book-form"),
    adminExportCodeBtn: document.getElementById("admin-export-code-btn"),
    codeExportBox: document.getElementById("code-export-box"),
    exportCodeDisplay: document.getElementById("export-code-display"),
    copyCodeSnippetBtn: document.getElementById("copy-code-snippet-btn"),
    adminLockBtn: document.getElementById("admin-lock-btn"),
    formSelectBookMode: document.getElementById("form-select-book-mode"),
    addChapterBtn: document.getElementById("add-chapter-btn"),
    chaptersListContainer: document.getElementById("chapters-list-container"),
    adminSaveBtn: document.getElementById("admin-save-btn"),
    adminPreviewBtn: document.getElementById("admin-preview-btn"),
    formCover: document.getElementById("form-cover"),
    formCoverCustom: document.getElementById("form-cover-custom"),

    // Auth Modal
    authModalOverlay: document.getElementById("auth-modal-overlay"),
    authPasscodeForm: document.getElementById("auth-passcode-form"),
    authPasscodeInput: document.getElementById("auth-passcode-input"),
    authCancelBtn: document.getElementById("auth-cancel-btn"),

    // Toast & Utilities
    toastNotice: document.getElementById("toast-notice"),
    backToTopBtn: document.getElementById("back-to-top-btn")
  };

  // ---------------------------------------------------------------------------
  // 3. 初始化入口 (Init)
  // ---------------------------------------------------------------------------
  function init() {
    loadCustomNovels();
    renderCategoryChips();
    renderFeaturedNovel(state.featuredIndex);
    setupCarouselIndicators();
    renderNovelsGrid();
    renderReservedStripButtons();
    renderGoldenQuotes();
    renderSocialCards();
    updateBookshelfBadge();
    bindGlobalEvents();
    applyInitialReaderSettings();
  }

  // ---------------------------------------------------------------------------
  // 4. 頂部分類標籤與搜索邏輯 (Navigation & Filter)
  // ---------------------------------------------------------------------------
  function renderCategoryChips() {
    DOM.categoryFilterBar.innerHTML = "";

    CATEGORIES_DATA.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = `filter-chip ${state.activeCategory === cat.id ? "active" : ""}`;
      btn.dataset.id = cat.id;

      // 計算各分類即時作品數量
      let count = 0;
      if (cat.id === "all") count = NOVELS_DATA.length;
      else if (cat.id === "featured") count = NOVELS_DATA.filter((n) => n.isFeatured).length;
      else if (cat.id === "ongoing") count = NOVELS_DATA.filter((n) => n.status === "連載中").length;
      else if (cat.id === "completed") count = NOVELS_DATA.filter((n) => n.status === "已完結").length;
      else count = NOVELS_DATA.filter((n) => {
        const catIds = Array.isArray(cat.id) ? cat.id : [cat.id];
        const nGenres = Array.isArray(n.genre) ? n.genre : [n.genre];
        const nCategories = Array.isArray(n.category) ? n.category : [n.category];
        const matchGenre = catIds.some(id => nGenres.includes(id));
        const matchCat = nCategories.some(c => c.includes(cat.label));
        const matchTag = n.tags && n.tags.includes(cat.label);
        return matchGenre || matchCat || matchTag;
      }).length;

      btn.innerHTML = `
        <span>${cat.label}</span>
        <span class="chip-count">${count}</span>
      `;

      btn.addEventListener("click", () => {
        state.activeCategory = cat.id;
        document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        applyFilterAndSearch();

        // 滾動至目錄區塊
        const catalogEl = document.getElementById("catalog-section");
        if (catalogEl && window.scrollY < 300) {
          catalogEl.scrollIntoView({ behavior: "smooth" });
        }
      });

      DOM.categoryFilterBar.appendChild(btn);
    });
  }

  function applyFilterAndSearch() {
    const q = state.searchQuery.trim().toLowerCase();

    state.filteredNovels = NOVELS_DATA.filter((novel) => {
      // 1. 分類篩選
      let matchCategory = true;
      if (state.activeCategory === "all") {
        matchCategory = true;
      } else if (state.activeCategory === "featured") {
        matchCategory = novel.isFeatured;
      } else if (state.activeCategory === "ongoing") {
        matchCategory = novel.status === "連載中";
      } else if (state.activeCategory === "completed") {
        matchCategory = novel.status === "已完結";
      } else {
        const activeCatObj = CATEGORIES_DATA.find(c => c.id === state.activeCategory);
        const catIds = activeCatObj && Array.isArray(activeCatObj.id) ? activeCatObj.id : [state.activeCategory];
        const nGenres = Array.isArray(novel.genre) ? novel.genre : [novel.genre];
        matchCategory = catIds.some(id => nGenres.includes(id)) || (novel.tags && novel.tags.includes(state.activeCategory));
      }

      // 2. 搜索關鍵字比對 (標題、英文標題、簡介、標籤、金句)
      let matchQuery = true;
      if (q) {
        const fullContent = (
          novel.title +
          " " +
          novel.enTitle +
          " " +
          novel.synopsis +
          " " +
          novel.quote +
          " " +
          novel.category +
          " " +
          novel.tags.join(" ")
        ).toLowerCase();
        matchQuery = fullContent.includes(q);
      }

      return matchCategory && matchQuery;
    });

    renderNovelsGrid();

    // 更新標頭與筆數
    const activeCatObj = CATEGORIES_DATA.find((c) => c.id === state.activeCategory);
    const catName = activeCatObj ? activeCatObj.label : "精選作品";

    if (q) {
      DOM.currentSectionTitle.textContent = `搜尋結果：包含「${q}」的作品`;
    } else {
      DOM.currentSectionTitle.textContent = state.activeCategory === "all" ? "精選全系列作品巡禮" : `主題專區：${catName}`;
    }

    DOM.resultCountLabel.textContent = `共 ${state.filteredNovels.length} 部作品`;
  }

  // ---------------------------------------------------------------------------
  // 5. 首頁主打推薦作品展示 (Hero Spotlight Carousel)
  // ---------------------------------------------------------------------------
  let isCarouselAnimating = false;

  function navigateFeatured(target, explicitDirection = null) {
    if (!state.featuredNovels || state.featuredNovels.length <= 1) return;
    if (isCarouselAnimating) return;

    const total = state.featuredNovels.length;
    let newIndex = state.featuredIndex;
    let direction = "next";

    if (target === "next") {
      newIndex = (state.featuredIndex + 1) % total;
      direction = "next";
    } else if (target === "prev") {
      newIndex = (state.featuredIndex - 1 + total) % total;
      direction = "prev";
    } else if (typeof target === "number") {
      if (target === state.featuredIndex) return;
      direction = explicitDirection || (target > state.featuredIndex ? "next" : "prev");
      newIndex = target;
    }

    state.featuredIndex = newIndex;
    renderFeaturedNovel(state.featuredIndex, direction);
  }

  function renderFeaturedNovel(index, direction = null) {
    if (!state.featuredNovels || state.featuredNovels.length === 0) return;
    const novel = state.featuredNovels[index];
    if (!novel) return;

    const infoEl = DOM.spotlightInfo;
    const bookEl = DOM.bookShowcaseWrapper;

    const updateContent = () => {
      DOM.spotlightBadge.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        本月主打推薦 · #${index + 1}
      `;
      DOM.spotlightCategory.textContent = novel.category;
      DOM.spotlightStatus.textContent = novel.status;
      DOM.spotlightReadtime.textContent = novel.readTime;
      DOM.spotlightEnTitle.textContent = novel.enTitle;
      DOM.spotlightTitle.textContent = novel.title;
      DOM.spotlightQuote.textContent = novel.quote;
      DOM.spotlightSynopsis.textContent = novel.synopsis;
      DOM.spotlightWords.textContent = novel.wordCount;
      DOM.spotlightUpdated.textContent = novel.updateDate;
      DOM.spotlightHighlight.textContent = novel.highlight;

      // 封面圖片
      DOM.spotlightCoverImg.src = novel.cover;
      DOM.spotlightCoverImg.alt = `${novel.title} 書籍封面`;

      // 書架收藏狀態
      const isSaved = state.savedBookshelf.includes(novel.id);
      updateSpotlightSaveButton(isSaved);

      // 按鈕綁定當前書籍
      DOM.spotlightReadBtn.onclick = () => openReaderModal(novel.id, 0);
      DOM.spotlightBook3d.onclick = () => openReaderModal(novel.id, 0);
      DOM.spotlightSaveBtn.onclick = () => toggleBookshelf(novel.id);

      // 更新指示點
      updateCarouselIndicators(index);
    };

    // 初次載入或無特定方向時，直接更新
    if (!direction || !infoEl || !bookEl) {
      updateContent();
      return;
    }

    isCarouselAnimating = true;

    // 出場與進場 class (依方向左右滑動)
    const exitClass = direction === "next" ? "slide-out-left" : "slide-out-right";
    const enterClass = direction === "next" ? "slide-in-right" : "slide-in-left";

    const allAnimClasses = [
      "slide-out-left",
      "slide-out-right",
      "slide-in-left",
      "slide-in-right"
    ];

    infoEl.classList.remove(...allAnimClasses);
    bookEl.classList.remove(...allAnimClasses);

    // 觸發出場左右滑動
    infoEl.classList.add(exitClass);
    bookEl.classList.add(exitClass);

    setTimeout(() => {
      // 替換各欄位文字與封面
      updateContent();

      // 切換為進場左右滑動
      infoEl.classList.remove(exitClass);
      bookEl.classList.remove(exitClass);

      infoEl.classList.add(enterClass);
      bookEl.classList.add(enterClass);

      setTimeout(() => {
        infoEl.classList.remove(enterClass);
        bookEl.classList.remove(enterClass);
        isCarouselAnimating = false;
      }, 340);
    }, 200);
  }

  function setupCarouselIndicators() {
    DOM.carouselIndicators.innerHTML = "";
    state.featuredNovels.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = `indicator-dot ${i === state.featuredIndex ? "active" : ""}`;
      dot.title = `切換至第 ${i + 1} 本推薦作品`;
      dot.addEventListener("click", () => {
        navigateFeatured(i);
      });
      DOM.carouselIndicators.appendChild(dot);
    });
  }

  function updateCarouselIndicators(activeIndex) {
    const dots = DOM.carouselIndicators.querySelectorAll(".indicator-dot");
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === activeIndex);
    });
  }

  function updateSpotlightSaveButton(isSaved) {
    if (isSaved) {
      DOM.spotlightSaveText.textContent = "已在書架";
      DOM.spotlightSaveBtn.style.color = "#3b7454";
      DOM.spotlightSaveBtn.style.borderColor = "rgba(59, 116, 84, 0.4)";
      DOM.spotlightSaveBtn.style.background = "rgba(234, 243, 237, 0.6)";
    } else {
      DOM.spotlightSaveText.textContent = "加入書架";
      DOM.spotlightSaveBtn.style.color = "var(--blue-700)";
      DOM.spotlightSaveBtn.style.borderColor = "var(--border-medium)";
      DOM.spotlightSaveBtn.style.background = "#FFFFFF";
    }
  }

  // ---------------------------------------------------------------------------
  // 6. 主題分區作品網格 (Thematic Bookshelf Grid)
  // ---------------------------------------------------------------------------
  function renderNovelsGrid() {
    DOM.novelsGrid.innerHTML = "";

    if (state.filteredNovels.length === 0) {
      DOM.novelsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; color: var(--text-muted); background: #FFFFFF; border-radius: var(--radius-lg); border: 1px dashed var(--border-medium);">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; color: var(--blue-300);">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h4 style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--text-main); margin-bottom: 6px;">暫無符合條件的作品</h4>
          <p style="font-size: 0.88rem; margin-bottom: 16px;">可以嘗試清空搜尋詞或選擇其他主題分類看看喔！</p>
          <button class="btn-secondary" id="reset-filter-btn" style="padding: 8px 18px; font-size: 0.84rem;">
            顯示全部作品
          </button>
        </div>
      `;
      const resetBtn = document.getElementById("reset-filter-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          state.activeCategory = "all";
          state.searchQuery = "";
          DOM.searchInput.value = "";
          DOM.searchClearBtn.classList.remove("visible");
          renderCategoryChips();
          applyFilterAndSearch();
        });
      }
      return;
    }

    state.filteredNovels.forEach((novel, index) => {
      const isSaved = state.savedBookshelf.includes(novel.id);
      const isHidden = index >= 6;

      const card = document.createElement("article");
      card.className = `novel-card ${isHidden ? "initially-hidden" : ""}`;
      card.innerHTML = `
        <div class="novel-card-cover-wrap">
          <img src="${novel.cover}" alt="${novel.title} 封面" class="novel-card-img" loading="lazy">
          <span class="novel-card-status-badge ${novel.status === "已完結" ? "status-completed" : "status-ongoing"}">
            ${novel.status}
          </span>
          <button class="novel-card-bookmark-btn ${isSaved ? "saved" : ""}" title="${isSaved ? "移出書架" : "收藏至書架"}" data-id="${novel.id}" aria-label="收藏作品">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${isSaved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
        <div class="novel-card-body">
          <div class="novel-card-category">${Array.isArray(novel.category) ? novel.category.join(", ") : novel.category}</div>
          <h3 class="novel-card-title">${novel.title}</h3>
          <p class="novel-card-synopsis">${novel.synopsis}</p>
          <div class="novel-card-tags">
            ${novel.tags.map((t) => `<span class="tag-badge">#${t}</span>`).join("")}
          </div>
          <div class="novel-card-footer">
            <span class="novel-card-words">${novel.wordCount}</span>
            <button class="novel-read-trigger-btn" data-id="${novel.id}">
              <span>進入試讀</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      `;

      // 點擊卡片或查看詳情按鈕進入書籍詳細資訊視窗
      const readBtn = card.querySelector(".novel-read-trigger-btn");
      readBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openBookDetailModal(novel.id);
      });

      card.addEventListener("click", () => {
        openBookDetailModal(novel.id);
      });

      // 收藏書籤按鈕
      const bookmarkBtn = card.querySelector(".novel-card-bookmark-btn");
      bookmarkBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleBookshelf(novel.id);
      });

      DOM.novelsGrid.appendChild(card);
    });

    // 如果超過 6 本，加入展開按鈕
    if (state.filteredNovels.length > 6) {
      const hiddenCount = state.filteredNovels.length - 6;
      let isExpanded = false;

      const toggleBtn = document.createElement("button");
      toggleBtn.className = "novels-expand-toggle";
      toggleBtn.innerHTML = `
        <span>展開所有作品</span>
        <span class="toggle-count">+${hiddenCount}</span>
        <span class="toggle-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      `;

      toggleBtn.addEventListener("click", () => {
        isExpanded = !isExpanded;
        const hiddenCards = DOM.novelsGrid.querySelectorAll(".initially-hidden");

        if (isExpanded) {
          hiddenCards.forEach(card => card.classList.add("revealed"));
          toggleBtn.classList.add("expanded");
          toggleBtn.querySelector("span").textContent = "收合作品列表";
          toggleBtn.querySelector(".toggle-count").style.display = "none";
        } else {
          hiddenCards.forEach(card => card.classList.remove("revealed"));
          toggleBtn.classList.remove("expanded");
          toggleBtn.querySelector("span").textContent = "展開所有作品";
          toggleBtn.querySelector(".toggle-count").style.display = "inline-block";

          // 滾動回網格頂部
          const offsetTop = DOM.novelsGrid.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
      });

      DOM.novelsGrid.appendChild(toggleBtn);
    }
  }

  // ---------------------------------------------------------------------------
  // 6.5 書籍詳細資訊視窗彈窗 (Book Detail Modal)
  // ---------------------------------------------------------------------------
  function openBookDetailModal(novelId) {
    const novel = NOVELS_DATA.find((n) => n.id === novelId);
    if (!novel) return;

    DOM.detailCoverImg.src = novel.cover;
    DOM.detailCoverImg.alt = `${novel.title} 書籍封面`;

    const catStr = Array.isArray(novel.category) ? novel.category.join(" / ") : novel.category;
    DOM.detailCategoryBadge.textContent = catStr;
    DOM.detailStatus.textContent = novel.status;
    DOM.detailReadtime.textContent = novel.readTime;
    DOM.detailEnTitle.textContent = novel.enTitle || "";
    DOM.detailTitle.textContent = novel.title;
    DOM.detailQuote.textContent = novel.quote || "";
    DOM.detailSynopsis.textContent = novel.synopsis || "";
    DOM.detailWords.textContent = `原著字數：${novel.wordCount}`;
    DOM.detailUpdated.textContent = `最近更新：${novel.updateDate}`;
    DOM.detailHighlight.textContent = novel.highlight || "讀者極力推薦作品";

    DOM.detailTags.innerHTML = (novel.tags || [])
      .map((t) => `<span class="tag-badge">#${t}</span>`)
      .join("");

    const isSaved = state.savedBookshelf.includes(novel.id);
    updateDetailSaveButton(isSaved);

    // 點擊「立即開始試讀」或 3D 封面進入試讀模式
    DOM.detailReadBtn.onclick = () => {
      closeBookDetailModal();
      openReaderModal(novel.id, 0);
    };
    if (DOM.detailBook3d) {
      DOM.detailBook3d.onclick = () => {
        closeBookDetailModal();
        openReaderModal(novel.id, 0);
      };
    }
    // 點擊「加入/移出書架」
    DOM.detailSaveBtn.onclick = () => {
      toggleBookshelf(novel.id);
      const nowSaved = state.savedBookshelf.includes(novel.id);
      updateDetailSaveButton(nowSaved);
    };

    DOM.bookDetailOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeBookDetailModal() {
    DOM.bookDetailOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  function updateDetailSaveButton(isSaved) {
    if (isSaved) {
      DOM.detailSaveText.textContent = "已在書架";
      DOM.detailSaveBtn.style.color = "#3b7454";
      DOM.detailSaveBtn.style.borderColor = "rgba(59, 116, 84, 0.4)";
      DOM.detailSaveBtn.style.background = "rgba(234, 243, 237, 0.6)";
    } else {
      DOM.detailSaveText.textContent = "加入書架";
      DOM.detailSaveBtn.style.color = "var(--blue-700)";
      DOM.detailSaveBtn.style.borderColor = "var(--border-medium)";
      DOM.detailSaveBtn.style.background = "#FFFFFF";
    }
  }

  // ---------------------------------------------------------------------------
  // 6.7 作者視覺化作品管理視窗 (Author Book Admin Modal)
  // ---------------------------------------------------------------------------
  function loadCustomNovels() {
    try {
      // 1. 優先載入包含修改後排序與屬性的全站作品狀態
      const savedAllNovels = JSON.parse(localStorage.getItem("aether_all_novels_v2") || "[]");
      if (savedAllNovels && savedAllNovels.length > 0) {
        savedAllNovels.forEach((sn) => {
          const titleKey = (sn.title || "").trim().toLowerCase();
          const existingIdx = NOVELS_DATA.findIndex((n) => n.id === sn.id || (n.title && n.title.trim().toLowerCase() === titleKey));
          if (existingIdx !== -1) {
            NOVELS_DATA[existingIdx] = { ...NOVELS_DATA[existingIdx], ...sn };
          } else {
            NOVELS_DATA.push(sn);
          }
        });
      }

      // 2. 舊版自訂作品相容載入
      const customNovels = JSON.parse(localStorage.getItem("aether_custom_novels") || "[]");
      customNovels.forEach((cn) => {
        const titleKey = (cn.title || "").trim().toLowerCase();
        if (!NOVELS_DATA.some((n) => n.id === cn.id || (n.title && n.title.trim().toLowerCase() === titleKey))) {
          NOVELS_DATA.unshift(cn);
        }
      });

      deduplicateNovelsData();
      NOVELS_DATA.sort((a, b) => (Number(a.featuredRank) || 999) - (Number(b.featuredRank) || 999));
      state.featuredNovels = NOVELS_DATA.filter((n) => n.isFeatured);
      if (state.featuredNovels.length === 0 && NOVELS_DATA.length > 0) {
        state.featuredNovels = [NOVELS_DATA[0]];
      }
      state.filteredNovels = [...NOVELS_DATA];
    } catch (e) {
      console.warn("Custom novels load error", e);
    }
  }

  function openAdminModal() {
    if (state.isAuthorAuthenticated) {
      populateBookSelectOptions();
      resetOrLoadBookForm("__NEW__");
      DOM.adminModalOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
    } else {
      openAuthModal();
    }
  }

  const KNOWN_COVER_FILES = [
    { value: "assets/images/cover_default.jpg", label: "預設通用封面 (本書暫無圖片)" },
    { value: "assets/images/cover_sea.jpg", label: "蒼藍海面風格 (cover_sea.jpg)" },
    { value: "assets/images/cover_coffee_at_edge.jpg", label: "時間盡頭咖啡館 (cover_coffee_at_edge.jpg)" },
    { value: "assets/images/cover_hakaniwa_1.jpg", label: "箱庭第一部：為了小小的幸福 (cover_hakaniwa_1.jpg)" },
    { value: "assets/images/cover_hakaniwa_2.jpg", label: "箱庭第二部：石竹的永恆之旅 (cover_hakaniwa_2.jpg)" },
    { value: "assets/images/cover_hakaniwa_3.jpg", label: "箱庭第三部：生命之神與雪之精靈 (cover_hakaniwa_3.jpg)" },
    { value: "assets/images/cover_stars.jpg", label: "星空微光風格 (cover_stars.jpg)" },
    { value: "assets/images/cover_city.jpg", label: "都會沉靜風格 (cover_city.jpg)" },
    { value: "assets/images/cover_quiet.jpg", label: "溫暖紙質風格 (cover_quiet.jpg)" }
  ];

  function populateCoverSelectOptions(selectedVal = "") {
    if (!DOM.formCover) return;
    DOM.formCover.innerHTML = "";

    const allCoversSet = new Map();
    KNOWN_COVER_FILES.forEach((c) => allCoversSet.set(c.value, c.label));

    // 自動整合 NOVELS_DATA 中出現的所有封面檔名
    NOVELS_DATA.forEach((n) => {
      if (n.cover && !allCoversSet.has(n.cover)) {
        const filename = n.cover.split("/").pop() || n.cover;
        allCoversSet.set(n.cover, `${filename} (${n.cover})`);
      }
    });

    allCoversSet.forEach((label, val) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = label;
      DOM.formCover.appendChild(opt);
    });

    // 加上自訂選項
    const customOpt = document.createElement("option");
    customOpt.value = "__CUSTOM__";
    customOpt.textContent = "[輸入自訂圖片路徑 / 網址...]";
    DOM.formCover.appendChild(customOpt);

    const targetVal = selectedVal || "assets/images/cover_default.jpg";
    if (allCoversSet.has(targetVal)) {
      DOM.formCover.value = targetVal;
      if (DOM.formCoverCustom) DOM.formCoverCustom.style.display = "none";
    } else {
      DOM.formCover.value = "__CUSTOM__";
      if (DOM.formCoverCustom) {
        DOM.formCoverCustom.style.display = "block";
        DOM.formCoverCustom.value = targetVal;
      }
    }
  }

  function populateBookSelectOptions() {
    if (!DOM.formSelectBookMode) return;
    DOM.formSelectBookMode.innerHTML = `<option value="__NEW__">[新增全新作品]</option>`;
    NOVELS_DATA.forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n.id;
      opt.textContent = `編輯：《${n.title}》(${n.status})`;
      DOM.formSelectBookMode.appendChild(opt);
    });
  }

  function resetOrLoadBookForm(bookId) {
    DOM.adminBookForm.reset();
    DOM.chaptersListContainer.innerHTML = "";

    if (bookId === "__NEW__") {
      if (DOM.adminSaveBtn) DOM.adminSaveBtn.querySelector("span").textContent = "網頁即時新增與預覽";
      const isFeaturedEl = document.getElementById("form-isFeatured");
      if (isFeaturedEl) isFeaturedEl.value = "false";
      const featuredRankEl = document.getElementById("form-featuredRank");
      if (featuredRankEl) featuredRankEl.value = NOVELS_DATA.length + 1;
      populateCoverSelectOptions("assets/images/cover_default.jpg");
      addChapterEditCard("第一章 · 篇名", "");
    } else {
      const novel = NOVELS_DATA.find((n) => n.id === bookId);
      if (!novel) return;

      if (DOM.adminSaveBtn) DOM.adminSaveBtn.querySelector("span").textContent = `儲存《${novel.title}》修改與預覽`;

      document.getElementById("form-title").value = novel.title || "";
      document.getElementById("form-enTitle").value = novel.enTitle || "";
      document.getElementById("form-category").value = Array.isArray(novel.category) ? novel.category.join(", ") : (novel.category || "");
      document.getElementById("form-status").value = novel.status || "連載中";
      document.getElementById("form-wordCount").value = novel.wordCount || "";
      document.getElementById("form-readTime").value = novel.readTime || "";

      const isFeaturedEl = document.getElementById("form-isFeatured");
      if (isFeaturedEl) isFeaturedEl.value = novel.isFeatured ? "true" : "false";

      const featuredRankEl = document.getElementById("form-featuredRank");
      if (featuredRankEl) featuredRankEl.value = novel.featuredRank !== undefined ? novel.featuredRank : 1;

      document.getElementById("form-tags").value = (novel.tags || []).join(", ");
      document.getElementById("form-quote").value = novel.quote || "";
      document.getElementById("form-synopsis").value = novel.synopsis || "";
      document.getElementById("form-highlight").value = novel.highlight || "";

      populateCoverSelectOptions(novel.cover || "assets/images/cover_default.jpg");

      if (novel.chapters && novel.chapters.length > 0) {
        novel.chapters.forEach((chap) => {
          addChapterEditCard(chap.title, chap.content);
        });
      } else {
        addChapterEditCard("第一章", "");
      }
    }
  }

  function addChapterEditCard(title = "", content = "") {
    const chapterCount = DOM.chaptersListContainer.querySelectorAll(".chapter-edit-card").length + 1;

    const card = document.createElement("div");
    card.className = "chapter-edit-card";
    card.innerHTML = `
      <div class="chapter-card-header">
        <span class="chapter-number-tag">章節 #${chapterCount}</span>
        <button type="button" class="remove-ch-btn" title="刪除此章">✕ 刪除此章</button>
      </div>
      <div class="form-group">
        <label class="form-label" style="font-size: 0.8rem;">章節標題</label>
        <input type="text" class="form-input ch-title-input" placeholder="例如：第 ${chapterCount} 章 · 篇名" value="${escapeHtml(title)}">
      </div>
      <div class="form-group">
        <label class="form-label" style="font-size: 0.8rem;">章節試讀正文段落</label>
        <textarea class="form-textarea ch-content-textarea" rows="4" placeholder="在此貼上試讀文章段落...">${escapeHtml(content)}</textarea>
      </div>
    `;

    const removeBtn = card.querySelector(".remove-ch-btn");
    removeBtn.addEventListener("click", () => {
      const allCards = DOM.chaptersListContainer.querySelectorAll(".chapter-edit-card");
      if (allCards.length <= 1) {
        showToast("請至少保留一個試讀章節！");
        return;
      }
      card.remove();
      updateChapterNumberTags();
    });

    DOM.chaptersListContainer.appendChild(card);
  }

  function updateChapterNumberTags() {
    const cards = DOM.chaptersListContainer.querySelectorAll(".chapter-edit-card");
    cards.forEach((card, idx) => {
      const tag = card.querySelector(".chapter-number-tag");
      if (tag) tag.textContent = `章節 #${idx + 1}`;
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function openAuthModal() {
    if (DOM.authPasscodeInput) DOM.authPasscodeInput.value = "";
    DOM.authModalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      if (DOM.authPasscodeInput) DOM.authPasscodeInput.focus();
    }, 100);
  }

  function closeAuthModal() {
    DOM.authModalOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  function handleAuthSubmit(e) {
    e.preventDefault();
    const inputPass = DOM.authPasscodeInput.value.trim();
    if (inputPass === state.authorPasscode || inputPass === "rieru0314") {
      state.isAuthorAuthenticated = true;
      localStorage.setItem("aether_author_auth", "true");
      closeAuthModal();
      openAdminModal();
      showToast("歡迎回歸，作者身份解鎖成功！");
    } else {
      showToast("密碼不正確！僅限作者本人使用");
      DOM.authPasscodeInput.value = "";
      DOM.authPasscodeInput.focus();
    }
  }

  function handleAdminLock() {
    state.isAuthorAuthenticated = false;
    localStorage.removeItem("aether_author_auth");
    closeAdminModal();
    showToast("已成功登出作者狀態");
  }

  function closeAdminModal() {
    DOM.adminModalOverlay.classList.remove("open");
    document.body.style.overflow = "";
    DOM.codeExportBox.style.display = "none";
  }

  function getFormNovelData() {
    const title = document.getElementById("form-title").value.trim();
    if (!title) return null;

    const mode = DOM.formSelectBookMode ? DOM.formSelectBookMode.value : "__NEW__";
    const existingNovel = mode !== "__NEW__" ? NOVELS_DATA.find((n) => n.id === mode) : null;

    const enTitle = document.getElementById("form-enTitle").value.trim() || title;
    const category = document.getElementById("form-category").value.trim() || "原創作品";
    const status = document.getElementById("form-status").value;
    const wordCount = document.getElementById("form-wordCount").value.trim() || "未填寫";
    const readTime = document.getElementById("form-readTime").value.trim() || "約 1 小時";

    const isFeaturedEl = document.getElementById("form-isFeatured");
    const isFeatured = isFeaturedEl ? isFeaturedEl.value === "true" : (existingNovel ? existingNovel.isFeatured : false);

    const featuredRankEl = document.getElementById("form-featuredRank");
    const featuredRankVal = featuredRankEl ? parseInt(featuredRankEl.value, 10) : NaN;
    const featuredRank = !isNaN(featuredRankVal) && featuredRankVal > 0
      ? featuredRankVal
      : (existingNovel && existingNovel.featuredRank ? existingNovel.featuredRank : NOVELS_DATA.length + 1);

    const tagsStr = document.getElementById("form-tags").value.trim();
    const tags = tagsStr ? tagsStr.split(/[,，]\s*/).filter(Boolean) : ["原創"];
    const quote = document.getElementById("form-quote").value.trim() || "「......」";
    const synopsis = document.getElementById("form-synopsis").value.trim() || "暫無故事簡介。";
    const highlight = document.getElementById("form-highlight").value.trim() || "作者推薦原創作品";

    let cover = DOM.formCover ? DOM.formCover.value : "assets/images/cover_default.jpg";
    if (cover === "__CUSTOM__") {
      cover = DOM.formCoverCustom ? DOM.formCoverCustom.value.trim() : "assets/images/cover_default.jpg";
      if (!cover) cover = "assets/images/cover_default.jpg";
    }

    // 獨立保留內部分類 genre (避免連鎖覆蓋主題分類如 fanfic / fantasy / essay)
    let genre = existingNovel ? existingNovel.genre : null;
    if (!genre) {
      if (category.includes("同人")) {
        genre = "fanfic";
      } else if (category.includes("散文") || category.includes("生活")) {
        genre = "essay";
      } else if (category.includes("懸疑") || category.includes("都會")) {
        genre = "mystery";
      } else {
        genre = ["original", "novel", "fantasy"];
      }
    }

    // 收集所有章節
    const chapterCards = DOM.chaptersListContainer.querySelectorAll(".chapter-edit-card");
    const chapters = Array.from(chapterCards).map((card, idx) => {
      const chTitle = card.querySelector(".ch-title-input").value.trim() || `第 ${idx + 1} 章`;
      const chContent = card.querySelector(".ch-content-textarea").value.trim() || "（內容準備中...）";
      return {
        id: `ch-${idx + 1}`,
        title: chTitle,
        content: chContent
      };
    });

    const id = existingNovel ? existingNovel.id : "novel-" + Date.now().toString(36);

    return {
      id,
      title,
      enTitle,
      category,
      genre,
      status,
      wordCount,
      readTime,
      updateDate: new Date().toISOString().split("T")[0],
      cover,
      accentColor: existingNovel ? existingNovel.accentColor : "#D6E4EE",
      tags,
      isFeatured,
      featuredRank,
      quote,
      synopsis,
      highlight,
      chapters
    };
  }

  function deduplicateNovelsData() {
    const seenTitles = new Map();
    const cleanList = [];

    NOVELS_DATA.forEach((novel) => {
      if (!novel || !novel.title) return;
      const titleKey = novel.title.trim().toLowerCase();

      if (!seenTitles.has(titleKey)) {
        seenTitles.set(titleKey, novel);
        cleanList.push(novel);
      } else {
        const existingIdx = cleanList.findIndex((n) => (n.title || "").trim().toLowerCase() === titleKey);
        if (existingIdx !== -1) {
          cleanList[existingIdx] = { ...cleanList[existingIdx], ...novel };
        }
      }
    });

    NOVELS_DATA.length = 0;
    NOVELS_DATA.push(...cleanList);
  }

  function saveOrUpdateNovelInState(novel) {
    const mode = DOM.formSelectBookMode ? DOM.formSelectBookMode.value : "__NEW__";
    const titleKey = (novel.title || "").trim().toLowerCase();

    let existingIndex = -1;
    if (mode !== "__NEW__") {
      existingIndex = NOVELS_DATA.findIndex((n) => n.id === mode);
    }
    if (existingIndex === -1 && titleKey) {
      existingIndex = NOVELS_DATA.findIndex((n) => (n.title || "").trim().toLowerCase() === titleKey);
    }

    if (existingIndex !== -1) {
      const oldId = NOVELS_DATA[existingIndex].id;
      novel.id = oldId;
      NOVELS_DATA[existingIndex] = novel;
    } else {
      NOVELS_DATA.unshift(novel);
    }

    deduplicateNovelsData();

    // 依據展示順序 (featuredRank) 重新遞增排序 (1, 2, 3...)
    NOVELS_DATA.sort((a, b) => (Number(a.featuredRank) || 999) - (Number(b.featuredRank) || 999));
    state.featuredNovels = NOVELS_DATA.filter((n) => n.isFeatured);
    if (state.featuredNovels.length === 0 && NOVELS_DATA.length > 0) {
      state.featuredNovels = [NOVELS_DATA[0]];
    }
    state.filteredNovels = [...NOVELS_DATA];

    try {
      // 完整保存包含預設作品變更與自訂作品在內的所有書籍狀態與排序
      localStorage.setItem("aether_all_novels_v2", JSON.stringify(NOVELS_DATA));
      const customNovels = NOVELS_DATA.filter((n) => n.id.startsWith("novel-"));
      localStorage.setItem("aether_custom_novels", JSON.stringify(customNovels));
    } catch (err) {
      console.warn("Failed to save custom novel to localStorage", err);
    }

    return novel;
  }

  function handleAdminSubmit(e) {
    e.preventDefault();
    const rawNovel = getFormNovelData();
    if (!rawNovel) return;

    const novel = saveOrUpdateNovelInState(rawNovel);
    showToast(`《${novel.title}》已更新至最新內容！`);

    // 重新更新背景網格與主題標籤與輪播
    renderCategoryChips();
    setupCarouselIndicators();
    renderFeaturedNovel(0);
    renderNovelsGrid();

    // 刷新後台選單選項，並選取該書
    populateBookSelectOptions();
    if (DOM.formSelectBookMode) {
      DOM.formSelectBookMode.value = novel.id;
      resetOrLoadBookForm(novel.id);
    }

    // 按鈕提供短暫儲存成功視覺反饋
    if (DOM.adminSaveBtn) {
      const span = DOM.adminSaveBtn.querySelector("span");
      if (span) span.textContent = "✓ 儲存成功！";
      DOM.adminSaveBtn.style.background = "#3b7454";

      setTimeout(() => {
        if (span) span.textContent = `儲存作品內容 (網頁即時生效)`;
        DOM.adminSaveBtn.style.background = "";
      }, 1800);
    }
  }

  function handleAdminPreview() {
    const rawNovel = getFormNovelData();
    if (!rawNovel) {
      showToast("請至少填寫作品名稱！");
      return;
    }

    const novel = saveOrUpdateNovelInState(rawNovel);

    renderCategoryChips();
    setupCarouselIndicators();
    renderNovelsGrid();
    renderFeaturedNovel(0);

    closeAdminModal();
    openBookDetailModal(novel.id);
    showToast(`正在預覽《${novel.title}》讀者視角`);
  }

  function handleAdminCodeExport() {
    const novel = getFormNovelData();
    if (!novel) {
      showToast("請至少填寫作品名稱！");
      return;
    }

    const formattedChapters = novel.chapters.map((ch) => `      {
        id: "${ch.id}",
        title: "${ch.title}",
        content: \`${ch.content}\`
      }`).join(",\n");

    const codeSnippet = `  {
    id: "${novel.id}",
    title: "${novel.title}",
    enTitle: "${novel.enTitle}",
    category: "${novel.category}",
    genre: ${JSON.stringify(novel.genre)},
    status: "${novel.status}",
    wordCount: "${novel.wordCount}",
    readTime: "${novel.readTime}",
    updateDate: "${novel.updateDate}",
    cover: "${novel.cover}",
    accentColor: "${novel.accentColor}",
    tags: ${JSON.stringify(novel.tags)},
    isFeatured: ${novel.isFeatured},
    featuredRank: ${novel.featuredRank},
    quote: \`${novel.quote}\`,
    synopsis: \`${novel.synopsis}\`,
    highlight: "${novel.highlight}",
    chapters: [
${formattedChapters}
    ]
  },`;

    DOM.exportCodeDisplay.textContent = codeSnippet;
    DOM.codeExportBox.style.display = "block";
    DOM.codeExportBox.scrollIntoView({ behavior: "smooth" });

    copyToClipboard(codeSnippet);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast("已複製 JavaScript 程式碼！可以直接貼至 data.js");
      }).catch(() => {
        showToast("請直接手動選取下方文字框進行複製");
      });
    } else {
      showToast("請直接手動選取下方文字框進行複製");
    }
  }
  function renderReservedStripButtons() {
    DOM.stripButtonsList.innerHTML = "";

    RESERVED_STRIP_BUTTONS.forEach((item) => {
      const isPlaceholder = item.tagColor === "dashed" || item.id === "btn-placeholder-custom";
      const btn = document.createElement("div");
      btn.className = `strip-button ${isPlaceholder ? "placeholder-style" : ""}`;
      btn.dataset.id = item.id;

      // SVG 圖標切換
      let iconSvg = "";
      if (item.icon === "compass") {
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`;
      } else if (item.icon === "book-open") {
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;
      } else if (item.icon === "message-circle") {
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
      } else {
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
      }

      btn.innerHTML = `
        <div class="strip-button-left">
          <div class="strip-icon-box">
            ${iconSvg}
          </div>
          <div class="strip-text-content">
            <div class="strip-tag-row">
              <span class="strip-tag-pill">${item.tag}</span>
              <span class="strip-badge-note">${item.badge}</span>
            </div>
            <h4 class="strip-main-title">${item.title}</h4>
            <p class="strip-subtitle">${item.subtitle}</p>
          </div>
        </div>
        <div class="strip-button-right">
          <span class="strip-action-text">${item.linkText}</span>
          <div class="strip-arrow-circle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      `;

      btn.addEventListener("click", () => {
        if (isPlaceholder) {
          openGuideModal();
        } else {
          showToast(`已點選：${item.title}（已為您預留功能，可隨時替換目標頁面）`);
        }
      });

      DOM.stripButtonsList.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------------------
  // 8. 書摘金句渲染與複製 (Quotes)
  // ---------------------------------------------------------------------------
  function renderGoldenQuotes() {
    DOM.quotesGrid.innerHTML = "";

    NOVEL_QUOTES.forEach((q) => {
      const card = document.createElement("div");
      card.className = "quote-card";
      card.innerHTML = `
        <div class="quote-mark">“</div>
        <p class="quote-card-text">${q.text}</p>
        <div class="quote-card-footer">
          <span>${q.source} · ${q.chapter}</span>
          <button class="quote-copy-btn" title="複製此段金句">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>複製</span>
          </button>
        </div>
      `;

      const copyBtn = card.querySelector(".quote-copy-btn");
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`「${q.text}」——${q.source}`).then(() => {
          showToast("已複製金句到剪貼簿！");
        }).catch(() => {
          showToast("已成功選取金句！");
        });
      });

      DOM.quotesGrid.appendChild(card);
    });
  }

  // ---------------------------------------------------------------------------
  // 9. 底部社群帳號卡片 (Social Channels Hub)
  // 「網頁最底列是羅列社群帳號的地方，方便有興趣的讀者去追蹤」
  // ---------------------------------------------------------------------------
  function renderSocialCards() {
    DOM.socialChannelsGrid.innerHTML = "";

    SOCIAL_ACCOUNTS.forEach((account) => {
      const card = document.createElement("a");
      card.className = "social-card";
      card.href = account.link;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.title = `點擊追蹤 ${account.name}`;

      card.innerHTML = `
        <div class="social-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            ${account.iconSvg}
          </svg>
        </div>
        <div class="social-card-info">
          <div class="social-card-name">
            <span>${account.name}</span>
            <span class="social-card-badge">${account.badge}</span>
          </div>
          <span class="social-card-handle">${account.handle}</span>
          <span class="social-card-role">${account.role}</span>
        </div>
        <div class="social-card-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      `;

      card.addEventListener("click", (e) => {
        // 如果是郵箱則預設 mailto
        if (account.id === "email") return;
        showToast(`正在前往 ${account.name} 追蹤頁面...`);
      });

      DOM.socialChannelsGrid.appendChild(card);
    });
  }

  // ---------------------------------------------------------------------------
  // 10. 沉浸式小說試讀彈窗 (Immersive Reader Modal)
  // ---------------------------------------------------------------------------
  function openReaderModal(novelId, chapterIndex = 0) {
    const novel = NOVELS_DATA.find((n) => n.id === novelId);
    if (!novel || !novel.chapters || novel.chapters.length === 0) {
      showToast("該作品章節準備中，敬請期待！");
      return;
    }

    state.activeReaderBook = novel;
    state.activeReaderChapterIndex = chapterIndex;

    DOM.readerModalTitle.textContent = novel.title;
    renderReaderChapters(novel, chapterIndex);
    loadChapterContent(novel, chapterIndex);

    DOM.readerModalOverlay.classList.add("open");
    document.body.style.overflow = "hidden"; // 防止底層滾動
  }

  function renderReaderChapters(novel, activeIndex) {
    DOM.readerChapterTabs.innerHTML = "";

    novel.chapters.forEach((chap, idx) => {
      const btn = document.createElement("button");
      btn.className = `chapter-tab-pill ${idx === activeIndex ? "active" : ""}`;
      btn.textContent = chap.title.split(" · ")[0] || `第 ${idx + 1} 章`;
      btn.title = chap.title;

      btn.addEventListener("click", () => {
        state.activeReaderChapterIndex = idx;
        document.querySelectorAll(".chapter-tab-pill").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        loadChapterContent(novel, idx);
      });

      DOM.readerChapterTabs.appendChild(btn);
    });
  }

  function loadChapterContent(novel, chapterIndex) {
    const chapter = novel.chapters[chapterIndex];
    if (!chapter) return;

    DOM.readerChapterName.textContent = chapter.title;

    // 將段落包裝為 <p> 標籤
    const paragraphs = chapter.content
      .split("\n\n")
      .filter((p) => p.trim())
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");

    DOM.readerBodyScroll.innerHTML = `
      <div style="margin-bottom: 24px; text-align: center; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 16px;">
        <h2 style="font-size: 1.4rem; color: var(--blue-800); font-family: var(--font-serif);">${chapter.title}</h2>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">《${novel.title}》· 作者：${novel.author || "晨星"}</div>
      </div>
      ${paragraphs}
      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border-subtle); text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        ── 本章試閱完畢 · 歡迎追蹤社群接收最新連載 ──
      </div>
    `;

    DOM.readerBodyScroll.scrollTop = 0;
  }

  function closeReaderModal() {
    DOM.readerModalOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  // ---------------------------------------------------------------------------
  // 11. 我的書架收藏與側邊抽屜 (Bookshelf)
  // ---------------------------------------------------------------------------
  function toggleBookshelf(novelId) {
    const idx = state.savedBookshelf.indexOf(novelId);
    let isNowSaved = false;

    if (idx > -1) {
      state.savedBookshelf.splice(idx, 1);
      isNowSaved = false;
      showToast("已從書架移除作品");
    } else {
      state.savedBookshelf.push(novelId);
      isNowSaved = true;
      showToast("已將作品加入我的收藏書架！");
    }

    localStorage.setItem("aether_bookshelf", JSON.stringify(state.savedBookshelf));
    updateBookshelfBadge();

    // 更新 Hero 按鈕狀態
    if (state.featuredNovels[state.featuredIndex]?.id === novelId) {
      updateSpotlightSaveButton(isNowSaved);
    }

    // 重新渲染目錄卡片的收藏圖示
    renderNovelsGrid();
    renderBookshelfDrawer();
  }

  function updateBookshelfBadge() {
    DOM.shelfCountBadge.textContent = state.savedBookshelf.length;
  }

  function openBookshelfDrawer() {
    renderBookshelfDrawer();
    DOM.drawerOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeBookshelfDrawer() {
    DOM.drawerOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  function renderBookshelfDrawer() {
    DOM.drawerBody.innerHTML = "";

    if (state.savedBookshelf.length === 0) {
      DOM.drawerBody.innerHTML = `
        <div class="empty-shelf-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; color: var(--blue-300);">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <p style="font-size: 0.95rem; color: var(--text-main); font-weight: 500;">書架目前是空的</p>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">點擊任何作品卡片上的書籤圖標，即可加入收藏以便隨時閱讀。</p>
        </div>
      `;
      return;
    }

    const savedNovels = NOVELS_DATA.filter((n) => state.savedBookshelf.includes(n.id));

    savedNovels.forEach((novel) => {
      const item = document.createElement("div");
      item.className = "drawer-book-item";
      item.innerHTML = `
        <img src="${novel.cover}" alt="${novel.title}" class="drawer-book-thumb">
        <div class="drawer-book-meta">
          <span class="drawer-book-genre">${novel.category} · ${novel.status}</span>
          <span class="drawer-book-title">${novel.title}</span>
        </div>
        <button class="remove-saved-btn" title="移出書架" style="color: var(--text-light); padding: 4px;" aria-label="移除">
          ✕
        </button>
      `;

      item.querySelector(".drawer-book-meta").addEventListener("click", () => {
        closeBookshelfDrawer();
        openReaderModal(novel.id, 0);
      });

      item.querySelector(".remove-saved-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleBookshelf(novel.id);
      });

      DOM.drawerBody.appendChild(item);
    });
  }

  // ---------------------------------------------------------------------------
  // 12. 自訂指引彈窗 (Customization Guide Modal)
  // ---------------------------------------------------------------------------
  function openGuideModal() {
    DOM.guideModalOverlay.classList.add("open");
  }

  function closeGuideModal() {
    DOM.guideModalOverlay.classList.remove("open");
  }

  // ---------------------------------------------------------------------------
  // 13. 輔助提示與字級色彩切換 (Toast & Reader settings)
  // ---------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    DOM.toastNotice.textContent = message;
    DOM.toastNotice.classList.add("show");

    toastTimer = setTimeout(() => {
      DOM.toastNotice.classList.remove("show");
    }, 2800);
  }

  function applyInitialReaderSettings() {
    // 字級
    DOM.readerBodyScroll.className = `reader-body-scroll font-${state.readerFontSize}`;
    DOM.fontSizeBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.size === state.readerFontSize);
    });

    // 主題
    DOM.readerModalContent.className = `reader-modal-content ${state.readerTheme}`;
    DOM.colorDots.forEach((dot) => {
      dot.classList.toggle("active", dot.dataset.theme === state.readerTheme);
    });
  }

  // ---------------------------------------------------------------------------
  // 14. 全域監聽事件綁定 (Global Event Listeners)
  // ---------------------------------------------------------------------------
  function bindGlobalEvents() {
    // 搜索輸入即時監聽
    DOM.searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      DOM.searchClearBtn.classList.toggle("visible", state.searchQuery.length > 0);
      applyFilterAndSearch();
    });

    // 清空搜尋按鈕
    DOM.searchClearBtn.addEventListener("click", () => {
      state.searchQuery = "";
      DOM.searchInput.value = "";
      DOM.searchClearBtn.classList.remove("visible");
      applyFilterAndSearch();
      DOM.searchInput.focus();
    });

    // Logo 返回首頁頂部
    DOM.brandLogo.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // 輪播左右箭頭
    DOM.prevFeaturedBtn.addEventListener("click", () => {
      navigateFeatured("prev");
    });

    DOM.nextFeaturedBtn.addEventListener("click", () => {
      navigateFeatured("next");
    });

    // 觸控手勢左右滑動支援 (Touch Swipe Support)
    let touchStartX = 0;
    let touchStartY = 0;
    DOM.spotlightCard.addEventListener("touchstart", (e) => {
      if (!e.touches || e.touches.length === 0) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    DOM.spotlightCard.addEventListener("touchend", (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
        if (diffX < 0) {
          navigateFeatured("next");
        } else {
          navigateFeatured("prev");
        }
      }
    }, { passive: true });

    // 鍵盤左右方向鍵切換 (當聚焦或瀏覽首頁推薦時)
    document.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (document.getElementById("reader-modal-overlay")?.classList.contains("active")) return;
      if (document.getElementById("bookshelf-drawer")?.classList.contains("active")) return;
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;

      const rect = DOM.spotlightCard.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === "ArrowRight") navigateFeatured("next");
        else if (e.key === "ArrowLeft") navigateFeatured("prev");
      }
    });

    // 書架開關
    DOM.openBookshelfBtn.addEventListener("click", openBookshelfDrawer);
    DOM.drawerCloseBtn.addEventListener("click", closeBookshelfDrawer);
    DOM.drawerOverlay.addEventListener("click", (e) => {
      if (e.target === DOM.drawerOverlay) closeBookshelfDrawer();
    });

    // 閱讀窗關閉
    DOM.readerCloseBtn.addEventListener("click", closeReaderModal);
    DOM.readerModalOverlay.addEventListener("click", (e) => {
      if (e.target === DOM.readerModalOverlay) closeReaderModal();
    });

    // 閱讀字級調整
    DOM.fontSizeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const size = btn.dataset.size;
        state.readerFontSize = size;
        localStorage.setItem("aether_font_size", size);
        DOM.fontSizeBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        DOM.readerBodyScroll.className = `reader-body-scroll font-${size}`;
      });
    });

    // 閱讀主題背景切換
    DOM.colorDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const theme = dot.dataset.theme;
        state.readerTheme = theme;
        localStorage.setItem("aether_reader_theme", theme);
        DOM.colorDots.forEach((d) => d.classList.remove("active"));
        dot.classList.add("active");
        DOM.readerModalContent.className = `reader-modal-content ${theme}`;
      });
    });

    // 自訂導引關閉
    DOM.guideModalConfirmBtn.addEventListener("click", closeGuideModal);
    DOM.guideModalOverlay.addEventListener("click", (e) => {
      if (e.target === DOM.guideModalOverlay) closeGuideModal();
    });

    // 書籍詳細資訊視窗關閉
    DOM.detailCloseBtn.addEventListener("click", closeBookDetailModal);
    DOM.bookDetailOverlay.addEventListener("click", (e) => {
      if (e.target === DOM.bookDetailOverlay) closeBookDetailModal();
    });

    // 作者管理後台關閉與提交
    if (DOM.openAdminBtn) DOM.openAdminBtn.addEventListener("click", openAdminModal);
    if (DOM.adminCloseBtn) DOM.adminCloseBtn.addEventListener("click", closeAdminModal);
    if (DOM.adminModalOverlay) {
      DOM.adminModalOverlay.addEventListener("click", (e) => {
        if (e.target === DOM.adminModalOverlay) closeAdminModal();
      });
    }
    if (DOM.adminBookForm) DOM.adminBookForm.addEventListener("submit", handleAdminSubmit);
    if (DOM.adminPreviewBtn) DOM.adminPreviewBtn.addEventListener("click", handleAdminPreview);
    if (DOM.adminExportCodeBtn) DOM.adminExportCodeBtn.addEventListener("click", handleAdminCodeExport);
    if (DOM.copyCodeSnippetBtn) {
      DOM.copyCodeSnippetBtn.addEventListener("click", () => {
        copyToClipboard(DOM.exportCodeDisplay.textContent);
      });
    }

    // 作者解鎖與登入事件
    if (DOM.authPasscodeForm) DOM.authPasscodeForm.addEventListener("submit", handleAuthSubmit);
    if (DOM.authCancelBtn) DOM.authCancelBtn.addEventListener("click", closeAuthModal);
    if (DOM.authModalOverlay) {
      DOM.authModalOverlay.addEventListener("click", (e) => {
        if (e.target === DOM.authModalOverlay) closeAuthModal();
      });
    }
    if (DOM.adminLockBtn) DOM.adminLockBtn.addEventListener("click", handleAdminLock);

    // 選擇封面切換事件
    if (DOM.formCover) {
      DOM.formCover.addEventListener("change", (e) => {
        if (e.target.value === "__CUSTOM__") {
          if (DOM.formCoverCustom) {
            DOM.formCoverCustom.style.display = "block";
            DOM.formCoverCustom.focus();
          }
        } else {
          if (DOM.formCoverCustom) DOM.formCoverCustom.style.display = "none";
        }
      });
    }

    // 切換編輯模式 / 選擇作品選單
    if (DOM.formSelectBookMode) {
      DOM.formSelectBookMode.addEventListener("change", (e) => {
        resetOrLoadBookForm(e.target.value);
      });
    }

    // 新增試讀章節按鈕
    if (DOM.addChapterBtn) {
      DOM.addChapterBtn.addEventListener("click", () => {
        addChapterEditCard("", "");
      });
    }

    // 雙擊品牌 Logo 快速觸發作者驗證
    if (DOM.brandLogo) {
      DOM.brandLogo.addEventListener("dblclick", () => {
        openAdminModal();
      });
    }

    // 鍵盤快捷鍵
    document.addEventListener("keydown", (e) => {
      // Ctrl + Shift + A 快捷解鎖作者後台
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        openAdminModal();
      }

      // 按 '/' 快速對焦搜尋欄 (未在輸入框內時)
      if (e.key === "/" && document.activeElement !== DOM.searchInput) {
        e.preventDefault();
        DOM.searchInput.focus();
        DOM.searchInput.select();
      }

      // 按 Esc 關閉彈窗
      if (e.key === "Escape") {
        if (DOM.authModalOverlay && DOM.authModalOverlay.classList.contains("open")) closeAuthModal();
        if (DOM.adminModalOverlay && DOM.adminModalOverlay.classList.contains("open")) closeAdminModal();
        if (DOM.bookDetailOverlay.classList.contains("open")) closeBookDetailModal();
        if (DOM.readerModalOverlay.classList.contains("open")) closeReaderModal();
        if (DOM.drawerOverlay.classList.contains("open")) closeBookshelfDrawer();
        if (DOM.guideModalOverlay.classList.contains("open")) closeGuideModal();
      }
    });

    // 滾動監聽：頂部導覽列陰影與回到頂部按鈕
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      DOM.header.classList.toggle("scrolled", scrollY > 30);
      DOM.backToTopBtn.classList.toggle("visible", scrollY > 400);
    });

    // 回到頂部按鈕點擊
    DOM.backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------------------------------------------------------------------------
  // 15. DOM 載入完畢執行
  // ---------------------------------------------------------------------------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
