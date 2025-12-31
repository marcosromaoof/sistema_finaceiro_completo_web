import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Share2 } from 'lucide-react';
import { AchievementBadge, AchievementType, AchievementLevel } from './AchievementBadge';

interface AchievementUnlockedModalProps {
  type: AchievementType;
  level: AchievementLevel;
  xpEarned: number;
  message: string;
  onClose: () => void;
}

const levelMessages: Record<AchievementLevel, string> = {
  bronze: 'Conquista Desbloqueada!',
  silver: 'Conquista Prata Desbloqueada!',
  gold: 'Conquista Ouro Desbloqueada!',
};

export function AchievementUnlockedModal({
  type,
  level,
  xpEarned,
  message,
  onClose,
}: AchievementUnlockedModalProps) {
  useEffect(() => {
    // Trigger confetti animation
    const colors = level === 'gold'
      ? ['#D4AF37', '#FFD700', '#FDB931']
      : level === 'silver'
      ? ['#C0C0C0', '#D3D3D3', '#E8E8E8']
      : ['#CD7F32', '#B87333', '#C77826'];

    const duration = level === 'gold' ? 3000 : 2000;
    const particleCount = level === 'gold' ? 200 : level === 'silver' ? 150 : 100;

    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Big burst in center
    setTimeout(() => {
      confetti({
        particleCount: particleCount,
        spread: 120,
        origin: { y: 0.5 },
        colors: colors,
        ticks: 300,
      });
    }, 300);

    // Play sound (optional - can add audio file)
    // const audio = new Audio('/achievement-sound.mp3');
    // audio.play().catch(() => {});
  }, [level]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-md p-8 bg-card border-2 border-primary rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Title */}
          <div>
            <h2 className="text-3xl font-bold mb-2">{levelMessages[level]}</h2>
            <div className="flex items-center justify-center gap-2 text-lg text-prosperity font-semibold">
              <span>+{xpEarned} XP</span>
              <span className="text-2xl">✨</span>
            </div>
          </div>

          {/* Badge */}
          <div className="my-4 animate-in zoom-in-50 duration-500">
            <AchievementBadge
              type={type}
              level={level}
              size="lg"
              showLabel={true}
              unlocked={true}
            />
          </div>

          {/* Message */}
          <p className="text-lg text-muted-foreground max-w-sm">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg bg-prosperity text-white font-medium hover:bg-prosperity/90 transition-colors"
            >
              Continuar
            </button>
            <button
              onClick={() => {
                // Share functionality (can implement later)
                alert('Compartilhar em breve!');
              }}
              className="px-6 py-3 rounded-lg border-2 border-border hover:bg-muted transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-prosperity rounded-full opacity-20 blur-xl" />
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-full opacity-20 blur-xl" />
      </div>
    </div>
  );
}
