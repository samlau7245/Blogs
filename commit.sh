#!/usr/bin/env sh

git pull
git add -A
git commit -m '更新内容'
git push --force origin master
# chmod 777 /commit.sh  #使脚本具有执行权限