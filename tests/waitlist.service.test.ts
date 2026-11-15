import { describe, expect, it, vi } from 'vitest';
import { ValidationError } from '@/lib/errors';
import { createWaitlistService } from '@/modules/waitlist/waitlist.service';
import { customerBody } from './fixtures/registrations';

function setup(isNew = true) {
  const repository = { createIfNew: vi.fn(async () => isNew) };
  const notify = vi.fn(async () => undefined);
  const publish = vi.fn(async () => undefined);
  const service = createWaitlistService({
    repository,
    notify,
    publish,
    now: () => new Date('2026-11-15T10:00:00Z'),
  });
  return { service, repository, notify, publish };
}

describe('waitlistService.register', () => {
  it('saves then notifies a new registration', async () => {
    const { service, repository, notify, publish } = setup();
    const result = await service.register(customerBody);
    expect(publish).toHaveBeenCalledWith('entry.created', result.id);
    expect(result.duplicate).toBe(false);
    expect(result.id).toMatch(/^CHOP-C-[0-9a-f-]{36}$/);
    expect(repository.createIfNew).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledOnce();
  });

  it('reports duplicates without notifying', async () => {
    const { service, notify, publish } = setup(false);
    expect(await service.register(customerBody)).toEqual({ id: '', duplicate: true });
    expect(notify).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it('throws a validation error for bad input', async () => {
    const { service, repository } = setup();
    await expect(service.register({ ...customerBody, contactConsent: false })).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(repository.createIfNew).not.toHaveBeenCalled();
  });
});
