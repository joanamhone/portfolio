import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

const ContactForm: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    if (!form.current) return;

    emailjs
      .sendForm(
        'service_vgta1te',     // Replace with your EmailJS service ID
        'template_b02fhb6',    // Replace with your EmailJS template ID
        form.current,
        'URxU9Ju95We6wypMg'      // Replace with your EmailJS public key
      )
      .then(
        () => {
          setStatus('sent');
          if (form.current) form.current.reset();
        },
        () => {
          setStatus('error');
        }
      );
  };

  return (
    <form ref={form} onSubmit={sendEmail} className="grid gap-4 max-w-xl mx-auto">
      <input
        type="text"
        name="user_name"
        placeholder="Your Name"
        className="p-3 rounded bg-white/10"
        required
      />
      <input
        type="email"
        name="user_email"
        placeholder="Your Email"
        className="p-3 rounded bg-white/10"
        required
      />
      <input
        type="text"
        name="subject"
        placeholder="Subject"
        className="p-3 rounded bg-white/10"
        required
      />
      <textarea
        name="message"
        rows={5}
        placeholder="Your Message"
        className="p-3 rounded bg-white/10"
        required
      />
      <button type="submit" className="btn-primary">
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
      {status === 'sent' && <p className="text-green-400 text-sm">Message sent successfully!</p>}
      {status === 'error' && <p className="text-red-400 text-sm">Failed to send message. Try again.</p>}
    </form>
  );
};

export default ContactForm;
