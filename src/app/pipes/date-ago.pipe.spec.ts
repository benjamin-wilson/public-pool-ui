import { DateAgoPipe } from './date-ago.pipe';

describe('DateAgoPipe', () => {
  const now = new Date('2026-06-08T12:00:00Z');

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(now);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('create an instance', () => {
    const pipe = new DateAgoPipe();
    expect(pipe).toBeTruthy();
  });

  it('returns Just now without an ago suffix for recent dates', () => {
    const pipe = new DateAgoPipe();

    expect(pipe.transform(new Date(now.getTime() - 10_000), true)).toBe('Just now');
  });

  it('keeps duration-only output by default', () => {
    const pipe = new DateAgoPipe();

    expect(pipe.transform(new Date(now.getTime() - 90_000))).toBe('1.5 minutes');
  });

  it('returns a complete ago phrase when suffix output is requested', () => {
    const pipe = new DateAgoPipe();

    expect(pipe.transform(new Date(now.getTime() - 90_000), true)).toBe('1.5 minutes ago');
  });

  it('returns a complete future phrase when suffix output is requested', () => {
    const pipe = new DateAgoPipe();

    expect(pipe.transform(new Date(now.getTime() + 90_000), true)).toBe('in 1.5 minutes');
  });
});
