import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Cloud, Sun, Moon } from "lucide-react";
import { useThemeStore } from "../shared/stores/themeStore";

function ShootingStar({ delay, top, left, isDark }: { delay: number; top: string; left: string; isDark: boolean }) {
  if (!isDark) return null;

  return (
    <motion.div
      className="absolute h-[2px] w-24 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_white]"
      style={{ top, left, rotate: "-45deg" }}
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        x: [-50, -400],
        y: [50, 400],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: delay + 5,
        delay,
        ease: "linear",
      }}
    />
  );
}

function FloatingCloud({ top, left, delay, duration, scale }: { top: string; left: string; delay: number; duration: number; scale: number }) {
  return (
    <motion.div
      className="absolute text-white/90 drop-shadow-md"
      style={{ top, left, width: 64 * scale, height: 64 * scale }}
      animate={{
        x: [0, 100, -50, 0],
        y: [0, -10, 5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      <Cloud className="h-full w-full fill-white" />
    </motion.div>
  );
}

export function AtmosphereBackground() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: number; type: "dot" | "star" }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 150 }).map((_, i) => {
      const type = (Math.random() > 0.8 ? "star" : "dot") as "star" | "dot";
      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: type === "star" ? Math.random() * 6 + 4 : Math.random() * 2.5 + 0.5,
        delay: Math.random() * 5,
        type,
      };
    });
    setStars(newStars);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden"
    >
      {/* ---------------- DARK MODE BACKGROUND ---------------- */}
      <motion.div
        initial={false}
        animate={{ opacity: isDark ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/60 via-slate-900/40 to-transparent" />
        
        {/* Glowing Moon */}
        <motion.div 
          className="absolute right-[20%] text-yellow-200 drop-shadow-[0_0_40px_rgba(253,224,71,0.3)]"
          style={{ top: "15%" }}
          initial={false}
          animate={{ 
            y: isDark ? 0 : "100vh",
            rotate: [-5, 5, -5] 
          }}
          transition={{ 
            y: { duration: 1.5, ease: "easeInOut" },
            rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Moon className="h-28 w-28 fill-yellow-100/30" />
        </motion.div>

        {stars.map((star) => (
          <motion.div
            key={star.id}
            className={`absolute bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)] ${
              star.type === "dot" ? "rounded-full" : ""
            }`}
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              ...(star.type === "star" && {
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                backgroundColor: "#FFF9C4" // Pale yellow for star shapes
              })
            }}
            animate={isDark ? {
              opacity: star.type === "star" ? [0.4, 1, 0.4] : [0.1, 0.9, 0.1],
              scale: [1, 1.3, 1],
              rotate: star.type === "star" ? [0, 15, 0, -15, 0] : 0,
            } : { opacity: 0 }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
        
        <ShootingStar delay={2} top="10%" left="80%" isDark={isDark} />
        <ShootingStar delay={7} top="30%" left="90%" isDark={isDark} />
        <ShootingStar delay={12} top="5%" left="40%" isDark={isDark} />
      </motion.div>

      {/* ---------------- LIGHT MODE BACKGROUND ---------------- */}
      <motion.div
        initial={false}
        animate={{ opacity: isDark ? 0 : 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        {/* Sky Gradient overlaying index.css grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/60 via-sky-100/30 to-transparent" />
        
        {/* Glowing Sun */}
        <motion.div 
          className="absolute right-[10%] text-orange-400 drop-shadow-[0_0_40px_rgba(251,146,60,0.6)]"
          style={{ top: "10%" }}
          initial={false}
          animate={{ 
            y: isDark ? "100vh" : 0,
            rotate: 360, 
            scale: [1, 1.05, 1] 
          }}
          transition={{ 
            y: { duration: 1.5, ease: "easeInOut" },
            rotate: { duration: 60, repeat: Infinity, ease: "linear" }, 
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } 
          }}
        >
          <Sun className="h-32 w-32 fill-orange-300" />
        </motion.div>

        {/* Floating Clouds */}
        <FloatingCloud top="15%" left="10%" delay={0} duration={25} scale={1.5} />
        <FloatingCloud top="25%" left="60%" delay={2} duration={30} scale={1.2} />
        <FloatingCloud top="8%" left="40%" delay={5} duration={35} scale={0.8} />

        {/* Green Grass Landscape */}
        <motion.div
          className="absolute bottom-0 left-0 w-full"
          initial={false}
          animate={{ y: isDark ? 100 : 0, opacity: isDark ? 0 : 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {/* Back hill */}
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-32 md:h-48" preserveAspectRatio="none">
            <path fill="#4ade80" fillOpacity="0.4" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,224C840,245,960,267,1080,261.3C1200,256,1320,224,1380,208L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
          {/* Front hill */}
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-24 md:h-32" preserveAspectRatio="none">
            <path fill="#22c55e" fillOpacity="0.7" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,176C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
