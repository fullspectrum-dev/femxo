"use client";

import { useEffect, useRef, useState } from "react";
import { useSyncExternalStore } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsInView(true);
        observer.disconnect();
      },
      { rootMargin: "100px 0px" }
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [isInView]);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;

    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value, duration, prefersReducedMotion]);

  const displayedCount = prefersReducedMotion && isInView ? value : count;

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {displayedCount.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}