import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'PlayCraft',
  description: 'AI-Powered Game Builder - Create games with natural language',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/PlayCraft.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/PlayCraft.png' }],
    ['meta', { name: 'theme-color', content: '#8b5cf6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'PlayCraft Docs' }],
    ['meta', { property: 'og:description', content: 'AI-Powered Game Builder - Create games with natural language' }],
    ['meta', { property: 'og:image', content: '/PlayCraft.png' }],
  ],

  // Force dark mode only
  appearance: 'dark',

  themeConfig: {
    logo: '/PlayCraft.png',
    siteTitle: 'PlayCraft',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Features', link: '/features/ai-chat' },
      { text: 'Changelog', link: '/changelog' },
      { text: 'App', link: 'https://playcraft.games' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is PlayCraft?', link: '/guide/what-is-playcraft' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Your First Game', link: '/guide/first-game' },
          ]
        },
        {
          text: 'Best Practices',
          items: [
            { text: 'Prompt Tips', link: '/guide/prompt-tips' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          ]
        }
      ],
      '/features/': [
        {
          text: 'Features',
          items: [
            { text: 'AI Chat', link: '/features/ai-chat' },
            { text: 'Live Preview', link: '/features/live-preview' },
            { text: 'Code Editor', link: '/features/code-editor' },
            { text: 'Templates', link: '/features/templates' },
            { text: '3D Support', link: '/features/three-js' },
            { text: 'Export & Deploy', link: '/features/export' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/playcraft' },
      { icon: 'twitter', link: 'https://twitter.com/playcraft' }
    ],

    footer: {
      message: 'Build games with AI',
      copyright: 'Copyright © 2024-2026 PlayCraft'
    },

    search: {
      provider: 'local'
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/playcraft/playcraft/edit/main/apps/docs/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // Last updated
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  }
})
