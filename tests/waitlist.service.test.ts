import { describe, expect, it, vi } from 'vitest';
import { ValidationError } from '@/lib/errors';
import { createWaitlistService } from '@/modules/waitlist/waitlist.service';
import { customerBody } from './fixtures/registrations';

function setup(exists = false) {
  const repository = {
    phoneExists: vi.fn(async () => exists),
    append: vi.fn(async () => undefined),
  };
  const notify = vi.fn(async () => undefined);
  const service = createWaitlistService({ repository, notify, now: () => new Date('2026-11-15T10:00:00Z') });
  return { service, repository, notify };
}

describe('waitlistService.register', () => {
  it('saves then notifies a new registration', async () => {
    const { service, repository, notify } = setup();
    const result = await service.register(customerBody);
    expect(result.duplicate).toBe(false);
    expect(result.id).toMatch(/^CHOP-C-/);
    expect(repository.append).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledOnce();
  });

  it('does not save or notify duplicates', async () => {
    const { service, repository, notify } = setup(true);
    expect(await service.register(customerBody)).toEqual({ id: '', duplicate: true });
    expect(repository.append).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it('throws a validation error for bad input', async () => {
    const { service } = setup();
    await expect(service.register({ ...customerBody, contactConsent: false })).rejects.toBeInstanceOf(
      ValidationError
    );
  });
});
