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
    nav: getNavBar(),

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
    '/it/swift/': [{
      title: 'Swift',
      collapsable: false,
      displayAllHeaders: true,
      sidebarDepth: 2,
      children: [
        { title: 'Swift', path: '/it/swift/' },
        { title: 'RxSwift', path: '/it/swift/RxSwift.md' },
      ],
    }],
    '/it/notes/': [{
      title: '开发记录',
      collapsable: false,
      displayAllHeaders: true,
      sidebarDepth: 2,
      //path: '/it/notes/',
      children: [
        //{ title: '开发记录', path: '/it/notes/' },
        { title: '博客搭建', path: '/it/notes/blogs.md' },
        { title: 'Git使用', path: '/it/notes/git.md' },
      ],
    }],
  };
}

function getNavBar() {
  return [
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
            { text: 'Swift', link: '/it/swift/', },
          ],
        }, {
          text: '其他',
          items: [
            { text: '开发记录', link: '/it/notes/' },
          ],
        },
      ],
    },
    {
      text: '个人',
      items: [
        //{ text: '医学', link: '/personal/', },
      ],
    },
  ];
}