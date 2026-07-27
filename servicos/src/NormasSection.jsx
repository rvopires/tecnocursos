import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useAnimationFrame, useMotionValue, animate } from 'framer-motion';
import {
  FileStack,
  Users,
  HardHat,
  ArrowUpFromLine,
  Zap,
  PersonStanding,
  Box,
  Shield,
  Flame,
  FileText,
  Layers,
  Headphones,
} from 'lucide-react';

const nrData = [
  {
    id: 'center-base',
    title: '35+ NRs',
    subtitle: 'Catálogo completo',
    badge: 'Online + presencial',
    isCenterBase: true,
    Icon: FileStack,
  },
  {
    id: 'nr-05',
    code: 'NR 05',
    label: 'CIPA',
    Icon: Users,
  },
  {
    id: 'nr-18',
    code: 'NR 18',
    label: 'Construção',
    Icon: HardHat,
  },
  {
    id: 'nr-35',
    code: 'NR 35',
    label: 'Trabalho em Altura',
    Icon: ArrowUpFromLine,
  },
  {
    id: 'nr-10',
    code: 'NR 10',
    label: 'Instalações Elétricas',
    Icon: Zap,
  },
  {
    id: 'nr-17',
    code: 'NR 17',
    label: 'Ergonomia',
    Icon: PersonStanding,
  },
  {
    id: 'nr-33',
    code: 'NR 33',
    label: 'Espaços Confinados',
    Icon: Box,
  },
  {
    id: 'nr-06',
    code: 'NR 06',
    label: 'EPI',
    Icon: Shield,
  },
  {
    id: 'nr-20',
    code: 'NR 20',
    label: 'Inflamáveis e Combustíveis',
    Icon: Flame,
  },
];

const centerBase = nrData[0];
const initialOrbit = nrData.slice(1);

const ORBIT_RX = 42;
const ORBIT_RY = 38;

function getOrbitPosition(index, total) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    left: `${50 + ORBIT_RX * Math.cos(angle)}%`,
    top: `${50 + ORBIT_RY * Math.sin(angle)}%`,
  };
}

function CenterCardContent({ item }) {
  const Icon = item.Icon;
  if (item.isCenterBase) {
    return (
      <>
        <span className="normas-card-icon normas-card-icon--lg" aria-hidden="true">
          <Icon size={28} strokeWidth={1.75} />
        </span>
        <div className="normas-card-center-body">
          <strong className="normas-card-center-title">{item.title}</strong>
          <span className="normas-card-center-sub">{item.subtitle}</span>
          <span className="normas-card-center-badge">{item.badge}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <span className="normas-card-icon normas-card-icon--lg" aria-hidden="true">
        <Icon size={28} strokeWidth={1.75} />
      </span>
      <div className="normas-card-center-body">
        <strong className="normas-card-center-title">{item.code}</strong>
        <span className="normas-card-center-sub">{item.label}</span>
        <span className="normas-card-center-badge">Online + presencial</span>
      </div>
    </>
  );
}

function OrbitCardContent({ item }) {
  const Icon = item.Icon;
  if (item.isCenterBase) {
    return (
      <>
        <span className="normas-card-icon" aria-hidden="true">
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <div className="normas-card-orbit-text">
          <strong>{item.title}</strong>
          <span>{item.subtitle}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <span className="normas-card-icon" aria-hidden="true">
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <div className="normas-card-orbit-text">
        <strong>{item.code}</strong>
        <span>{item.label}</span>
      </div>
    </>
  );
}

// Velocidade da rotação contínua da órbita (radianos por segundo)
const ROTATION_SPEED = 0.14;
// Tempos do ciclo de destaque
const PULL_TRAVEL_MS = 1000;
const PULL_HOLD_MS = 2600;
const PULL_GAP_MS = 900;
const PULL_SCALE = 0.45;

function usePrefersReducedMotion() {
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  return reduced;
}

function NormasOrbital() {
  const reducedMotion = usePrefersReducedMotion();
  const centerRef = useRef(null);
  const cardRefs = useRef({});
  const angleRef = useRef(0);
  const activeIndexRef = useRef(-1);
  const pull = useMotionValue(0);
  const [activeId, setActiveId] = useState(null);

  // Ciclo de destaque: puxa um card por vez para o centro, segura e devolve
  useEffect(() => {
    if (reducedMotion) return undefined;
    let cancelled = false;
    const timers = [];
    let index = 0;

    const schedule = (fn, ms) => {
      timers.push(window.setTimeout(fn, ms));
    };

    function cycle() {
      if (cancelled) return;
      activeIndexRef.current = index % initialOrbit.length;
      setActiveId(initialOrbit[activeIndexRef.current].id);
      animate(pull, 1, { duration: PULL_TRAVEL_MS / 1000, ease: [0.22, 1, 0.36, 1] });
      schedule(() => {
        if (cancelled) return;
        animate(pull, 0, { duration: PULL_TRAVEL_MS / 1000, ease: [0.45, 0, 0.55, 1] });
        schedule(() => {
          if (cancelled) return;
          activeIndexRef.current = -1;
          setActiveId(null);
          index += 1;
          schedule(cycle, PULL_GAP_MS);
        }, PULL_TRAVEL_MS);
      }, PULL_TRAVEL_MS + PULL_HOLD_MS);
    }

    schedule(cycle, 1600);
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reducedMotion, pull]);

  // Rotação contínua + interpolação do card em destaque, direto no DOM
  useAnimationFrame((_, delta) => {
    if (reducedMotion) return;
    angleRef.current += (Math.min(delta, 64) / 1000) * ROTATION_SPEED;
    const p = pull.get();
    const active = activeIndexRef.current;

    initialOrbit.forEach((item, idx) => {
      const node = cardRefs.current[item.id];
      if (!node) return;
      const angle =
        angleRef.current + (idx / initialOrbit.length) * Math.PI * 2 - Math.PI / 2;
      let x = 50 + ORBIT_RX * Math.cos(angle);
      let y = 50 + ORBIT_RY * Math.sin(angle);
      let scale = 1;
      let opacity = 1;
      let z = 2;
      if (idx === active) {
        x += (50 - x) * p;
        y += (50 - y) * p;
        scale = 1 + PULL_SCALE * p;
        z = 30;
      } else if (active !== -1) {
        opacity = 1 - 0.3 * p;
      }
      node.style.left = x + '%';
      node.style.top = y + '%';
      node.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
      node.style.opacity = String(opacity);
      node.style.zIndex = String(z);
    });

    if (centerRef.current) {
      const k = 1 - p;
      centerRef.current.style.opacity = String(k);
      centerRef.current.style.transform =
        'translate(-50%, -50%) scale(' + (0.72 + 0.28 * k) + ')';
    }
  });

  return (
    <div className="normas-orbital" aria-label="Catálogo orbital de Normas Regulamentadoras">
      <div className="normas-orbital-rings" aria-hidden="true">
        <svg className="normas-ring normas-ring--1" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 8" />
        </svg>
        <svg className="normas-ring normas-ring--2" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="68" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
        </svg>
        <svg className="normas-ring normas-ring--3" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
        <span className="normas-star normas-star--1" />
        <span className="normas-star normas-star--2" />
        <span className="normas-star normas-star--3" />
        <span className="normas-star normas-star--4" />
        <span className="normas-star normas-star--5" />
      </div>

      <div className="normas-orbital-stage">
        <div
          ref={centerRef}
          className="normas-card normas-card--center"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <CenterCardContent item={centerBase} />
        </div>

        {initialOrbit.map((item, index) => {
          const pos = getOrbitPosition(index, initialOrbit.length);
          return (
            <div
              key={item.id}
              ref={(el) => {
                cardRefs.current[item.id] = el;
              }}
              className={
                'normas-card normas-card--orbit' +
                (activeId === item.id ? ' is-highlight' : '')
              }
              style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
            >
              <OrbitCardContent item={item} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function initReveals(scope) {
  const root = scope || document;
  const reveals = root.querySelectorAll('.reveal:not(.is-visible)');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }
}

export function NormasSection() {
  useEffect(() => {
    initReveals(document.getElementById('catalogo'));
  }, []);
  return (
    <section className="block normas-section" id="catalogo" aria-labelledby="normas-title">
      <div className="normas-ambient" aria-hidden="true">
        <div className="normas-glow normas-glow--cyan" />
        <div className="normas-glow normas-glow--emerald" />
        <div className="normas-glow normas-glow--blue" />
      </div>

      <div className="container">
        <div className="normas-layout">
          <div className="normas-copy reveal">
            <h2 id="normas-title" className="normas-title">
              Todas as NRs, do <span className="normas-accent normas-accent--emerald">online</span> ao{' '}
              <span className="normas-accent normas-accent--blue">presencial</span>
            </h2>
            <p className="normas-lead">
              Normas Regulamentadoras cobrindo desde treinamentos introdutórios até capacitações de alta
              criticidade — online e presencial, com conteúdo técnico e atualizado para a sua operação.
            </p>

            <div className="normas-features-box">
              <div className="normas-features-grid">
                <div className="normas-feature-col">
                  <span className="normas-feature-icon" aria-hidden="true">
                    <FileText size={20} strokeWidth={1.75} />
                  </span>
                  <strong>
                    <span className="normas-feature-num">35+</span> NRs disponíveis
                  </strong>
                  <p>Portfólio completo para sua operação.</p>
                </div>
                <div className="normas-feature-col">
                  <span className="normas-feature-icon" aria-hidden="true">
                    <Shield size={20} strokeWidth={1.75} />
                  </span>
                  <strong>
                    Conteúdo <span className="normas-accent normas-accent--emerald">atualizado</span>
                  </strong>
                  <p>Revisado conforme mudanças na legislação.</p>
                </div>
                <div className="normas-feature-col">
                  <span className="normas-feature-icon" aria-hidden="true">
                    <Layers size={20} strokeWidth={1.75} />
                  </span>
                  <strong>
                    Etapas <span className="normas-accent normas-accent--blue">integradas</span>
                  </strong>
                  <p>Online e presencial em um só lugar.</p>
                </div>
              </div>
              <div className="normas-features-footer">
                <Headphones size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>Não encontrou a NR que precisa?</span>
                {/* TODO: trocar o href pelo link da página de contato */}
                <a href="contato.html">Fale com um especialista →</a>
              </div>
            </div>
          </div>

          <div className="normas-orbital-wrap reveal">
            <NormasOrbital />
          </div>
        </div>
      </div>
    </section>
  );
}

export function mountNormas(element) {
  if (!element) return;
  createRoot(element).render(<NormasSection />);
}
