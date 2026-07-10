// Background code field: random snippets placed on a jittered grid over a
// fixed-width virtual canvas centered on the viewport, so density does not
// change with the page width. Each snippet gets a random depth — the
// fraction of the scroll speed it moves at — which also sets its size,
// opacity, and blur (far = small, dim, soft). Snippets that scroll off the
// top wrap around to the bottom while fully hidden, so the field never
// empties. Purely decorative.
(function () {
  const layer = document.querySelector(".page-fx");
  if (!layer) return;

  const SNIPPETS = [
    "cmake_minimum_required(VERSION 3.15...4.3)\nproject(${SKBUILD_PROJECT_NAME} LANGUAGES C)",
    "example-project\n├── src/example/_core.c\n├── pyproject.toml\n└── CMakeLists.txt",
    "find_package(Python REQUIRED\n  COMPONENTS Interpreter Development.Module)",
    'PYBIND11_MODULE(_core, m) {\n    m.def("add", &add);\n}',
    "$ pip install scikit-build-core",
    "$ python -m build",
    "install(TARGETS _core DESTINATION example)",
    "python_add_library(_core MODULE _core.c WITH_SOABI)",
    '[tool.scikit-build]\nbuild.verbose = true\nlogging.level = "INFO"',
    "nanobind_add_module(_core NB_STATIC src/_core.cpp)",
    '[project]\nname = "example"\nversion = "0.0.1"',
    ">>> from example._core import add\n>>> add(1, 2)\n3",
    '[build-system]\nrequires = ["scikit-build-core"]\nbuild-backend = "scikit_build_core.build"',
    'NB_MODULE(_core, m) {\n  m.def("square", &square);\n}',
    '[tool.scikit-build]\nminimum-version = "build-system.requires"',
    'cmake.version = ">=3.26.1"\nninja.version = ">=1.11"',
    "find_package(pybind11 CONFIG REQUIRED)\npybind11_add_module(_core src/_core.cpp)",
    'wheel.py-api = "cp312"',
  ];

  // Near snippets render large — keep those to short lines so they don't
  // become walls of text
  const SHORT = SNIPPETS.filter(
    (s) => Math.max(...s.split("\n").map((l) => l.length)) <= 32,
  );

  const CANVAS_W = 2400; // px, virtual canvas width centered on the viewport
  const CELL_W = 180; // one snippet per jittered grid cell
  const CELL_H = 150;
  const SPEED = 0.6; // global multiplier on every snippet's scroll speed

  let items = [];

  function build() {
    layer.textContent = "";
    items = [];
    const height = layer.clientHeight || window.innerHeight;
    const originX = (layer.clientWidth - CANVAS_W) / 2;
    const cols = Math.ceil(CANVAS_W / CELL_W);
    const rows = Math.ceil(height / CELL_H);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let depth = 0.08 + Math.random() * 0.42;
        const x = originX + (c + 0.1 + Math.random() * 0.8) * CELL_W;
        const y = (r + 0.1 + Math.random() * 0.8) * CELL_H;
        // Keep the zone behind the logo/subtitle far and faint
        if (Math.abs(x - layer.clientWidth / 2) < 380 && y < height * 0.42) {
          depth = Math.min(depth, 0.14);
        }
        const pool = depth > 0.32 ? SHORT : SNIPPETS;
        const el = document.createElement("pre");
        el.className = "fx-code";
        el.textContent = pool[(Math.random() * pool.length) | 0];
        el.style.left = `${x.toFixed(0)}px`;
        el.style.top = `${y.toFixed(0)}px`;
        el.style.fontSize = `${(8 + depth * 16).toFixed(1)}px`;
        el.style.opacity = Math.min(1, 0.3 + depth * 1.4).toFixed(2);
        if (depth < 0.25) {
          el.style.filter = `blur(${((0.25 - depth) * 7).toFixed(2)}px)`;
        }
        layer.appendChild(el);
        items.push({ el, depth, baseTop: y, h: 0 });
      }
    }
    // Measure in a second pass to avoid layout thrash
    for (const it of items) {
      it.h = it.el.offsetHeight;
    }
  }

  function apply() {
    if (layer.clientWidth === 0) return;
    const scroll = window.scrollY;
    const range = layer.clientHeight + 1;
    for (const it of items) {
      // Wrap the parallax offset so the snippet re-enters from the bottom
      // (the jump happens while it is fully outside the viewport)
      const span = range + it.h;
      const virtual = it.baseTop - scroll * it.depth * SPEED;
      const wrapped = ((((virtual + it.h) % span) + span) % span) - it.h;
      it.el.style.transform = `translate3d(0, ${(wrapped - it.baseTop).toFixed(2)}px, 0)`;
    }
  }

  let raf = null;
  function wake() {
    if (raf === null) {
      raf = requestAnimationFrame(() => {
        raf = null;
        apply();
      });
    }
  }

  build();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      wake();
    }, 150);
  });
  window.addEventListener("scroll", wake, { passive: true });
  wake();
})();
