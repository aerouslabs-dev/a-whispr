import { motion } from "motion/react";

const clouds = [
  { top: "8%", size: 150, duration: 34, delay: 0 },
  { top: "26%", size: 96, duration: 46, delay: 4 },
  { top: "58%", size: 190, duration: 55, delay: 2 },
  { top: "78%", size: 120, duration: 40, delay: 7 },
];

const stars = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 5) % 96}%`,
  top: `${(i * 13.7 + 9) % 92}%`,
  delay: (i % 6) * 0.6,
  size: 8 + (i % 4) * 5,
}));

export function KawaiiBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {clouds.map((cloud, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-card/60 blur-[1px]"
          style={{ top: cloud.top, width: cloud.size, height: cloud.size * 0.5 }}
          initial={{ x: "-25vw" }}
          animate={{ x: "115vw" }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {stars.map((star, i) => (
        <motion.span
          key={`s-${i}`}
          className="absolute text-primary/50"
          style={{ left: star.left, top: star.top, fontSize: star.size }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.25, 0.8], rotate: [0, 25, 0] }}
          transition={{ duration: 3.2, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
      ))}

      <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
      <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky/40 blur-3xl" />
    </div>
  );
}
