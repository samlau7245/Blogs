# ONE

[[toc]]


* [Home](/) <!-- 跳转到根部的 README.md -->
* [foo](/foo/) <!-- 跳转到 foo 文件夹的 index.html -->
* [foo heading](./#heading) <!-- 跳转到 foo/index.html 的特定标题位置 -->
* [bar - three](../bar/three.md) <!-- 具体文件可以使用 .md 结尾（推荐） -->
* [bar - four](../bar/four.html) <!-- 也可以用 .html --> 

## ONE2
### ONE3

## ONE2
### ONE3

::: tip
这是一个提示
:::

::: warning
这是一个警告
:::

::: danger
这是一个危险警告
:::

::: details
这是一个详情块，在 IE / Edge 中不生效
:::

::: danger STOP
危险区域，禁止通行
:::

::: details 点击查看代码
```js
console.log('你好，VuePress！')
```
:::

``` js {4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

![An image](../assets/img/1.jpg)
