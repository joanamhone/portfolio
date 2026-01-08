import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { useToast } from './Toast';

const ContactForm: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const { showToast } = useToast();

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
          showToast('success', 'Message sent successfully!');
          if (form.current) form.current.reset();
        },
        () => {
          setStatus('error');
          showToast('error', 'Failed to send message. Please try again.');
        }
      );
  };

  return (
    <form ref={form} onSubmit={sendEmail} className="grid gap-4 max-w-xl mx-auto">
      <input
        type="text"
        name="user_name"
        placeholder="Your Name"
        className="p-3 rounded bg-white/10 input-focus"
        required
      />
      <input
        type="email"
        name="user_email"
        placeholder="Your Email"
        className="p-3 rounded bg-white/10 input-focus"
        required
      />
      <input
        type="text"
        name="subject"
        placeholder="Subject"
        className="p-3 rounded bg-white/10 input-focus"
        required
      />
      <textarea
        name="message"
        rows={5}
        placeholder="Your Message"
        className="p-3 rounded bg-white/10 input-focus resize-none"
        required
      />
      <button type="submit" className="btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;
