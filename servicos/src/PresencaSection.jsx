import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'framer-motion';
import {
  Check,
  MoreHorizontal,
  Users,
  SquareActivity,
  FileX2,
  ShieldCheck,
  Radio,
} from 'lucide-react';

const TOTAL_PARTICIPANTS = 1250;
const INITIAL_PRESENT = 1084;
const PROGRESS_SEGMENTS = 40;
const MAX_VISIBLE_CHECKINS = 5;
// Intervalo entre check-ins (aleatório, para parecer orgânico)
const CHECKIN_MIN_MS = 1600;
const CHECKIN_MAX_MS = 3400;

const firstNames = [
  'Ana', 'Bruno', 'Camila', 'Diego', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique',
  'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nicolas', 'Otávio', 'Patrícia',
  'Rafael', 'Sofia', 'Thiago', 'Vitória', 'William', 'Yasmin', 'Paulo', 'Larissa',
];
const lastNames = [
  'Silva', 'Souza', 'Oliveira', 'Santos', 'Pereira', 'Lima', 'Carvalho', 'Ribeiro',
  'Almeida', 'Gomes', 'Martins', 'Rocha', 'Barbosa', 'Nunes', 'Castro', 'Ferreira',
  'Dias', 'Moreira', 'Cardoso', 'Teixeira',
];

const initialCheckins = [
  { id: 'c-1', name: 'João Silva', time: '10:24:31', initials: 'JS', tone: 'emerald' },
  { id: 'c-2', name: 'Maria Alves', time: '10:24:28', initials: 'MA', tone: 'blue' },
  { id: 'c-3', name: 'Pedro Costa', time: '10:24:25', initials: 'PC', tone: 'emerald' },
  { id: 'c-4', name: 'Paulo Henrique', time: '10:24:22', initials: 'PH', tone: 'blue' },
];

const highlightPills = [
  { label: 'Zero papel', Icon: FileX2 },
  { label: 'Pronto para auditorias', Icon: Radio },
  { label: 'Rastreabilidade total', Icon: ShieldCheck },
];

function formatCount(value) {
  return value.toLocaleString('pt-BR');
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatNow() {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function calcPercentage(count) {
  return Math.min(100, Math.round((count / TOTAL_PARTICIPANTS) * 100));
}

function SegmentedProgress({ percentage }) {
  const filled = Math.round((percentage / 100) * PROGRESS_SEGMENTS);
  return (
    <div className="presenca-progress">
      <div className="presenca-progress-bars" aria-hidden="true">
        {Array.from({ length: PROGRESS_SEGMENTS }).map((_, index) => (
          <span
            key={index}
            className={`presenca-progress-seg${index < filled ? ' is-filled' : ''}`}
          />
        ))}
      </div>
      <p className="presenca-progress-label">
        <strong>{percentage}%</strong> de presença
      </p>
    </div>
  );
}

function PresencaDashboard() {
  const [checkins, setCheckins] = useState(initialCheckins);
  const [presentCount, setPresentCount] = useState(INITIAL_PRESENT);
  const [percentage, setPercentage] = useState(calcPercentage(INITIAL_PRESENT));
  const [newCheckinId, setNewCheckinId] = useState(null);
  const [countPulse, setCountPulse] = useState(false);
  const idRef = useRef(100);
  const countRef = useRef(INITIAL_PRESENT);

  // Check-ins contínuos: nomes gerados aleatoriamente entram o tempo todo
  useEffect(() => {
    let cancelled = false;
    let timer = null;
    const recentNames = [];

    function nextDelay() {
      return CHECKIN_MIN_MS + Math.random() * (CHECKIN_MAX_MS - CHECKIN_MIN_MS);
    }

    function randomName() {
      let name = '';
      do {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        name = `${first} ${last}`;
      } while (recentNames.includes(name));
      recentNames.push(name);
      if (recentNames.length > 10) recentNames.shift();
      return name;
    }

    function addCheckin() {
      if (cancelled) return;
      if (countRef.current >= TOTAL_PARTICIPANTS) return;
      // Aba oculta: não acumula check-ins, só reagenda
      if (document.hidden) {
        timer = window.setTimeout(addCheckin, nextDelay());
        return;
      }

      const name = randomName();
      idRef.current += 1;
      const newEntry = {
        id: `c-${idRef.current}`,
        name,
        time: formatNow(),
        initials: getInitials(name),
        tone: Math.random() < 0.5 ? 'emerald' : 'blue',
      };

      countRef.current += 1;
      setCheckins((prev) => [newEntry, ...prev].slice(0, MAX_VISIBLE_CHECKINS));
      setPresentCount(countRef.current);
      setPercentage(calcPercentage(countRef.current));
      setNewCheckinId(newEntry.id);
      setCountPulse(true);
      window.setTimeout(() => setCountPulse(false), 700);

      timer = window.setTimeout(addCheckin, nextDelay());
    }

    timer = window.setTimeout(addCheckin, 1200);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!newCheckinId) return undefined;
    const timeout = window.setTimeout(() => setNewCheckinId(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [newCheckinId]);

  return (
    <div className="presenca-dashboard-wrap" aria-label="Painel de presença em tempo real">
      <div className="presenca-dashboard-aura" aria-hidden="true" />
      <div className="presenca-dashboard-card">
        <header className="presenca-dashboard-header">
          <div className="presenca-dashboard-header-left">
            <span className="presenca-dashboard-kicker">TURMA</span>
            <h3 className="presenca-dashboard-class">NR-10 — Básico</h3>
            <span className="presenca-live">
              <span className="presenca-live-dot" />
              Ao vivo
            </span>
          </div>
          <div className="presenca-dashboard-header-right">
            <motion.span
              className={`presenca-count${countPulse ? ' is-pulse' : ''}`}
              animate={countPulse ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {formatCount(presentCount)}
            </motion.span>
            <span className="presenca-count-label">participantes presentes</span>
            <span className="presenca-updated">
              <span className="presenca-live-dot presenca-live-dot--sm" />
              Atualizado agora
            </span>
          </div>
          <button type="button" className="presenca-menu-btn" aria-label="Mais opções">
            <MoreHorizontal size={18} strokeWidth={1.75} />
          </button>
        </header>

        <SegmentedProgress percentage={percentage} />

        <div className="presenca-checkins-head">
          <SquareActivity size={14} strokeWidth={1.75} aria-hidden="true" />
          <span>CHECK-INS EM TEMPO REAL</span>
        </div>

        <ul className="presenca-checkins-list">
          {checkins.map((item, index) => {
            const isNew = item.id === newCheckinId && index === 0;
            return (
              <motion.li
                key={item.id}
                className={`presenca-checkin${isNew ? ' is-new' : ''}`}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={`presenca-avatar presenca-avatar--${item.tone}`}>{item.initials}</span>
                <div className="presenca-checkin-body">
                  <div className="presenca-checkin-name-row">
                    <strong>{item.name}</strong>
                    {isNew && <span className="presenca-novo-tag">NOVO</span>}
                  </div>
                  <span className="presenca-checkin-time">{item.time}</span>
                </div>
                <span className={`presenca-check-icon${isNew ? ' is-glow' : ''}`} aria-hidden="true">
                  <Check size={14} strokeWidth={2.5} />
                </span>
              </motion.li>
            );
          })}
        </ul>

        <footer className="presenca-dashboard-footer">
          <Users size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>
            <strong>{formatCount(presentCount)}</strong> de {formatCount(TOTAL_PARTICIPANTS)} participantes
          </span>
        </footer>
      </div>

      <aside className="presenca-qr-widget" aria-label="QR Code de presença">
        <img
          src={
            typeof window !== 'undefined' && window.location.pathname.includes('/tecnologia')
              ? '../../img/qrcode.jpeg'
              : '../img/qrcode.jpeg'
          }
          alt="QR Code de Presença"
          className="presenca-qr-img"
          width="96"
          height="96"
        />
        <p>Escaneie para entrar</p>
      </aside>
    </div>
  );
}

export function PresencaSection() {
  return (
    <section className="block presenca-section" id="lista-digital" aria-labelledby="presenca-title">
      <div className="presenca-ambient" aria-hidden="true">
        <div className="presenca-trail presenca-trail--1" />
        <div className="presenca-trail presenca-trail--2" />
        <div className="presenca-glow presenca-glow--cyan" />
        <div className="presenca-glow presenca-glow--emerald" />
      </div>

      <div className="container">
        <div className="presenca-layout">
          <div className="presenca-copy">
            <span className="presenca-eyebrow">Lista de Presença Digital</span>
            <h2 id="presenca-title" className="presenca-title">
              Presença em tempo real.<br />
              <span className="presenca-title-accent">Sem papel. Sem dúvida.</span>
            </h2>
            <p className="presenca-lead">
              Check-ins em tempo real, QR Code e registros prontos para auditorias. Toda a turma sob controle em um único painel.
            </p>

            <ul className="presenca-pills" aria-label="Diferenciais rápidos">
              {highlightPills.map((pill) => (
                <li key={pill.label} className="presenca-pill">
                  <span className="presenca-pill-ico" aria-hidden="true">
                    <pill.Icon size={16} strokeWidth={1.9} />
                  </span>
                  {pill.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="presenca-dashboard-col">
            <PresencaDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

export function mountPresenca(element) {
  if (!element) return;
  createRoot(element).render(<PresencaSection />);
}
