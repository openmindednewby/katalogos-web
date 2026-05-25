import { NoOpClient } from './NoOpClient';
import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';

describe('NoOpClient', () => {
  it('does not throw on any method call', () => {
    const client = new NoOpClient();
    expect(() => client.track(AnalyticsEventName.PageViewed)).not.toThrow();
    expect(() => client.identify('user-1')).not.toThrow();
    expect(() => client.page('/home')).not.toThrow();
    expect(() => client.reset()).not.toThrow();
  });
});
