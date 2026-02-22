'use client';

import { FormEvent, useState } from 'react';

type NotifyMeButtonProps = {
  collectionId: string;
};

export default function NotifyMeButton({ collectionId }: NotifyMeButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const normalizedWhatsapp = whatsapp.trim();

    if (!normalizedEmail && !normalizedWhatsapp) {
      setMessage({ type: 'error', text: 'Enter email or WhatsApp to join waitlist.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail || undefined,
          whatsapp_number: normalizedWhatsapp || undefined,
          collection_id: collectionId,
          source: 'waitlist',
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to join waitlist right now.');
      }

      setMessage({ type: 'success', text: "You're on the list!" });
      setEmail('');
      setWhatsapp('');
    } catch (submitError) {
      setMessage({
        type: 'error',
        text:
          submitError instanceof Error
            ? submitError.message
            : 'Unable to join waitlist right now.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="inline-block text-sm uppercase tracking-widest text-white/90 transition-colors hover:text-white"
      >
        {expanded ? 'Hide Form' : 'Notify Me'}
      </button>

      {expanded ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email Address"
            className="w-full border border-white/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:border-white focus:outline-none"
          />
          <input
            type="tel"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder="WhatsApp (optional)"
            className="w-full border border-white/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:border-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border border-white bg-white px-4 py-2 text-xs uppercase tracking-widest text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {isSubmitting ? 'Joining...' : 'Join Waitlist'}
          </button>
          {message ? (
            <p className={`text-xs ${message.type === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
              {message.text}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
