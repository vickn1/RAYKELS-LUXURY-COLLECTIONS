const state = {
  products: [],
  editingId: null,
  selectedImages: [],
  selectedVideos: [],
  removedImages: [],
  removedVideos: []
};

const analyticsState = {
  summary: null,
  loading: false
};

const $ = (selector) => document.querySelector(selector);

const adminModules = {
  dashboard: {
    viewId: "view-dashboard",
    title: "Dashboard",
    subtitle: "Manage your Raykels catalogue."
  },
  orders: {
    viewId: "view-orders",
    title: "Orders",
    subtitle: "Review and manage customer order requests."
  },
  products: {
    viewId: "view-products",
    title: "Products",
    subtitle: "View and manage your product catalogue."
  },
  "add-product": {
    viewId: "view-add-product",
    title: "Add Product",
    subtitle: "Create a new Raykels product."
  },
  analytics: {
    viewId: "view-analytics",
    title: "Analytics",
    subtitle: "Understand traffic and customer activity."
  },
  settings: {
    viewId: "view-settings",
    title: "Settings",
    subtitle: "Manage Raykels administration settings."
  }
};

const views = Object.fromEntries(
  Object.entries(adminModules).map(([name, module]) => [
    name,
    document.getElementById(module.viewId)
  ])
);

const notice = $("#notice");
const adminLogin = $("#adminLogin");
const adminShell = $("#adminShell");
const adminLoginForm = $("#adminLoginForm");
const adminLoginError = $("#adminLoginError");
const adminLogout = $("#adminLogout");

function showNotice(message, type = "success") {
  notice.textContent = message;
  notice.className = `notice show ${type}`;

  clearTimeout(showNotice.timer);

  showNotice.timer = setTimeout(() => {
    notice.className = "notice";
  }, 5000);
}

function showAdminShell() {
  adminLogin?.classList.remove("active");
  adminLogin?.setAttribute("hidden", "");
  adminShell?.removeAttribute("hidden");
}

function showAdminLogin(message = "") {
  adminShell?.setAttribute("hidden", "");
  adminLogin?.removeAttribute("hidden");

  if (adminLoginError) {
    adminLoginError.textContent = message;
    adminLoginError.className = message
      ? "notice error show"
      : "notice error";
  }
}

async function checkAdminSession() {
  try {
    await api("/api/admin/session");
    showAdminShell();
    return true;
  } catch {
    showAdminLogin();
    return false;
  }
}

async function handleAdminLogout() {
  try {
    await api("/api/admin/logout", {
      method: "POST"
    });

    showAdminLogin();
  } catch (error) {
    showNotice(
      error.message || "Could not log out.",
      "error"
    );
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();

  const username = $("#adminUsername")?.value.trim();
  const password = $("#adminPassword")?.value || "";

  if (!username || !password) {
    showAdminLogin("Username and password are required.");
    return;
  }

  try {
    adminLoginError.textContent = "";
    adminLoginError.className = "notice error";

    await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    });

    adminLoginForm.reset();
    showAdminShell();

    if (typeof loadProducts === "function") {
      await loadProducts();
    }

    if (typeof loadPaymentSettings === "function") {
      await loadPaymentSettings();
    }

    if (typeof loadHomepageSettings === "function") {
      await loadHomepageSettings();
    }
  } catch (error) {
    showAdminLogin(error.message);
  }
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      data?.errors?.join(", ") ||
      `Request failed (${response.status})`
    );
  }

  return data;
}

adminLoginForm?.addEventListener("submit", handleAdminLogin);
adminLogout?.addEventListener("click", handleAdminLogout);

function renderAnalytics() {
  const data = analyticsState.summary;

  if (!data) return;

  const totals = data.totals || {};
  const funnel = data.funnel || {};

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent =
        value === undefined || value === null
          ? "—"
          : String(value);
    }
  };

  setText("analyticsVisitors", totals.visitors);
  setText("analyticsSessions", totals.sessions);
  setText("analyticsPageViews", totals.pageViews);
  setText("analyticsEvents", totals.events);

  setText("analyticsProductViews", totals.productViews);
  setText("analyticsProductClicks", totals.productClicks);
  setText("analyticsAddToCart", totals.addToCart);
  setText("analyticsCheckoutStarted", totals.checkoutStarted);
  setText("analyticsOrdersSubmitted", totals.ordersSubmitted);

  const funnelElement = $("#analyticsFunnel");

  if (funnelElement) {
    const stages = [
      ["Visitors", funnel.visitors],
      ["Product Views", funnel.productViews],
      ["Add to Cart", funnel.addToCart],
      ["Checkout Started", funnel.checkoutStarted],
      ["Orders Submitted", funnel.ordersSubmitted]
    ];

    funnelElement.innerHTML = stages.map(([label, value]) => `
      <div class="analytics-funnel-row">
        <span>${label}</span>
        <strong>${Number(value || 0)}</strong>
      </div>
    `).join("");
  }

  const popularProducts =
    Array.isArray(data.popularProducts)
      ? data.popularProducts
      : [];

  const productsElement =
    $("#analyticsPopularProducts");

  if (productsElement) {
    productsElement.innerHTML =
      popularProducts.length
        ? popularProducts.map(product => `
            <div class="analytics-list-row">
              <span>${escapeHtml(product.productName || product.productId || "Unknown product")}</span>
              <strong>${Number(product.views || 0)}</strong>
            </div>
          `).join("")
        : '<p class="empty-state">No product activity yet.</p>';
  }

  const popularPages =
    Array.isArray(data.popularPages)
      ? data.popularPages
      : [];

  const pagesElement =
    $("#analyticsPopularPages");

  if (pagesElement) {
    pagesElement.innerHTML =
      popularPages.length
        ? popularPages.map(page => `
            <div class="analytics-list-row">
              <span>${escapeHtml(page.page || "/")}</span>
              <strong>${Number(page.views || 0)}</strong>
            </div>
          `).join("")
        : '<p class="empty-state">No page activity yet.</p>';
  }

  const recentEvents =
    Array.isArray(data.recentEvents)
      ? data.recentEvents
      : [];

  const recentElement =
    $("#analyticsRecentActivity");

  if (recentElement) {
    recentElement.innerHTML =
      recentEvents.length
        ? recentEvents.map(event => `
            <div class="analytics-activity-row">
              <div>
                <strong>${escapeHtml(event.event || "activity")}</strong>
                ${
                  event.productName
                    ? `<span>${escapeHtml(event.productName)}</span>`
                    : ""
                }
                ${
                  event.page
                    ? `<small>${escapeHtml(event.page)}</small>`
                    : ""
                }
              </div>
              <time>${escapeHtml(
                event.timestamp
                  ? new Date(event.timestamp).toLocaleString()
                  : ""
              )}</time>
            </div>
          `).join("")
        : '<p class="empty-state">No activity recorded yet.</p>';
  }
}

async function loadAnalytics() {
  const content = $("#analyticsContent");

  if (!content) return;

  analyticsState.loading = true;

  try {
    const data = await api("/api/admin/analytics");

    analyticsState.summary = data;

    return data;
  } catch (error) {
    analyticsState.summary = null;

    const notice = $("#analyticsNotice");

    if (notice) {
      notice.textContent =
        error.message || "Could not load analytics.";

      notice.className = "notice show error";
    }

    throw error;
  } finally {
    analyticsState.loading = false;
  }
}

function setView(name) {
  const module = adminModules[name];

  if (!module) {
    console.warn(`Unknown admin view: ${name}`);
    return;
  }

  Object.values(views).forEach((view) => {
    if (view) view.classList.remove("active");
  });

  if (views[name]) {
    views[name].classList.add("active");
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle(
      "active",
      link.dataset.view === name
    );
  });

  const title =
    name === "add-product" && state.editingId
      ? "Edit Product"
      : module.title;

  const subtitle =
    name === "add-product" && state.editingId
      ? "Update an existing product."
      : module.subtitle;

  $("#pageTitle").textContent = title;
  $("#pageSubtitle").textContent = subtitle;
}


/* =========================================================
 * HOMEPAGE SETTINGS MODULE
 * ======================================================= */

async function loadHomepageSettings() {
  try {
    const settings = await api(
      "/api/admin/site-settings"
    );

    const homepage = settings?.homepage || {};
    const featured = homepage.featuredProducts || {};

    const setChecked = (id, value) => {
      const element = $(`#${id}`);

      if (element) {
        element.checked = value !== false;
      }
    };

    const setValue = (id, value, fallback) => {
      const element = $(`#${id}`);

      if (element) {
        element.value =
          value === undefined || value === null
            ? fallback
            : String(value);
      }
    };

    setChecked("heroEnabled", homepage.heroEnabled);
    setChecked("heroAutoRotate", homepage.autoRotate);

    setValue(
      "heroRotationSeconds",
      homepage.rotationSeconds,
      5
    );

    setChecked(
      "featuredProductsEnabled",
      featured.enabled
    );

    setChecked(
      "featuredAutoRotate",
      featured.autoRotate
    );

    setValue(
      "featuredDisplayMode",
      featured.displayMode,
      "carousel"
    );

    setValue(
      "featuredRotationSeconds",
      featured.rotationSeconds,
      5
    );

    setChecked(
      "collectionsEnabled",
      homepage.collectionsEnabled
    );

    setChecked(
      "servicesEnabled",
      homepage.servicesEnabled
    );
  } catch (error) {
    console.error(
      "Load homepage settings error:",
      error
    );

    showNotice(
      error.message ||
      "Could not load homepage settings.",
      "error"
    );
  }
}

async function saveHomepageSettings(event) {
  event.preventDefault();

  const button =
    $("#saveHomepageSettings");

  const payload = {
    homepage: {
      heroEnabled:
        $("#heroEnabled")?.checked !== false,

      heroSource: "catalogue",

      autoRotate:
        $("#heroAutoRotate")?.checked !== false,

      rotationSeconds:
        Number(
          $("#heroRotationSeconds")?.value || 5
        ),

      featuredProducts: {
        enabled:
          $("#featuredProductsEnabled")?.checked !== false,

        displayMode:
          $("#featuredDisplayMode")?.value === "grid"
            ? "grid"
            : "carousel",

        autoRotate:
          $("#featuredAutoRotate")?.checked !== false,

        rotationSeconds:
          Number(
            $("#featuredRotationSeconds")?.value || 5
          ),

        productIds: [],
        pinnedProductIds: []
      },

      collectionsEnabled:
        $("#collectionsEnabled")?.checked !== false,

      servicesEnabled:
        $("#servicesEnabled")?.checked !== false
    }
  };

  if (button) {
    button.disabled = true;
    button.textContent = "Saving...";
  }

  try {
    await api(
      "/api/admin/site-settings",
      {
        method: "PUT",
        body: JSON.stringify(payload)
      }
    );

    showNotice(
      "Homepage settings saved.",
      "success"
    );
  } catch (error) {
    console.error(
      "Save homepage settings error:",
      error
    );

    showNotice(
      error.message ||
      "Could not save homepage settings.",
      "error"
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent =
        "Save Homepage Settings";
    }
  }
}

function bindHomepageSettingsEvents() {
  $("#homepageSettingsForm")?.addEventListener(
    "submit",
    saveHomepageSettings
  );
}

/* =========================================================
 * PAYMENT SETTINGS MODULE
 * ======================================================= */

async function loadPaymentSettings() {
  try {
    const settings = await api(
      "/api/admin/payment-settings"
    );

    const transfer = settings?.bankTransfer || {};

    const enabled =
      $("#bankTransferEnabled");

    const bankName =
      $("#bankName");

    const accountName =
      $("#accountName");

    const accountNumber =
      $("#accountNumber");

    const instructions =
      $("#bankTransferInstructions");

    if (enabled) {
      enabled.checked =
        transfer.enabled !== false;
    }

    if (bankName) {
      bankName.value =
        transfer.bankName || "";
    }

    if (accountName) {
      accountName.value =
        transfer.accountName || "";
    }

    if (accountNumber) {
      accountNumber.value =
        transfer.accountNumber || "";
    }

    if (instructions) {
      instructions.value =
        transfer.instructions || "";
    }
  } catch (error) {
    console.error(
      "Load payment settings error:",
      error
    );

    showNotice(
      error.message ||
      "Could not load payment settings.",
      "error"
    );
  }
}

async function savePaymentSettings(event) {
  event.preventDefault();

  const button =
    $("#saveBankTransferSettings");

  const payload = {
    bankTransfer: {
      enabled:
        $("#bankTransferEnabled")?.checked !== false,

      bankName:
        $("#bankName")?.value.trim() || "",

      accountName:
        $("#accountName")?.value.trim() || "",

      accountNumber:
        $("#accountNumber")?.value.trim() || "",

      instructions:
        $("#bankTransferInstructions")?.value.trim() || ""
    }
  };

  if (button) {
    button.disabled = true;
    button.textContent = "Saving...";
  }

  try {
    await api(
      "/api/admin/payment-settings",
      {
        method: "PUT",
        body: JSON.stringify(payload)
      }
    );

    showNotice(
      "Bank transfer details saved.",
      "success"
    );
  } catch (error) {
    console.error(
      "Save payment settings error:",
      error
    );

    showNotice(
      error.message ||
      "Could not save bank transfer details.",
      "error"
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Save Bank Details";
    }
  }
}

function bindPaymentSettingsEvents() {
  $("#bankTransferSettingsForm")?.addEventListener(
    "submit",
    savePaymentSettings
  );
}

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(number);
}

function categoryLabel(category) {
  const labels = {
    hair: "Hair",
    bags: "Bags",
    shoes: "Shoes",
    children: "Children"
  };

  return labels[category] || category || "Uncategorised";
}

function getImageUrl(image) {
  if (!image) return "";

  if (typeof image === "string") return image;

  return image.url || "";
}

function renderStats() {
  const products = state.products;

  $("#statProducts").textContent = products.length;

  $("#statPublished").textContent =
    products.filter(
      (product) => product.published !== false
    ).length;

  $("#statFeatured").textContent =
    products.filter(
      (product) => product.featured === true
    ).length;

  $("#statOutOfStock").textContent =
    products.filter((product) => {
      if (!product.inventory?.trackStock) return false;

      return Number(product.inventory?.stock || 0) <= 0;
    }).length;
}

function productRowHTML(product) {
  const image = getImageUrl(product.images?.[0]);

  const stock = product.inventory?.trackStock
    ? Number(product.inventory?.stock || 0)
    : "∞";

  return `
    <div class="product-row">
      ${
        image
          ? `<img
              class="product-thumb"
              src="${escapeHtml(image)}"
              alt="${escapeHtml(product.name || "")}"
            >`
          : `<div class="product-thumb"></div>`
      }

      <div class="product-info">
        <strong>
          ${escapeHtml(product.name || "Unnamed product")}
        </strong>

        <small>
          ${escapeHtml(categoryLabel(product.category))}
          ${
            product.sku
              ? ` · SKU: ${escapeHtml(product.sku)}`
              : ""
          }
          · Stock: ${stock}
        </small>
      </div>

      <div class="product-price">
        ${formatPrice(
          product.pricing?.salePrice ??
          product.pricing?.price
        )}
      </div>

      <span class="status ${
        product.published !== false
          ? "published"
          : "draft"
      }">
        ${
          product.published !== false
            ? "Published"
            : "Draft"
        }
      </span>

      <button
        class="secondary-button"
        type="button"
        data-edit="${escapeHtml(product.id)}"
      >
        Edit
      </button>

      <button
        class="danger-button"
        type="button"
        data-delete="${escapeHtml(product.id)}"
      >
        Delete
      </button>
    </div>
  `;
}

function renderRecentProducts() {
  const container = $("#recentProducts");

  if (!state.products.length) {
    container.innerHTML = `
      <div class="empty-state">
        No products have been added yet.
      </div>
    `;

    return;
  }

  const recent = [...state.products]
    .sort((a, b) => {
      return (
        new Date(
          b.updatedAt ||
          b.createdAt ||
          0
        ) -
        new Date(
          a.updatedAt ||
          a.createdAt ||
          0
        )
      );
    })
    .slice(0, 5);

  container.innerHTML =
    recent.map(productRowHTML).join("");
}

function renderProducts() {
  const container = $("#productsTable");

  const search =
    ($("#productSearch").value || "")
      .trim()
      .toLowerCase();

  const category =
    $("#productCategoryFilter").value;

  const filtered = state.products.filter(
    (product) => {
      const matchesSearch =
        !search ||
        [
          product.name,
          product.brand,
          product.sku,
          product.subcategory
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(search)
          );

      const matchesCategory =
        !category ||
        product.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        ${
          state.products.length
            ? "No products match your search."
            : "No products have been added yet."
        }
      </div>
    `;

    return;
  }

  container.innerHTML =
    filtered.map(productRowHTML).join("");
}

async function loadProducts() {
  try {
    const data =
      await api("/api/products");

    state.products =
      Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

    renderStats();
    renderRecentProducts();
    renderProducts();

  } catch (error) {
    console.error(error);

    showNotice(
      `Could not load products: ${error.message}`,
      "error"
    );
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function resetForm() {
  state.editingId = null;
  state.selectedImages = [];
  state.selectedVideos = [];
  state.removedImages = [];
  state.removedVideos = [];

  $("#productId").value = "";
  $("#productName").value = "";
  $("#productCategory").value = "";
  $("#productSubcategory").value = "";
  $("#productBrand").value = "";
  $("#productSku").value = "";
  $("#productPrice").value = "";
  $("#productSalePrice").value = "";
  $("#productStock").value = "0";
  $("#productTrackStock").checked = true;
  $("#productFeatured").checked = false;
  $("#productPublished").checked = true;
  $("#productColours").value = "";
  $("#productSizes").value = "";
  $("#productLengths").value = "";
  $("#productMaterials").value = "";
  $("#productAgeRanges").value = "";
  $("#productDescription").value = "";
  $("#productImages").value = "";
  $("#productVideos").value = "";
  $("#imagePreview").innerHTML = "";
  $("#videoPreview").innerHTML = "";
  $("#variants").innerHTML = "";

  addVariantRow();

  $("#saveProduct").textContent = "Create Product";
  setView("add-product");
}


function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function addVariantRow(variant = {}) {
  const container = $("#variants");
  const row = document.createElement("div");

  row.className = "variant-row";

  row.innerHTML = `
    <input
      type="text"
      placeholder="Option"
      value="${escapeHtml(variant.name || "")}"
    >

    <input
      type="text"
      placeholder="Value"
      value="${escapeHtml(variant.value || "")}"
    >

    <input
      type="number"
      min="0"
      step="0.01"
      placeholder="Price"
      value="${escapeHtml(variant.price ?? "")}"
    >

    <button
      type="button"
      class="danger-button"
      data-remove-variant
    >Remove</button>
  `;

  container.appendChild(row);
}

function getVariants() {
  return [...document.querySelectorAll(".variant-row")]
    .map((row) => {
      const inputs = row.querySelectorAll("input");

      return {
        name: inputs[0]?.value.trim() || "",
        value: inputs[1]?.value.trim() || "",
        price: inputs[2]?.value.trim() || ""
      };
    })
    .filter((variant) =>
      variant.name ||
      variant.value ||
      variant.price
    );
}

function editProduct(id) {
  const product = state.products.find(
    (item) => String(item.id) === String(id)
  );

  if (!product) {
    showNotice("Product could not be found.", "error");
    return;
  }

  populateForm(product);
}

function openAddProduct() {
  resetForm();
}

function buildProductPayload() {
  const price = Number($("#productPrice").value);
  const saleValue = $("#productSalePrice").value.trim();
  const stock = Number($("#productStock").value);
  const existing = state.products.find(
    (product) => product.id === state.editingId
  );

  return {
    name: $("#productName").value.trim(),
    brand: $("#productBrand").value.trim(),
    category: $("#productCategory").value,
    subcategory: $("#productSubcategory").value.trim(),
    description: $("#productDescription").value.trim(),
    sku: $("#productSku").value.trim(),
    currency: "NGN",

    pricing: {
      price: Number.isFinite(price) ? price : 0,
      salePrice:
        saleValue === ""
          ? null
          : Number(saleValue)
    },
    attributes: {
      colours: parseList($("#productColours").value),
      sizes: parseList($("#productSizes").value),
      lengths: parseList($("#productLengths").value),
      materials: parseList($("#productMaterials").value),
      ageRanges: parseList($("#productAgeRanges").value)
    },

    variants: getVariants(),
    inventory: {
      stock: Number.isFinite(stock) ? stock : 0,
      trackStock: $("#productTrackStock").checked
    },

    available:
      $("#productTrackStock").checked
        ? stock > 0
        : true,

    featured: $("#productFeatured").checked,
    published: $("#productPublished").checked,

    images: (existing?.images || []).filter((item, index) => {
      const id =
        typeof item === "string"
          ? item
          : item?.id;

      return !state.removedImages.includes(id);
    }),

    videos: (existing?.videos || []).filter((item, index) => {
      const id =
        typeof item === "string"
          ? item
          : item?.id;

      return !state.removedVideos.includes(id);
    })
  };
}

function renderSelectedImages() {
  const container = $("#imagePreview");

  const existing =
    state.editingId
      ? state.products.find(
          (product) => product.id === state.editingId
        )?.images || []
      : [];

  if (
    !existing.length &&
    !state.selectedImages.length
  ) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = [
    ...existing.map((image) => {
      const url = getImageUrl(image);
      const id =
        typeof image === "string"
          ? image
          : image?.id || url;

      if (!url || state.removedImages.includes(id)) {
        return "";
      }

      return `
        <div class="image-card">
          <img
            src="${escapeHtml(url)}"
            alt="${escapeHtml(
              image.alt || "Product image"
            )}"
          >
          <button
            type="button"
            data-remove-existing-image="${escapeHtml(id)}"
            title="Remove image"
          >×</button>
        </div>
      `;
    }),

    ...state.selectedImages.map((file, index) => {
      const url = URL.createObjectURL(file);

      return `
        <div class="image-card">
          <img
            src="${url}"
            alt="${escapeHtml(file.name)}"
          >
          <button
            type="button"
            data-remove-image="${index}"
            title="Remove image"
          >×</button>
        </div>
      `;
    })
  ].join("");
}

function handleImageSelection(event) {
  const files = Array.from(event.target.files || []);
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024;

  for (const file of files) {
    if (!allowed.includes(file.type)) {
      showNotice(
        "Only JPG, PNG, and WebP images are allowed.",
        "error"
      );
      continue;
    }

    if (file.size > maxSize) {
      showNotice(
        `${file.name} is larger than 10MB.`,
        "error"
      );
      continue;
    }

    if (state.selectedImages.length >= 20) {
      showNotice(
        "Maximum of 20 images allowed.",
        "error"
      );
      break;
    }

    state.selectedImages.push(file);
  }

  $("#productImages").value = "";
  $("#productVideos").value = "";
  renderSelectedImages();
}

function renderSelectedVideos() {
  const container = $("#videoPreview");

  if (!container) return;

  const existing =
    state.editingId
      ? state.products.find(
          (product) => product.id === state.editingId
        )?.videos || []
      : [];

  if (
    !existing.length &&
    !state.selectedVideos.length
  ) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = [
    ...existing.map((video, index) => {
      const url =
        typeof video === "string"
          ? video
          : video?.url || "";

      const id =
        typeof video === "string"
          ? video
          : video?.id || url;

      if (!url || state.removedVideos.includes(id)) {
        return "";
      }

      return `
        <div class="image-card video-card">
          <video
            src="${escapeHtml(url)}"
            controls
            preload="metadata"
          ></video>

          <button
            type="button"
            data-remove-existing-video="${escapeHtml(id)}"
            title="Remove video"
          >×</button>
        </div>
      `;
    }),

    ...state.selectedVideos.map((file, index) => {
      const url = URL.createObjectURL(file);

      return `
        <div class="image-card video-card">
          <video
            src="${url}"
            controls
            preload="metadata"
          ></video>

          <button
            type="button"
            data-remove-video="${index}"
            title="Remove video"
          >×</button>
        </div>
      `;
    })
  ].join("");
}

function handleVideoSelection(event) {
  const files =
    Array.from(event.target.files || []);

  const allowed = [
    "video/mp4",
    "video/webm",
    "video/quicktime"
  ];

  const maxSize =
    100 * 1024 * 1024;

  for (const file of files) {
    if (!allowed.includes(file.type)) {
      showNotice(
        "Only MP4, WebM and MOV videos are allowed.",
        "error"
      );
      continue;
    }

    if (file.size > maxSize) {
      showNotice(
        `${file.name} is larger than 100MB.`,
        "error"
      );
      continue;
    }

    if (state.selectedVideos.length >= 5) {
      showNotice(
        "Maximum of 5 product videos allowed.",
        "error"
      );
      break;
    }

    state.selectedVideos.push(file);
  }

  $("#productVideos").value = "";
  renderSelectedVideos();
}

async function uploadProductImages(productId) {
  if (
    !state.selectedImages.length &&
    !state.selectedVideos.length
  ) {
    return { success: true };
  }

  const formData = new FormData();

  state.selectedImages.forEach((file) => {
    formData.append("images", file);
  });

  state.selectedVideos.forEach((file) => {
    formData.append("images", file);
  });

  const response = await fetch(
    `/api/uploads/products/${encodeURIComponent(productId)}`,
    {
      method: "POST",
      body: formData
    }
  );

  const data =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Could not upload product media."
    );
  }

  return data;
}
async function saveProduct() {
  const name = $("#productName").value.trim();
  const category = $("#productCategory").value;
  const price = Number($("#productPrice").value);
  const saleValue = $("#productSalePrice").value.trim();
  const stock = Number($("#productStock").value);

  if (!name) {
    showNotice("Product name is required.", "error");
    return;
  }

  if (!category) {
    showNotice("Please select a category.", "error");
    return;
  }

  if (!Number.isFinite(price) || price < 0) {
    showNotice("Enter a valid product price.", "error");
    return;
  }

  if (
    saleValue !== "" &&
    (!Number.isFinite(Number(saleValue)) ||
      Number(saleValue) < 0)
  ) {
    showNotice("Enter a valid sale price.", "error");
    return;
  }

  if (!Number.isFinite(stock) || stock < 0) {
    showNotice("Enter a valid stock quantity.", "error");
    return;
  }

  const payload = buildProductPayload();
  const editing = Boolean(state.editingId);

  try {
    $("#saveProduct").disabled = true;
    $("#saveProduct").textContent = "Saving...";

    const response = await fetch(
      editing
        ? `/api/products/${encodeURIComponent(state.editingId)}`
        : `/api/products`,
      {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        "Could not save product."
      );
    }

    const savedProduct =
      data.product || data;

    let imageUploadFailed = false;

    if (
      state.selectedImages.length ||
      state.selectedVideos.length
    ) {
      try {
        await uploadProductImages(savedProduct.id);
      } catch (imageError) {
        console.error(
          "RAYKELS MEDIA UPLOAD FAILED:",
          imageError
        );
        imageUploadFailed = true;
      }
    }

    await loadProducts();

    if (imageUploadFailed) {
      showNotice(
        "Product saved, but media upload failed. You can try adding the images or videos again.",
        "error"
      );
    } else {
      showNotice(
        editing
          ? "Product updated successfully."
          : "Product created successfully.",
        "success"
      );
    }

    resetForm();
    setView("products");
  } catch (error) {
    showNotice(
      error.message || "Could not save product.",
      "error"
    );
  } finally {
    $("#saveProduct").disabled = false;
    $("#saveProduct").textContent =
      state.editingId ? "Save Changes" : "Create Product";
  }
}

function populateProductDetails(product) {
  $("#productColours").value =
    (product.attributes?.colours || []).join(", ");

  $("#productSizes").value =
    (product.attributes?.sizes || []).join(", ");

  $("#productLengths").value =
    (product.attributes?.lengths || []).join(", ");

  $("#productMaterials").value =
    (product.attributes?.materials || []).join(", ");

  $("#productAgeRanges").value =
    (product.attributes?.ageRanges || []).join(", ");

  $("#productDescription").value =
    product.description || "";

  $("#variants").innerHTML = "";

  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  if (variants.length) {
    variants.forEach((variant) => {
      addVariantRow(variant);
    });
  } else {
    addVariantRow();
  }

  renderSelectedImages();
}

function populateForm(product) {
  state.editingId = product.id;
  state.selectedImages = [];
  state.selectedVideos = [];
  state.removedImages = [];
  state.removedVideos = [];

  $("#productId").value = product.id || "";
  $("#productName").value = product.name || "";
  $("#productCategory").value = product.category || "";
  $("#productSubcategory").value =
    product.subcategory || "";
  $("#productBrand").value = product.brand || "";
  $("#productSku").value = product.sku || "";

  $("#productPrice").value =
    product.pricing?.price ?? "";

  $("#productSalePrice").value =
    product.pricing?.salePrice ?? "";

  $("#productStock").value =
    product.inventory?.stock ?? 0;

  $("#productTrackStock").checked =
    product.inventory?.trackStock !== false;

  $("#productFeatured").checked =
    product.featured === true;

  $("#productPublished").checked =
    product.published !== false;

  populateProductDetails(product);
  renderSelectedVideos();

  $("#saveProduct").textContent =
    "Save Changes";

  setView("add-product");
}

function bindEvents() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", async () => {
      const view = link.dataset.view;

      setView(view);

      if (view === "analytics") {
        try {
          await loadAnalytics();
          renderAnalytics();
        } catch {
          // loadAnalytics displays the error.
        }
      }
    });
  });

  $("#refreshAnalytics")?.addEventListener(
    "click",
    async () => {
      try {
        await loadAnalytics();
        renderAnalytics();
      } catch {
        // loadAnalytics displays the error.
      }
    }
  );

  $("#topAddProduct").addEventListener(
    "click",
    openAddProduct
  );

  $("#emptyAddProduct")?.addEventListener(
    "click",
    openAddProduct
  );

  $("#cancelEdit").addEventListener(
    "click",
    () => {
      resetForm();
      setView("products");
    }
  );

  $("#productForm").addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();
      await saveProduct();
    }
  );

  $("#productImages").addEventListener(
    "change",
    handleImageSelection
  );

  $("#productVideos").addEventListener(
    "change",
    handleVideoSelection
  );

  $("#addVariant").addEventListener(
    "click",
    () => addVariantRow()
  );

  $("#productSearch").addEventListener(
    "input",
    renderProducts
  );

  $("#productCategoryFilter").addEventListener(
    "change",
    renderProducts
  );

  document.addEventListener(
    "click",
    async (event) => {
      const editButton =
        event.target.closest("[data-edit]");

      if (editButton) {
        editProduct(editButton.dataset.edit);
        return;
      }

      const deleteButton =
        event.target.closest("[data-delete]");

      if (deleteButton) {
        await deleteProduct(deleteButton.dataset.delete);
        return;
      }

      const removeVariant =
        event.target.closest(
          "[data-remove-variant]"
        );

      if (removeVariant) {
        removeVariant.closest(".variant-row")?.remove();

        if (!document.querySelector(".variant-row")) {
          addVariantRow();
        }

        return;
      }

      const removeImage =
        event.target.closest(
          "[data-remove-image]"
        );

      if (removeImage) {
        const index =
          Number(removeImage.dataset.removeImage);

        if (
          Number.isInteger(index) &&
          index >= 0 &&
          index < state.selectedImages.length
        ) {
          state.selectedImages.splice(index, 1);
          renderSelectedImages();
        }

        return;
      }

      const removeExistingImage =
        event.target.closest(
          "[data-remove-existing-image]"
        );

      if (removeExistingImage) {
        const id =
          removeExistingImage.dataset.removeExistingImage;

        if (
          id &&
          !state.removedImages.includes(id)
        ) {
          state.removedImages.push(id);
        }

        renderSelectedImages();
        return;
      }

      const removeVideo =
        event.target.closest(
          "[data-remove-video]"
        );

      if (removeVideo) {
        const index =
          Number(removeVideo.dataset.removeVideo);

        if (
          Number.isInteger(index) &&
          index >= 0 &&
          index < state.selectedVideos.length
        ) {
          state.selectedVideos.splice(index, 1);
          renderSelectedVideos();
        }

        return;
      }

      const removeExistingVideo =
        event.target.closest(
          "[data-remove-existing-video]"
        );

      if (removeExistingVideo) {
        const id =
          removeExistingVideo.dataset.removeExistingVideo;

        if (id && !state.removedVideos.includes(id)) {
          state.removedVideos.push(id);
        }

        renderSelectedVideos();
      }
    }
  );
}


/* =========================================================
 * ORDERS MODULE
 * Customer quantities are requests only.
 * Inventory is never checked or exposed here.
 * ======================================================= */

const ordersState = {
  orders: [],
  selectedOrder: null
};

function escapeOrderHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function orderStatusLabel(status) {
  return String(status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function renderOrdersList() {
  const container = $("#ordersList");
  const filter = $("#orderStatusFilter")?.value || "all";

  if (!container) return;

  const orders = ordersState.orders.filter(order => {
    return filter === "all" || order.status === filter;
  });

  if (!orders.length) {
    container.innerHTML =
      "<p>No orders found for this filter.</p>";
    return;
  }

  container.innerHTML = orders.map(order => {
    const customerName =
      escapeOrderHtml(order.customer?.name || "Customer");

    const itemCount =
      Array.isArray(order.items)
        ? order.items.reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0
          )
        : 0;

    const total =
      formatPrice(order.totals?.total || 0);

    const date =
      order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : "";

    return `
      <button
        type="button"
        class="order-row"
        data-order-id="${escapeOrderHtml(order.id)}"
      >
        <div>
          <strong>${customerName}</strong>
          <span>${escapeOrderHtml(order.id)}</span>
        </div>

        <div>
          <span>${itemCount} requested unit${itemCount === 1 ? "" : "s"}</span>
          <span>${escapeOrderHtml(orderStatusLabel(order.status))}</span>
        </div>

        <div>
          <strong>${escapeOrderHtml(total)}</strong>
          <span>${escapeOrderHtml(date)}</span>
        </div>
      </button>
    `;
  }).join("");
}

async function loadOrders() {
  const container = $("#ordersList");

  if (container) {
    container.innerHTML = "<p>Loading orders...</p>";
  }

  try {
    const data = await api("/api/orders");

    ordersState.orders =
      Array.isArray(data?.orders)
        ? data.orders
        : [];

    renderOrdersList();
  } catch (error) {
    console.error("Load orders error:", error);

    if (container) {
      container.innerHTML = `
        <p class="notice error show">
          ${escapeOrderHtml(
            error.message || "Could not load orders."
          )}
        </p>
      `;
    }
  }
}

function renderOrderDetail(order) {
  const panel = $("#orderDetailPanel");

  if (!panel || !order) return;

  ordersState.selectedOrder = order;

  $("#orderDetailTitle").textContent =
    `Order ${order.id}`;

  $("#orderDetailStatus").textContent =
    orderStatusLabel(order.status);

  const customer = order.customer || {};
  const fulfilment = order.fulfilment || {};

  $("#orderCustomerDetails").innerHTML = `
    <h3>Customer</h3>

    <div class="order-detail-grid">
      <div>
        <strong>Name</strong>
        <span>${escapeOrderHtml(customer.name)}</span>
      </div>

      <div>
        <strong>Phone</strong>
        <span>${escapeOrderHtml(customer.phone)}</span>
      </div>

      <div>
        <strong>Email</strong>
        <span>${escapeOrderHtml(customer.email || "—")}</span>
      </div>

      <div>
        <strong>Fulfilment</strong>
        <span>${escapeOrderHtml(
          orderStatusLabel(fulfilment.method)
        )}</span>
      </div>
    </div>

    ${
      fulfilment.method === "home_delivery"
        ? `
          <div class="order-address">
            <strong>Delivery address</strong>
            <span>
              ${escapeOrderHtml(
                fulfilment.delivery?.address || "—"
              )}
              ${escapeOrderHtml(
                fulfilment.delivery?.city || ""
              )}
              ${escapeOrderHtml(
                fulfilment.delivery?.state || ""
              )}
            </span>
          </div>
        `
        : `
          <div class="order-address">
            <strong>Pickup location</strong>
            <span>
              ${escapeOrderHtml(
                fulfilment.pickup?.location || "—"
              )}
            </span>
          </div>
        `
    }
  `;

  $("#orderItemsDetails").innerHTML = `
    <h3>Customer request</h3>

    <div class="order-items-table">
      ${order.items.map((item, index) => `
        <div class="order-item-row">
          <div>
            <strong>${escapeOrderHtml(
              item.productName
            )}</strong>

            ${
              item.variant
                ? `
                  <span>
                    ${escapeOrderHtml(
                      item.variant.name ||
                      item.variant.colour ||
                      item.variant.size ||
                      ""
                    )}
                  </span>
                `
                : ""
            }
          </div>

          <div>
            <strong>
              Requested: ${Number(item.quantity || 0)}
            </strong>
            <span>
              ${escapeOrderHtml(
                formatPrice(item.unitPrice || 0)
              )} each
            </span>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="order-request-total">
      Customer request total:
      <strong>
        ${escapeOrderHtml(
          formatPrice(order.totals?.subtotal || 0)
        )}
      </strong>
    </div>
  `;

  const form = $("#orderConfirmationForm");
  const fields = $("#confirmedQuantitiesFields");

  if (order.status === "pending") {
    form.hidden = false;

    fields.innerHTML = `
      <h4>Confirmed quantities</h4>
      <p class="order-help">
        Enter the quantity you agreed to supply after contacting the customer.
        This does not check or expose catalogue stock.
      </p>

      ${order.items.map((item, index) => {
        const key =
          `${item.productId}::${item.variantId || "product"}`;

        return `
          <label class="confirmed-quantity-field">
            <span>
              ${escapeOrderHtml(item.productName)}
              <small>
                Requested: ${Number(item.quantity || 0)}
              </small>
            </span>

            <input
              type="number"
              min="1"
              max="${Number(item.quantity || 1)}"
              step="1"
              required
              data-confirmed-stock-key="${escapeOrderHtml(key)}"
              value="${Number(item.quantity || 1)}"
            >
          </label>
        `;
      }).join("")}
    `;

    $("#orderDeliveryFee").value = "0";
    $("#orderAdminNote").value = "";
  } else {
    form.hidden = true;
    fields.innerHTML = "";
  }

  panel.hidden = false;
}

function closeOrderDetail() {
  const panel = $("#orderDetailPanel");

  if (panel) {
    panel.hidden = true;
  }

  ordersState.selectedOrder = null;
}

async function confirmSelectedOrder(event) {
  event.preventDefault();

  const order = ordersState.selectedOrder;

  if (!order || order.status !== "pending") {
    return;
  }

  const confirmedQuantities = {};

  document
    .querySelectorAll("[data-confirmed-stock-key]")
    .forEach(input => {
      confirmedQuantities[
        input.dataset.confirmedStockKey
      ] = Number(input.value);
    });

  const deliveryFee =
    Number($("#orderDeliveryFee")?.value || 0);

  const adminNote =
    $("#orderAdminNote")?.value.trim() || "";

  try {
    const result = await api(
      `/api/orders/${encodeURIComponent(order.id)}/confirm`,
      {
        method: "POST",
        body: JSON.stringify({
          confirmedQuantities,
          deliveryFee,
          adminNote
        })
      }
    );

    showNotice(
      "Order confirmed successfully.",
      "success"
    );

    await loadOrders();

    const updated =
      ordersState.orders.find(
        item => item.id === result?.id
      );

    if (updated) {
      renderOrderDetail(updated);
    } else {
      closeOrderDetail();
    }
  } catch (error) {
    console.error("Confirm order error:", error);

    showNotice(
      error.message || "Could not confirm order.",
      "error"
    );
  }
}

function bindOrderEvents() {
  $("#refreshOrdersButton")?.addEventListener(
    "click",
    loadOrders
  );

  $("#orderStatusFilter")?.addEventListener(
    "change",
    renderOrdersList
  );

  $("#ordersList")?.addEventListener(
    "click",
    event => {
      const row =
        event.target.closest("[data-order-id]");

      if (!row) return;

      const order =
        ordersState.orders.find(
          item => item.id === row.dataset.orderId
        );

      if (order) {
        renderOrderDetail(order);
      }
    }
  );

  $("#closeOrderDetailButton")?.addEventListener(
    "click",
    closeOrderDetail
  );

  $("#orderConfirmationForm")?.addEventListener(
    "submit",
    confirmSelectedOrder
  );
}

async function init() {
  bindEvents();
  bindOrderEvents();
  bindPaymentSettingsEvents();
  bindHomepageSettingsEvents();
  setView("dashboard");
  await loadProducts();
}

init();

async function deleteProduct(id) {
  const product = state.products.find(
    (item) => String(item.id) === String(id)
  );

  if (!product) {
    showNotice("Product could not be found.", "error");
    return;
  }

  const confirmed = window.confirm(
    `Delete "${product.name || "this product"}"?\n\nThis will permanently remove the product and its uploaded images.`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `/api/products/${encodeURIComponent(id)}`,
      {
        method: "DELETE"
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        "Could not delete product."
      );
    }

    await loadProducts();

    showNotice(
      "Product deleted successfully.",
      "success"
    );

    setView("products");
  } catch (error) {
    console.error(error);

    showNotice(
      error.message ||
      "Could not delete product.",
      "error"
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const authenticated = await checkAdminSession();

  if (!authenticated) {
    return;
  }

  if (typeof loadProducts === "function") {
    await loadProducts();
  }

  if (typeof loadOrders === "function") {
    await loadOrders();
  }

  if (typeof loadPaymentSettings === "function") {
    await loadPaymentSettings();
  }
});
