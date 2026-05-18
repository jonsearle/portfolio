"use client";

import type { PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

type EaseTuple = [number, number, number, number];

type ParticleSpec = {
  color: string;
  size: number;
  baseX: number;
  baseY: number;
  driftX: number[];
  driftY: number[];
  scale: number[];
  duration: number;
  delay: number;
  opacity: number;
  parallax: number;
};

type AmbientParticleFieldProps = {
  className?: string;
  particles?: ParticleSpec[];
  driftScale?: number;
  durationScale?: number;
  particleOpacity?: number;
  hoverStrength?: number;
  ease?: EaseTuple;
};

const DEFAULT_EASE: EaseTuple = [0.42, 0, 0.18, 1];

const DEFAULT_PARTICLES: ParticleSpec[] = [
  {
    color: "#4285F4",
    size: 14,
    baseX: 22,
    baseY: 32,
    driftX: [-10, 8, -6, -10],
    driftY: [-6, 10, -4, -6],
    scale: [1, 1.06, 0.98, 1],
    duration: 18,
    delay: 0,
    opacity: 0.78,
    parallax: 0.9,
  },
  {
    color: "#EA4335",
    size: 12,
    baseX: 66,
    baseY: 26,
    driftX: [8, -7, 5, 8],
    driftY: [6, -8, 4, 6],
    scale: [1, 0.97, 1.05, 1],
    duration: 22,
    delay: 1.4,
    opacity: 0.74,
    parallax: 0.7,
  },
  {
    color: "#FBBC05",
    size: 11,
    baseX: 38,
    baseY: 70,
    driftX: [-7, 6, -5, -7],
    driftY: [8, -7, 5, 8],
    scale: [1, 1.04, 0.99, 1],
    duration: 20,
    delay: 2.3,
    opacity: 0.68,
    parallax: 0.8,
  },
  {
    color: "#34A853",
    size: 13,
    baseX: 78,
    baseY: 62,
    driftX: [6, -9, 7, 6],
    driftY: [-7, 7, -5, -7],
    scale: [1, 1.05, 0.97, 1],
    duration: 24,
    delay: 0.8,
    opacity: 0.72,
    parallax: 1,
  },
];

function Particle({
  particle,
  driftScale,
  durationScale,
  particleOpacity,
  ease,
  pointerX,
  pointerY,
  reduceMotion,
}: {
  particle: ParticleSpec;
  driftScale: number;
  durationScale: number;
  particleOpacity: number;
  ease: EaseTuple;
  pointerX: ReturnType<typeof useSpring>;
  pointerY: ReturnType<typeof useSpring>;
  reduceMotion: boolean;
}) {
  const parallaxX = useTransform(pointerX, (value) =>
    reduceMotion ? 0 : value * particle.parallax
  );
  const parallaxY = useTransform(pointerY, (value) =>
    reduceMotion ? 0 : value * particle.parallax
  );

  return (
    <div
      className="absolute left-0 top-0"
      style={{ left: `${particle.baseX}%`, top: `${particle.baseY}%` }}
    >
      <motion.div style={{ x: parallaxX, y: parallaxY }}>
        {/* Keep ambient looping and pointer response separate so tuning stays simple. */}
        <motion.div
          className="rounded-full will-change-transform"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity * particleOpacity,
            boxShadow: `0 0 28px ${particle.color}22`,
          }}
          animate={
            reduceMotion
              ? { opacity: particle.opacity * particleOpacity }
              : {
                  x: particle.driftX.map((value) => value * driftScale),
                  y: particle.driftY.map((value) => value * driftScale),
                  scale: particle.scale,
                  opacity: particle.scale.map(
                    (value) =>
                      particle.opacity * particleOpacity * (0.96 + (value - 1) * 0.6)
                  ),
                }
          }
          transition={{
            duration: particle.duration * durationScale,
            delay: particle.delay,
            repeat: Infinity,
            ease,
            times: [0, 0.33, 0.66, 1],
          }}
        />
      </motion.div>
    </div>
  );
}

export default function AmbientParticleField({
  className = "",
  particles = DEFAULT_PARTICLES,
  driftScale = 1,
  durationScale = 1,
  particleOpacity = 1,
  hoverStrength = 10,
  ease = DEFAULT_EASE,
}: AmbientParticleFieldProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  // Springs keep the hover response calm and prevent cursor jitter.
  const springX = useSpring(pointerX, { stiffness: 42, damping: 18, mass: 1.2 });
  const springY = useSpring(pointerY, { stiffness: 42, damping: 18, mass: 1.2 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    pointerX.set(x * hoverStrength);
    pointerY.set(y * hoverStrength);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div
      className={[
        "relative isolate min-h-[320px] w-full overflow-hidden rounded-[32px] bg-[#05060a]",
        className,
      ].join(" ")}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.05),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_45%,rgba(255,255,255,0.015))]" />

      {particles.map((particle, index) => (
        <Particle
          key={`${particle.color}-${index}`}
          particle={particle}
          driftScale={driftScale}
          durationScale={durationScale}
          particleOpacity={particleOpacity}
          ease={ease}
          pointerX={springX}
          pointerY={springY}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}
