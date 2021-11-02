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
