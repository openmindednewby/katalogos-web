import React from 'react';

import { render } from '@testing-library/react-native';

import PricingPage from '../../../app/pricing';

const mockSeoHead = jest.fn();

jest.mock('./SEOHead', () => ({
  SEOHead: (props: { url?: string }) => {
    mockSeoHead(props);
    return null;
  },
}));

jest.mock('../Landing', () => ({
  LandingLayout: ({ children }: { children: unknown }): unknown => children,
  PricingCard: () => null,
}));

jest.mock('../../lib/analytics', () => ({
  useAnalytics: () => ({ track: jest.fn() }),
}));

describe('PricingPage', () => {
  it('on render, passes the pricing page URL as the SEOHead canonical url', () => {
    const expectedUrl = 'https://katalogos.dloizides.com/pricing';

    render(<PricingPage />);

    expect(mockSeoHead).toHaveBeenCalledWith(expect.objectContaining({ url: expectedUrl }));
  });
});
