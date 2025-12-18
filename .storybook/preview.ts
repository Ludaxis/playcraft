import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'page',
      values: [
        { name: 'page', value: 'var(--color-bg-page)' },
        { name: 'card', value: 'var(--color-bg-card)' },
        { name: 'muted', value: 'var(--color-bg-muted)' },
        { name: 'inverse', value: 'var(--color-bg-inverse)' },
      ],
    },
    layout: 'centered',
    docs: {
      toc: true,
    },
  },
  tags: ['autodocs'],
};

export default preview;