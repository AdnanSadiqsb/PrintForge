import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './app';

jest.mock('fabricjs-react', () => ({
  FabricJSCanvas: ({ className }: { className?: string }) => (
    <div className={className} data-testid="fabric-canvas" />
  ),
  useFabricJSEditor: () => ({
    editor: undefined,
    onReady: jest.fn(),
  }),
}));

jest.mock('react-color-palette', () => ({
  ColorPicker: () => <div data-testid="color-picker" />,
}));

test('renders the editor shell', () => {
  render(<App />);
  expect(screen.getByText(/threadsmith/i)).toBeInTheDocument();
  expect(screen.getByText(/create your shirt/i)).toBeInTheDocument();
  expect(screen.getByText(/custom t-shirt designer/i)).toBeInTheDocument();
});
