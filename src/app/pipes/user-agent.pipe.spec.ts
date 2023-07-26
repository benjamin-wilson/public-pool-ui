import { UserAgentPipe } from './user-agent.pipe';

describe('UserAgentPipe', () => {
  it('create an instance', () => {
    const pipe = new UserAgentPipe();
    expect(pipe).toBeTruthy();
  });
});
