module.exports = {
  title: 'Sam\'s Blog',
  description: '',
  lang: 'zh-CN',
  // base: './', // build

  markdown: {
    lineNumbers: true,
  },

  themeConfig: {
    logo: '/favicon.png',

    // 顶部导航栏
    nav: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: '前端',
        items: [
          {
            text: '语言学习',
            items: [
              { text: 'foo', link: '/foo/' },
              { text: 'bar', link: '/bar/' },
            ],
          }
        ],
      },
    ],

    // 侧边栏
    sidebar: getSider(),
  },

  plugins: [
    '@vuepress/back-to-top', // npm install -D @vuepress/plugin-back-to-top
    '@vuepress/medium-zoom', // npm install -D @vuepress/plugin-medium-zoom
    '@vuepress/active-header-links', // npm install -D @vuepress/plugin-active-header-links
    {
      sidebarLinkSelector: '.sidebar-link',
      headerAnchorSelector: '.header-anchor'
    },
  ],
}

// 侧边栏结构
function getSider() {
  return {
    '/foo/': [{
      title: 'items01',
      collapsable: false,
      displayAllHeaders: true,
      sidebarDepth: 2,
      children: [
        { title: 'items01', path: '/foo/' },
        { title: 'items02', path: '/foo/one' },
      ],
    }],
    '/bar/': [{
      title: 'items03',
      collapsable: false,
      displayAllHeaders: true,
      sidebarDepth: 2,
      children: [
        { title: 'items03', path: '/bar/' },
        { title: 'items04', path: '/bar/three' },
      ],
    }],
  };
}