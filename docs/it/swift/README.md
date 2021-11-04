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

## 枚举

[SwiftGG教程：枚举](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/08_enumerations)

:::details 枚举、扩展 搭配使用
```swift {30}
enum ValidationResult {
    case ok(message:String)
    case empty
    case validating
    case failed(message:String)
}

extension ValidationResult {
    var isValid: Bool {
        switch self {
        case .ok:
            return true
        default:
            return false
        }
    }
}

/// RxSwift 使用Enum

let obs: Observable<ValidationResult> = Observable.create({ oberver in
    oberver.onNext(ValidationResult.validating)
    oberver.onNext(ValidationResult.ok(message: "Success~~"))
    oberver.onCompleted()
    return Disposables.create()
})

obs.subscribe { result in
    switch result.element {
    case let .ok(message):
        print(message)
        break
    default:
        print("Others")
        break
    }
}.disposed(by: disposeBag)

/*
Others
Success~~
Others
*/
```
:::

## 扩展

[SwiftGG教程：扩展](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/20_extensions)

## 零碎知识记录

* [guard](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/05_control_flow#early-exit) 和`if`语句一样，不同的点是 `guard`语句总是有一个`else`从句。

## 学习资源

* [SwiftGG](https://swiftgg.gitbook.io/swift/)、[Swift 基础教程](https://itisjoe.gitbooks.io/swiftgo/content/ch1/ch1.html)