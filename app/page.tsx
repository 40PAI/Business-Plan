"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { ArrowRight, FileBarChart, Palette, Presentation } from "lucide-react";

const MASCOTS = [
  "/mascot-1.png",
  "/mascot-2.png",
  "/mascot-3.png",
  "/mascot-4.png",
  "/mascot-5.png",
  "/mascot-6.png",
  "/mascot-7.png",
];

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [currentMascot, setCurrentMascot] = useState(0);
  const mascotRef = useRef<HTMLDivElement>(null);

  // Auto-cycle mascots
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMascot((prev) => (prev + 1) % MASCOTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animate mascot transition
  useEffect(() => {
    if (mascotRef.current) {
      gsap.fromTo(
        mascotRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [currentMascot]);

  useGSAP(
    () => {
      // Nav Animation
      gsap.from(navRef.current, {
        y: -50,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2,
      });

      // Hero Text Split Animation
      const elements = gsap.utils.toArray(".reveal-text");
      gsap.from(elements, {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.4,
      });

      // Mascot Badges Float Animation
      gsap.from(".mascot-badge", {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.7)",
        delay: 1.2,
      });
    },
    { scope: container }
  );

  return (
    <div ref={container} className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-accent selection:text-foreground">
      {/* Noise Overlay */}
      <svg
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Smoke Blue Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-chart-1/10 blur-[120px] rounded-full mix-blend-multiply translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vh] bg-secondary/20 blur-[140px] rounded-full mix-blend-multiply -translate-x-1/4 translate-y-1/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
      </div>

      {/* Floating Navbar */}
      <header
        ref={navRef}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between px-6 py-3 w-[90%] max-w-4xl bg-secondary/40 backdrop-blur-xl border border-secondary rounded-full shadow-lg"
      >
        <span className="font-sans text-sm md:text-base font-medium tracking-tight text-foreground">
          O teu plano de negócio <span className="font-serif italic">em menos de 5min</span>
        </span>
        <a href="/dashboard" className="px-5 py-2 text-sm font-medium text-primary-foreground bg-foreground rounded-full hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
          Entrar
        </a>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="relative flex items-center min-h-[100dvh] px-8 md:px-16 lg:px-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full pt-28 pb-16">
            {/* Left — Text */}
            <div ref={heroTextRef}>
              <h1 className="flex flex-col gap-2">
                <span className="reveal-text font-sans text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-[1.1]">
                  A precisão dos dados encontra
                </span>
                <span className="reveal-text font-serif italic text-5xl md:text-7xl lg:text-8xl tracking-tight text-accent-foreground">
                  a clareza estratégica.
                </span>
              </h1>

              <p className="reveal-text mt-8 max-w-xl text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
                Responde a algumas perguntas rápidas. A nossa IA transforma as tuas ideias num plano de negócio completo, logo e pitch deck profissional.
              </p>

              <div className="reveal-text mt-10 flex items-center gap-6">
                <a href="/plan" className="group relative overflow-hidden rounded-full bg-foreground px-8 py-4 text-primary-foreground font-medium transition-all hover:scale-105 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] duration-500">
                  <span className="relative z-10 flex items-center gap-2">
                    Criar o meu plano
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 z-0 bg-accent translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                </a>
              </div>
            </div>

            {/* Right — Mascot Card */}
            <div className="reveal-text relative flex justify-center lg:justify-end">
              <div className="relative w-[320px] md:w-[380px]">
                {/* Main card with mascot */}
                <div className="relative rounded-[2rem] bg-card/80 backdrop-blur-xl border border-border/60 shadow-2xl overflow-hidden">
                  {/* Grid pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

                  {/* Mascot carousel */}
                  <div ref={mascotRef} className="relative z-10 flex justify-center pt-8 pb-6 min-h-[350px]">
                    <Image
                      key={currentMascot}
                      src={MASCOTS[currentMascot]}
                      alt="PlanAI Mascot"
                      width={280}
                      height={350}
                      className="drop-shadow-2xl object-contain"
                      priority
                    />
                  </div>

                  {/* Dots indicator */}
                  <div className="relative z-10 flex justify-center gap-1.5 pb-4">
                    {MASCOTS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentMascot(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentMascot
                            ? "w-5 bg-accent-foreground"
                            : "w-1.5 bg-border hover:bg-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Glow under mascot */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-accent/20 blur-[40px] rounded-full" />
                </div>

                {/* Floating badges */}
                <div className="mascot-badge absolute -top-3 -left-4 flex items-center gap-2 rounded-full bg-card border border-border/60 shadow-lg px-4 py-2 text-xs font-medium text-foreground">
                  <FileBarChart size={14} className="text-accent-foreground" />
                  Plano completo
                </div>

                <div className="mascot-badge absolute top-1/4 -right-6 flex items-center gap-2 rounded-full bg-card border border-border/60 shadow-lg px-4 py-2 text-xs font-medium text-foreground">
                  <Palette size={14} className="text-accent-foreground" />
                  Logo
                </div>

                <div className="mascot-badge absolute bottom-1/3 -left-6 flex items-center gap-2 rounded-full bg-card border border-border/60 shadow-lg px-4 py-2 text-xs font-medium text-foreground">
                  <Presentation size={14} className="text-accent-foreground" />
                  Pitch deck
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
