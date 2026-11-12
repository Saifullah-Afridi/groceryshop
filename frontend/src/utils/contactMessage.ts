import { STORE } from "../config";

export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

// A simple email shape check: something, an @, something, a dot, something
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_MESSAGE_LENGTH = 10;

// Checks the three fields and returns a message for each one that is wrong.
// The messages are passed in already translated, so this file does not depend on the language.
export function validateContact(values: ContactValues, messages: Record<keyof ContactValues, string>): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) errors.name = messages.name;
  if (!EMAIL_SHAPE.test(values.email.trim())) errors.email = messages.email;
  if (values.message.trim().length < MINIMUM_MESSAGE_LENGTH) errors.message = messages.message;
  return errors;
}

// Builds the link that opens the visitor's email app with the message ready to send.
export function buildMailtoLink(values: ContactValues, subject: string): string {
  const body = `${values.message.trim()}\n\n${values.name.trim()}\n${values.email.trim()}`;
  return `mailto:${STORE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
