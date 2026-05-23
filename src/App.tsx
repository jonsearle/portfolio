import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
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
      "I use research and behavioural insight to uncover the friction, opportunities and human behaviours that drive innovation and shape effective digital experiences.",
    panelClassName: "bg-[var(--color-cap-teal)] text-[var(--color-cap-teal-text)]",
    align: "left",
    contentClassName: "md:max-w-[35rem]",
    image: "/images/panel/user-research.png",
    imageAlt: "Abstract architectural detail for user research panel",
    imageWrapperClassName: "right-0 w-[845px]",
    imageClassName: "right-0",
  },
  {
    title: "Design & Strategy",
    description:
      "I create clear, focused digital experiences that align user behaviour with business goals and commercial impact.",
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
    image: "/images/panel/darker-red.png",
    imageAlt: "Abstract architectural detail for visual design panel",
    imageWrapperClassName: "right-0 w-[clamp(410px,32vw,470px)]",
    imageClassName: "right-0",
  },
  {
    title: "AI Prototyping & Innovation",
    description:
      "I use AI-enabled workflows and rapid prototyping to turn ideas into tangible concepts quickly and accelerate modern digital design.",
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

type InterviewPrompt = {
  label: string;
  openingQuestion?: string;
  openingReply?: string;
};

const interviewPrompts: InterviewPrompt[] = [
  {
    label: "Tell me about your experience",
    openingQuestion: "Tell me about your experience",
  },
  {
    label: "Tell me about your approach to design",
    openingQuestion: "Tell me about your approach to design",
  },
  {
    label: "Ask me anything",
    openingReply:
      "Ask me anything about my work, how I think, or where I might be useful.",
  },
];

const interviewIntroMessages = [
  "Before we start: I don’t really look like this.",
  "I’m an AI version of Jon trained on his writing, thinking, and professional experience, so occasional hallucinations are possible.",
  "This isn’t meant to be taken too seriously. The real Jon is a little less polished and not quite so serious looking.",
];

type InterviewMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "thinking" | "error";
};

type InterviewContentBlock =
  | {
      type: "paragraph";
      lines: string[];
    }
  | {
      type: "list";
      lines: string[];
    };

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function normalizeInterviewContent(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/\s+-\s+/g, "\n- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getInterviewContentBlocks(content: string) {
  const blocks: InterviewContentBlock[] = [];

  normalizeInterviewContent(content)
    .split("\n")
    .forEach((rawLine) => {
      const line = rawLine.trim();

      if (!line) return;

      const bulletMatch = line.match(/^[-•]\s+(.+)$/);
      const blockType = bulletMatch ? "list" : "paragraph";
      const text = bulletMatch?.[1] ?? line;
      const previousBlock = blocks.at(-1);

      if (previousBlock?.type === blockType) {
        previousBlock.lines.push(text);
      } else {
        blocks.push({ type: blockType, lines: [text] } as InterviewContentBlock);
      }
    });

  return blocks;
}

function InterviewMessageContent({ content }: { content: string }) {
  const blocks = getInterviewContentBlocks(content);

  return (
    <div className="space-y-4">
      {blocks.map((block, blockIndex) =>
        block.type === "list" ? (
          <ul
            key={`${block.type}-${blockIndex}`}
            className="list-disc space-y-2 pl-5 marker:text-[var(--color-cap-teal)]"
          >
            {block.lines.map((line, lineIndex) => (
              <li key={`${line}-${lineIndex}`}>{line}</li>
            ))}
          </ul>
        ) : (
          <p key={`${block.type}-${blockIndex}`}>{block.lines.join(" ")}</p>
        )
      )}
    </div>
  );
}

function getLocalInterviewReply(question: string) {
  const normalizedQuestion = question.toLowerCase();

  if (normalizedQuestion.includes("experience")) {
    return "The live AI endpoint is not connected yet, but the interface is ready. Jon is a designer and product leader with 20+ years of experience creating digital products and services for brands including Apple, BBC and Samsung, with a current focus on AI-enabled design, rapid prototyping and digital innovation.";
  }

  if (normalizedQuestion.includes("approach") || normalizedQuestion.includes("design")) {
    return "The live AI endpoint is not connected yet, but the interface is ready. Jon's design approach blends behavioural insight, sharp product strategy and fast prototyping, moving from messy ambiguity to clear, usable digital experiences that can be tested and improved quickly.";
  }

  return "The live AI endpoint is not connected yet, but the interface is ready. Ask about Jon's product design work, AI prototyping, design leadership, research process, or the kind of senior design roles he is interested in.";
}

async function requestInterviewReply(messages: InterviewMessage[]) {
  const cleanMessages = messages
    .filter((message) => message.status !== "thinking")
    .map(({ role, content }) => ({ role, content }));
  const lastUserMessage =
    [...cleanMessages].reverse().find((message) => message.role === "user")
      ?.content ?? "";

  let response: Response;

  try {
    response = await fetch("/.netlify/functions/interview-jon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: cleanMessages }),
    });
  } catch {
    return getLocalInterviewReply(lastUserMessage);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return getLocalInterviewReply(lastUserMessage);
  }

  const data = (await response.json()) as { reply?: string; error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "The interview assistant could not reply.");
  }

  return data.reply?.trim() || getLocalInterviewReply(lastUserMessage);
}

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

function InterviewJonSection({
  onStartConversation,
}: {
  onStartConversation: (prompt: InterviewPrompt) => void;
}) {
  return (
    <section className="bg-[var(--color-footer)] px-7 py-20 md:px-0 md:py-[118px]">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[minmax(280px,440px)_1fr] md:items-center md:gap-20 md:px-[168px]">
        <Reveal y={18}>
          <img
            src="/images/ai-jon.png"
            alt="AI-generated portrait of Jon Searle"
            className="mx-auto w-full max-w-[340px] rounded-full shadow-[0_28px_70px_rgba(91,71,71,0.16)] md:max-w-[420px]"
          />
        </Reveal>

        <div>
          <Reveal delay={0.08} y={18}>
            <p className="mb-4 font-sans text-[10px] font-bold uppercase leading-none tracking-[0] text-[var(--color-ink)] opacity-55 md:text-[11px]">
              AI INTERVIEW
            </p>
            <h2 className="mb-6 font-serif text-[45px] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--color-ink)] md:text-[72px]">
              Interview Me
            </h2>
          </Reveal>

          <Reveal delay={0.16} y={16}>
            <p className="max-w-[44rem] text-[18px] font-light leading-[1.62] tracking-[-0.02em] text-[var(--color-ink)] md:text-[21px]">
              An Ai version of Jon Searle trained on his writing, thinking and
              professional experience.
            </p>
          </Reveal>

          <Reveal delay={0.24} y={14}>
            <div className="mt-10 grid max-w-[45rem] gap-3">
              {interviewPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  type="button"
                  onClick={() => onStartConversation(prompt)}
                  className="group flex min-h-14 w-full items-center justify-between rounded-full border border-[var(--color-ink)]/18 bg-[var(--color-paper)] px-6 py-4 text-left text-[15px] font-bold leading-5 tracking-[-0.01em] text-[var(--color-ink)] transition hover:-translate-y-0.5 hover:border-[var(--color-cap-teal)] hover:text-[var(--color-cap-teal)] hover:shadow-[0_14px_28px_rgba(91,71,71,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-blue)] md:px-7 md:text-base"
                >
                  <span>{prompt.label}</span>
                  <span
                    aria-hidden="true"
                    className="ml-4 text-2xl leading-none transition group-hover:translate-x-1"
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function InterviewChat({
  prompt,
  onClose,
}: {
  prompt: InterviewPrompt | null;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!prompt) return;

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
  }, [prompt, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!prompt) return;

    let isCurrent = true;
    const introMessages = interviewIntroMessages.map((content) => ({
      id: createMessageId(),
      role: "assistant" as const,
      content,
    }));
    const userMessage: InterviewMessage | null = prompt.openingQuestion
      ? {
          id: createMessageId(),
          role: "user",
          content: prompt.openingQuestion,
        }
      : null;
    const openingReplyMessage: InterviewMessage | null = prompt.openingReply
      ? {
          id: createMessageId(),
          role: "assistant",
          content: prompt.openingReply,
        }
      : null;
    const thinkingMessage: InterviewMessage = {
      id: createMessageId(),
      role: "assistant",
      content: "Thinking",
      status: "thinking",
    };
    const nextMessages = userMessage ? [userMessage] : [];

    setMessages([]);
    setInput("");
    setIsSending(true);

    const runOpeningSequence = async () => {
      const stagedMessages: InterviewMessage[] = [];

      for (const introMessage of introMessages) {
        await wait(stagedMessages.length === 0 ? 610 : 1575);

        if (!isCurrent) return;

        stagedMessages.push(introMessage);
        setMessages([...stagedMessages]);
      }

      await wait(1490);

      if (!isCurrent) return;

      if (openingReplyMessage) {
        setMessages([...stagedMessages, openingReplyMessage]);
        return;
      }

      setMessages([...stagedMessages, ...nextMessages, thinkingMessage]);

      const reply = await requestInterviewReply(nextMessages);

      if (!isCurrent) return;

      setMessages([
        ...stagedMessages,
        ...nextMessages,
        {
          id: createMessageId(),
          role: "assistant",
          content: reply,
        },
      ]);
    };

    runOpeningSequence()
      .then((reply) => {
        return reply;
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;

        setMessages([
          ...introMessages,
          ...nextMessages,
          {
            id: createMessageId(),
            role: "assistant",
            content:
              error instanceof Error
                ? error.message
                : "The interview assistant could not reply.",
            status: "error",
          },
        ]);
      })
      .finally(() => {
        if (isCurrent) {
          setIsSending(false);
          window.setTimeout(() => inputRef.current?.focus(), 80);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [prompt]);

  async function sendMessage(content: string) {
    if (!content.trim() || isSending) return;

    const userMessage: InterviewMessage = {
      id: createMessageId(),
      role: "user",
      content: content.trim(),
    };
    const nextMessages = [
      ...messages.filter((message) => message.status !== "thinking"),
      userMessage,
    ];
    const thinkingMessage: InterviewMessage = {
      id: createMessageId(),
      role: "assistant",
      content: "Thinking",
      status: "thinking",
    };

    setMessages([...nextMessages, thinkingMessage]);
    setInput("");
    setIsSending(true);

    try {
      const reply = await requestInterviewReply(nextMessages);

      setMessages([
        ...nextMessages,
        {
          id: createMessageId(),
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "The interview assistant could not reply.",
          status: "error",
        },
      ]);
    } finally {
      setIsSending(false);
      window.setTimeout(() => inputRef.current?.focus(), 80);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <AnimatePresence>
      {prompt ? (
        <motion.div
          className="fixed inset-0 z-[60] flex bg-[var(--color-paper)] text-[var(--color-ink)]"
          role="dialog"
          aria-modal="true"
          aria-label="Interview Jon chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: MOTION_EASE }}
        >
          <div className="flex min-h-0 w-full flex-col">
            <header className="flex min-h-[72px] items-center justify-between border-b border-black/8 px-5 md:min-h-[84px] md:px-10">
              <div className="flex min-w-0 items-center gap-4">
                <img
                  src="/images/ai-jon.png"
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-full object-cover md:h-12 md:w-12"
                />
                <div className="min-w-0">
                  <p className="truncate font-serif text-[24px] font-semibold leading-none tracking-[-0.035em] md:text-[28px]">
                    Ai Jon
                  </p>
                  <p className="mt-1 truncate text-xs font-bold uppercase leading-none tracking-[0] opacity-50">
                    Like interviewing Jon but not really
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 text-3xl leading-none text-[var(--color-ink)] transition hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-blue)]"
                aria-label="Close interview chat"
              >
                ×
              </button>
            </header>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto px-5 py-8 md:px-10"
            >
              <div className="mx-auto flex max-w-[820px] flex-col gap-7">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div
                      className={
                        message.role === "user"
                          ? "max-w-[82%] rounded-[28px] bg-[var(--color-ink)] px-5 py-3 text-[15px] leading-7 text-[var(--color-paper)] md:max-w-[68%]"
                          : `max-w-[88%] rounded-[28px] border px-5 py-3 text-[15px] font-light leading-7 tracking-[-0.01em] md:max-w-[74%] md:text-[16px] ${
                              message.status === "error"
                                ? "border-[var(--color-cap-red)]/20 bg-[var(--color-cap-red)]/5 text-[var(--color-cap-red)]"
                                : "border-black/8 bg-white text-[var(--color-ink)] shadow-[0_10px_28px_rgba(91,71,71,0.08)]"
                            }`
                      }
                    >
                      {message.status === "thinking" ? (
                        <span className="inline-flex items-center gap-2 opacity-65">
                          <span>{message.content}</span>
                          <span className="flex gap-1" aria-hidden="true">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:120ms]" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:240ms]" />
                          </span>
                        </span>
                      ) : (
                        <InterviewMessageContent content={message.content} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-black/8 bg-[var(--color-paper)] px-5 py-4 md:px-10 md:py-6"
            >
              <div className="mx-auto flex max-w-[820px] items-end gap-3 rounded-[28px] border border-black/10 bg-white px-4 py-3 shadow-[0_18px_50px_rgba(91,71,71,0.11)] focus-within:border-[var(--color-cap-teal)]">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                  rows={1}
                  placeholder="Ask Jon a question"
                  className="max-h-32 min-h-11 flex-1 resize-none bg-transparent py-2 text-base leading-7 text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/45"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="flex h-11 min-w-20 items-center justify-center rounded-full bg-[var(--color-ink)] px-5 text-sm font-bold leading-none text-[var(--color-paper)] transition hover:bg-[var(--color-cap-teal)] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
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
  const [activeInterviewPrompt, setActiveInterviewPrompt] =
    useState<InterviewPrompt | null>(null);
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
          className="px-7 pb-32 pt-32 md:min-h-[640px] md:px-0 md:pb-0 md:pt-0"
        >
          <div className="mx-auto max-w-[1440px] md:px-[168px]">
            <div className="md:pt-[176px]">
              <Reveal>
                <p className="max-w-[70rem] font-serif text-[clamp(27px,2.5vw,36px)] leading-[1.47] tracking-[-0.045em] text-[var(--color-ink)]">
                  Hello,
                  <br />
                  I&apos;m a Designer and Product Manager with 20+ years&apos;
                  experience creating digital experiences for brands including
                  Apple, BBC and Samsung. I specialise in AI-enabled design,
                  rapid prototyping and digital innovation.
                  <br />
                  Open to senior design roles.
                </p>
              </Reveal>
              <Reveal delay={0.14} y={16}>
                <div className="mt-12 flex flex-wrap gap-5">
                  <a
                    href="mailto:jon.searle@gmail.com"
                    className="inline-flex min-w-[190px] justify-center rounded-full bg-[var(--color-ink)] px-9 py-4 text-base font-bold leading-5 tracking-[-0.01em] text-[var(--color-paper)] transition hover:-translate-y-0.5 hover:bg-[var(--color-cap-teal)] hover:shadow-[0_8px_20px_rgba(13,135,125,0.3)]"
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

        <InterviewJonSection onStartConversation={setActiveInterviewPrompt} />

        <section className="px-7 pb-28 pt-20 md:px-0 md:pb-[118px] md:pt-[118px]">
          <div className="mx-auto max-w-[1440px] md:px-[168px]">
            <Reveal y={16}>
              <h2 className="mb-8 font-serif text-[30px] leading-[1.12] tracking-[-0.03em] text-[var(--color-ink)] md:mb-[30px] md:text-[32px]">
                Explore some of my work
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-10 lg:grid-cols-6 lg:gap-12">
              {portfolioItems.map((item, index) => (
                <Reveal
                  key={item.title}
                  delay={index * 0.04}
                  y={18}
                  className="lg:col-span-2"
                >
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
      <InterviewChat
        prompt={activeInterviewPrompt}
        onClose={() => setActiveInterviewPrompt(null)}
      />
    </>
  );
}
