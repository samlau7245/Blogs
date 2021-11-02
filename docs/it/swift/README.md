# Swift

[[toc]]

## 标注

```swift
class ViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {
    func f1(){}
    func f2(){}
    // MARK: - 说明文字,带分割线
    func f3(){}
    func f4(){}
    // MARK: 说明文字,不带分割线
    func f5(){}
    func f6(){}
    // TODO: 标注TODO
    // FIXME: 标注FIXME
}
```

![](http://msnewlifefitness.com/img/20211102094828.png)

## 通知

```swift
class ViewController: UIViewController {
    var ntfObserver: NSObjectProtocol!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.ntfObserver = NotificationCenter.default.addObserver(forName: .UIApplicationWillEnterForeground, object: nil, queue: nil) { (notification) in
            print(notification.name)
        }
    }
    deinit {
        NotificationCenter.default.removeObserver(self.ntfObserver)
    }
}
```

## 零碎知识记录

* [guard](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/05_control_flow#early-exit) 和`if`语句一样，不同的点是 `guard`语句总是有一个`else`从句。