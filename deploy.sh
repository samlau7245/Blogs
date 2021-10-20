#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME
git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
git push -f git@github.com:samlau7245/blogs.git master:gh-pages
# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f https://github.com/samlau7245/Records.git master:gh-pages

cd -

# git@github.com:samlau7245/blogs.github.io.git

# chmod 777 ./deploy.sh  #使脚本具有执行权限