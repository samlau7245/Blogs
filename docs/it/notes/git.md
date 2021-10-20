# Git 开发记录

## 创建仓库

* Create a new repository

```sh
git clone http://gitlab.uhomecp.com:9200/ios/SEGSpecs.git
cd SEGSpecs
touch README.md
git add README.md
git commit -m "add README"
git push -u origin master
```

* Push an existing folder

```sh
cd existing_folder
git init
git remote add origin http://gitlab.uhomecp.com:9200/ios/SEGSpecs.git
git add .
git commit -m "Initial commit"
git push -u origin master
# 强制推送
# git push -f origin master 
```

* Push an existing Git repository

```sh
cd existing_repo
git remote rename origin old-origin
git remote add origin http://gitlab.uhomecp.com:9200/ios/SEGSpecs.git
git push -u origin --all
git push -u origin --tags
```

本地初始化一个仓库，设置远程仓库地址后再做push

```sh
git init
git remote add origin http://gitlab.uhomecp.com:9200/iOS_UnderlyingLib/SEGFMDB.git
git pull origin master

git add .
git commit -m "Init"
git push origin master
```

## 日志

```sh
git log --oneline
```

## 分支

### 创建新的分支

```sh
git pull
# 切换到基础分支，如主干
git checkout master
# 创建并切换到新分支
git checkout -b <branch_name>

# 更新分支代码并提交
git add *
git commit -m "init <branch_name>"
git push origin <branch_name>
```

### 删除本地分支

```sh
git branch -d <branch_name>
```