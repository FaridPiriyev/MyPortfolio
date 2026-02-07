const STAR_COLOR = "#fff";
const STAR_SIZE = 3;
const STAR_MIN_SCALE = 0.2;
const OVERFLOW_THRESHOLD = 50;
const STAR_COUNT = (window.innerWidth + window.innerHeight) / 8;

const canvas = document.querySelector("canvas");
const context = canvas ? canvas.getContext("2d") : null;

let scale = 1;
let width;
let height;

let stars = [];

let pointerX;
let pointerY;

let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 };

let touchInput = false;

if (canvas && context) {
  generate();
  resize();
  step();

  window.onresize = resize;
  canvas.onmousemove = onMouseMove;
  canvas.ontouchmove = onTouchMove;
  canvas.ontouchend = onMouseLeave;
  document.onmouseleave = onMouseLeave;
}

function generate() {
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: 0,
      y: 0,
      z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
    });
  }
}

function placeStar(star) {
  star.x = Math.random() * width;
  star.y = Math.random() * height;
}

function recycleStar(star) {
  let direction = "z";

  let vx = Math.abs(velocity.x);
  let vy = Math.abs(velocity.y);

  if (vx > 1 || vy > 1) {
    let axis;

    if (vx > vy) {
      axis = Math.random() < vx / (vx + vy) ? "h" : "v";
    } else {
      axis = Math.random() < vy / (vx + vy) ? "v" : "h";
    }

    if (axis === "h") {
      direction = velocity.x > 0 ? "l" : "r";
    } else {
      direction = velocity.y > 0 ? "t" : "b";
    }
  }

  star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

  if (direction === "z") {
    star.z = 0.1;
    star.x = Math.random() * width;
    star.y = Math.random() * height;
  } else if (direction === "l") {
    star.x = -OVERFLOW_THRESHOLD;
    star.y = height * Math.random();
  } else if (direction === "r") {
    star.x = width + OVERFLOW_THRESHOLD;
    star.y = height * Math.random();
  } else if (direction === "t") {
    star.x = width * Math.random();
    star.y = -OVERFLOW_THRESHOLD;
  } else if (direction === "b") {
    star.x = width * Math.random();
    star.y = height + OVERFLOW_THRESHOLD;
  }
}

function resize() {
  scale = window.devicePixelRatio || 1;

  width = window.innerWidth * scale;
  height = window.innerHeight * scale;

  canvas.width = width;
  canvas.height = height;

  stars.forEach(placeStar);
}

function step() {
  context.clearRect(0, 0, width, height);

  update();
  render();

  requestAnimationFrame(step);
}

function update() {
  velocity.tx *= 0.96;
  velocity.ty *= 0.96;

  velocity.x += (velocity.tx - velocity.x) * 0.8;
  velocity.y += (velocity.ty - velocity.y) * 0.8;

  stars.forEach((star) => {
    star.x += velocity.x * star.z;
    star.y += velocity.y * star.z;

    star.x += (star.x - width / 2) * velocity.z * star.z;
    star.y += (star.y - height / 2) * velocity.z * star.z;
    star.z += velocity.z;

    if (
      star.x < -OVERFLOW_THRESHOLD ||
      star.x > width + OVERFLOW_THRESHOLD ||
      star.y < -OVERFLOW_THRESHOLD ||
      star.y > height + OVERFLOW_THRESHOLD
    ) {
      recycleStar(star);
    }
  });
}

function render() {
  stars.forEach((star) => {
    context.beginPath();
    context.lineCap = "round";
    context.lineWidth = STAR_SIZE * star.z * scale;
    context.globalAlpha = 0.5 + 0.5 * Math.random();
    context.strokeStyle = STAR_COLOR;

    context.beginPath();
    context.moveTo(star.x, star.y);

    let tailX = velocity.x * 2;
    let tailY = velocity.y * 2;

    if (Math.abs(tailX) < 0.1) tailX = 0.5;
    if (Math.abs(tailY) < 0.1) tailY = 0.5;

    context.lineTo(star.x + tailX, star.y + tailY);

    context.stroke();
  });
}

function movePointer(x, y) {
  if (typeof pointerX === "number" && typeof pointerY === "number") {
    let ox = x - pointerX;
    let oy = y - pointerY;

    velocity.tx = velocity.tx + (ox / 8) * scale * (touchInput ? 1 : -1);
    velocity.ty = velocity.ty + (oy / 8) * scale * (touchInput ? 1 : -1);
  }

  pointerX = x;
  pointerY = y;
}

function onMouseMove(e) {
  touchInput = false;
  movePointer(e.clientX, e.clientY);
}

function onTouchMove(e) {
  touchInput = true;
  movePointer(e.touches[0].clientX, e.touches[0].clientY);
  e.preventDefault();
}

function onMouseLeave() {
  pointerX = null;
  pointerY = null;
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      const headerOffset = 70;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      const menuToggle = document.getElementById("menu-toggle");
      if (menuToggle && menuToggle.checked) {
        menuToggle.checked = false;
      }
    }
  });
});

window.addEventListener("scroll", () => {
  let current = "";
  const sections = document.querySelectorAll("section");

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.pageYOffset >= sectionTop - 100) {
      current = section.getAttribute("id");
    }
  });

  document.querySelectorAll(".menu a").forEach((link) => {
    link.style.color = "";
    if (link.getAttribute("href") === `#${current}`) {
      link.style.color = "var(--maincolor)";
    }
  });
});

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", function () {
    this.style.transform = "scale(0.98)";
    setTimeout(() => {
      this.style.transform = "";
    }, 150);
  });
});

function animateSkills() {
  const skillsSection = document.querySelector("#skills");
  const progressBars = document.querySelectorAll(".progress");

  if (!skillsSection || progressBars.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          progressBars.forEach((bar) => {
            const value = bar.getAttribute("data-percent");
            bar.style.width = value;
          });

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.3,
    },
  );

  observer.observe(skillsSection);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", animateSkills);
} else {
  animateSkills();
}

const settingsIcon = document.getElementById("settingsIcon");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");

settingsIcon.addEventListener("click", () => {
  settingsModal.classList.add("active");
});

closeSettings.addEventListener("click", () => {
  settingsModal.classList.remove("active");
});

settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.remove("active");
  }
});

const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
  themeToggle.checked = true;
}

themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.add("light-mode");
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.remove("light-mode");
    localStorage.setItem("theme", "dark");
  }
});

const colorOptions = document.querySelectorAll(".color-option");

const savedColor = localStorage.getItem("accentColor");
if (savedColor) {
  document.documentElement.style.setProperty("--maincolor", savedColor);

  colorOptions.forEach((opt) => {
    if (opt.dataset.color === savedColor) {
      opt.classList.add("active");
    } else {
      opt.classList.remove("active");
    }
  });
}

colorOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const color = option.dataset.color;

    colorOptions.forEach((opt) => opt.classList.remove("active"));

    option.classList.add("active");
    document.documentElement.style.setProperty("--maincolor", color);

    localStorage.setItem("accentColor", color);
  });
});


const scrollTopBtn = document.getElementById("scrollTop");
const progressCircle = document.querySelector(".progress-ring__circle");
const radius = progressCircle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

window.addEventListener("scroll", () => {
  if (window.pageYOffset > 200) {
    scrollTopBtn.classList.add("active");
  } else {
    scrollTopBtn.classList.remove("active");
  }

  const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPosition = window.pageYOffset;
  const scrollPercentage = scrollPosition / scrollTotal;
  const offset = circumference - scrollPercentage * circumference;
  progressCircle.style.strokeDashoffset = offset;
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});