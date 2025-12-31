import { Trophy, Target, TrendingUp, Calendar, Gem, Scissors, TrendingDown, Repeat, Gamepad2, Users } from "lucide-react";

export type AchievementType =
  | 'primeiros_passos'
  | 'orcamento_controle'
  | 'cacador_metas'
  | 'analista_financeiro'
  | 'poupador_inteligente'
  | 'cortador_gastos'
  | 'investidor_iniciante'
  | 'automacao_mestre'
  | 'desafio_30_dias'
  | 'embaixador_financeiro';

export type AchievementLevel = 'bronze' | 'silver' | 'gold';

interface AchievementBadgeProps {
  type: AchievementType;
  level: AchievementLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  unlocked?: boolean;
}

const achievementConfig: Record<AchievementType, {
  icon: typeof Trophy;
  label: string;
  emoji: string;
}> = {
  primeiros_passos: {
    icon: Target,
    label: 'Primeiros Passos',
    emoji: '🎯',
  },
  orcamento_controle: {
    icon: TrendingUp,
    label: 'Orçamento no Controle',
    emoji: '💰',
  },
  cacador_metas: {
    icon: Trophy,
    label: 'Caçador de Metas',
    emoji: '🏆',
  },
  analista_financeiro: {
    icon: Calendar,
    label: 'Analista Financeiro',
    emoji: '📊',
  },
  poupador_inteligente: {
    icon: Gem,
    label: 'Poupador Inteligente',
    emoji: '💎',
  },
  cortador_gastos: {
    icon: Scissors,
    label: 'Cortador de Gastos',
    emoji: '✂️',
  },
  investidor_iniciante: {
    icon: TrendingDown,
    label: 'Investidor Iniciante',
    emoji: '📈',
  },
  automacao_mestre: {
    icon: Repeat,
    label: 'Automação Mestre',
    emoji: '🔄',
  },
  desafio_30_dias: {
    icon: Gamepad2,
    label: 'Desafio 30 Dias',
    emoji: '🎮',
  },
  embaixador_financeiro: {
    icon: Users,
    label: 'Embaixador Financeiro',
    emoji: '👥',
  },
};

const levelColors: Record<AchievementLevel, {
  bg: string;
  border: string;
  glow: string;
  text: string;
}> = {
  bronze: {
    bg: 'bg-gradient-to-br from-amber-700 to-amber-900',
    border: 'border-amber-600',
    glow: 'shadow-amber-500/50',
    text: 'text-amber-200',
  },
  silver: {
    bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
    border: 'border-gray-400',
    glow: 'shadow-gray-400/50',
    text: 'text-gray-100',
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-500/70',
    text: 'text-yellow-100',
  },
};

const sizeClasses = {
  sm: {
    container: 'w-16 h-16',
    icon: 'h-6 w-6',
    emoji: 'text-xl',
    border: 'border-2',
  },
  md: {
    container: 'w-24 h-24',
    icon: 'h-10 w-10',
    emoji: 'text-3xl',
    border: 'border-3',
  },
  lg: {
    container: 'w-32 h-32',
    icon: 'h-14 w-14',
    emoji: 'text-5xl',
    border: 'border-4',
  },
};

export function AchievementBadge({
  type,
  level,
  size = 'md',
  showLabel = false,
  unlocked = true,
}: AchievementBadgeProps) {
  const config = achievementConfig[type];
  const colors = levelColors[level];
  const sizes = sizeClasses[size];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          ${sizes.container}
          ${unlocked ? colors.bg : 'bg-muted/30'}
          ${unlocked ? colors.border : 'border-muted'}
          ${unlocked ? colors.glow : ''}
          ${sizes.border}
          rounded-full
          flex items-center justify-center
          relative
          transition-all duration-300
          ${unlocked ? 'hover:scale-110 hover:shadow-2xl' : 'opacity-50 grayscale'}
        `}
      >
        {/* Glow effect for gold */}
        {unlocked && level === 'gold' && (
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl animate-pulse" />
        )}

        {/* Icon or Emoji */}
        <div className="relative z-10">
          {unlocked ? (
            <span className={sizes.emoji}>{config.emoji}</span>
          ) : (
            <Icon className={`${sizes.icon} text-muted-foreground`} />
          )}
        </div>

        {/* Lock overlay for locked badges */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full backdrop-blur-sm">
            <svg
              className={`${sizes.icon} text-muted-foreground`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        )}

        {/* Level indicator */}
        {unlocked && (
          <div
            className={`
              absolute -bottom-1 -right-1
              ${level === 'bronze' ? 'bg-amber-700' : ''}
              ${level === 'silver' ? 'bg-gray-400' : ''}
              ${level === 'gold' ? 'bg-yellow-500' : ''}
              ${colors.text}
              text-xs font-bold
              px-2 py-0.5
              rounded-full
              border-2 border-background
              shadow-lg
            `}
          >
            {level === 'bronze' && '🥉'}
            {level === 'silver' && '🥈'}
            {level === 'gold' && '🥇'}
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-semibold">{config.label}</p>
          <p className="text-xs text-muted-foreground capitalize">{level}</p>
        </div>
      )}
    </div>
  );
}
