const navToggle = document.querySelector("#navToggle");
const navMenu = document.querySelector("#navMenu");
const siteHeader = document.querySelector("#siteHeader");

if (window.lucide) {
  window.lucide.createIcons();
}

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("scroll", () => {
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
});

const trackingForm = document.querySelector("#trackingForm");
const trackingNumber = document.querySelector("#trackingNumber");

trackingForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const trackingNo = trackingNumber?.value.trim();
  if (!trackingNo) {
    trackingNumber?.focus();
    return;
  }

  const trackingUrl = new URL("http://admin.amtxpress.com/api/tracking_api/get_tracking_data");
  trackingUrl.searchParams.set("api_company_id", "11");
  trackingUrl.searchParams.set("customer_code", "superadmin");
  trackingUrl.searchParams.set("tracking_no", trackingNo);

  const trackingPage = window.open(trackingUrl.toString(), "_blank", "noopener");
  if (!trackingPage) {
    window.location.href = trackingUrl.toString();
  }
});

const quoteForm = document.querySelector("#quote");
const quoteFormStatus = document.querySelector("#quoteFormStatus");

quoteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(quoteForm);
  const values = Object.fromEntries(formData.entries());
  const requiredFields = [
    "name",
    "phone",
    "email",
    "pickupCountry",
    "destinationCountry",
    "shipmentType",
    "weight",
    "message",
  ];

  const missing = requiredFields.filter((field) => !String(values[field] || "").trim());
  if (missing.length) {
    quoteFormStatus.textContent = "Please fill in all required fields before sending your quote request.";
    quoteFormStatus.classList.add("form-status--error");
    quoteFormStatus.classList.remove("form-status--success");
    return;
  }

  const submitButton = quoteForm.querySelector('button[type="submit"]');
  quoteFormStatus.textContent = "Sending your quote request...";
  quoteFormStatus.classList.remove("form-status--error", "form-status--success");
  submitButton.disabled = true;

  try {
    formData.set("_subject", "AMT Shipping Quote Request");
    formData.set("_template", "table");

    const response = await fetch("https://formsubmit.co/ajax/sales@amtxpress.com", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to send your quote request right now.");
    }

    quoteForm.reset();
    quoteFormStatus.textContent = "Thank you. Your quote request has been sent to sales@amtxpress.com.";
    quoteFormStatus.classList.add("form-status--success");
    quoteFormStatus.classList.remove("form-status--error");
  } catch (error) {
    quoteFormStatus.textContent = error.message || "Unable to send your quote request right now. Please try again.";
    quoteFormStatus.classList.add("form-status--error");
    quoteFormStatus.classList.remove("form-status--success");
  } finally {
    submitButton.disabled = false;
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const number = entry.target;
      const target = Number(number.dataset.count || 0);
      const duration = 1200;
      const started = performance.now();

      const tick = (time) => {
        const progress = Math.min((time - started) / duration, 1);
        const value = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
        number.textContent = target === 99 ? `${value}%` : `${value}+`;

        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      countObserver.unobserve(number);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll("[data-count]").forEach((number) => countObserver.observe(number));
