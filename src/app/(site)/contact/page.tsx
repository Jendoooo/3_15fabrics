'use client';

import { FormEvent, useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '2349131410602').replace(/\D/g, '');
  const whatsappHref = `https://wa.me/${whatsappNumber}`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setStatus('sending');

    try {
      // Save contact to contacts table
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), source: 'contact_form' }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="flex min-h-[30vh] items-center justify-center bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="mb-4 text-4xl font-light uppercase tracking-[0.3em] md:text-5xl">
            Contact Us
          </h1>
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            We&apos;d love to hear from you
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 md:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          {/* Contact Info */}
          <div>
            <h2 className="mb-8 text-lg font-light uppercase tracking-widest">
              Get in Touch
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest">
                  WhatsApp
                </h3>
                <p className="text-sm text-neutral-600">
                  Fastest way to reach us. Order enquiries, sizing help, custom requests.
                </p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-medium underline transition-colors hover:text-neutral-500"
                >
                  Message us on WhatsApp
                </a>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest">
                  Instagram
                </h3>
                <p className="text-sm text-neutral-600">
                  Follow us for new drops, behind-the-scenes, and editorial content.
                </p>
                <a
                  href="https://instagram.com/iby_closet"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-medium underline transition-colors hover:text-neutral-500"
                >
                  @iby_closet
                </a>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest">
                  Email
                </h3>
                <p className="text-sm text-neutral-600">
                  For partnerships, press enquiries, and wholesale.
                </p>
                <a
                  href="mailto:Ibycloset11@gmail.com"
                  className="mt-2 inline-block text-sm font-medium underline transition-colors hover:text-neutral-500"
                >
                  Ibycloset11@gmail.com
                </a>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest">
                  TikTok
                </h3>
                <p className="text-sm text-neutral-600">
                  Short-form content, fits, and style inspiration.
                </p>
                <a
                  href="https://tiktok.com/@iby_closet"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-medium underline transition-colors hover:text-neutral-500"
                >
                  @iby_closet
                </a>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest">
                  Visit Us
                </h3>
                <p className="text-sm text-neutral-600">
                  Our Lagos space is open for walk-ins. DM us on Instagram or WhatsApp for the address and available times.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="mb-8 text-lg font-light uppercase tracking-widest">
              Send a Message
            </h2>

            {status === 'sent' ? (
              <div className="flex min-h-[300px] items-center justify-center rounded bg-neutral-50 p-8 text-center">
                <div>
                  <p className="mb-2 text-lg font-light uppercase tracking-widest">
                    Message Sent
                  </p>
                  <p className="text-sm text-neutral-600">
                    Thanks for reaching out. We&apos;ll get back to you soon.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-semibold uppercase tracking-widest"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full border border-neutral-300 px-4 py-3 text-sm transition-colors focus:border-black focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-widest"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full border border-neutral-300 px-4 py-3 text-sm transition-colors focus:border-black focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-xs font-semibold uppercase tracking-widest"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full border border-neutral-300 px-4 py-3 text-sm transition-colors focus:border-black focus:outline-none"
                    placeholder="How can we help?"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-600">
                    Something went wrong. Please try again or reach us on WhatsApp.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-black py-4 text-sm uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
