"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, createDrawable, createMotionPath, createTimeline, stagger, utils } from "animejs";
import { canAnimate } from "@/lib/anime-desk";

const MOTES = 7;
const SPREAD = 0.34;
const RAY_OFFSETS = [-0.32, -0.21, -0.11, 0, 0.11, 0.21, 0.32];

function polar(x: number, y: number, angle: number, length: number) {
  return { x: x + Math.cos(angle) * length, y: y + Math.sin(angle) * length };
}

function screenPoint(svg: SVGSVGElement, x: number, y: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    const box = svg.getBoundingClientRect();
    return { x: box.left + (x / 180) * box.width, y: box.top + (y / 230) * box.height };
  }
  const pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  const mapped = pt.matrixTransform(ctm);
  return { x: mapped.x, y: mapped.y };
}

function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const mapped = pt.matrixTransform(ctm.inverse());
  return { x: mapped.x, y: mapped.y };
}

export default function DeskLamp({ streaming = false }: { streaming?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const lamp = rootRef.current;
    const beam = beamRef.current;
    if (!lamp || !beam) return;

    const field = beam.querySelector<SVGSVGElement>(".desk-lamp__field");
    const cone = beam.querySelector<SVGPolygonElement>(".desk-lamp__cone");
    const glow = beam.querySelector<SVGCircleElement>(".desk-lamp__glow");
    const core = beam.querySelector<SVGCircleElement>(".desk-lamp__core");
    const grad = beam.querySelector<SVGLinearGradientElement>("#lamp-cone-grad");
    const radial = beam.querySelector<SVGRadialGradientElement>("#lamp-bulb-grad");
    const rays = [...beam.querySelectorAll<SVGPathElement>(".desk-lamp__ray")];
    const motes = [...beam.querySelectorAll<HTMLElement>(".desk-lamp__mote")];
    const fixture = lamp.querySelector<SVGSVGElement>(".desk-lamp__fixture");
    const bulb = lamp.querySelector(".desk-lamp__bulb");
    const arms = lamp.querySelectorAll(".desk-lamp__arm");
    if (!field || !fixture) return;

    const layout = () => {
      const bulbEl = lamp.querySelector(".desk-lamp__bulb");
      if (!bulbEl) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      field.setAttribute("viewBox", `0 0 ${w} ${h}`);
      field.setAttribute("preserveAspectRatio", "none");
      field.style.width = `${w}px`;
      field.style.height = `${h}px`;

      const box = bulbEl.getBoundingClientRect();
      const origin = clientToSvg(field, box.left + box.width / 2, box.top + box.height / 2);
      const aimScreen = screenPoint(fixture, 14, 236);
      const aim = clientToSvg(field, aimScreen.x, aimScreen.y);
      const x = origin.x;
      const y = origin.y;
      const axis = Math.atan2(aim.y - y, aim.x - x);
      const reach = Math.hypot(w, h) * 1.25;
      const left = polar(x, y, axis - SPREAD, reach);
      const right = polar(x, y, axis + SPREAD, reach);
      const far = polar(x, y, axis, reach);

      cone?.setAttribute("points", `${x},${y} ${left.x},${left.y} ${right.x},${right.y}`);
      glow?.setAttribute("cx", String(x));
      glow?.setAttribute("cy", String(y));
      core?.setAttribute("cx", String(x));
      core?.setAttribute("cy", String(y));
      grad?.setAttribute("x1", String(x));
      grad?.setAttribute("y1", String(y));
      grad?.setAttribute("x2", String(far.x));
      grad?.setAttribute("y2", String(far.y));
      radial?.setAttribute("cx", String(x));
      radial?.setAttribute("cy", String(y));
      radial?.setAttribute("fx", String(x));
      radial?.setAttribute("fy", String(y));

      RAY_OFFSETS.forEach((offset, i) => {
        const ray = rays[i];
        if (!ray) return;
        const end = polar(x, y, axis + offset, reach * 0.92);
        ray.setAttribute("d", `M ${x} ${y} L ${end.x} ${end.y}`);
      });
    };

    layout();

    const motion = canAnimate();
    const cleanups: Array<() => void> = [];
    let frame = 0;
    const follow = () => {
      layout();
      frame = window.requestAnimationFrame(follow);
    };
    frame = window.requestAnimationFrame(follow);
    cleanups.push(() => window.cancelAnimationFrame(frame));

    if (motion) {
      if (arms.length) {
        animate(createDrawable(arms), {
          draw: ["0 0", "0 1"],
          duration: 1100,
          ease: "inOut(3)",
          delay: stagger(90),
        });
      }

      const tl = createTimeline({ defaults: { ease: "out(3)" } });
      utils.set(beam, { opacity: 0 });
      tl.add(beam, { opacity: 1, duration: 720 }, 0);
      if (glow) {
        utils.set(glow, { opacity: 0 });
        tl.add(glow, { opacity: 1, duration: 640 }, 40);
      }
      if (cone) {
        utils.set(cone, { opacity: 0 });
        tl.add(cone, { opacity: 1, duration: 900 }, 80);
      }
      if (rays.length) {
        tl.add(
          createDrawable(rays),
          {
            draw: ["0 0", "0 1"],
            duration: 1400,
            delay: stagger(70),
            ease: "inOut(3)",
          },
          120,
        );
      }

      motes.forEach((mote, i) => {
        const ray = rays[i];
        if (!ray) return;
        const ride = animate(mote, {
          ...createMotionPath(ray),
          opacity: [0, 0.9, 0],
          scale: [0.45, 1, 0.45],
          duration: () => utils.random(2600, 4800),
          delay: i * 160,
          ease: "linear",
          loop: true,
          composition: "blend",
        });
        cleanups.push(() => ride.pause());
      });

      if (bulb) {
        const pulse = animate(bulb, {
          opacity: [0.72, 1],
          duration: streaming ? 380 : 1600,
          ease: "inOutQuad",
          alternate: true,
          loop: true,
        });
        cleanups.push(() => pulse.pause());
      }
    } else {
      beam.style.opacity = on ? "1" : "0";
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [mounted, streaming]);

  useEffect(() => {
    const lamp = rootRef.current;
    const beam = beamRef.current;
    if (!lamp) return;
    lamp.classList.toggle("is-off", !on);
    lamp.closest(".desk")?.classList.toggle("desk--dim", !on);
    document.body.classList.toggle("cortex-lamp-off", !on);
    if (!beam) return;
    if (!canAnimate()) {
      beam.style.opacity = on ? "1" : "0";
      return;
    }
    animate(beam, {
      opacity: on ? 1 : 0.03,
      duration: 780,
      ease: "inOut(3)",
    });
  }, [on, mounted]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("cortex-lamp-off");
    };
  }, []);

  const beam = (
    <div
      className={`desk-lamp__beam${on ? "" : " is-off"}${streaming ? " is-live" : ""}`}
      ref={beamRef}
      aria-hidden
    >
      <svg className="desk-lamp__field" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lamp-cone-grad" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff4c4" stopOpacity="0.72" />
            <stop offset="12%" stopColor="#ffe08a" stopOpacity="0.38" />
            <stop offset="42%" stopColor="#e0b45c" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#e0b45c" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lamp-bulb-grad" gradientUnits="userSpaceOnUse" r="42">
            <stop offset="0%" stopColor="#fff8dc" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#ffd678" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffd678" stopOpacity="0" />
          </radialGradient>
        </defs>
        <polygon className="desk-lamp__cone" fill="url(#lamp-cone-grad)" />
        <circle className="desk-lamp__glow" r="36" fill="url(#lamp-bulb-grad)" />
        <circle className="desk-lamp__core" r="7" fill="#fff6c8" opacity="0.9" />
        {Array.from({ length: MOTES }, (_, i) => (
          <path key={`ray-${i}`} className="desk-lamp__ray" />
        ))}
      </svg>
      {Array.from({ length: MOTES }, (_, i) => (
        <span key={`mote-${i}`} className="desk-lamp__mote" />
      ))}
    </div>
  );

  return (
    <>
      <div className={`desk-lamp${streaming ? " is-live" : ""}`} ref={rootRef}>
        <button
          type="button"
          className="desk-lamp__switch"
          aria-pressed={on}
          aria-label={on ? "Dim the desk lamp" : "Turn on the desk lamp"}
          onClick={() => setOn((v) => !v)}
        >
          <svg className="desk-lamp__fixture" viewBox="0 0 180 230" fill="none">
            <path d="M154 6h18v16h-6.5v22h-5V22H154V6Z" fill="#8a6a32" />
            <circle cx="160.5" cy="46" r="6.5" fill="#c9a24e" stroke="#6f5424" strokeWidth="1.2" />
            <path
              className="desk-lamp__arm"
              d="M160.5 52.5c0 0-18 28-46 48"
              stroke="#b58a3c"
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M160.5 52.5c0 0-18 28-46 48"
              stroke="#e4c078"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.55"
              fill="none"
            />
            <circle cx="114" cy="101" r="7" fill="#c9a24e" stroke="#6f5424" strokeWidth="1.2" />
            <path
              className="desk-lamp__arm"
              d="M108 106c-18 14-38 28-48 34"
              stroke="#b58a3c"
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M108 106c-18 14-38 28-48 34"
              stroke="#e4c078"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.5"
              fill="none"
            />
            <circle cx="60" cy="140" r="6.5" fill="#c9a24e" stroke="#6f5424" strokeWidth="1.2" />
            <path
              d="M32 168c10-22 28-32 44-28 10 2.5 18 12 22 24-18 8-36 10-66 4Z"
              fill="#8d6324"
            />
            <path
              d="M36 166c9-18 24-26 38-23 9 2 16 10 19 20-16 6-32 8-57 3Z"
              fill="#d4a44a"
            />
            <path
              d="M48 171c6-8 14-11 22-9"
              stroke="#f3dd9a"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.7"
            />
            <ellipse className="desk-lamp__bulb" cx="62" cy="176" rx="9" ry="5.5" fill="#ffe9a8" />
          </svg>
        </button>
      </div>
      {mounted ? createPortal(beam, document.body) : null}
    </>
  );
}
