import { useCallback, useEffect, useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

type VoiceButtonProps = {
  text: string;
  lang?: 'pt-BR' | 'en-US';
  label: string;
  variant?: 'default' | 'compact';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

export function VoiceButton({
  text,
  lang = 'pt-BR',
  label,
  variant = 'default',
  ...props
}: VoiceButtonProps) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const isCompact = variant === 'compact';

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const handleClick = useCallback(() => {
    if (!supported) {
      return;
    }
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  }, [lang, speaking, supported, text]);

  return (
    <Button
      type="button"
      variant="secondary"
      size={isCompact ? 'icon' : 'sm'}
      onClick={handleClick}
      aria-pressed={speaking}
      aria-live="polite"
      disabled={!supported}
      title={label}
      aria-label={label}
      {...props}
    >
      {speaking ? <VolumeX aria-hidden className="h-6 w-6" /> : <Volume2 aria-hidden className="h-6 w-6" />}
      {!isCompact ? <span>{label}</span> : null}
    </Button>
  );
}
