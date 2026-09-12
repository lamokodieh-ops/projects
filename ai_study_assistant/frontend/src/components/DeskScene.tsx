"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  createAnimatable,
  createScope,
  createTimeline,
  splitText,
  stagger,
  utils,
} from "animejs";
import { canAnimate, isFinePointer, setAnimatable } from "@/lib/anime-desk";

export default function DeskScene({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !canAnimate()) return;

    const scope = createScope({ root }).add(() => {
      const mast = root.querySelector(".mast");
      const hero = root.querySelector(".hero");
      const paper = root.querySelector(".paper");
      const margin = root.querySelector(".margin");
      const workspace = root.querySelector(".workspace-head");
      const fixture = root.querySelector(".desk-lamp__fixture");
      const h1 = root.querySelector(".hero h1, .workspace-head h1");
      const fields = root.querySelectorAll(".field");
      const modes = root.querySelectorAll(".modes .btn");

      const opening = root.querySelector(".opening");
      const nodes = [mast, hero, paper, margin, workspace, opening].filter(
        (node): node is Element => Boolean(node),
      );
      utils.set(nodes, { opacity: 0, y: 22 });
      if (fixture) utils.set(fixture, { rotate: -14, transformOrigin: "88% 6%" });
      if (fields.length) utils.set(fields, { opacity: 0, y: 10 });
      if (modes.length) utils.set(modes, { opacity: 0, y: 8 });

      const tl = createTimeline({ defaults: { ease: "out(3)" } });

      if (fixture) tl.add(fixture, { rotate: 0, duration: 860 }, 0);
      if (mast) tl.add(mast, { opacity: 1, y: 0, duration: 620 }, 160);
      if (workspace) tl.add(workspace, { opacity: 1, y: 0, duration: 640 }, 200);

      if (h1 instanceof HTMLElement) {
        const split = splitText(h1, { words: true });
        utils.set(split.words, { opacity: 0, y: 16 });
        tl.add(
          split.words,
          {
            opacity: 1,
            y: 0,
            duration: 700,
            delay: stagger(38, { from: "first" }),
            ease: "out(3)",
          },
          240,
        );
      } else if (hero) {
        tl.add(hero, { opacity: 1, y: 0, duration: 700 }, 240);
      }

      if (hero) {
        const lede = hero.querySelector("p");
        if (lede) {
          utils.set(lede, { opacity: 0, y: 12 });
          tl.add(lede, { opacity: 1, y: 0, duration: 640 }, 500);
        }
        utils.set(hero, { opacity: 1, y: 0 });
      }

      if (paper) {
        utils.set(paper, { rotate: 1.2 });
        tl.add(paper, { opacity: 1, y: 0, rotate: 0, duration: 820 }, 460);
      }
      if (margin) tl.add(margin, { opacity: 1, y: 0, duration: 720 }, 540);
      if (opening) tl.add(opening, { opacity: 1, y: 0, duration: 640 }, 280);
      if (fields.length) {
        tl.add(fields, { opacity: 1, y: 0, delay: stagger(55), duration: 520 }, 620);
      }
      if (modes.length) {
        tl.add(modes, { opacity: 1, y: 0, delay: stagger(45), duration: 480 }, 580);
      }

      const cleanups: Array<() => void> = [];

      if (paper instanceof HTMLElement && isFinePointer()) {
        const tilt = createAnimatable(paper, {
          rotateX: 0,
          rotateY: 0,
          duration: 480,
          ease: "out(3)",
        });

        const onMove = (event: PointerEvent) => {
          const box = root.getBoundingClientRect();
          const px = (event.clientX - box.left) / box.width - 0.5;
          const py = (event.clientY - box.top) / box.height - 0.5;
          setAnimatable(tilt, "rotateY", px * 7.5);
          setAnimatable(tilt, "rotateX", -py * 5.5);
        };
        const onLeave = () => {
          setAnimatable(tilt, "rotateX", 0);
          setAnimatable(tilt, "rotateY", 0);
        };
        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
        });
      }

      const hoverable = (node: EventTarget | null) => {
        if (!(node instanceof Element)) return null;
        return node.closest(".btn, .card-link, .source");
      };

      const onOver = (event: PointerEvent) => {
        const el = hoverable(event.target);
        if (!el || el === hoverable(event.relatedTarget)) return;
        if (el.matches(".btn:not(:disabled)")) {
          animate(el, { scale: 1.04, y: -3, duration: 280, ease: "out(3)", composition: "blend" });
        } else if (el.matches(".card-link")) {
          animate(el, { x: 7, duration: 320, ease: "out(3)", composition: "blend" });
        } else if (el.matches(".source")) {
          animate(el, { x: 5, duration: 340, ease: "out(3)", composition: "blend" });
        }
      };
      const onOut = (event: PointerEvent) => {
        const el = hoverable(event.target);
        if (!el || (event.relatedTarget instanceof Node && el.contains(event.relatedTarget))) {
          return;
        }
        animate(el, { scale: 1, x: 0, y: 0, duration: 360, ease: "out(3)" });
      };
      const onDown = (event: PointerEvent) => {
        const btn = event.target instanceof Element ? event.target.closest(".btn") : null;
        if (btn && !btn.hasAttribute("disabled")) {
          animate(btn, { scale: 0.96, duration: 110, ease: "out(2)" });
        }
      };
      const onUp = (event: PointerEvent) => {
        const btn = event.target instanceof Element ? event.target.closest(".btn") : null;
        if (btn && !btn.hasAttribute("disabled")) {
          animate(btn, { scale: 1.03, duration: 260, ease: "out(3)" });
        }
      };

      root.addEventListener("pointerover", onOver);
      root.addEventListener("pointerout", onOut);
      root.addEventListener("pointerdown", onDown);
      root.addEventListener("pointerup", onUp);
      cleanups.push(() => {
        root.removeEventListener("pointerover", onOver);
        root.removeEventListener("pointerout", onOut);
        root.removeEventListener("pointerdown", onDown);
        root.removeEventListener("pointerup", onUp);
      });

      const onFocusIn = (event: FocusEvent) => {
        const field = event.target instanceof Element ? event.target.closest(".field") : null;
        if (field) animate(field, { y: -3, duration: 280, ease: "out(3)" });
      };
      const onFocusOut = (event: FocusEvent) => {
        const field = event.target instanceof Element ? event.target.closest(".field") : null;
        if (field) animate(field, { y: 0, duration: 320, ease: "out(3)" });
      };
      root.addEventListener("focusin", onFocusIn);
      root.addEventListener("focusout", onFocusOut);
      cleanups.push(() => {
        root.removeEventListener("focusin", onFocusIn);
        root.removeEventListener("focusout", onFocusOut);
      });

      if (isFinePointer()) {
        root.querySelectorAll(".btn-primary").forEach((btn) => {
          const mag = createAnimatable(btn, {
            x: 0,
            y: 0,
            duration: 420,
            ease: "out(3)",
          });
          const onMagMove = (event: Event) => {
            const e = event as PointerEvent;
            const box = btn.getBoundingClientRect();
            setAnimatable(mag, "x", (e.clientX - box.left - box.width / 2) * 0.16);
            setAnimatable(mag, "y", (e.clientY - box.top - box.height / 2) * 0.2);
          };
          const onMagLeave = () => {
            setAnimatable(mag, "x", 0);
            setAnimatable(mag, "y", 0);
          };
          btn.addEventListener("pointermove", onMagMove);
          btn.addEventListener("pointerleave", onMagLeave);
          cleanups.push(() => {
            btn.removeEventListener("pointermove", onMagMove);
            btn.removeEventListener("pointerleave", onMagLeave);
          });
        });
      }

      const stream = root.querySelector(".stream");
      if (stream) {
        const pulse = () => {
          if (!stream.classList.contains("busy")) return;
          animate(stream, {
            filter: ["brightness(1)", "brightness(1.06)", "brightness(1)"],
            duration: 900,
            ease: "inOutSine",
            composition: "blend",
          });
        };
        const observer = new MutationObserver(pulse);
        observer.observe(stream, { attributes: true, attributeFilter: ["class"] });
        cleanups.push(() => observer.disconnect());
      }

      return () => {
        cleanups.forEach((fn) => fn());
      };
    });

    return () => scope.revert();
  }, []);

  return (
    <main className="desk" ref={rootRef}>
      {children}
    </main>
  );
}
