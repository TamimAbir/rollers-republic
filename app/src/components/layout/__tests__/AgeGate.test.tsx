import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AgeGate } from '../AgeGate';
import { features } from '@/lib/config';

describe('AgeGate', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('locks the app and asks for age confirmation on first visit', async () => {
    render(<AgeGate />);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /are you 18 or older\?/i })).toBeInTheDocument();
  });

  it('persists consent and unlocks on confirmation', async () => {
    render(<AgeGate />);
    fireEvent.click(await screen.findByRole('button', { name: /yes — i'm 18 or older/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(window.localStorage.getItem('rr-age-verified')).toBe('yes');
  });

  it('shows the exit screen when the visitor is under 18', async () => {
    render(<AgeGate />);
    fireEvent.click(await screen.findByRole('button', { name: /take me out of here/i }));

    expect(await screen.findByRole('heading', { name: /come back when you're 18/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /leave this site/i })).toHaveAttribute(
      'href',
      'https://www.google.com'
    );
  });

  it('does not re-lock when consent was already given', async () => {
    window.localStorage.setItem('rr-age-verified', 'yes');
    render(<AgeGate />);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders nothing when the ageGate feature flag is off', async () => {
    const spy = vi.spyOn(features, 'ageGate', 'get').mockReturnValue(false);
    render(<AgeGate />);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    spy.mockRestore();
  });
});
