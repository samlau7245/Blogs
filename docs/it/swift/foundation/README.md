# Foundation

[[toc]]

## Timer

* 获取当前时间的时间戳

```swift
let now = Date()
let timeInterval:TimeInterval = now.timeIntervalSince1970
print("时间戳：\(Int(timeInterval))")
// 时间戳：1635840019
```

* 获取当前日期时间

```swift
let now = Date()
let dformatter = DateFormatter()
dformatter.dateFormat = "yyyy年MM月dd日 HH:mm:ss"
print("当前日期时间：\(dformatter.string(from: now))")
// 当前日期时间：2021年11月02日 16:01:45
```

## JSON、Model 互相转换

基于 [quicktype: Model生成器](https://app.quicktype.io/) 生成完成后进行转换：

```swift
// let myHouseLis = try? JSONDecoder().decode(MyHouseLis.self, from: json as Data)

struct MyHouseLis: Codable {
    var code, message: String?
    var data: DataClass?
}
```

::: danger
* 同一个字段，前端定义的类型和服务器下方的类型存在差异，那么数据解析的结果为`nil`。
* 前端创建字段，服务器没有下发对应的字段，解析后字段的值为`nil`。程序不会报错。
:::

## 工具

* 获取 CFBundleName

```swift
func getAppName() -> String {
    guard let bundle = Bundle.main.infoDictionary, let appName = bundle["CFBundleName"] as? String else {
        return ""
    }
    return appName
}
```

* String To Class

```swift
if let cls = NSClassFromString(appName.className) as? xxx.Type {
    let dvc = cls.init()
}
```

另外一种方式：

```swift
@objc(ViewController)
public class ViewController: UIViewController {
    public override func viewDidLoad() {
        self.view.backgroundColor = UIColor.orange
    }
}

if let cls = NSClassFromString("ViewController") as? UIViewController.Type {
    let dvc = cls.init()
}
```

* 字典、Data、String 互相转换

```swift
let json = ["key":"Value"]
let data = try? JSONSerialization.data(withJSONObject: json, options: [])
let str = String(data: data ?? Data(), encoding: .utf8)

let jsonObj = try? JSONSerialization.jsonObject(with: data!, options: .mutableLeaves)
```