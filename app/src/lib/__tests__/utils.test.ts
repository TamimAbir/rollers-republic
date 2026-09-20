import { describe, it, expect } from 'vitest';
import { cn, formatPrice, truncate } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('resolves tailwind conflicts with twMerge', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('formatPrice', () => {
  it('formats a price and returns a non-empty string', () => {
    const result = formatPrice(1000);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formats large values (grouped digits or localized digits)', () => {
    const result = formatPrice(1000000);
    expect(result).not.toBe('1000000');
    expect(result.length).toBeGreaterThan(6);
  });

  it('formats zero', () => {
    const result = formatPrice(0);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('truncate', () => {
  it('returns the string unchanged when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates long strings with ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('handles empty strings', () => {
    expect(truncate('', 5)).toBe('');
  });
});
