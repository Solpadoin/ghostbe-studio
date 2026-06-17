const configPath = "config/config.txt";

const parseConfig = (text) => {
  const config = {};

  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;

    const separator = line.indexOf("=");
    if (separator === -1) return;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    config[key] = value;
  });

  return config;
};

const groupedItems = (config, prefix) => {
  const ids = new Set();
  Object.keys(config).forEach((key) => {
    const match = key.match(new RegExp(`^${prefix}_(\\d+)_`));
    if (match) ids.add(Number(match[1]));
  });

  return [...ids].sort((a, b) => a - b).map((id) => ({
    title: config[`${prefix}_${id}_TITLE`] || "",
    status: config[`${prefix}_${id}_STATUS`] || "",
    text: config[`${prefix}_${id}_TEXT`] || "",
    image: config[`${prefix}_${id}_IMAGE`] || "",
    url: config[`${prefix}_${id}_URL`] || "#",
    linkText: config[`${prefix}_${id}_LINK_TEXT`] || "Open",
  }));
};

const externalAttrs = (anchor, href) => {
  if (/^https?:\/\//.test(href)) {
    anchor.target = "_blank";
    anchor.rel = "noopener";
  }
};

const applyConfig = (config) => {
  document.querySelectorAll("[data-config]").forEach((node) => {
    const value = config[node.dataset.config];
    if (value) node.textContent = value;
  });

  document.querySelectorAll("[data-config-href]").forEach((node) => {
    const href = config[node.dataset.configHref];
    if (!href) return;
    node.href = href;
    externalAttrs(node, href);
  });

  renderServices(groupedItems(config, "SERVICE"));
  renderProjects(groupedItems(config, "PROJECT"));
};

const renderServices = (services) => {
  if (!services.length) return;
  const grid = document.querySelector("#servicesGrid");
  grid.innerHTML = services.map((service, index) => `
    <article class="service-card" data-tilt>
      <span class="service-index">${String(index + 1).padStart(2, "0")}</span>
      <h3>${service.title}</h3>
      <p>${service.text}</p>
      <a href="${service.url}">${service.linkText}</a>
    </article>
  `).join("");

  grid.querySelectorAll("a").forEach((anchor) => externalAttrs(anchor, anchor.getAttribute("href")));
};

const renderProjects = (projects) => {
  if (!projects.length) return;
  const grid = document.querySelector("#projectsGrid");
  grid.innerHTML = projects.map((project, index) => `
    <article class="project-card${index === 0 ? " is-active" : ""}" data-project-card data-tilt>
      <img src="${project.image}" alt="${project.title} preview">
      <div>
        <span>${project.status}</span>
        <h3>${project.title}</h3>
        <p>${project.text}</p>
        <a href="${project.url}">${project.linkText}</a>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("a").forEach((anchor) => externalAttrs(anchor, anchor.getAttribute("href")));
  bindProjectCards();
  bindTilt();
};

const bindProjectCards = () => {
  const cards = document.querySelectorAll("[data-project-card]");
  const kicker = document.querySelector("#projectKicker");
  const title = document.querySelector("#projectTitle");
  const text = document.querySelector("#projectText");

  cards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;

      cards.forEach((item) => item.classList.remove("is-active"));
      card.classList.add("is-active");

      kicker.textContent = card.querySelector("span")?.textContent || "Selected project";
      title.textContent = card.querySelector("h3")?.textContent || "";
      text.textContent = card.querySelector("p")?.textContent || "";
    });
  });
};

const bindTilt = () => {
  const tiltItems = document.querySelectorAll("[data-tilt]");
  tiltItems.forEach((item) => {
    if (item.dataset.tiltReady) return;
    item.dataset.tiltReady = "true";

    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      item.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 7}deg) translateY(-2px)`;
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
    });
  });
};

const bindHeader = () => {
  const header = document.querySelector(".site-header");
  const update = () => header.dataset.state = window.scrollY > 24 ? "scrolled" : "top";
  update();
  window.addEventListener("scroll", update, { passive: true });
};

const bindCursorLight = () => {
  const light = document.querySelector("#cursorLight");
  window.addEventListener("pointermove", (event) => {
    light.style.left = `${event.clientX}px`;
    light.style.top = `${event.clientY}px`;
  }, { passive: true });
};

const animateCounters = () => {
  const counters = document.querySelectorAll("[data-count]");
  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    let value = 0;
    const step = () => {
      value += Math.max(1, Math.ceil(target / 24));
      counter.textContent = Math.min(value, target);
      if (value < target) requestAnimationFrame(step);
    };
    step();
  });
};

const drawField = () => {
  const canvas = document.querySelector("#orbitalField");
  const ctx = canvas.getContext("2d");
  const dots = Array.from({ length: 70 }, (_, index) => ({
    angle: index * 0.71,
    radius: 80 + (index % 17) * 18,
    speed: 0.0004 + (index % 9) * 0.00008,
    size: 1 + (index % 4) * 0.45,
  }));

  const resize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };

  const frame = (time) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    dots.forEach((dot) => {
      const x = width * 0.5 + Math.cos(dot.angle + time * dot.speed) * dot.radius;
      const y = height * 0.42 + Math.sin(dot.angle + time * dot.speed * 1.7) * dot.radius * 0.56;
      ctx.beginPath();
      ctx.arc(x, y, dot.size, 0, Math.PI * 2);
      ctx.fillStyle = dot.size > 2 ? "rgba(255, 138, 36, 0.45)" : "rgba(57, 212, 255, 0.28)";
      ctx.fill();
    });

    requestAnimationFrame(frame);
  };

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
};

fetch(configPath)
  .then((response) => response.ok ? response.text() : Promise.reject(new Error("Config not found")))
  .then((text) => applyConfig(parseConfig(text)))
  .catch(() => {});

bindHeader();
bindCursorLight();
bindProjectCards();
bindTilt();
animateCounters();
drawField();
