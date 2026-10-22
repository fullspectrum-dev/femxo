"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, RefObject } from "react";
import { cn } from "@/lib/utils";

/*
 * A packet that walks a row of steps: it waits on a step, travels to the next
 * one, and the step lights up only when the packet arrives. After the last
 * step it returns to the first and starts again.
 */

const MOVE_MS = 1100;
const HOLD_MS = 1500;

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface StepCycle<T extends Element> {
  /** Put on the element that holds the steps; the cycle starts once it's on screen. */
  ref: RefObject<T | null>;
  /** The step the packet is at or travelling to. */
  target: number;
  /** The last step the packet has reached; steps up to here are lit. */
  reached: number;
  /** True for the jump back to the first step, which shouldn't animate. */
  instant: boolean;
}

export function useStepCycle<T extends Element>(count: number): StepCycle<T> {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [state, setState] = useState({ target: 0, reached: 0, instant: false });
  const reduceMotion = useSyncExternalStore(subscribeToReducedMotion, prefersReducedMotion, () => false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || reduceMotion) return;
    let timer: number;
    const after = (ms: number, next: () => void) => {
      timer = window.setTimeout(next, ms);
    };

    const hold = (step: number) => after(HOLD_MS, () => (step === count - 1 ? restart() : move(step + 1)));
    const move = (step: number) => {
      setState((current) => ({ ...current, target: step, instant: false }));
      after(MOVE_MS, () => {
        setState({ target: step, reached: step, instant: false });
        hold(step);
      });
    };
    const restart = () => {
      setState({ target: 0, reached: 0, instant: true });
      hold(0);
    };

    // Each time the steps come into view, start from the first one.
    restart();
    return () => window.clearTimeout(timer);
  }, [isVisible, reduceMotion, count]);

  // Without motion, show the whole path as done.
  return reduceMotion ? { ref, target: count - 1, reached: count - 1, instant: true } : { ref, ...state };
}

/**
 * The line between the steps, with the gold trail and the travelling packet.
 * Position it (absolute) so its two ends sit on the first and last step markers.
 */
export function StepTrack({
  count,
  target,
  reached,
  instant,
  className,
  style,
}: {
  count: number;
  target: number;
  reached: number;
  instant: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const progress = count > 1 ? (target / (count - 1)) * 100 : 0;
  const motion: CSSProperties = {
    transitionDuration: instant ? "0ms" : `${MOVE_MS}ms`,
    transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
  };
  const isHolding = target === reached;

  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute h-0.5", className)} style={style}>
      <span className="dots-x absolute inset-0" />
      <span
        className="dots-x absolute inset-y-0 left-0 transition-[width]"
        style={{ ...motion, width: `${progress}%`, "--dot": "#ffc65c" } as CSSProperties}
      />
      <span
        className="absolute top-1/2 transition-[left]"
        style={{ ...motion, left: `${progress}%` }}
      >
        <span className="absolute -left-[5px] -top-[5px] size-2.5 rounded-full bg-gold-300 shadow-[0_0_10px_3px_rgba(255,198,92,0.7)]" />
        {isHolding && <span className="animate-ping-soft absolute -left-[5px] -top-[5px] size-2.5 rounded-full bg-gold-400" />}
      </span>
    </span>
  );
}
