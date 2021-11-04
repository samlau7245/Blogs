# RxSwift

[[toc]]

## RxSwift 核心

### 事件(Event)

简单的网络请求通过RxSwift来实现：

::: details 点击查看代码
```swift
func doRequest() {
    
    typealias JSON = Any
    
    let json: Observable<JSON> = Observable.create { (observer) -> Disposable in
        
        let url: URL = URL(string: "http://192.168.9.16:8080/mock/myHouseLis.json")!
        let request: URLRequest = URLRequest(url: url)
        let task = URLSession.shared.dataTask(with: request) { data, _, error in
            
            guard error == nil else {
                observer.onError(error!)
                return
            }
            
            guard let data = data, let jsonObj = try? JSONSerialization.jsonObject(with: data, options: .mutableLeaves) else {
                observer.onError(DataError.cantParseJSON)
                return
            }
            
            observer.onNext(jsonObj)
            observer.onCompleted()
        }
        
        task.resume()
        
        return Disposables.create {
            task.cancel()
        }
    }
    
    json.subscribe { json in
        print("成功：\(json)")
    } onError: { (error) in
        print("失败：\(error)")
    } onCompleted: {
        print("取得 json 任务成功完成")
    }
}
```
:::

代码中的`onNext`、`onError`、`onCompleted`，我们称这些事件为`Event`。

### 可监听序列(Observable)

`可被观察的序列(Observable)`：可以帮助我们更准确的描述序列。

* [Single](#single)
* [Completable](#completable)
* [Maybe](#maybe)
* [Driver](#driver)
* [Signal](#signal)

创建一个基础的**可被观察的序列(Observable)**

```swift
let obs: Observable<String> = Observable.create { obsever -> Disposable in
    obsever.onNext("A")
    obsever.onNext("B")
    obsever.onCompleted()
    return Disposables.create()
}
```

:::details 点击查看代码-通过 Observable 请求代码
```swift
enum DataError:Error {
    case cantParseJSON
}

class ViewController: UIViewController {
    let disposeBag = DisposeBag()

    override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white
        
        getRepo("ReactiveX/RxSwift").subscribe { json in
            print(json)
        } onError: { error in
            print(error)
        } onCompleted: {
            print("可监听序列完成！")
        }.disposed(by: disposeBag)
    }

    func getRepo(_ repo: String) -> Observable<[String:Any]> {
        return Observable.create { (observer) -> Disposable in
            let url = URL(string: "https://api.github.com/repos/\(repo)")!
            let task = URLSession.shared.dataTask(with: url) { data, _, error in
                if let error = error {
                    observer.onError(error)
                    return
                }
                
                guard let data = data, let json = try? JSONSerialization.jsonObject(with: data, options: .mutableLeaves), let result = json as? [String:Any] else {
                    observer.onError(DataError.cantParseJSON)
                    return
                }
                
                observer.onNext(result)
                observer.onCompleted()

            }
            
            task.resume()
            
            return Disposables.create {
                task.cancel()
            }
        }
    }
}
```
:::

> 当网络请求操作失败了，序列就会终止。整个订阅将被取消。如果用户再次点击请求接口按钮，就无法再次发起网络请求进行更新操作了。

#### Single

`Single`是`Observable`的另外一个版本。

* `Single` 只能发出一个元素，或者`error`事件。
* `Single` 不会共享附加作用。

:::details 点击查看代码
```swift
func getRepo(_ repo: String) -> Single<[String:Any]> {
    return Single<[String:Any]>.create { (single) in
        
        let url = URL(string: "https://api.github.com/repos/\(repo)")!
        let task = URLSession.shared.dataTask(with: url) { data, _, error in
            
            if let error = error {
                single(.error(error))
                return
            }
            
            guard let data = data, let json = try? JSONSerialization.jsonObject(with: data, options: .mutableLeaves), let result = json as? [String :Any] else {
                single(.error(DataError.cantParseJSON))
                return
            }
            
            single(.success(result))
        }
        
        task.resume()
        return Disposables.create { task.cancel() }
    }
}
/// 方法调用
func getRepoUseage() {
    getRepo("ReactiveX/RxSwift").subscribe { (json: [String : Any]) in
        print("\(json)")
    } onError: { (error) in
        print("\(error)")
    }
}
```
:::

信号转换：

```swift
let json: Observable<JSON> = Observable.create {...}
//`Observable` -> `Single`: 
json.asSingle()
//`Observable` -> `Maybe`: 
json.asMaybe()
```

#### Completable

`Completable`适用于那种你只关心任务是否完成，而不需要在意任务返回值的情况。

* 发出零个元素
* 发出一个 `completed` 事件或者一个 `error` 事件
* 不会共享附加作用

:::details 点击查看代码
```swift
class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    func demoCompletable() -> Completable {
        return Completable.create { completable in
            
            let url = URL(string: "http://192.168.9.16:8080/mock/myHouseLis.json")!
            
            let task = URLSession.shared.dataTask(with: url) { data, _, error in
                if let error = error {
                    completable(.error(error))
                    return
                }
                
                guard data != nil else {
                    completable(.error(DataError.cantParseJSON))
                    return
                }
                
                completable(.completed)
            }
            task.resume()
            return Disposables.create()
        }
    }
    func demoCompletableUseage() {
        demoCompletable().subscribe {
            print("Completed!")
        } onError: { error in
            print("error:\(error)")
        }.disposed(by: self.disposeBag)
    }
}
```
:::

#### maybe

`Maybe`: 它介于 `Single` 和 `Completable` 之间，它要么只能发出一个元素，要么产生一个 `completed` 事件，要么产生一个 `error` 事件。。

* 不会共享附加作用。
* 发出一个元素。

#### driver

`Driver` 作用是为了简化 UI 层的代码。

任何可监听序列都可以被转换为`Driver`，只要他满足 3 个条件:

* 不会产生 error 事件
* 一定在 MainScheduler 监听（主线程监听）
* 共享附加作用

:::details 点击查看代码： 输入框和Label的联动
```swift
class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    
    @IBOutlet weak var nameTextField: UITextField!
    @IBOutlet weak var nameLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let sta: Driver<String?> = nameTextField.rx.text.asDriver()
        let obs = nameLabel.rx.text

        // 输入的数据同步展示到Label中
        sta.drive(obs).disposed(by: disposeBag)
        // 在Label中展示输入框内容的字数。
        sta.map { $0?.count.description }.drive(obs).disposed(by: disposeBag)
    }
}
```
:::


:::details 点击查看代码： 按钮点击响应
```swift
class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    @IBOutlet weak var button: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let evt: Driver<Void> = button.rx.tap.asDriver()
        let obs: () -> Void = { print("打印内容！") }
        evt.drive(onNext: obs).disposed(by: disposeBag)
    }
}    
```
:::

::: warning
`drive` 方法只能被 `Driver` 调用。这意味着，如果你发现代码所存在 `drive`，那么这个序列不会产生错误事件并且一定在主线程监听。这样你可以安全的绑定 UI 元素。
:::

#### Signal

Signal 和 [Driver](#driver) 相似,唯一的区别是，Driver 会对新观察者回放（重新发送）上一个元素，而 Signal 不会对新观察者回放上一个元素。

* 不会产生 error 事件
* 一定在 MainScheduler 监听（主线程监听）
* 共享附加作用

:::details 点击查看代码
```swift
class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    @IBOutlet weak var button: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let evt: Signal<Void> = button.rx.tap.asSignal()
        let obs: () -> Void = { print("打印内容1") }
        evt.emit(onNext: obs).disposed(by: disposeBag)
    }
}
```
:::

### 观察者(Observer)

* [AnyObserver](#anyobserver): 用来描叙任意一种观察者。
* [Binder](#binder)

**观察者**是用来监听事件，然后它需要这个事件做出响应。

> 响应事件的都是观察者。

* 当室温高于 33 度时，打开空调降温。打开空调降温就是观察者 `Observer<Double>`

![](http://msnewlifefitness.com/img/20211101153503.png)
`
* 当取到 JSON 时，将它打印出来。将它打印出来就是观察者 `Observer<JSON>`。

![](http://msnewlifefitness.com/img/20211101153727.png)

* 当任务结束后，提示用户任务已完成。 提示用户任务已完成就是观察者 `Observer<Void>`。

![](http://msnewlifefitness.com/img/20211101153806.png)

创建观察者最直接的方法就是在[Observable](#可监听序列-observable)的 `subscribe` 方法。后面的 `onNext`，`onError`，`onCompleted`的这些闭包构建出来的。

:::details 点击查看代码
```swift
button.rx.tap.subscribe { [weak self] in
    self?.showAlert()
} onError: { error in
    print("发生错误： \(error.localizedDescription)")
} onCompleted: {
    print("任务完成")
}.disposed(by: disposeBag)
```
:::

#### AnyObserver

#### Binder

**Binder**特征: 

* 不会处理错误事件。一旦产生错误事件，在调试环境下将执行 `fatalError`，在发布环境下将打印错误信息。
* 确保绑定都是在给定 [Scheduler](#调度器-schedulers) 上执行（默认 `MainScheduler`）

### 可监听时序、观察者

* [PublishSubject](#publishsubject)
* [ReplaySubject](#replaysubject)

#### PublishSubject

**PublishSubject** 将对观察者发送订阅后产生的元素，而在订阅前发出的元素将不会发送给观察者。

:::details 点击查看代码
```swift
class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    let subject = PublishSubject<String>()
    
    override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white
        
        subject.subscribe { print("Next1:\($0)") } onError: { print("Error1:\($0)") } onCompleted: { print("Completed1") } .disposed(by: disposeBag)
        subject.onNext("A")
        subject.onNext("B")
        // A、B 是在此订阅前发送的， PublishSubject 不会A、B 进行观察。
        subject.subscribe { print("Next2:\($0)") } onError: { print("Error2:\($0)") } onCompleted: { print("Completed2") } .disposed(by: disposeBag)
        subject.onNext("C")
        subject.onNext("D")
    }
}

/*
Next1:A
Next1:B
Next1:C
Next2:C
Next1:D
Next2:D
*/
```
:::

#### ReplaySubject

**ReplaySubject** 将对观察者发送全部的元素，无论观察者是何时进行订阅的。

:::details 点击查看代码
```swift
class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    // 只会将最新的 1 个元素发送给观察者
    let subject = ReplaySubject<String>.create(bufferSize: 1)
    
    override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white
        
        subject.subscribe { print("Next1:\($0)") } onError: { print("Error1:\($0)") } onCompleted: { print("Completed1") } .disposed(by: disposeBag)
        subject.onNext("A")
        subject.onNext("B")
        subject.subscribe { print("Next2:\($0)") } onError: { print("Error2:\($0)") } onCompleted: { print("Completed2") } .disposed(by: disposeBag)
        subject.onNext("C")
        subject.onNext("D")
    }
}
/*
Next1:A
Next1:B
Next2:B
Next1:C
Next2:C
Next1:D
Next2:D
*/
```
:::

### 可被清除的资源(Disposable)

一个序列如果发出了 `error` 或者 `completed` 事件，那么所有内部资源都会被释放。如果你需要提前释放这些资源或取消订阅的话，那么你可以对返回的 **可被清除的资源（Disposable）** 调用 `dispose` 方法。

**清除包（DisposeBag)** 也是用来管理订阅的生命周期。相对于 **可被清除的资源（Disposable）** 更推荐使用 **清除包（DisposeBag)** 。

:::details 点击查看代码
```swift
/// 这个例子中 disposeBag 和 ViewController 具有相同的生命周期。
/// 当退出页面时， ViewController 就被释放，disposeBag 也跟着被释放。
class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    let nameTextField = UITextField()

    override func viewDidLoad() {
        nameTextField.rx.text.subscribe { str in
        } onError: { error in
        } onCompleted: {
        }.disposed(by: disposeBag)
    }
}
```
:::

### 调度器(Schedulers)

**Schedulers** 是多线程模块，用于控制任务在哪个线程或队列运行。

* `MainScheduler`: 主线程
* `SerialDispatchQueueScheduler`: 抽象了串行 DispatchQueue
* `ConcurrentDispatchQueueScheduler`: 抽象了并行 DispatchQueue
* `OperationQueueScheduler`: 抽象了 NSOperationQueue

### 错误处理(Error Handling)

当[可监听序列](#可监听序列-observable)里面产出了一个 `error` 事件，整个序列将被终止。错误处理机制：

* [重试(retry)](#重试-retry): 重复次数。
* [重试-retryWhen](#重试-retrywhen): 重复时间。
* [恢复(catchError)](#恢复-catcherror): 在错误产生时，用一个备用元素或者一组备用元素将错误替换掉。或者将错误事件替换成一个备选序列。

#### 重试-retry

:::details 点击查看代码
```swift {23}
enum DataError:Error {
    case cantParseJSON
}

class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    var count = 1
    
    override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white
        
        let obs: Observable<String> = Observable.create { obsever -> Disposable in
            obsever.onNext("A\(self.count)")
            if self.count == 1 {
                obsever.onError(DataError.cantParseJSON)
                self.count += 1
            }
            obsever.onNext("B\(self.count)")
            obsever.onCompleted()
            return Disposables.create()
        }
        
        obs.retry(3).subscribe { str in
            print(str)
        } onError: { err in
            print(err)
        } onCompleted: {
            print("时序完成")
        }.disposed(by: disposeBag)
    }
}
/*
A1
A2
B2
时序完成
*/
```
:::

#### 重试-retrywhen

:::details 点击查看代码- 重复时间
```swift {17-19}
/// 当请求 JSON 失败时，等待 5 秒后重试。

class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    
    override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white
        
        let obs: Observable<String> = Observable.create { obsever -> Disposable in
            obsever.onNext("A")
            obsever.onError(DataError.cantParseJSON)
            obsever.onNext("B")
            obsever.onCompleted()
            return Disposables.create()
        }
        
        obs.retryWhen({ (observer: Observable<Error>) -> Observable<Int> in
            // 重试延时 5 秒
            return Observable.timer(DispatchTimeInterval.seconds(5), scheduler: MainScheduler.instance)
        }).subscribe { str in
            print(str)
        } onError: { err in
            print(err)
        } onCompleted: {
            print("时序完成")
        }.disposed(by: disposeBag)
    }
}
```
:::

:::details 点击查看代码- 重复次数&重复时间
```swift {18-26}
/// 请求 JSON 失败时，重试超过 4 次，就将错误抛出。
/// 如果错误在 4 次以内时，就等待 5 秒后重试。

class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    
    override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white
        
        let obs: Observable<String> = Observable.create { obsever -> Disposable in
            obsever.onNext("A")
            obsever.onError(DataError.cantParseJSON)
            obsever.onNext("B")
            obsever.onCompleted()
            return Disposables.create()
        }
        
        obs.retryWhen({ (observer: Observable<Error>) -> Observable<Int> in
            return observer.enumerated().flatMap { (index: Int, element: Error) -> Observable<Int> in
                // 最多重试 4 次
                guard index < 4 else {
                    return Observable.error(element)
                }
                // 重试延时 5 秒
                return Observable.timer(DispatchTimeInterval.seconds(5), scheduler: MainScheduler.instance)
            }
            
        }).subscribe { str in
            print(str)
        } onError: { err in
            print(err)
        } onCompleted: {
            print("时序完成")
        }.disposed(by: disposeBag)
    }
}
```
:::

#### 恢复-catcherror

:::details 点击查看代码
```swift {24-25}
/// 先从网络获取数据，如果获取失败了，就从本地缓存获取数据

class ViewController2: UIViewController {
    let disposeBag = DisposeBag()
    let recoverySequence = PublishSubject<String>()
    
    override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white
        // 网络请求的数据
        let rzData: Observable<String> = Observable.create { obsever -> Disposable in
            obsever.onError(DataError.cantParseJSON)
            //obsever.onNext("Online Data")
            //obsever.onCompleted()
            return Disposables.create()
        }
        // 本地缓存的数据
        let rxLocalData: Observable<String> = Observable.create { obsever -> Disposable in
            obsever.onNext("Local Data")
            obsever.onCompleted()
            return Disposables.create()
        }
        
        
        rzData.catchError({ _ in
            rxLocalData
        }).subscribe { str in
            print(str)
        } onError: { err in
            print(err)
        } onCompleted: {
            print("时序完成")
        }.disposed(by: disposeBag)
    }
}

/*
Local Data
时序完成
*/
```
:::


可供参考的资料: [How to handle errors in RxSwift](http://adamborek.com/how-to-handle-errors-in-rxswift/)

## 操作符

**操作符**可以创建新的序列，或者变化组合原有的序列，从而生成一个新的序列。

[操作符选择](https://beeth0ven.github.io/RxSwift-Chinese-Documentation/content/decision_tree.html)

### filter-过滤

![](http://msnewlifefitness.com/img/20211101173617.png)

### zip-配对

![](http://msnewlifefitness.com/img/20211101173848.png)

### withLatestFrom

将两个 [Observables](#可监听序列-observable) 最新的元素通过一个函数组合起来，当第一个 [Observable](#可监听序列-observable) 发出一个元素，就将组合后的元素发送出来。

![](http://msnewlifefitness.com/img/20211103141101.png)

:::details 点击查看代码
```swift
class ViewController: UIViewController {
    let disposeBag = DisposeBag()
    let subjectA = PublishSubject<String>()
    let subjectB = PublishSubject<String>()
    
    override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white
        
        subjectA.withLatestFrom(subjectB){(first, second) in
            return first + second
        }
        .subscribe {
            print("Subcribe:\($0)")
        } onError: {
            print("Error:\($0)")
        } onCompleted: {
            print("Completed")
        }.disposed(by: disposeBag)
        
        subjectA.onNext("1")
        subjectB.onNext("A")
        
        subjectA.onNext("2")
        subjectB.onNext("B")
        
        subjectB.onNext("C")
        subjectB.onNext("D")
        
        subjectA.onNext("3")
        subjectA.onNext("4")
        subjectA.onNext("5")
    }
}

/*
Subcribe:2A
Subcribe:3D
Subcribe:4D
Subcribe:5D
*/
```
:::

### flatMapLatest-只接收最新的元素

### map-转换

**map** 通过一个转换函数，将 [Observable](#可监听序列-observable) 的每个元素转换一遍。

![](http://msnewlifefitness.com/img/20211101173654.png)

:::details 点击查看代码
```swift{14,26}
public class OperatorMapExample: UIViewController {
    let disposeBag = DisposeBag()
    
    public override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white
        
        let obs:Observable<Int> = Observable.create({ observer in
            observer.onNext(1)
            observer.onNext(2)
            observer.onNext(3)
            return Disposables.create()
        })
        
        obs.map { $0 *  10 }
        .subscribe { print($0) }
        .disposed(by: disposeBag)
    }
}
/*
next(10)
next(20)
next(30)
*/

// 如果改代码为：
obs.map { $0 > 1 }

/* 则打印结果：
next(false)
next(true)
next(true)
*/
```
:::

![](http://msnewlifefitness.com/img/20211103181600.png)

### combineLatest-组合

当多个 [Observables](#可监听序列-observable) 中任何一个发出一个元素，就发出一个元素。这个元素是由这些 [Observables](#可监听序列-observable) 中最新的元素，通过一个函数组合起来的，然后将这个组合的结果发出来。

:::details 点击查看代码
```swift
/// 需求： 当用户名、密码输入位数都大于4时，按钮才可以进行点击

private let minimalUsernameLength = 5
private let minimalPasswordLength = 5

public class SimpleValidationViewController: UIViewController {
    let disposeBag = DisposeBag()
    
    let usernameOutlet = UITextField()
    let passwordOutlet = UITextField()
    let doSomethingOutlet = UIButton()
    
    public override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white

        // 用户名是否有效
        let usernameValid = usernameOutlet.rx.text.orEmpty
            .map { $0.count >= minimalUsernameLength }
            .share(replay: 1, scope: .forever)
        
        // 密码是否有效
        let passwordValid = passwordOutlet.rx.text.orEmpty
            .map { $0.count >= minimalPasswordLength }
            .share(replay: 1, scope: .forever)
        
        // 变量 usernameValid、passwordValid 都为 true 时， everythingValid 则为 true。
        let everythingValid = Observable.combineLatest(usernameValid, passwordValid) { $0 && $1}.share(replay: 1, scope: .forever)
        everythingValid.bind(to: doSomethingOutlet.rx.isEnabled).disposed(by: disposeBag)
    }
}    
```
:::

## 示例

[RxExample](https://github.com/ReactiveX/RxSwift/tree/main/RxExample/RxExample/Examples)

### 模拟用户登录-MVVM

![](http://msnewlifefitness.com/img/IMG_2033.TRIM.gif)

:::details 点击查看代码
```swift {23-44}
/// 当用户输入用户名时，如果用户名不足 5 个字就给出红色提示语，并且无法输入密码，当用户名符合要求时才可以输入密码。
/// 同样的当用户输入的密码不到 5 个字时也给出红色提示语。
/// 当用户名和密码有一个不符合要求时底部的绿色按钮不可点击，只有当用户名和密码同时有效时按钮才可点击。
/// 当点击绿色按钮后弹出一个提示框，这个提示框只是用来做演示而已。

private let minimalUsernameLength = 5
private let minimalPasswordLength = 5
public class SimpleValidationViewController: UIViewController {
    let disposeBag = DisposeBag()
    
    let usernameOutlet = UITextField()
    let usernameValidOutlet = UILabel()
    
    let passwordOutlet = UITextField()
    let passwordValidOutlet = UILabel()
    
    let doSomethingOutlet = UIButton()
    
    public override func viewDidLoad() {
        self.view.backgroundColor = UIColor.white
        layout()
        
        // 用户名是否有效
        let usernameValid = usernameOutlet.rx.text.orEmpty
            .map { $0.count >= minimalUsernameLength }
            .share(replay: 1, scope: .forever)
        
        // 密码是否有效
        let passwordValid = passwordOutlet.rx.text.orEmpty
            .map { $0.count >= minimalPasswordLength }
            .share(replay: 1, scope: .forever)
        
        // 组合 用户名、密码两个序列
        let everythingValid = Observable.combineLatest(usernameValid, passwordValid) { $0 && $1}.share(replay: 1, scope: .forever)
        
        usernameValid.bind(to: passwordOutlet.rx.isEnabled).disposed(by: disposeBag)
        usernameValid.bind(to: usernameValidOutlet.rx.isHidden).disposed(by: disposeBag)
        
        passwordValid.bind(to: passwordValidOutlet.rx.isHidden).disposed(by: disposeBag)
        
        everythingValid.bind(to: doSomethingOutlet.rx.isEnabled).disposed(by: disposeBag)
        doSomethingOutlet.rx.tap.subscribe { [weak self] _ in
            self?.showAlert()
        }.disposed(by: disposeBag)
    }
    
    func showAlert() {
        let alert = UIAlertController(title: "RxExample", message: "This is Perfect!", preferredStyle: .alert)
        let defaultAction = UIAlertAction(title: "OK", style: .default, handler: nil)
        alert.addAction(defaultAction)
        present(alert, animated: true, completion: nil)
    }
    
    func layout() {
        doSomethingOutlet.setTitle("Submit", for: .normal)
        doSomethingOutlet.backgroundColor = UIColor.blue
        
        self.view.addSubview(usernameOutlet)
        self.view.addSubview(usernameValidOutlet)
        self.view.addSubview(passwordOutlet)
        self.view.addSubview(passwordValidOutlet)
        self.view.addSubview(doSomethingOutlet)
        
        usernameOutlet.placeholder = "用户名："
        passwordOutlet.placeholder = "密码："
        
        usernameOutlet.borderStyle = .roundedRect
        usernameOutlet.clearButtonMode = .whileEditing
        usernameOutlet.keyboardType = .emailAddress
        usernameOutlet.returnKeyType = .done
        
        passwordOutlet.borderStyle = .roundedRect
        passwordOutlet.clearButtonMode = .whileEditing
        passwordOutlet.keyboardType = .emailAddress
        passwordOutlet.returnKeyType = .done
        
        usernameValidOutlet.text = "Username has to be at least \(minimalUsernameLength) characters"
        usernameValidOutlet.textColor = UIColor.red

        passwordValidOutlet.text = "Password has to be at least \(minimalPasswordLength) characters"
        passwordValidOutlet.textColor = UIColor.red

        usernameOutlet.snp.makeConstraints { make in
            make.left.equalTo(self.view).offset(15)
            make.right.equalTo(self.view).offset(-15)
            make.top.equalTo(self.view).offset(100)
        }
        usernameValidOutlet.snp.makeConstraints { make in
            make.left.equalTo(self.view).offset(15)
            make.right.equalTo(self.view).offset(-15)
            make.top.equalTo(usernameOutlet.snp_bottom).offset(5)
        }
        
        passwordOutlet.snp.makeConstraints { make in
            make.left.equalTo(self.view).offset(15)
            make.right.equalTo(self.view).offset(-15)
            make.top.equalTo(usernameValidOutlet.snp_bottom).offset(10)
        }
        passwordValidOutlet.snp.makeConstraints { make in
            make.left.equalTo(self.view).offset(15)
            make.right.equalTo(self.view).offset(-15)
            make.top.equalTo(passwordOutlet.snp_bottom).offset(5)
        }
        
        doSomethingOutlet.snp.makeConstraints { make in
            make.left.equalTo(self.view).offset(15)
            make.right.equalTo(self.view).offset(-15)
            make.top.equalTo(passwordValidOutlet.snp_bottom).offset(10)
        }
    }
}
```
:::

通过MVVM改造后：

:::details 点击查看MVVM改造后的代码
```swift {25-26}
class SimpleValidationViewModel {
    // 用户名是否有效
    let usernameValid: Observable<Bool>
    // 密码是否有效
    let passwordValid: Observable<Bool>
    let everythingValid: Observable<Bool>
    
    // Error: Return from initializer without initializing all stored properties
    // 这种报错需要把所有的变量都初始化。
    init(username: Observable<String>, password: Observable<String>) {
        usernameValid = username
            .map { $0.count >= minimalUsernameLength }
            .share(replay: 1, scope: .forever)
        passwordValid = password
            .map { $0.count >= minimalPasswordLength }
            .share(replay: 1, scope: .forever)
        
        everythingValid = Observable.combineLatest(usernameValid, passwordValid) { $0 && $1}.share(replay: 1, scope: .forever)
    }
}

public class SimpleValidationViewController: UIViewController {
    var viewModel: SimpleValidationViewModel!
    public override func viewDidLoad() {
        viewModel = SimpleValidationViewModel(username: usernameOutlet.rx.text.orEmpty.asObservable(),
                                              password: passwordOutlet.rx.text.orEmpty.asObservable())
        viewModel.usernameValid.bind(to: passwordOutlet.rx.isEnabled).disposed(by: disposeBag)
        viewModel.usernameValid.bind(to: usernameValidOutlet.rx.isHidden).disposed(by: disposeBag)
        viewModel.passwordValid.bind(to: passwordValidOutlet.rx.isHidden).disposed(by: disposeBag)
        viewModel.everythingValid.bind(to: doSomethingOutlet.rx.isEnabled).disposed(by: disposeBag)
        doSomethingOutlet.rx.tap.subscribe { [weak self] _ in
            self?.showAlert()
        }.disposed(by: disposeBag)
    }
    //...
}
```
:::


## 学习资源

* [RxSwift 中文文档](https://beeth0ven.github.io/RxSwift-Chinese-Documentation/)