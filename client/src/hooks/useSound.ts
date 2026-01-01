import { useCallback, useRef } from "react";

/**
 * Hook para tocar efeitos sonoros
 * Usa Web Audio API para sons sutis e performáticos
 */
export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Inicializa AudioContext (lazy)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Toca som de conquista desbloqueada
   * Frequências: C5 (523Hz) → E5 (659Hz) → G5 (784Hz)
   */
  const playAchievementSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Oscilador principal
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Configurar forma de onda (sine = suave)
      oscillator.type = "sine";

      // Melodia ascendente (C5 → E5 → G5)
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5

      // Envelope ADSR (Attack, Decay, Sustain, Release)
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.15); // Decay
      gainNode.gain.setValueAtTime(0.2, now + 0.25); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, now + 0.4); // Release

      oscillator.start(now);
      oscillator.stop(now + 0.4);
    } catch (error) {
      console.warn("Erro ao tocar som de conquista:", error);
    }
  }, [getAudioContext]);

  /**
   * Toca som de top 1 no ranking
   * Fanfarra triunfante: C5 → E5 → G5 → C6
   */
  const playTop1Sound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Oscilador principal
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "triangle"; // Som mais brilhante

      // Fanfarra (C5 → E5 → G5 → C6)
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
      oscillator.frequency.setValueAtTime(1046.50, now + 0.3); // C6

      // Envelope mais longo
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.2);
      gainNode.gain.setValueAtTime(0.3, now + 0.35);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.6);

      oscillator.start(now);
      oscillator.stop(now + 0.6);
    } catch (error) {
      console.warn("Erro ao tocar som de top 1:", error);
    }
  }, [getAudioContext]);

  /**
   * Toca som de nível subido
   * Arpejo ascendente rápido
   */
  const playLevelUpSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "square"; // Som mais "digital"

      // Arpejo rápido (C5 → G5 → C6)
      oscillator.frequency.setValueAtTime(523.25, now);
      oscillator.frequency.setValueAtTime(783.99, now + 0.08);
      oscillator.frequency.setValueAtTime(1046.50, now + 0.16);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.warn("Erro ao tocar som de level up:", error);
    }
  }, [getAudioContext]);

  /**
   * Toca som de clique suave
   */
  const playClickSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.05);

      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } catch (error) {
      console.warn("Erro ao tocar som de clique:", error);
    }
  }, [getAudioContext]);

  return {
    playAchievementSound,
    playTop1Sound,
    playLevelUpSound,
    playClickSound,
  };
}
