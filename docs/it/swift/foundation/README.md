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

## 工具

### 获取 CFBundleName

```swift
func getAppName() -> String {
    guard let bundle = Bundle.main.infoDictionary, let appName = bundle["CFBundleName"] as? String else {
        return ""
    }
    return appName
}
```

### String To Class

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