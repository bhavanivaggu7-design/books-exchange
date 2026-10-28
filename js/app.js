/**
 * BookExchange - Main JavaScript Application
 * SPA Router, State Management, Reactive Filters, Listings,
 * Details View, Safe Messaging, Comparison Engine & LocalStorage Persistence.
 */

// Application State
const AppState = {
  books: [],
  currentPage: "home",
  activeBookId: null,
  compareList: [], // Array of book IDs (max 2)
  filters: {
    search: "",
    subject: "All",
    condition: "All",
    maxPrice: 2000,
    sortBy: "featured"
  }
};

const STORAGE_KEYS = {
  CUSTOM_BOOKS: "bookexchange_custom_books",
  COMPARE_LIST: "bookexchange_compare_list"
};

/* ==========================================================================
   Initialization
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  loadStoredBooks();
  restoreCompareState();
  setupEventListeners();
  populateFilterDropdowns();
  initPriceSlider();
  initRouter();
  renderFeaturedBooks();
  applyFiltersAndRender();
  updateCompareBar();
}

/**
 * Loads default book list and merges any user-added listings from localStorage
 */
function loadStoredBooks() {
  let custom = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_BOOKS);
    if (raw) {
      custom = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Unable to parse custom books from localStorage:", err);
  }

  // Prepend user listings to the default catalogue
  AppState.books = [...custom, ...INITIAL_BOOKS];
}

function saveCustomBookToStorage(newBook) {
  try {
    let custom = [];
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_BOOKS);
    if (raw) custom = JSON.parse(raw);
    custom.unshift(newBook);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_BOOKS, JSON.stringify(custom));
  } catch (err) {
    console.warn("Error saving custom book:", err);
  }
}

function restoreCompareState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.COMPARE_LIST);
    if (raw) AppState.compareList = JSON.parse(raw);
  } catch (e) {
    AppState.compareList = [];
  }
}

function saveCompareState() {
  try {
    sessionStorage.setItem(STORAGE_KEYS.COMPARE_LIST, JSON.stringify(AppState.compareList));
  } catch (e) {}
}

/* ==========================================================================
   Single Page Application Router (Hash Based)
   ========================================================================== */

function initRouter() {
  window.addEventListener("hashchange", handleHashRouting);
  // Initial route dispatch
  handleHashRouting();
}

function handleHashRouting() {
  const hash = window.location.hash.slice(1) || "home";
  const [route, queryString] = hash.split("?");
  const params = new URLSearchParams(queryString || "");

  switch (route) {
    case "search":
      showPageView("view-search", "search");
      applyFiltersAndRender();
      break;

    case "details":
      const bookId = params.get("id");
      if (bookId) {
        loadBookDetailsView(bookId);
      } else if (AppState.books.length > 0) {
        loadBookDetailsView(AppState.books[0].id);
      }
      showPageView("view-details", "search");
      break;

    case "contact":
      const contactBookId = params.get("id");
      loadContactPage(contactBookId);
      showPageView("view-contact", "contact");
      break;

    case "compare":
      renderComparePage();
      showPageView("view-compare", "compare");
      break;

    case "sell":
      showPageView("view-sell", "sell");
      break;

    case "home":
    default:
      showPageView("view-home", "home");
      renderFeaturedBooks();
      break;
  }

  // Scroll to top upon page navigation
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPageView(viewId, navKey) {
  // Hide all views
  document.querySelectorAll(".page-view").forEach(view => {
    view.classList.remove("active");
  });

  // Activate matching view
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
  }

  // Update navbar links
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === navKey);
  });

  AppState.currentPage = navKey;
}

function navigateTo(page, queryString = "") {
  window.location.hash = queryString ? `${page}?${queryString}` : page;
}

/* ==========================================================================
   Event Listeners & Filter Controls Setup
   ========================================================================== */

function setupEventListeners() {
  // Hero quick search
  const heroSearchInput = document.getElementById("hero-quick-search-input");
  const heroSearchBtn = document.getElementById("hero-quick-search-btn");

  if (heroSearchInput) {
    heroSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        executeHeroSearch();
      }
    });
  }
  if (heroSearchBtn) {
    heroSearchBtn.addEventListener("click", executeHeroSearch);
  }

  // Search catalog input
  const searchInputField = document.getElementById("search-input-field");
  if (searchInputField) {
    searchInputField.addEventListener("input", (e) => {
      AppState.filters.search = e.target.value.trim();
      applyFiltersAndRender();
    });
  }

  // Subject filter
  const filterSubject = document.getElementById("filter-subject");
  if (filterSubject) {
    filterSubject.addEventListener("change", (e) => {
      AppState.filters.subject = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Condition radios
  document.querySelectorAll('input[name="filter-condition"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      AppState.filters.condition = e.target.value;
      document.querySelectorAll(".condition-pill-label").forEach(label => {
        label.classList.toggle("active", label.contains(e.target));
      });
      applyFiltersAndRender();
    });
  });

  // Price slider
  const priceSlider = document.getElementById("filter-price-slider");
  const priceDisplay = document.getElementById("filter-price-display");
  if (priceSlider) {
    priceSlider.addEventListener("input", (e) => {
      const val = Number(e.target.value);
      AppState.filters.maxPrice = val;
      if (priceDisplay) priceDisplay.textContent = `₹${val.toLocaleString()}`;
      applyFiltersAndRender();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById("sort-books");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      AppState.filters.sortBy = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Clear filters
  const clearBtn = document.getElementById("btn-clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", resetAllFilters);
  }

  // Compare clear button on floating bar
  const clearCompareBtn = document.getElementById("bar-clear-compare");
  if (clearCompareBtn) {
    clearCompareBtn.addEventListener("click", clearComparison);
  }

  // Forms submit handlers
  const sellForm = document.getElementById("page-sell-book-form");
  if (sellForm) {
    sellForm.addEventListener("submit", handleSellBookSubmit);
  }

  const contactForm = document.getElementById("contact-page-form");
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit);
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const navLinks = document.getElementById("nav-links");
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }

  // Navbar shadow on scroll
  window.addEventListener("scroll", () => {
    const header = document.getElementById("site-header");
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 15);
    }
  });
}

function executeHeroSearch() {
  const input = document.getElementById("hero-quick-search-input");
  if (!input) return;
  const query = input.value.trim();
  AppState.filters.search = query;

  const catalogInput = document.getElementById("search-input-field");
  if (catalogInput) catalogInput.value = query;

  navigateTo("search");
}

function filterByCategory(catName) {
  if (catName === "All") {
    AppState.filters.subject = "All";
  } else {
    // Find matching category in SUBJECT_CATEGORIES
    const matched = SUBJECT_CATEGORIES.find(s => s.toLowerCase().includes(catName.toLowerCase()));
    AppState.filters.subject = matched || catName;
  }

  const filterSubject = document.getElementById("filter-subject");
  if (filterSubject) {
    filterSubject.value = AppState.filters.subject;
  }

  // Update pills UI
  document.querySelectorAll(".category-pill").forEach(pill => {
    pill.classList.toggle("active", pill.textContent.includes(catName));
  });

  navigateTo("search");
}

function populateFilterDropdowns() {
  const filterSelect = document.getElementById("filter-subject");
  const sellSelect = document.getElementById("sell-subject");

  if (filterSelect) {
    filterSelect.innerHTML = `<option value="All">All Subjects (${AppState.books.length})</option>`;
    SUBJECT_CATEGORIES.forEach(subj => {
      const count = AppState.books.filter(b => b.subject === subj).length;
      const opt = document.createElement("option");
      opt.value = subj;
      opt.textContent = `${subj} (${count})`;
      filterSelect.appendChild(opt);
    });
  }

  if (sellSelect) {
    sellSelect.innerHTML = `<option value="">Select subject category</option>`;
    SUBJECT_CATEGORIES.forEach(subj => {
      const opt = document.createElement("option");
      opt.value = subj;
      opt.textContent = subj;
      sellSelect.appendChild(opt);
    });
  }
}

function initPriceSlider() {
  const maxPriceInList = Math.max(...AppState.books.map(b => b.price), 1500);
  const slider = document.getElementById("filter-price-slider");
  const display = document.getElementById("filter-price-display");

  if (slider) {
    const roundedMax = Math.ceil(maxPriceInList / 100) * 100;
    slider.max = roundedMax;
    slider.value = roundedMax;
    AppState.filters.maxPrice = roundedMax;
    if (display) display.textContent = `₹${roundedMax.toLocaleString()}`;
  }
}

/* ==========================================================================
   Book Listing Cards Rendering
   ========================================================================== */

function createBookCard(book) {
  const isCompared = AppState.compareList.includes(book.id);
  const conditionMeta = CONDITION_META[book.condition] || { badgeClass: "badge-good" };

  // Calculate discount percentage
  let savingsTag = "";
  if (book.originalPrice && book.originalPrice > book.price) {
    const discount = Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100);
    savingsTag = `<span class="savings-tag">Save ${discount}%</span>`;
  }

  // Cover image with graceful hardcover fallback
  const coverHTML = book.coverImage
    ? `<img src="${book.coverImage}" alt="${escapeHTML(book.title)}" class="book-cover-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
       <div class="book-styled-cover" style="display:none; background:${book.coverColor || '#1e3a8a'}">
         <span class="book-styled-subject">${escapeHTML(book.subject)}</span>
         <h4 class="book-styled-title">${escapeHTML(book.title)}</h4>
         <span class="book-styled-author">${escapeHTML(book.author)}</span>
       </div>`
    : `<div class="book-styled-cover" style="background:${book.coverColor || '#1e3a8a'}">
         <span class="book-styled-subject">${escapeHTML(book.subject)}</span>
         <h4 class="book-styled-title">${escapeHTML(book.title)}</h4>
         <span class="book-styled-author">${escapeHTML(book.author)}</span>
       </div>`;

  return `
    <article class="book-card" data-id="${book.id}">
      <div class="book-cover-container">
        <div class="card-badges-top">
          <span class="subject-badge" title="${escapeHTML(book.subject)}">${escapeHTML(book.subject)}</span>
          <span class="condition-badge ${conditionMeta.badgeClass}">${escapeHTML(book.condition)}</span>
        </div>
        ${coverHTML}
      </div>

      <div class="book-card-body">
        <h3 class="book-title" title="${escapeHTML(book.title)}">${escapeHTML(book.title)}</h3>
        <p class="book-author">by <strong>${escapeHTML(book.author)}</strong></p>
        <p class="book-edition">${escapeHTML(book.edition)}</p>

        <div class="price-container">
          <span class="asking-price">₹${book.price}</span>
          ${book.originalPrice ? `<span class="original-price">₹${book.originalPrice}</span>` : ""}
          ${savingsTag}
        </div>

        <div class="card-actions">
          <a href="#details?id=${book.id}" class="btn-view-details">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            View Details
          </a>

          <button 
            type="button" 
            class="compare-checkbox-btn ${isCompared ? 'checked' : ''}" 
            onclick="toggleCompareBook('${book.id}')"
            title="${isCompared ? 'Remove from comparison' : 'Add to compare'}"
            aria-pressed="${isCompared}"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${isCompared 
                ? '<polyline points="20 6 9 17 4 12"></polyline>' 
                : '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>'
              }
            </svg>
            <span>${isCompared ? 'Compared' : 'Compare'}</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedBooks() {
  const container = document.getElementById("featured-books-grid");
  if (!container) return;

  const featured = AppState.books.filter(b => b.isFeatured).slice(0, 4);
  container.innerHTML = featured.map(createBookCard).join("");
}

function applyFiltersAndRender() {
  const grid = document.getElementById("all-books-grid");
  const countLabel = document.getElementById("results-count-number");
  if (!grid) return;

  const { search, subject, condition, maxPrice, sortBy } = AppState.filters;
  const searchLower = search.toLowerCase();

  // 1. Filtering
  let filtered = AppState.books.filter(book => {
    const matchesSearch = !search ||
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.subject.toLowerCase().includes(searchLower);

    const matchesSubject = subject === "All" || book.subject === subject;
    const matchesCondition = condition === "All" || book.condition === condition;
    const matchesPrice = book.price <= maxPrice;

    return matchesSearch && matchesSubject && matchesCondition && matchesPrice;
  });

  // 2. Sorting
  if (sortBy === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "newest") {
    filtered.sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || ""));
  }

  // 3. Update count
  if (countLabel) {
    countLabel.textContent = filtered.length;
  }

  // 4. Render
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h3 class="empty-state-title">No matching textbooks found</h3>
        <p class="empty-state-desc">
          We couldn't find textbooks matching your search or filter combination. Try resetting your price limit or clearing filters.
        </p>
        <button type="button" class="btn-primary" onclick="resetAllFilters()">
          Clear All Filters
        </button>
      </div>
    `;
  } else {
    grid.innerHTML = filtered.map(createBookCard).join("");
  }
}

function resetAllFilters() {
  AppState.filters.search = "";
  AppState.filters.subject = "All";
  AppState.filters.condition = "All";
  AppState.filters.sortBy = "featured";

  const searchInput = document.getElementById("search-input-field");
  if (searchInput) searchInput.value = "";

  const heroSearchInput = document.getElementById("hero-quick-search-input");
  if (heroSearchInput) heroSearchInput.value = "";

  const filterSubject = document.getElementById("filter-subject");
  if (filterSubject) filterSubject.value = "All";

  const allCondRadio = document.querySelector('input[name="filter-condition"][value="All"]');
  if (allCondRadio) {
    allCondRadio.checked = true;
    document.querySelectorAll(".condition-pill-label").forEach(l => l.classList.remove("active"));
    allCondRadio.closest(".condition-pill-label")?.classList.add("active");
  }

  initPriceSlider();

  const sortSelect = document.getElementById("sort-books");
  if (sortSelect) sortSelect.value = "featured";

  document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
  document.querySelector(".category-pill")?.classList.add("active");

  applyFiltersAndRender();
  showToast("Filters reset to default view.", "info");
}

/* ==========================================================================
   Page 4: Book Details Page
   ========================================================================== */

function loadBookDetailsView(bookId) {
  const book = AppState.books.find(b => b.id === bookId);
  if (!book) return;

  AppState.activeBookId = bookId;
  const container = document.getElementById("book-details-full-container");
  if (!container) return;

  const conditionMeta = CONDITION_META[book.condition] || { badgeClass: "badge-good" };
  const isCompared = AppState.compareList.includes(book.id);

  let savingsTag = "";
  if (book.originalPrice && book.originalPrice > book.price) {
    const discount = Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100);
    savingsTag = `<span class="savings-tag" style="font-size:0.85rem; padding:0.25rem 0.6rem;">Save ${discount}% (₹${book.originalPrice - book.price} discount)</span>`;
  }

  const coverHTML = book.coverImage
    ? `<img src="${book.coverImage}" alt="${escapeHTML(book.title)}" class="details-cover-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
       <div class="book-styled-cover" style="display:none; width:190px; height:260px; background:${book.coverColor || '#1e3a8a'}">
         <span class="book-styled-subject">${escapeHTML(book.subject)}</span>
         <h4 class="book-styled-title">${escapeHTML(book.title)}</h4>
         <span class="book-styled-author">${escapeHTML(book.author)}</span>
       </div>`
    : `<div class="book-styled-cover" style="width:190px; height:260px; background:${book.coverColor || '#1e3a8a'}">
         <span class="book-styled-subject">${escapeHTML(book.subject)}</span>
         <h4 class="book-styled-title">${escapeHTML(book.title)}</h4>
         <span class="book-styled-author">${escapeHTML(book.author)}</span>
       </div>`;

  container.innerHTML = `
    <div class="details-grid">
      <div class="details-cover-box">
        ${coverHTML}
      </div>

      <div class="details-info">
        <span class="details-subject-tag">${escapeHTML(book.subject)}</span>
        <h1 class="details-book-title">${escapeHTML(book.title)}</h1>
        <p class="details-author">Author(s): <strong>${escapeHTML(book.author)}</strong></p>
        <p class="details-edition">Edition: <strong>${escapeHTML(book.edition)}</strong></p>

        <div class="details-price-badge-row">
          <span class="details-price">₹${book.price}</span>
          ${book.originalPrice ? `<span class="original-price" style="font-size:1.1rem;">₹${book.originalPrice}</span>` : ""}
          ${savingsTag}
          <span class="condition-badge ${conditionMeta.badgeClass}" style="margin-left:auto; font-size:0.8rem; padding:0.35rem 0.8rem;">
            ${escapeHTML(book.condition)}
          </span>
        </div>

        <h4 class="details-section-title">Physical Condition & Notes</h4>
        <div class="details-desc-box">
          ${escapeHTML(book.conditionDescription || "Carefully kept student copy. Binding is firm and all pages are intact.")}
        </div>

        ${book.syllabusNote ? `
          <h4 class="details-section-title">Syllabus / Course Relevance</h4>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1.5rem; line-height:1.5;">
            ${escapeHTML(book.syllabusNote)}
          </p>
        ` : ""}

        <h4 class="details-section-title">Seller Profile</h4>
        <div class="seller-profile-card">
          <div class="seller-avatar-info">
            <div class="seller-avatar">
              ${escapeHTML((book.seller?.name || "Student").charAt(0))}
            </div>
            <div>
              <div class="seller-name">${escapeHTML(book.seller?.name || "Campus Student")}</div>
              <div class="seller-dept">${escapeHTML(book.seller?.dept || "University Department")}</div>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
                📍 Suggested Meetup: <strong>${escapeHTML(book.seller?.campusLocation || "Central Library")}</strong>
              </div>
            </div>
          </div>
          ${book.seller?.verifiedStudent ? `
            <span class="seller-verified-badge" title="Student ID verified on BookExchange">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Student Verified
            </span>
          ` : ""}
        </div>

        <div class="details-actions">
          <a href="#contact?id=${book.id}" class="btn-primary" style="flex:1;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Contact Seller Safely
          </a>

          <button 
            type="button" 
            class="btn-secondary" 
            onclick="toggleCompareBook('${book.id}'); loadBookDetailsView('${book.id}');"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            ${isCompared ? 'Remove Compare' : 'Add to Compare'}
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   Page 5: Safe Contact Seller View
   ========================================================================== */

function loadContactPage(bookId) {
  const book = AppState.books.find(b => b.id === bookId) || AppState.books[0];
  if (!book) return;

  AppState.activeBookId = book.id;

  const titleEl = document.getElementById("contact-page-book-title");
  const sellerEl = document.getElementById("contact-page-seller-name");
  const priceEl = document.getElementById("contact-page-price");
  const thumbEl = document.getElementById("contact-page-thumb");
  const messageInput = document.getElementById("contact-page-message");
  const successBox = document.getElementById("contact-page-success-box");
  const formEl = document.getElementById("contact-page-form");

  if (titleEl) titleEl.textContent = `${book.title} (${book.edition})`;
  if (sellerEl) sellerEl.textContent = book.seller?.name || "Student Seller";
  if (priceEl) priceEl.textContent = `₹${book.price}`;
  if (thumbEl) {
    thumbEl.innerHTML = book.coverImage
      ? `<img src="${book.coverImage}" alt="Cover" style="width:100%; height:100%; object-fit:cover; border-radius:6px;">`
      : `📖`;
  }

  // Populate book switcher dropdown
  const bookSelect = document.getElementById("contact-book-select");
  if (bookSelect) {
    bookSelect.innerHTML = AppState.books
      .map(b => `<option value="${b.id}" ${b.id === book.id ? 'selected' : ''}>${escapeHTML(b.title)} (₹${b.price})</option>`)
      .join("");

    bookSelect.onchange = (e) => {
      navigateTo("contact", `id=${e.target.value}`);
    };
  }

  // Pre-fill student greeting
  if (messageInput) {
    messageInput.value = `Hi ${book.seller?.name || "there"}, I'm interested in buying your copy of "${book.title}". Are you free to meet up near the campus library or cafeteria this week?`;
  }

  if (successBox) successBox.classList.remove("visible");
  if (formEl) formEl.style.display = "block";
  clearFormErrors("contact-page-form");
}

function appendLocation(loc) {
  const messageInput = document.getElementById("contact-page-message");
  if (!messageInput) return;
  messageInput.value += ` Let's meet at ${loc}.`;
  messageInput.focus();
}

function handleContactSubmit(e) {
  e.preventDefault();

  const buyerNameInput = document.getElementById("contact-page-buyer-name");
  const messageInput = document.getElementById("contact-page-message");
  const sendBtn = document.getElementById("btn-page-send-enquiry");

  clearFormErrors("contact-page-form");
  let valid = true;

  if (!buyerNameInput || buyerNameInput.value.trim().length < 2) {
    displayError(buyerNameInput, "Please enter your name (at least 2 letters).");
    valid = false;
  }

  if (!messageInput || messageInput.value.trim().length < 10) {
    displayError(messageInput, "Please write a message of at least 10 characters.");
    valid = false;
  }

  if (!valid) return;

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = `Sending Encrypted Relay...`;
  }

  setTimeout(() => {
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.innerHTML = `Send Safe Message`;
    }

    const formEl = document.getElementById("contact-page-form");
    const successBox = document.getElementById("contact-page-success-box");

    if (formEl) formEl.style.display = "none";
    if (successBox) {
      const activeBook = AppState.books.find(b => b.id === AppState.activeBookId);
      successBox.classList.add("visible");
      successBox.innerHTML = `
        <div class="success-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 style="font-size:1.2rem; font-weight:800; color:#065f46; margin-bottom:0.4rem;">Message Sent to Seller!</h3>
        <p style="font-size:0.9rem; color:#047857; margin-bottom:1.25rem;">
          Your inquiry was dispatched to <strong>${escapeHTML(activeBook?.seller?.name || "the seller")}</strong>.
        </p>
        <div style="background:#ffffff; border-radius:10px; padding:1rem; border:1px dashed #6ee7b7; text-align:left; font-size:0.85rem; color:#065f46; margin-bottom:1.5rem;">
          <strong>🛡️ Safe Campus Meetup Checklist:</strong>
          <ul style="margin-left:1.25rem; margin-top:0.4rem; line-height:1.6;">
            <li>Meet during daylight hours in populated areas (e.g. Campus Library or Cafeteria).</li>
            <li>Inspect the physical textbook condition thoroughly before paying.</li>
            <li>No personal phone numbers were shared publicly.</li>
          </ul>
        </div>
        <div style="display:flex; gap:0.75rem; justify-content:center;">
          <a href="#search" class="btn-primary">Browse More Textbooks</a>
          <button type="button" class="btn-secondary" onclick="resetContactForm()">Send Another Message</button>
        </div>
      `;
    }

    showToast("Safe inquiry dispatched to seller!", "success");
  }, 500);
}

function resetContactForm() {
  const formEl = document.getElementById("contact-page-form");
  const successBox = document.getElementById("contact-page-success-box");
  if (formEl) {
    formEl.reset();
    formEl.style.display = "block";
  }
  if (successBox) successBox.classList.remove("visible");
  loadContactPage(AppState.activeBookId);
}

/* ==========================================================================
   Page 6: Compare Books View
   ========================================================================== */

function toggleCompareBook(bookId) {
  const idx = AppState.compareList.indexOf(bookId);

  if (idx > -1) {
    AppState.compareList.splice(idx, 1);
    showToast("Book removed from comparison.", "info");
  } else {
    if (AppState.compareList.length >= 2) {
      showToast("You can compare up to 2 books at a time. Please remove one first.", "error");
      return;
    }
    AppState.compareList.push(bookId);
    showToast(`Added to comparison (${AppState.compareList.length} of 2).`, "success");
  }

  saveCompareState();
  updateCompareBar();
  applyFiltersAndRender();
  renderFeaturedBooks();

  if (AppState.currentPage === "compare") {
    renderComparePage();
  }
}

function clearComparison() {
  AppState.compareList = [];
  saveCompareState();
  updateCompareBar();
  applyFiltersAndRender();
  renderFeaturedBooks();
  if (AppState.currentPage === "compare") {
    renderComparePage();
  }
  showToast("Comparison cleared.", "info");
}

function updateCompareBar() {
  const bar = document.getElementById("compare-floating-bar");
  const navBadge = document.getElementById("nav-compare-count");
  const barBadge = document.getElementById("bar-compare-count");
  const barText = document.getElementById("bar-compare-text");

  const count = AppState.compareList.length;

  if (navBadge) navBadge.textContent = count;
  if (barBadge) barBadge.textContent = `${count}/2`;
  if (barText) {
    barText.textContent = count === 1
      ? "1 book selected (pick 1 more to compare)"
      : "2 books ready to compare side-by-side";
  }
  if (bar) {
    bar.classList.toggle("visible", count > 0 && AppState.currentPage !== "compare");
  }
}

function renderComparePage() {
  const container = document.getElementById("compare-page-content");
  if (!container) return;

  const count = AppState.compareList.length;

  if (count === 0) {
    container.innerHTML = `
      <div class="empty-compare-state">
        <div class="empty-compare-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </div>
        <h3 style="font-size:1.35rem; font-weight:800; color:var(--text-primary); margin-bottom:0.5rem;">
          No Books Selected for Comparison
        </h3>
        <p style="font-size:0.95rem; color:var(--text-secondary); max-width:500px; margin:0 auto 1.5rem;">
          Click the "Compare" button on any two textbook cards across the marketplace to view their price, condition, edition, and seller notes side-by-side.
        </p>
        <a href="#search" class="btn-primary">
          Browse Textbooks Catalog
        </a>
      </div>
    `;
    return;
  }

  const comparedBooks = AppState.compareList
    .map(id => AppState.books.find(b => b.id === id))
    .filter(Boolean);

  if (comparedBooks.length === 1) {
    const single = comparedBooks[0];
    container.innerHTML = `
      <div class="empty-compare-state">
        <div class="empty-compare-icon" style="background:var(--primary-blue-50); color:var(--primary-blue);">
          1/2
        </div>
        <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-primary); margin-bottom:0.4rem;">
          1 Book Selected: "${escapeHTML(single.title)}"
        </h3>
        <p style="font-size:0.92rem; color:var(--text-secondary); max-width:520px; margin:0 auto 1.5rem;">
          You need 2 books to view a side-by-side comparison. Select one more book from our catalog.
        </p>
        <div style="display:flex; gap:0.75rem; justify-content:center;">
          <a href="#search" class="btn-primary">+ Select Second Book</a>
          <button type="button" class="btn-secondary" onclick="clearComparison()">Clear</button>
        </div>
      </div>
    `;
    return;
  }

  // Exactly 2 books ready
  const [b1, b2] = comparedBooks;
  const b1Cheaper = b1.price < b2.price;
  const b2Cheaper = b2.price < b1.price;
  const priceDiff = Math.abs(b1.price - b2.price);

  container.innerHTML = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th style="width:20%;">Comparison Field</th>
          <th style="width:40%;">
            <div class="comparison-col-header">${escapeHTML(b1.title)}</div>
            <button type="button" class="btn-clear-filters" style="margin-top:4px;" onclick="toggleCompareBook('${b1.id}')">Remove</button>
          </th>
          <th style="width:40%;">
            <div class="comparison-col-header">${escapeHTML(b2.title)}</div>
            <button type="button" class="btn-clear-filters" style="margin-top:4px;" onclick="toggleCompareBook('${b2.id}')">Remove</button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>Cover Preview</th>
          <td>
            <div style="height:140px; width:100px; border-radius:8px; overflow:hidden; background:var(--bg-subtle); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-xs);">
              ${b1.coverImage
                ? `<img src="${b1.coverImage}" alt="${b1.title}" style="width:100%; height:100%; object-fit:cover;">`
                : `<span style="font-size:0.7rem; font-weight:700; text-align:center; padding:4px;">${escapeHTML(b1.subject)}</span>`
              }
            </div>
          </td>
          <td>
            <div style="height:140px; width:100px; border-radius:8px; overflow:hidden; background:var(--bg-subtle); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-xs);">
              ${b2.coverImage
                ? `<img src="${b2.coverImage}" alt="${b2.title}" style="width:100%; height:100%; object-fit:cover;">`
                : `<span style="font-size:0.7rem; font-weight:700; text-align:center; padding:4px;">${escapeHTML(b2.subject)}</span>`
              }
            </div>
          </td>
        </tr>

        <tr class="compare-diff-highlight">
          <th>Asking Price</th>
          <td>
            <span class="asking-price ${b1Cheaper ? 'compare-price-winner' : ''}">₹${b1.price}</span>
            ${b1Cheaper ? `<span class="savings-tag" style="margin-left:8px;">₹${priceDiff} Lower Price</span>` : ''}
          </td>
          <td>
            <span class="asking-price ${b2Cheaper ? 'compare-price-winner' : ''}">₹${b2.price}</span>
            ${b2Cheaper ? `<span class="savings-tag" style="margin-left:8px;">₹${priceDiff} Lower Price</span>` : ''}
          </td>
        </tr>

        <tr>
          <th>Author(s)</th>
          <td><strong>${escapeHTML(b1.author)}</strong></td>
          <td><strong>${escapeHTML(b2.author)}</strong></td>
        </tr>

        <tr>
          <th>Edition</th>
          <td>${escapeHTML(b1.edition)}</td>
          <td>${escapeHTML(b2.edition)}</td>
        </tr>

        <tr>
          <th>Subject / Field</th>
          <td><span class="subject-badge">${escapeHTML(b1.subject)}</span></td>
          <td><span class="subject-badge">${escapeHTML(b2.subject)}</span></td>
        </tr>

        <tr>
          <th>Condition Rating</th>
          <td>
            <span class="condition-badge ${CONDITION_META[b1.condition]?.badgeClass || ''}">${b1.condition}</span>
          </td>
          <td>
            <span class="condition-badge ${CONDITION_META[b2.condition]?.badgeClass || ''}">${b2.condition}</span>
          </td>
        </tr>

        <tr>
          <th>Physical Condition Notes</th>
          <td style="font-size:0.88rem; line-height:1.5;">${escapeHTML(b1.conditionDescription || "Good condition")}</td>
          <td style="font-size:0.88rem; line-height:1.5;">${escapeHTML(b2.conditionDescription || "Good condition")}</td>
        </tr>

        <tr>
          <th>Seller &amp; Department</th>
          <td>
            <strong>${escapeHTML(b1.seller?.name || "Student")}</strong><br>
            <small style="color:var(--text-muted);">${escapeHTML(b1.seller?.dept || "Campus")}</small><br>
            <small style="color:var(--text-secondary);">📍 ${escapeHTML(b1.seller?.campusLocation || "Library")}</small>
          </td>
          <td>
            <strong>${escapeHTML(b2.seller?.name || "Student")}</strong><br>
            <small style="color:var(--text-muted);">${escapeHTML(b2.seller?.dept || "Campus")}</small><br>
            <small style="color:var(--text-secondary);">📍 ${escapeHTML(b2.seller?.campusLocation || "Library")}</small>
          </td>
        </tr>

        <tr>
          <th>Direct Action</th>
          <td>
            <a href="#contact?id=${b1.id}" class="btn-primary" style="width:100%; font-size:0.85rem; padding:0.5rem 0.8rem;">
              Contact Seller
            </a>
          </td>
          <td>
            <a href="#contact?id=${b2.id}" class="btn-primary" style="width:100%; font-size:0.85rem; padding:0.5rem 0.8rem;">
              Contact Seller
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  `;
}

/* ==========================================================================
   Page 7: Sell a Book Submission
   ========================================================================== */

function handleSellBookSubmit(e) {
  e.preventDefault();

  const titleInput = document.getElementById("sell-title");
  const authorInput = document.getElementById("sell-author");
  const editionInput = document.getElementById("sell-edition");
  const subjectSelect = document.getElementById("sell-subject");
  const conditionSelect = document.getElementById("sell-condition");
  const priceInput = document.getElementById("sell-price");
  const originalPriceInput = document.getElementById("sell-original-price");
  const descInput = document.getElementById("sell-description");
  const sellerNameInput = document.getElementById("sell-seller-name");
  const coverUrlInput = document.getElementById("sell-cover-url");

  clearFormErrors("page-sell-book-form");
  let isValid = true;

  if (!titleInput || titleInput.value.trim().length < 3) {
    displayError(titleInput, "Please enter textbook title (at least 3 characters).");
    isValid = false;
  }

  if (!authorInput || authorInput.value.trim().length < 2) {
    displayError(authorInput, "Please enter author name(s).");
    isValid = false;
  }

  if (!editionInput || editionInput.value.trim().length === 0) {
    displayError(editionInput, "Please specify book edition (e.g. 7th Edition).");
    isValid = false;
  }

  if (!subjectSelect || !subjectSelect.value) {
    displayError(subjectSelect, "Please select an academic subject.");
    isValid = false;
  }

  if (!conditionSelect || !conditionSelect.value) {
    displayError(conditionSelect, "Please select book condition.");
    isValid = false;
  }

  const price = Number(priceInput?.value);
  if (isNaN(price) || price <= 0) {
    displayError(priceInput, "Please enter a positive asking price in ₹.");
    isValid = false;
  }

  if (!descInput || descInput.value.trim().length < 10) {
    displayError(descInput, "Please provide condition notes of at least 10 characters.");
    isValid = false;
  }

  if (!sellerNameInput || sellerNameInput.value.trim().length < 2) {
    displayError(sellerNameInput, "Please enter your display name.");
    isValid = false;
  }

  if (!isValid) return;

  const newBook = {
    id: `be-custom-${Date.now()}`,
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    edition: editionInput.value.trim(),
    subject: subjectSelect.value,
    condition: conditionSelect.value,
    price: Math.round(price),
    originalPrice: originalPriceInput?.value ? Math.round(Number(originalPriceInput.value)) : null,
    seller: {
      name: sellerNameInput.value.trim(),
      dept: "Student Seller",
      campusLocation: "Central Campus Meetup",
      verifiedStudent: true,
      joinDate: "Today",
      rating: 5.0
    },
    conditionDescription: descInput.value.trim(),
    syllabusNote: "Fresh student listing posted on BookExchange.",
    coverImage: coverUrlInput?.value?.trim() || null,
    coverColor: getRandomThemeColor(),
    isFeatured: false,
    dateAdded: new Date().toISOString().split("T")[0]
  };

  // Add to active state
  AppState.books.unshift(newBook);
  saveCustomBookToStorage(newBook);

  // Re-populate dropdowns and render
  populateFilterDropdowns();
  initPriceSlider();

  // Reset form
  document.getElementById("page-sell-book-form").reset();

  showToast(`"${newBook.title}" posted successfully!`, "success");

  // Route to search catalog to see the new listing
  navigateTo("search");
}

/* ==========================================================================
   Form Helpers & Validation
   ========================================================================== */

function displayError(inputEl, msg) {
  if (!inputEl) return;
  inputEl.classList.add("is-invalid");
  const parent = inputEl.closest(".form-group");
  if (parent) {
    const errorEl = parent.querySelector(".form-error");
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.add("visible");
    }
  }
  inputEl.focus();
}

function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
  form.querySelectorAll(".form-error").forEach(el => {
    el.textContent = "";
    el.classList.remove("visible");
  });
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(15px)";
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getRandomThemeColor() {
  const colors = ["#1e3a8a", "#2563eb", "#6d28d9", "#7c3aed", "#047857", "#0f766e", "#be123c"];
  return colors[Math.floor(Math.random() * colors.length)];
}
