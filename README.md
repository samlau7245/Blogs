
# 本地

```sh
npm install -D vuepress
npm run docs:dev
```


# 发布

* 在 `/docs/.vuepress/config.js` 文件中，把注释的key `base` 打开。
* 在 `/node_modules/@vuepress/core/lib/client/app.js` 文件中，把`mode: 'history'` 注释掉。