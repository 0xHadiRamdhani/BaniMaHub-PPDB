"use client";

import { useEffect, useRef } from "react";

/* ── Ikon & Token Makanan E-Kantin yang melayang (gaya blueprint halaman utama) ── */
type FoodIconType =
  | "bowl"
  | "cup"
  | "burger"
  | "mug"
  | "utensils"
  | "bread"
  | "onigiri"
  | "donut";

const FOOD_ICONS: FoodIconType[] = [
  "bowl",
  "cup",
  "burger",
  "mug",
  "utensils",
  "bread",
  "onigiri",
  "donut",
];

const FOOD_LABELS = [
  "KANTIN",
  "SEGAR",
  "HALAL",
  "SNACK",
  "MINUMAN",
  "NASI",
  "KOPI",
  "ROTI",
  "ATK",
  "KOPERASI",
];

type FloatFood = {
  x: number;
  y: number;
  kind: "icon" | "label";
  icon: FoodIconType;
  label: string;
  speed: number;
  opacity: number;
  size: number;
  drift: number;
  angle: number;
  spin: number;
};

type ScanLine = {
  y: number;
  speed: number;
  opacity: number;
  blur: number;
};

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

const CONNECT_DIST = 130;
const NODE_COUNT = 28;

export default function FoodBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0,
      h = 0;
    let gridOffset = 0;

    /* ── Floating Food Items ── */
    const items: FloatFood[] = [];

    function spawnItem(): FloatFood {
      const isIcon = Math.random() < 0.72;
      return {
        x: Math.random() * w,
        y: h + 30,
        kind: isIcon ? "icon" : "label",
        icon: FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)],
        label: FOOD_LABELS[Math.floor(Math.random() * FOOD_LABELS.length)],
        speed: 0.14 + Math.random() * 0.24,
        opacity: isIcon ? 0.12 + Math.random() * 0.14 : 0.055 + Math.random() * 0.075,
        size: isIcon ? 18 + Math.floor(Math.random() * 14) : 10 + Math.floor(Math.random() * 6),
        drift: (Math.random() - 0.5) * 0.11,
        angle: (Math.random() - 0.5) * 0.35,
        spin: (Math.random() - 0.5) * 0.0025,
      };
    }

    function initItems() {
      items.length = 0;
      const count = Math.max(12, Math.floor((w * h) / 24000));
      for (let i = 0; i < count; i++) {
        const it = spawnItem();
        it.y = Math.random() * h;
        items.push(it);
      }
    }

    /* ── Scan lines ── */
    const scans: ScanLine[] = [
      { y: 0, speed: 0.38, opacity: 0.028, blur: 70 },
      { y: 0, speed: 0.55, opacity: 0.018, blur: 50 },
    ];

    function initScans() {
      scans[0].y = Math.random() * h * 0.4;
      scans[1].y = Math.random() * h * 0.7;
    }

    /* ── Network nodes ── */
    const nodes: Node[] = [];

    function initNodes() {
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1.5 + Math.random() * 1.5,
        });
      }
    }

    /* ── Resize ── */
    function resize() {
      w = canvas!.width = canvas!.offsetWidth;
      h = canvas!.height = canvas!.offsetHeight;
      initItems();
      initScans();
      initNodes();
    }

    /* ── Draw: blueprint grid (identik dengan halaman utama) ── */
    function drawGrid() {
      const CELL = 44;
      const ANGLE = Math.PI / 6;
      const offset = gridOffset % CELL;

      ctx!.save();
      ctx!.strokeStyle = "rgba(37,99,235,0.20)";
      ctx!.lineWidth = 1;

      ctx!.translate(w / 2, h / 2);
      ctx!.rotate(ANGLE);
      ctx!.translate(offset, offset);

      const diag = Math.sqrt(w * w + h * h) + CELL * 4;
      const n = Math.ceil(diag / CELL) + 2;

      for (let c = -n; c < n; c++) {
        ctx!.beginPath();
        ctx!.moveTo(c * CELL, -diag);
        ctx!.lineTo(c * CELL, diag);
        ctx!.stroke();
      }
      for (let r = -n; r < n; r++) {
        ctx!.beginPath();
        ctx!.moveTo(-diag, r * CELL);
        ctx!.lineTo(diag, r * CELL);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    /* ── Draw: scan lines ── */
    function drawScans() {
      scans.forEach((sl) => {
        const g = ctx!.createLinearGradient(0, sl.y - sl.blur / 2, 0, sl.y + sl.blur / 2);
        g.addColorStop(0, "rgba(37,99,235,0)");
        g.addColorStop(0.5, `rgba(37,99,235,${sl.opacity})`);
        g.addColorStop(1, "rgba(37,99,235,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, sl.y - sl.blur / 2, w, sl.blur);
        sl.y += sl.speed;
        if (sl.y - sl.blur / 2 > h) sl.y = -sl.blur;
      });
    }

    /* ── Draw vector food icon in blueprint style ── */
    function drawFoodVector(icon: FoodIconType, s: number) {
      const r = s / 2;
      ctx!.lineWidth = 1.5;
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";

      switch (icon) {
        case "bowl": {
          // Mangkok bakso / mie hangat + uap
          ctx!.beginPath();
          ctx!.arc(0, 0, r, 0, Math.PI, false);
          ctx!.closePath();
          ctx!.stroke();
          // Alas mangkok
          ctx!.beginPath();
          ctx!.moveTo(-r * 0.45, r + 2);
          ctx!.lineTo(r * 0.45, r + 2);
          ctx!.stroke();
          // Sumpit / uap atas
          ctx!.beginPath();
          ctx!.moveTo(-r * 0.35, -3);
          ctx!.quadraticCurveTo(-r * 0.5, -r * 0.55, -r * 0.25, -r * 0.85);
          ctx!.moveTo(r * 0.15, -3);
          ctx!.quadraticCurveTo(0, -r * 0.55, r * 0.25, -r * 0.85);
          ctx!.stroke();
          break;
        }
        case "cup": {
          // Cup minuman es / boba + sedotan
          ctx!.beginPath();
          ctx!.moveTo(-r * 0.65, -r * 0.35);
          ctx!.lineTo(r * 0.65, -r * 0.35);
          ctx!.lineTo(r * 0.48, r * 0.9);
          ctx!.lineTo(-r * 0.48, r * 0.9);
          ctx!.closePath();
          ctx!.stroke();
          // Tutup dome
          ctx!.beginPath();
          ctx!.arc(0, -r * 0.35, r * 0.65, Math.PI, 0, false);
          ctx!.stroke();
          // Sedotan
          ctx!.beginPath();
          ctx!.moveTo(r * 0.1, -r * 0.35);
          ctx!.lineTo(r * 0.35, -r * 1.15);
          ctx!.stroke();
          break;
        }
        case "burger": {
          // Roti atas
          ctx!.beginPath();
          ctx!.arc(0, -r * 0.15, r * 0.85, Math.PI, 0, false);
          ctx!.closePath();
          ctx!.stroke();
          // Patty tengah
          ctx!.beginPath();
          ctx!.moveTo(-r * 0.9, r * 0.12);
          ctx!.lineTo(r * 0.9, r * 0.12);
          ctx!.stroke();
          // Roti bawah
          ctx!.beginPath();
          ctx!.roundRect(-r * 0.82, r * 0.3, r * 1.64, r * 0.42, 3);
          ctx!.stroke();
          break;
        }
        case "mug": {
          // Cangkir kopi / teh hangat
          ctx!.beginPath();
          ctx!.roundRect(-r * 0.65, -r * 0.35, r * 1.15, r * 1.15, [0, 0, 5, 5]);
          ctx!.stroke();
          // Gagang cangkir
          ctx!.beginPath();
          ctx!.arc(r * 0.5, r * 0.2, r * 0.32, -Math.PI / 2, Math.PI / 2, false);
          ctx!.stroke();
          break;
        }
        case "utensils": {
          // Sendok & Garpu menyilang
          ctx!.beginPath();
          ctx!.moveTo(-r * 0.4, -r * 0.85);
          ctx!.lineTo(-r * 0.4, r * 0.85);
          ctx!.moveTo(-r * 0.6, -r * 0.85);
          ctx!.lineTo(-r * 0.6, -r * 0.25);
          ctx!.moveTo(-r * 0.2, -r * 0.85);
          ctx!.lineTo(-r * 0.2, -r * 0.25);
          ctx!.stroke();
          // Sendok di kanan
          ctx!.beginPath();
          ctx!.ellipse(r * 0.4, -r * 0.5, r * 0.25, r * 0.35, 0, 0, Math.PI * 2);
          ctx!.moveTo(r * 0.4, -r * 0.15);
          ctx!.lineTo(r * 0.4, r * 0.85);
          ctx!.stroke();
          break;
        }
        case "bread": {
          // Roti bakar / tawar
          ctx!.beginPath();
          ctx!.roundRect(-r * 0.75, -r * 0.55, r * 1.5, r * 1.35, 4);
          ctx!.stroke();
          ctx!.beginPath();
          ctx!.arc(0, -r * 0.55, r * 0.75, Math.PI, 0, false);
          ctx!.stroke();
          break;
        }
        case "onigiri": {
          // Nasi kepal segitiga
          ctx!.beginPath();
          ctx!.moveTo(0, -r * 0.85);
          ctx!.lineTo(r * 0.85, r * 0.75);
          ctx!.lineTo(-r * 0.85, r * 0.75);
          ctx!.closePath();
          ctx!.stroke();
          // Nori bawah
          ctx!.beginPath();
          ctx!.rect(-r * 0.32, r * 0.2, r * 0.64, r * 0.55);
          ctx!.stroke();
          break;
        }
        case "donut": {
          // Donat
          ctx!.beginPath();
          ctx!.arc(0, 0, r * 0.82, 0, Math.PI * 2);
          ctx!.stroke();
          ctx!.beginPath();
          ctx!.arc(0, 0, r * 0.3, 0, Math.PI * 2);
          ctx!.stroke();
          break;
        }
      }
    }

    /* ── Draw: floating food items ── */
    function drawItems() {
      items.forEach((it) => {
        ctx!.save();
        ctx!.translate(it.x, it.y);
        ctx!.rotate(it.angle);

        if (it.kind === "icon") {
          ctx!.strokeStyle = `rgba(56,189,248,${it.opacity})`;
          drawFoodVector(it.icon, it.size);
        } else {
          ctx!.font = `600 ${it.size}px monospace`;
          ctx!.fillStyle = `rgba(37,99,235,${it.opacity})`;
          ctx!.fillText(it.label, 0, 0);
        }
        ctx!.restore();

        it.y -= it.speed;
        it.x += it.drift;
        it.angle += it.spin;

        if (it.y + it.size < -25) {
          Object.assign(it, spawnItem());
        }
        if (it.x < -60) it.x = w + 20;
        if (it.x > w + 60) it.x = -20;
      });
    }

    /* ── Draw: network nodes + edges ── */
    function drawNetwork() {
      nodes.forEach((nd) => {
        nd.x += nd.vx;
        nd.y += nd.vy;
        if (nd.x < 0 || nd.x > w) nd.vx *= -1;
        if (nd.y < 0 || nd.y > h) nd.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.12;
            ctx!.strokeStyle = `rgba(37,99,235,${alpha.toFixed(3)})`;
            ctx!.lineWidth = 0.8;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.stroke();
          }
        }
      }

      nodes.forEach((nd) => {
        ctx!.beginPath();
        ctx!.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(37,99,235,0.18)";
        ctx!.fill();
      });
    }

    /* ── Main loop ── */
    function loop() {
      ctx!.clearRect(0, 0, w, h);

      drawGrid();
      gridOffset += 0.22;

      drawNetwork();
      drawScans();
      drawItems();

      animId = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    loop();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
