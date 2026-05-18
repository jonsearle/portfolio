import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { portfolioItems, type PortfolioItem } from "@/data/portfolio";

const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const capabilities = [
  {
    title: "User Research",
    description:
      "I use research, observation and behavioural insight to uncover the needs, friction and opportunities that shape successful digital products.",
    panelClassName: "bg-[var(--color-cap-teal)] text-[var(--color-cap-teal-text)]",
    align: "left",
    contentClassName: "md:max-w-[35rem]",
    image: "/images/panel/user-research.png",
    imageAlt: "Abstract architectural detail for user research panel",
    imageWrapperClassName: "right-0 w-[845px]",
    imageClassName: "right-0",
  },
  {
    title: "Product Design & Strategy",
    description:
      "I design products that balance user needs, business goals and technical realities — helping teams turn complexity into clear, focused experiences.",
    panelClassName: "bg-[var(--color-cap-lime)] text-[var(--color-cap-lime-text)]",
    align: "right",
    contentClassName: "md:max-w-[38rem] md:text-right",
    image: "/images/panel/product-design.png",
    imageAlt: "Abstract architectural detail for product design panel",
    imageWrapperClassName: "left-0 w-[clamp(520px,39vw,640px)]",
    imageClassName: "left-0",
  },
  {
    title: "Visual Design & Branding",
    description:
      "I create visual systems and digital brands that build trust, improve clarity and give products a distinctive, recognisable identity.",
    panelClassName: "bg-[var(--color-cap-red)] text-[var(--color-cap-red-text)]",
    align: "left",
    contentClassName: "md:max-w-[36rem]",
    image: "/images/panel/visual-brand.png",
    imageAlt: "Abstract architectural detail for visual design panel",
    imageWrapperClassName: "right-0 w-[clamp(410px,32vw,470px)]",
    imageClassName: "right-0",
  },
  {
    title: "AI Prototyping & Innovation",
    description:
      "I use AI-native workflows and rapid prototyping to explore ideas faster, validate concepts earlier and accelerate modern product development.",
    panelClassName:
      "bg-[var(--color-cap-indigo)] text-[var(--color-cap-indigo-text)]",
    align: "right",
    contentClassName: "md:max-w-[38rem] md:text-right",
    image: "/images/panel/ai.png",
    imageAlt: "Abstract architectural detail for AI prototyping panel",
    imageWrapperClassName: "left-0 w-[clamp(540px,41vw,680px)]",
    imageClassName: "left-0",
  },
];

type Capability = (typeof capabilities)[number];

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 22,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, delay, ease: MOTION_EASE }}
    >
      {children}
    </motion.div>
  );
}

function CapabilityPanel({
  capability,
  index,
}: {
  capability: Capability;
  index: number;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [42, -42]
  );
  const copyY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [14, -14]
  );

  return (
    <article
      ref={panelRef}
      className={`relative min-h-[360px] overflow-hidden px-7 py-14 md:h-[475px] md:min-h-0 md:px-0 md:py-0 ${capability.panelClassName}`}
    >
      <div
        className={`pointer-events-none absolute inset-y-0 hidden overflow-hidden md:block ${capability.imageWrapperClassName}`}
        aria-hidden="true"
      >
        <motion.img
          src={capability.image}
          alt={capability.imageAlt}
          style={{ y: imageY }}
          className={`absolute top-[-7%] h-[114%] w-auto max-w-none select-none will-change-transform ${capability.imageClassName}`}
        />
      </div>

      <div className="relative z-10 flex min-h-[inherit] items-center md:mx-auto md:h-full md:max-w-[1440px] md:px-[168px]">
        <motion.div
          style={{ y: copyY }}
          className={
            capability.align === "right"
              ? `md:ml-auto ${capability.contentClassName ?? "md:max-w-[34rem] md:text-right"}`
              : capability.contentClassName ?? "md:max-w-[34rem]"
          }
        >
          <Reveal delay={0.05 + index * 0.04} y={18}>
            <div>
              <p className="mb-3 font-sans text-[10px] font-bold uppercase leading-none tracking-[0] opacity-55 md:mb-4 md:text-[11px]">
                AREA OF EXPERTISE
              </p>
              <h2
                className={`mb-4 max-w-[11ch] font-serif font-semibold text-[39px] leading-[0.98] tracking-[-0.045em] md:mb-7 md:text-[65px] ${
                  capability.align === "right" ? "md:ml-auto" : ""
                }`}
              >
                {capability.title}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.14 + index * 0.04} y={14}>
            <p
              className={`max-w-[43ch] text-base font-light leading-[1.62] tracking-[-0.02em] md:text-[17px] ${
                capability.align === "right" ? "md:ml-auto" : ""
              }`}
            >
              {capability.description}
            </p>
          </Reveal>
        </motion.div>
      </div>
    </article>
  );
}

function Lightbox({
  item,
  onClose,
}: {
  item: PortfolioItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-8 md:px-10"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: MOTION_EASE }}
        >
          <motion.div
            className="relative flex max-h-full max-w-[90vw] flex-col items-center"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.36, ease: MOTION_EASE }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-3xl text-white transition hover:bg-black/80"
              aria-label="Close image preview"
            >
              ×
            </button>
            <img
              src={item.image}
              alt={item.title}
              className="max-h-[calc(100vh-200px)] max-w-full object-contain"
            />
            <p className="mt-5 max-w-[90vw] text-center text-base leading-7 tracking-[-0.01em] text-white">
              {item.title} — {item.description}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function App() {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <main className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
        <a
          href="#top"
          className="absolute left-7 top-9 z-20 flex items-center md:left-16 md:top-[66px]"
          aria-label="Jon Searle home"
        >
          <img src="/images/logo.svg" alt="" className="h-8 w-auto md:h-12" />
        </a>

        <section
          id="top"
          className="px-7 pb-28 pt-32 md:min-h-[620px] md:px-0 md:pb-0 md:pt-0"
        >
          <div className="mx-auto max-w-[1440px] md:px-[168px]">
            <div className="md:pt-[176px]">
              <Reveal>
                <p className="max-w-[70rem] font-serif text-[clamp(27px,2.5vw,36px)] leading-[1.47] tracking-[-0.045em] text-[var(--color-ink)]">
                  Hello,
                  <br />
                  I&apos;m a Product Designer & Product Manager with 15+ years&apos;
                  experience shaping digital products. I have worked with Apple,
                  BBC, and Samsung. I&apos;m a specialist in AI-native design and
                  discovery-led development. Open to senior design roles.
                </p>
              </Reveal>
              <Reveal delay={0.14} y={16}>
                <div className="mt-12 flex flex-wrap gap-5">
                  <a
                    href="mailto:jon.searle@gmail.com"
                    className="inline-flex min-w-[190px] justify-center rounded-full bg-[var(--color-ink)] px-9 py-4 text-base font-bold leading-5 tracking-[-0.01em] text-[var(--color-paper)] transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-blue)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
                  >
                    Get in touch
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-paper)] px-0 pb-0 pt-0">
          <div className="overflow-hidden">
            <div className="flex flex-col">
              {capabilities.map((capability, index) => (
                <CapabilityPanel
                  key={capability.title}
                  capability={capability}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-7 pb-28 pt-20 md:px-0 md:pb-[118px] md:pt-[118px]">
          <div className="mx-auto max-w-[1440px] md:px-[168px]">
            <Reveal y={16}>
              <h2 className="mb-8 font-serif text-[30px] leading-[1.12] tracking-[-0.03em] text-[var(--color-ink)] md:mb-[30px] md:text-[32px]">
                Explore some of my work
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-12">
              {portfolioItems.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.04} y={18}>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    aria-label={`Open ${item.title} project detail`}
                    className="group flex aspect-[16/9] w-full cursor-pointer items-center justify-center transition duration-300 hover:-translate-y-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-blue)]"
                  >
                    <img
                      src={item.logo}
                      alt={item.logoAlt}
                      className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                    />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-black/8 bg-[var(--color-footer)] px-7 py-10 md:px-0 md:py-12">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-sm leading-6 text-[var(--color-ink)] md:flex-row md:items-center md:justify-between md:px-[168px]">
            <p>Copyright {currentYear} Jon Searle</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a
                href="https://www.linkedin.com/in/jon-searle-b5815b4/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-[var(--color-accent-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-blue)]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current"
                >
                  <path d="M4.98 3.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM3.5 8.75h2.96V20.5H3.5V8.75Zm4.81 0h2.83v1.6h.04c.4-.75 1.36-1.84 3.14-1.84 3.36 0 3.98 2.21 3.98 5.08v6.91h-2.96v-6.12c0-1.46-.03-3.34-2.03-3.34-2.04 0-2.35 1.59-2.35 3.23v6.23H8.31V8.75Z" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:jon.searle@gmail.com"
                className="inline-flex items-center gap-2 transition hover:text-[var(--color-accent-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-blue)]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-none stroke-current stroke-[1.8]"
                >
                  <path
                    d="M3.75 6.75h16.5v10.5H3.75z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m4.5 7.5 7.5 6 7.5-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Get in touch</span>
              </a>
            </div>
          </div>
        </footer>
      </main>

      <Lightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
