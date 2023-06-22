import { NumberSuffixPipe } from './number-suffix.pipe';

describe('NumberSuffixPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberSuffixPipe();
    expect(pipe).toBeTruthy();
  });
});
