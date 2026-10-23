import { describe, it, expect } from 'vitest';
import { ContactFormSchema } from '../src/index';

describe('Shared Schemas & Types Tests', () => {
  it('ContactFormSchema should validate compliant contact data', () => {
    const validData = {
      fullName: 'Bisi Akande',
      email: 'bisi@example.ng',
      subject: 'Inquiry',
      message: 'Hello, I would like to inquire about facility subscription options.',
      consent: true
    };
    const result = ContactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('ContactFormSchema should fail if NDPA consent is false', () => {
    const invalidData = {
      fullName: 'Bisi Akande',
      email: 'bisi@example.ng',
      subject: 'Inquiry',
      message: 'Hello, I would like to inquire about facility subscription options.',
      consent: false
    };
    const result = ContactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
