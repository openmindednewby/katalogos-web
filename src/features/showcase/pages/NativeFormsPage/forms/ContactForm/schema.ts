/**
 * Contact form validation schema using Zod.
 */
import { z } from 'zod';

const MIN_MESSAGE_LENGTH = 10;

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .min(1, 'Please select a subject'),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(MIN_MESSAGE_LENGTH, `Message must be at least ${MIN_MESSAGE_LENGTH} characters`),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const subjectOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'sales', label: 'Sales Question' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];
