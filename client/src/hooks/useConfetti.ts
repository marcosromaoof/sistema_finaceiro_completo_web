import { useCallback } from "react";
import confetti from "canvas-confetti";

/**
 * Hook para animações de confetti
 * Usa canvas-confetti para celebrações visuais
 */
export function useConfetti() {
  /**
   * Explosão de confetti para top 1 no ranking
   * Dourado e amarelo com explosão central
   */
  const fireTop1Confetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ["#FFD700", "#FFA500", "#FFFF00", "#FF8C00"], // Dourado, laranja, amarelo
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Explosões do centro com variação
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.4, 0.6), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  /**
   * Confetti lateral para conquistas
   * Explosões dos lados da tela
   */
  const fireAchievementConfetti = useCallback(() => {
    const end = Date.now() + 1500; // 1.5 segundos

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#6366f1", "#8b5cf6", "#a855f7"], // Primary/accent colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#6366f1", "#8b5cf6", "#a855f7"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  /**
   * Chuva de confetti para level up
   * Cai do topo da tela
   */
  const fireLevelUpConfetti = useCallback(() => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 90,
        spread: 45,
        origin: { x: Math.random(), y: 0 },
        colors: ["#10b981", "#3b82f6", "#8b5cf6"], // Verde, azul, roxo
        gravity: 1.2,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  /**
   * Explosão simples para eventos gerais
   */
  const fireSimpleConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return {
    fireTop1Confetti,
    fireAchievementConfetti,
    fireLevelUpConfetti,
    fireSimpleConfetti,
  };
}
