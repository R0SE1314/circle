(() => {
  "use strict";

  const canvas = document.querySelector("#cosmos");
  const ctx = canvas.getContext("2d", { alpha: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isCompact = () => window.innerWidth < 760;

  const state = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    scrollY: window.scrollY,
    pageHeight: document.documentElement.scrollHeight,
    pointerX: 0.5,
    pointerY: 0.5,
    targetPointerX: 0.5,
    targetPointerY: 0.5,
    stars: [],
    shootingStars: [],
    trail: [],
    bursts: [],
    impacts: [],
    lastTrailTime: 0,
    lastFrame: 0,
    running: true,
  };

  const sections = [...document.querySelectorAll("[data-ring-x]")];
  const navigationLinks = [...document.querySelectorAll("[data-nav]")];
  let revealObserver = null;
  let navigationObserver = null;
  const progressLine = document.querySelector("#scroll-progress");
  const progressValue = document.querySelector("#scroll-value");
  const localTime = document.querySelector("#local-time");
  const revealItems = [...document.querySelectorAll(".reveal")];
  const tarotButton = document.querySelector("#draw-tarot");
  const tarotButtonLabel = document.querySelector("#tarot-draw-label");
  const tarotDate = document.querySelector("#tarot-date");
  const tarotCard = document.querySelector("#tarot-card");
  const tarotCardFront = document.querySelector(".tarot-front");
  const tarotCardNumber = document.querySelector("#tarot-card-number");
  const tarotCardName = document.querySelector("#tarot-card-name");
  const tarotCardKeyword = document.querySelector("#tarot-card-keyword");
  const tarotReading = document.querySelector("#tarot-reading");
  const tarotReadingLabel = document.querySelector(".tarot-reading-label");
  const tarotReadingText = document.querySelector("#tarot-reading-text");
  const tarotStorageKey = "mobius-daily-tarot-v1";
  const tarotCards = [
    {
      number: "0",
      name: "愚者",
      english: "THE FOOL",
      keyword: "启程 · 自由",
      accent: "#a8c7d8",
      advice:
        "今天允许自己先迈出一步，不必把终点想清楚。轻盈不是逃避，是给未知留一扇门。",
    },
    {
      number: "I",
      name: "魔术师",
      english: "THE MAGICIAN",
      keyword: "创造 · 行动",
      accent: "#d9c8a9",
      advice:
        "把想法落到一个具体动作上。你并不缺答案，今天只需要让其中一件事真正开始。",
    },
    {
      number: "II",
      name: "女祭司",
      english: "THE HIGH PRIESTESS",
      keyword: "直觉 · 静默",
      accent: "#b8c3d8",
      advice:
        "先别急着解释自己。安静一会儿，身体最先感到的那份迟疑，往往比语言更诚实。",
    },
    {
      number: "III",
      name: "皇后",
      english: "THE EMPRESS",
      keyword: "滋养 · 丰盛",
      accent: "#d4b9b2",
      advice:
        "今天先照顾好自己的感受。能让你舒展的关系和事情，才值得你继续投入。",
    },
    {
      number: "IV",
      name: "皇帝",
      english: "THE EMPEROR",
      keyword: "边界 · 秩序",
      accent: "#c6b79f",
      advice:
        "替自己划一条清晰的边界。温柔不等于无限让步，稳定也可以从一句“不”开始。",
    },
    {
      number: "V",
      name: "教皇",
      english: "THE HIEROPHANT",
      keyword: "信念 · 传承",
      accent: "#bbae9a",
      advice:
        "不必独自解开所有问题。向可信的人询问，或回到曾被验证有效的方法里。",
    },
    {
      number: "VI",
      name: "恋人",
      english: "THE LOVERS",
      keyword: "选择 · 共鸣",
      accent: "#d8b8b6",
      advice:
        "今天的选择不必让所有人满意。更靠近真正与你同频的人与事，答案会更轻。",
    },
    {
      number: "VII",
      name: "战车",
      english: "THE CHARIOT",
      keyword: "方向 · 推进",
      accent: "#aabdd0",
      advice:
        "把注意力收回到一个目标上。你不需要更快，只需要在分心出现时重新握稳方向。",
    },
    {
      number: "VIII",
      name: "力量",
      english: "STRENGTH",
      keyword: "勇气 · 温柔",
      accent: "#d4b795",
      advice:
        "真正的力量不是硬撑。先承认“我也会累”，再用更温和的方式把事情继续下去。",
    },
    {
      number: "IX",
      name: "隐者",
      english: "THE HERMIT",
      keyword: "独处 · 内省",
      accent: "#aeb7bd",
      advice:
        "给今天留一点不被打扰的时间。暂时离开喧闹，不代表你正在后退。",
    },
    {
      number: "X",
      name: "命运之轮",
      english: "WHEEL OF FORTUNE",
      keyword: "转变 · 循环",
      accent: "#c6b8cf",
      advice:
        "计划有变化时，先别把它当成失败。旧的循环松动之处，正好可以放下一个旧习惯。",
    },
    {
      number: "XI",
      name: "正义",
      english: "JUSTICE",
      keyword: "平衡 · 诚实",
      accent: "#afc4c8",
      advice:
        "今天适合把事实和情绪分开看。诚实不是残忍，它会让真正适合你的选择浮现。",
    },
    {
      number: "XII",
      name: "倒吊人",
      english: "THE HANGED MAN",
      keyword: "暂停 · 换位",
      accent: "#a9c3c0",
      advice:
        "卡住的时候，不妨暂时停止用力。换一个角度，答案可能比你预想的更简单。",
    },
    {
      number: "XIII",
      name: "死神",
      english: "DEATH",
      keyword: "告别 · 更新",
      accent: "#aeb5c7",
      advice:
        "允许某件事在今天结束。告别并非抹去过去，而是把位置留给新的可能。",
    },
    {
      number: "XIV",
      name: "节制",
      english: "TEMPERANCE",
      keyword: "调和 · 节奏",
      accent: "#b9c9c1",
      advice:
        "今天不必把状态推到极限。找到能持续的节奏，慢慢来反而更接近你想要的结果。",
    },
    {
      number: "XV",
      name: "恶魔",
      english: "THE DEVIL",
      keyword: "欲望 · 束缚",
      accent: "#bfaaa4",
      advice:
        "看见让你反复消耗的东西，不必立刻挣脱。先停止责怪自己，解开的第一步才会出现。",
    },
    {
      number: "XVI",
      name: "高塔",
      english: "THE TOWER",
      keyword: "破局 · 真相",
      accent: "#bcafab",
      advice:
        "一个不稳定的部分显露出来，并不全是坏事。它让真正需要重建的地方变得清楚。",
    },
    {
      number: "XVII",
      name: "星星",
      english: "THE STAR",
      keyword: "希望 · 疗愈",
      accent: "#a9cade",
      advice:
        "今天先完成最小的一步，不必一次解决所有问题。你仍在靠近有光的地方。",
    },
    {
      number: "XVIII",
      name: "月亮",
      english: "THE MOON",
      keyword: "情绪 · 潜意识",
      accent: "#b3b8d1",
      advice:
        "情绪起伏时，不要急着给结论。先确认自己此刻真正需要的是休息、表达，还是一个拥抱。",
    },
    {
      number: "XIX",
      name: "太阳",
      english: "THE SUN",
      keyword: "明亮 · 真诚",
      accent: "#dbc39a",
      advice:
        "让真实的心意被看见。今天适合坦然表达快乐、感谢，或一句你一直没说的话。",
    },
    {
      number: "XX",
      name: "审判",
      english: "JUDGEMENT",
      keyword: "觉醒 · 回应",
      accent: "#adc6ca",
      advice:
        "听见内心反复出现的召唤。你不需要准备到完美，先回应它一次就足够。",
    },
    {
      number: "XXI",
      name: "世界",
      english: "THE WORLD",
      keyword: "完成 · 归位",
      accent: "#c0c8b8",
      advice:
        "允许一件努力很久的事得到收尾。完成不是结束，而是你终于可以带着它继续往前走。",
    },
  ];
  const tarotState = {
    dateKey: "",
    card: null,
    timer: 0,
  };

  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (from, to, amount) => from + (to - from) * amount;

  function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.pageHeight = document.documentElement.scrollHeight;
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    buildStars();

    if (reducedMotion.matches) {
      draw(performance.now());
    }
  }

  function buildStars() {
    const count = clamp(Math.floor((state.width * state.height) / 5800), 180, 340);
    state.stars = Array.from({ length: count }, (_, index) => {
      const depth = Math.random();
      return {
        x: Math.random(),
        y: Math.random(),
        depth,
        radius: lerp(0.35, 1.35, depth),
        alpha: lerp(0.22, 0.92, Math.random()),
        phase: Math.random() * Math.PI * 2,
        speed: lerp(0.0001, 0.00035, Math.random()),
        driftX: lerp(0.000003, 0.000016, depth),
        driftY: lerp(-0.0000015, -0.000007, depth),
        tint: index % 13 === 0 ? "blue" : index % 19 === 0 ? "warm" : "silver",
      };
    });
  }

  function drawBackground(time) {
    ctx.clearRect(0, 0, state.width, state.height);

    const base = ctx.createLinearGradient(0, 0, 0, state.height);
    base.addColorStop(0, "#0a0d14");
    base.addColorStop(0.5, "#10151d");
    base.addColorStop(1, "#080b11");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, state.width, state.height);

    const glow = ctx.createRadialGradient(
      state.width * 0.72,
      state.height * 0.38,
      0,
      state.width * 0.72,
      state.height * 0.38,
      Math.max(state.width, state.height) * 0.58
    );
    glow.addColorStop(0, "rgba(128, 158, 178, 0.095)");
    glow.addColorStop(0.45, "rgba(91, 109, 122, 0.032)");
    glow.addColorStop(1, "rgba(10, 13, 20, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, state.width, state.height);

    const warmGlow = ctx.createRadialGradient(
      state.width * 0.16,
      state.height * 0.1,
      0,
      state.width * 0.16,
      state.height * 0.1,
      Math.max(state.width, state.height) * 0.38
    );
    warmGlow.addColorStop(0, "rgba(201, 174, 158, 0.045)");
    warmGlow.addColorStop(1, "rgba(201, 174, 158, 0)");
    ctx.fillStyle = warmGlow;
    ctx.fillRect(0, 0, state.width, state.height);

    const pointerShiftX = (state.pointerX - 0.5) * 38;
    const pointerShiftY = (state.pointerY - 0.5) * 26;

    for (const star of state.stars) {
      const twinkle = reducedMotion.matches
        ? 0.72
        : 0.58 + Math.sin(time * star.speed + star.phase) * 0.32;
      const x =
        ((star.x * state.width +
          time * star.driftX * state.width +
          pointerShiftX * star.depth) %
          state.width +
          state.width) %
        state.width;
      const y =
        ((star.y * state.height +
          time * star.driftY * state.height +
          state.scrollY * star.depth * 0.012 +
          pointerShiftY * star.depth) %
          state.height +
          state.height) %
        state.height;
      const radius = star.radius * (isCompact() ? 0.82 : 1);
      const color =
        star.tint === "blue"
          ? "157, 190, 211"
          : star.tint === "warm"
            ? "225, 215, 195"
            : "220, 226, 232";

      if (star.depth > 0.7) {
        const trailX = x - star.driftX * state.width * 360;
        const trailY = y - star.driftY * state.height * 360;
        const trailGradient = ctx.createLinearGradient(trailX, trailY, x, y);
        trailGradient.addColorStop(0, `rgba(${color}, 0)`);
        trailGradient.addColorStop(1, `rgba(${color}, ${star.alpha * twinkle * 0.28})`);
        ctx.beginPath();
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = Math.max(0.45, radius * 0.55);
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(${color}, ${star.alpha * twinkle})`;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (star.depth > 0.86) {
        const flare = star.alpha * twinkle;
        const flareGradient = ctx.createRadialGradient(x, y, 0, x, y, 7);
        flareGradient.addColorStop(0, `rgba(${color}, ${flare * 0.32})`);
        flareGradient.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = flareGradient;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${color}, ${star.alpha * twinkle * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(x - 4.5, y);
        ctx.lineTo(x + 4.5, y);
        ctx.moveTo(x, y - 4.5);
        ctx.lineTo(x, y + 4.5);
        ctx.stroke();
      }
    }

    drawShootingStars(time);
  }

  function spawnShootingStar() {
    if (reducedMotion.matches || document.hidden) return;
    const startX = rand(state.width * 0.12, state.width * 0.78);
    const startY = rand(state.height * 0.08, state.height * 0.44);
    state.shootingStars.push({
      startX,
      startY,
      angle: rand(0.16, 0.36),
      length: rand(50, 110),
      life: 0,
      duration: rand(900, 1500),
    });
  }

  function drawShootingStars(time) {
    state.shootingStars = state.shootingStars.filter((star) => {
      if (!star.lastTick) star.lastTick = time;
      const delta = Math.min(time - star.lastTick, 32);
      star.lastTick = time;
      star.life += delta;
      const progress = star.life / star.duration;
      if (progress >= 1) return false;

      const distance = progress * 300;
      const x = star.startX + Math.cos(star.angle) * distance;
      const y = star.startY + Math.sin(star.angle) * distance;
      const tailX = x - Math.cos(star.angle) * star.length;
      const tailY = y - Math.sin(star.angle) * star.length;
      const opacity = Math.sin(progress * Math.PI) * 0.65;
      const gradient = ctx.createLinearGradient(tailX, tailY, x, y);
      gradient.addColorStop(0, "rgba(157, 190, 211, 0)");
      gradient.addColorStop(0.72, `rgba(157, 190, 211, ${opacity * 0.4})`);
      gradient.addColorStop(1, `rgba(241, 235, 223, ${opacity})`);

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(x, y);
      ctx.stroke();
      return true;
    });
  }

  function drawMoon(time) {
    const visibility = clamp(1 - getScrollRatio() * 3.4, 0, 1);
    if (visibility <= 0) return;

    const radius = isCompact() ? 42 : 56;
    const x = state.width * 0.84 + (state.pointerX - 0.5) * 10;
    const y = state.height * 0.2 + (state.pointerY - 0.5) * 7;
    const oscillation = reducedMotion.matches ? 0 : Math.sin(time * 0.00015) * 2;

    ctx.save();
    ctx.globalAlpha = visibility;

    const halo = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 2.7);
    halo.addColorStop(0, "rgba(245, 232, 214, 0.16)");
    halo.addColorStop(0.35, "rgba(207, 211, 211, 0.035)");
    halo.addColorStop(1, "rgba(207, 211, 211, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.7, 0, Math.PI * 2);
    ctx.fill();

    const moonGradient = ctx.createRadialGradient(
      x - radius * 0.38,
      y - radius * 0.35,
      radius * 0.12,
      x,
      y,
      radius
    );
    moonGradient.addColorStop(0, "rgba(255, 249, 237, 0.94)");
    moonGradient.addColorStop(0.62, "rgba(224, 216, 202, 0.62)");
    moonGradient.addColorStop(1, "rgba(171, 166, 157, 0.18)");
    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(x, y + oscillation, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0a0e15";
    ctx.beginPath();
    ctx.arc(x + radius * 0.45, y - radius * 0.13 + oscillation, radius * 0.92, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(219, 224, 225, 0.08)";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(x, y + oscillation, radius * 1.62, -0.3, Math.PI * 1.2);
    ctx.stroke();
    ctx.restore();
  }

  function drawOrbitLines(time, ringCenter) {
    ctx.save();
    ctx.translate(ringCenter.x, ringCenter.y);
    ctx.rotate(-0.22);

    const radiusX = ringCenter.size * 0.22;
    const radiusY = ringCenter.size * 0.073;
    const orbitAlpha = ringCenter.alpha * 0.2;

    for (let index = 0; index < 3; index += 1) {
      const offset = index * 0.12;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(157, 190, 211, ${orbitAlpha - index * 0.045})`;
      ctx.lineWidth = 0.5;
      ctx.ellipse(
        0,
        0,
        radiusX * (1 + offset),
        radiusY * (1 + offset),
        reducedMotion.matches ? 0.2 : Math.sin(time * 0.00012 + index) * 0.08,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(200, 228, 241, ${ringCenter.alpha * 0.52})`;
    const angle = reducedMotion.matches ? 2.2 : time * 0.00018 + 2.2;
    const px = Math.cos(angle) * radiusX * 1.17;
    const py = Math.sin(angle) * radiusY * 1.17;
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function getRingScene() {
    const viewportCenter = state.scrollY + state.height * 0.5;
    const points = sections.map((section) => {
      const top = section.offsetTop;
      return {
        y: top + section.offsetHeight * 0.5,
        x: Number(section.dataset.ringX),
        yRatio: Number(section.dataset.ringY),
        scale: Number(section.dataset.ringScale),
        alpha: Number(section.dataset.ringAlpha),
      };
    });

    let from = points[0];
    let to = points[points.length - 1];

    for (let index = 0; index < points.length - 1; index += 1) {
      if (viewportCenter >= points[index].y && viewportCenter <= points[index + 1].y) {
        from = points[index];
        to = points[index + 1];
        break;
      }
    }

    const amount = clamp((viewportCenter - from.y) / Math.max(to.y - from.y, 1), 0, 1);
    const eased = amount * amount * (3 - 2 * amount);
    return {
      x: lerp(from.x, to.x, eased) * state.width,
      y: lerp(from.yRatio, to.yRatio, eased) * state.height,
      scale: lerp(from.scale, to.scale, eased),
      alpha: lerp(from.alpha, to.alpha, eased),
      size: Math.min(state.width, state.height),
    };
  }

  function createMobiusQuads(time, ringCenter) {
    const uSegments = isCompact() ? 88 : 128;
    const vSegments = isCompact() ? 5 : 7;
    const radius = ringCenter.size * 0.235 * ringCenter.scale;
    const ribbonWidth = radius * 0.29;
    const perspective = ringCenter.size * 0.95;
    const rotationY =
      (reducedMotion.matches ? 0.5 : time * 0.00013) +
      (state.pointerX - 0.5) * 0.52 +
      getScrollRatio() * 1.15;
    const rotationX =
      -0.48 + (state.pointerY - 0.5) * 0.3 + Math.sin(time * 0.00009) * 0.08;
    const rotationZ = 0.1 + Math.sin(time * 0.00007) * 0.04;
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosZ = Math.cos(rotationZ);
    const sinZ = Math.sin(rotationZ);
    const quads = [];

    const project = (u, v) => {
      const half = u * 0.5;
      const ribbonOffset = v * ribbonWidth;
      let x = (radius + ribbonOffset * Math.cos(half)) * Math.cos(u);
      let z = (radius + ribbonOffset * Math.cos(half)) * Math.sin(u);
      let y = ribbonOffset * Math.sin(half);

      let rotatedX = x * cosY - z * sinY;
      let rotatedZ = x * sinY + z * cosY;
      const yAfterX = y * cosX - rotatedZ * sinX;
      rotatedZ = y * sinX + rotatedZ * cosX;
      const xAfterZ = rotatedX * cosZ - yAfterX * sinZ;
      const yAfterZ = rotatedX * sinZ + yAfterX * cosZ;

      const depth = perspective / (perspective + rotatedZ);
      return {
        x: ringCenter.x + xAfterZ * depth,
        y: ringCenter.y + yAfterZ * depth,
        z: rotatedZ,
        depth,
      };
    };

    for (let uIndex = 0; uIndex < uSegments; uIndex += 1) {
      const u0 = (uIndex / uSegments) * Math.PI * 2;
      const u1 = ((uIndex + 1) / uSegments) * Math.PI * 2;
      for (let vIndex = 0; vIndex < vSegments; vIndex += 1) {
        const v0 = -1 + (vIndex / vSegments) * 2;
        const v1 = -1 + ((vIndex + 1) / vSegments) * 2;
        const points = [project(u0, v0), project(u1, v0), project(u1, v1), project(u0, v1)];
        const averageZ = (points[0].z + points[1].z + points[2].z + points[3].z) / 4;
        quads.push({ points, z: averageZ, uIndex, vIndex });
      }
    }

    quads.sort((a, b) => b.z - a.z);
    return quads;
  }

  function drawMobius(time, ringCenter) {
    drawOrbitLines(time, ringCenter);
    const quads = createMobiusQuads(time, ringCenter);
    const baseAlpha = ringCenter.alpha;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.lineJoin = "round";

    for (const quad of quads) {
      const depthRatio = clamp((quad.z + ringCenter.size * 0.38) / (ringCenter.size * 0.76), 0, 1);
      const alpha = baseAlpha * lerp(0.035, 0.2, depthRatio);
      const hueShift = quad.uIndex / 128;
      const cool = Math.round(176 + hueShift * 20);
      const warm = Math.round(193 + hueShift * 13);

      ctx.beginPath();
      ctx.moveTo(quad.points[0].x, quad.points[0].y);
      ctx.lineTo(quad.points[1].x, quad.points[1].y);
      ctx.lineTo(quad.points[2].x, quad.points[2].y);
      ctx.lineTo(quad.points[3].x, quad.points[3].y);
      ctx.closePath();
      ctx.fillStyle = `rgba(${cool}, ${warm}, 209, ${alpha})`;
      ctx.fill();
    }

    const uSegments = isCompact() ? 88 : 128;
    const radius = ringCenter.size * 0.235 * ringCenter.scale;
    const ribbonWidth = radius * 0.29;
    const perspective = ringCenter.size * 0.95;
    const rotationY =
      (reducedMotion.matches ? 0.5 : time * 0.00013) +
      (state.pointerX - 0.5) * 0.52 +
      getScrollRatio() * 1.15;
    const rotationX =
      -0.48 + (state.pointerY - 0.5) * 0.3 + Math.sin(time * 0.00009) * 0.08;
    const rotationZ = 0.1 + Math.sin(time * 0.00007) * 0.04;
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosZ = Math.cos(rotationZ);
    const sinZ = Math.sin(rotationZ);

    const projectEdge = (u, side) => {
      const half = u * 0.5;
      const v = side * ribbonWidth;
      const x = (radius + v * Math.cos(half)) * Math.cos(u);
      const z = (radius + v * Math.cos(half)) * Math.sin(u);
      const y = v * Math.sin(half);
      const rotatedX = x * cosY - z * sinY;
      let rotatedZ = x * sinY + z * cosY;
      const yAfterX = y * cosX - rotatedZ * sinX;
      rotatedZ = y * sinX + rotatedZ * cosX;
      const xAfterZ = rotatedX * cosZ - yAfterX * sinZ;
      const yAfterZ = rotatedX * sinZ + yAfterX * cosZ;
      const depth = perspective / (perspective + rotatedZ);
      return {
        x: ringCenter.x + xAfterZ * depth,
        y: ringCenter.y + yAfterZ * depth,
        z: rotatedZ,
      };
    };

    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let index = 0; index <= uSegments; index += 1) {
        const point = projectEdge((index / uSegments) * Math.PI * 2, side);
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.strokeStyle = `rgba(225, 237, 240, ${baseAlpha * 0.4})`;
      ctx.lineWidth = 0.75;
      ctx.stroke();
    }

    ctx.restore();
  }

  function addTrail(x, y) {
    if (reducedMotion.matches) return;
    const now = performance.now();
    if (now - state.lastTrailTime < 34) return;
    state.lastTrailTime = now;
    state.trail.push({
      x,
      y,
      vx: rand(-0.16, 0.16),
      vy: rand(-0.1, 0.22),
      life: 1,
      size: rand(0.4, 1.3),
    });
    if (state.trail.length > 70) state.trail.shift();
  }

  function addBurst(x, y) {
    const now = performance.now();
    const particleCount = reducedMotion.matches ? 20 : 46;
    for (let index = 0; index < particleCount; index += 1) {
      const angle = (index / particleCount) * Math.PI * 2 + rand(-0.2, 0.2);
      const speed = rand(0.7, 3.4);
      state.trail.push({
        x,
        y,
        previousX: x,
        previousY: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: rand(0.948, 0.974),
        size: rand(0.55, 1.9),
        tint: index % 4 === 0 ? "blue" : index % 7 === 0 ? "rose" : "moon",
      });
    }
    state.bursts.push({
      x,
      y,
      born: now,
      duration: rand(1650, 2200),
      rotation: rand(0, Math.PI * 2),
      tilt: rand(0.28, 0.54),
      travel: rand(0.00018, 0.00028),
    });
    state.impacts.push({
      x,
      y,
      born: now,
      duration: 760,
      rotation: rand(0, Math.PI),
    });
    if (state.bursts.length > 4) state.bursts.shift();
    if (state.impacts.length > 3) state.impacts.shift();
  }

  function drawPointerEffects(time) {
    state.trail = state.trail.filter((particle) => {
      particle.previousX = particle.x;
      particle.previousY = particle.y;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.965;
      particle.vy *= 0.965;
      particle.vy += 0.003;
      particle.life *= particle.decay || 0.955;
      if (particle.life < 0.03) return false;

      const color =
        particle.tint === "blue"
          ? "174, 216, 235"
          : particle.tint === "rose"
            ? "225, 190, 187"
            : "244, 236, 220";
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${color}, ${particle.life * 0.72})`;
      ctx.lineWidth = Math.max(0.4, particle.size * particle.life * 0.72);
      ctx.moveTo(particle.previousX, particle.previousY);
      ctx.lineTo(particle.x, particle.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = `rgba(${color}, ${particle.life * 0.82})`;
      ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    state.bursts = state.bursts.filter((burst) => {
      const progress = clamp((time - burst.born) / burst.duration, 0, 1);
      if (progress >= 1) return false;

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const fade = Math.pow(1 - progress, 1.35);
      const orbitRadius = 8 + easeOut * 112;

      ctx.save();
      ctx.translate(burst.x, burst.y);
      ctx.rotate(burst.rotation + progress * 0.9);
      ctx.scale(1, burst.tilt);
      ctx.setLineDash([]);

      for (let ring = 0; ring < 3; ring += 1) {
        const ringRadius = orbitRadius * (0.58 + ring * 0.23);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${ring === 1 ? "199, 170, 167" : "157, 190, 211"}, ${
          fade * (0.54 - ring * 0.1)
        })`;
        ctx.lineWidth = ring === 0 ? 1.05 : 0.65;
        if (ring === 1) ctx.setLineDash([3, 7]);
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const planetAngle = time * burst.travel + burst.rotation;
      const planetX = Math.cos(planetAngle) * orbitRadius * 0.82;
      const planetY = Math.sin(planetAngle) * orbitRadius * 0.82;
      const planetGlow = ctx.createRadialGradient(planetX, planetY, 0, planetX, planetY, 13);
      planetGlow.addColorStop(0, `rgba(225, 241, 248, ${fade * 0.66})`);
      planetGlow.addColorStop(1, "rgba(157, 190, 211, 0)");
      ctx.fillStyle = planetGlow;
      ctx.beginPath();
      ctx.arc(planetX, planetY, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(225, 241, 248, ${fade})`;
      ctx.arc(planetX, planetY, 1.8 + fade * 0.9, 0, Math.PI * 2);
      ctx.fill();

      const tailX = Math.cos(planetAngle - 0.18) * orbitRadius * 0.82;
      const tailY = Math.sin(planetAngle - 0.18) * orbitRadius * 0.82;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(157, 190, 211, ${fade * 0.42})`;
      ctx.lineWidth = 0.8;
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(planetX, planetY);
      ctx.stroke();
      ctx.restore();
      return true;
    });

    state.impacts = state.impacts.filter((impact) => {
      const progress = clamp((time - impact.born) / impact.duration, 0, 1);
      if (progress >= 1) return false;

      const fade = Math.pow(1 - progress, 2.2);
      const flare = ctx.createRadialGradient(impact.x, impact.y, 0, impact.x, impact.y, 74 + progress * 50);
      flare.addColorStop(0, `rgba(255, 250, 238, ${fade})`);
      flare.addColorStop(0.12, `rgba(208, 237, 248, ${fade * 0.72})`);
      flare.addColorStop(0.42, `rgba(157, 190, 211, ${fade * 0.2})`);
      flare.addColorStop(1, "rgba(157, 190, 211, 0)");
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(impact.x, impact.y, 124, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(impact.x, impact.y);
      ctx.rotate(impact.rotation + progress * 0.7);
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = (ray / 8) * Math.PI * 2;
        const inner = 8 + progress * 18;
        const outer = 30 + progress * 76;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(233, 246, 250, ${fade * (ray % 2 === 0 ? 0.7 : 0.3)})`;
        ctx.lineWidth = ray % 2 === 0 ? 1.1 : 0.55;
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    });
  }

  function getScrollRatio() {
    const maxScroll = Math.max(state.pageHeight - state.height, 1);
    return clamp(state.scrollY / maxScroll, 0, 1);
  }

  function draw(time) {
    state.pointerX = lerp(state.pointerX, state.targetPointerX, 0.04);
    state.pointerY = lerp(state.pointerY, state.targetPointerY, 0.04);

    drawBackground(time);
    drawMoon(time);
    const ringCenter = getRingScene();
    drawMobius(time, ringCenter);
    drawPointerEffects(time);
  }

  let lastShootingStar = 0;
  function animate(time) {
    if (!state.running) return;
    const elapsed = time - state.lastFrame;
    state.lastFrame = time;

    const frameInterval = reducedMotion.matches ? 80 : 12;
    if (elapsed > frameInterval) {
      draw(time);
    }

    if (!reducedMotion.matches && time - lastShootingStar > rand(5200, 9200)) {
      lastShootingStar = time;
      spawnShootingStar();
    }

    requestAnimationFrame(animate);
  }

  function onScroll() {
    state.scrollY = window.scrollY;
    const ratio = getScrollRatio();
    progressLine.style.height = `${ratio * 100}%`;
    progressValue.textContent = String(Math.round(ratio * 100)).padStart(2, "0");
    revealVisibleItems();
    if (reducedMotion.matches) draw(performance.now());
  }

  function onPointerMove(event) {
    const point = event.touches ? event.touches[0] : event;
    state.targetPointerX = point.clientX / state.width;
    state.targetPointerY = point.clientY / state.height;
    addTrail(point.clientX, point.clientY);
  }

  function onClick(event) {
    if (event.clientX === 0 && event.clientY === 0) return;
    addBurst(event.clientX, event.clientY);
  }

  function revealItem(item) {
    if (item.classList.contains("is-visible")) return;
    item.classList.add("is-visible");
    if (revealObserver) revealObserver.unobserve(item);
  }

  function revealVisibleItems() {
    if (reducedMotion.matches) return;
    const cutoff = window.innerHeight * 0.92;
    revealItems.forEach((item) => {
      if (item.classList.contains("is-visible")) return;
      const rect = item.getBoundingClientRect();
      if (rect.top < cutoff && rect.bottom > 0) revealItem(item);
    });
  }

  function setupReveal() {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealItem(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
    requestAnimationFrame(revealVisibleItems);
  }

  function setupNavigation() {
    if (!("IntersectionObserver" in window)) return;

    navigationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navigationLinks.forEach((link) => {
            link.classList.toggle("is-active", link.dataset.nav === entry.target.id);
          });
        });
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0 }
    );

    document
      .querySelectorAll("section[id]")
      .forEach((section) => navigationObserver.observe(section));
  }

  function updateClock() {
    const now = new Date();
    const time = new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
    localTime.textContent = `SHANGHAI ${time}`;
  }

  function getShanghaiDate(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(
      parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
    );
    return {
      key: `${values.year}-${values.month}-${values.day}`,
      label: `${values.year}.${values.month}.${values.day}`,
    };
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function readSavedTarot() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(tarotStorageKey));
      if (
        !saved ||
        saved.date !== tarotState.dateKey ||
        !Number.isInteger(saved.cardIndex) ||
        saved.cardIndex < 0 ||
        saved.cardIndex >= tarotCards.length
      ) {
        return null;
      }
      return saved.cardIndex;
    } catch {
      return null;
    }
  }

  function saveTarot(cardIndex) {
    try {
      window.localStorage.setItem(
        tarotStorageKey,
        JSON.stringify({ date: tarotState.dateKey, cardIndex })
      );
    } catch {
      // The reading still works when local storage is unavailable.
    }
  }

  function renderTarot(card, cardIndex) {
    tarotState.card = { ...card, cardIndex };
    tarotCardNumber.textContent = card.number;
    tarotCardName.textContent = card.name;
    tarotCardKeyword.textContent = card.keyword;
    tarotReadingLabel.textContent = `TODAY / ${card.english}`;
    tarotReadingText.textContent = card.advice;
    tarotCardFront.style.setProperty("--card-accent", card.accent);
  }

  function showTarot(card, cardIndex, delay = 80) {
    window.clearTimeout(tarotState.timer);
    renderTarot(card, cardIndex);
    tarotState.timer = window.setTimeout(
      () => {
        tarotCard.setAttribute("aria-hidden", "false");
        tarotButton.setAttribute("aria-pressed", "true");
        tarotCard.classList.add("is-revealed");
        tarotReading.classList.add("is-active");
        tarotButtonLabel.textContent = "今日塔罗已开启";
        tarotButton.setAttribute(
          "aria-label",
          `今日已抽取${card.name}，再次点击可查看今日牌面`
        );
      },
      reducedMotion.matches ? 0 : delay
    );
  }

  function pulseTarot() {
    tarotCard.classList.remove("is-pulsing");
    void tarotCard.offsetWidth;
    tarotCard.classList.add("is-pulsing");
    window.setTimeout(() => tarotCard.classList.remove("is-pulsing"), 850);

    const rect = tarotCard.getBoundingClientRect();
    addBurst(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
  }

  function drawTarot() {
    if (tarotState.card) {
      pulseTarot();
      return;
    }

    const cardIndex = hashString(`${tarotState.dateKey}|mobius-daily-star`) % tarotCards.length;
    const card = tarotCards[cardIndex];
    saveTarot(cardIndex);
    showTarot(card, cardIndex);
  }

  function setupTarot() {
    if (!tarotButton || !tarotCard) return;

    const today = getShanghaiDate();
    tarotState.dateKey = today.key;
    tarotDate.textContent = `SHANGHAI / ${today.label}`;
    tarotButton.setAttribute("aria-pressed", "false");

    const savedIndex = readSavedTarot();
    if (savedIndex !== null) {
      showTarot(tarotCards[savedIndex], savedIndex, 420);
    }

    tarotButton.addEventListener("click", () => {
      if (!tarotState.card) {
        const rect = tarotButton.getBoundingClientRect();
        addBurst(rect.left + rect.width * 0.58, rect.top + rect.height * 0.5);
      }
      drawTarot();
    });
  }

  function bindEvents() {
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    document.addEventListener("visibilitychange", () => {
      state.running = !document.hidden;
      if (state.running) {
        state.lastFrame = performance.now();
        requestAnimationFrame(animate);
      }
    });
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches) {
        draw(performance.now());
      } else {
        state.lastFrame = performance.now();
        requestAnimationFrame(animate);
      }
    });
  }

  function init() {
    resize();
    setupReveal();
    setupNavigation();
    setupTarot();
    updateClock();
    setInterval(updateClock, 1000);
    bindEvents();
    onScroll();
    draw(performance.now());

    if (window.location.hash) {
      window.setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) target.scrollIntoView({ block: "start" });
      }, 120);
    }

    requestAnimationFrame(animate);
  }

  init();
})();
