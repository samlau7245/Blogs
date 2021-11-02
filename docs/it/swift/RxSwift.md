# RxSwift

[[toc]]

## RxSwift 核心

### 事件(event)

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

### 可监听序列(observable)

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
    var disposeBag = DisposeBag()

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

#### single

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

#### completable

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

### 观察者(observer)

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

### 操作符(operator)

**操作符**可以创建新的序列，或者变化组合原有的序列，从而生成一个新的序列。

* [filter-过滤](#filter-过滤)
* [map-转换](#map-转换)
* [zip-配对](#zip-配对)

#### filter-过滤

![](http://msnewlifefitness.com/img/20211101173617.png)

#### map-转换

![](http://msnewlifefitness.com/img/20211101173654.png)

#### zip-配对

![](http://msnewlifefitness.com/img/20211101173848.png)

### 可被清除的资源(disposable)

一个序列如果发出了 `error` 或者 `completed` 事件，那么所有内部资源都会被释放。如果你需要提前释放这些资源或取消订阅的话，那么你可以对返回的 **可被清除的资源（Disposable）** 调用 `dispose` 方法。

**清除包（DisposeBag)** 也是用来管理订阅的生命周期。相对于 **可被清除的资源（Disposable）** 更推荐使用 **清除包（DisposeBag)** 。

:::details 点击查看代码
```swift
/// 这个例子中 disposeBag 和 ViewController 具有相同的生命周期。
/// 当退出页面时， ViewController 就被释放，disposeBag 也跟着被释放。
class ViewController2: UIViewController {
    var disposeBag = DisposeBag()
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

### 调度器(schedulers)

**Schedulers** 是多线程模块，用于控制任务在哪个线程或队列运行。

* `MainScheduler`: 主线程
* `SerialDispatchQueueScheduler`: 抽象了串行 DispatchQueue
* `ConcurrentDispatchQueueScheduler`: 抽象了并行 DispatchQueue
* `OperationQueueScheduler`: 抽象了 NSOperationQueue

### 错误处理(error handling)

当[可监听序列](#可监听序列-observable)里面产出了一个 `error` 事件，整个序列将被终止。错误处理机制：

* [重试(retry)](#重试-retry): 重复次数。
* [重试-retryWhen](#重试-retrywhen): 重复时间。
* [恢复(catchError)](#恢复-catcherror): 在错误产生时，用一个备用元素或者一组备用元素将错误替换掉。或者将错误事件替换成一个备选序列。
* `Result`: 在错误产生时，用一个备用元素或者一组备用元素将错误替换掉。或者将错误事件替换成一个备选序列。

#### 重试-retry

:::details 点击查看代码
```swift {23}
enum DataError:Error {
    case cantParseJSON
}

class ViewController: UIViewController {
    var disposeBag = DisposeBag()
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
    var disposeBag = DisposeBag()
    
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
    var disposeBag = DisposeBag()
    
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
    var disposeBag = DisposeBag()
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

## 操作符选择

[操作符选择](https://beeth0ven.github.io/RxSwift-Chinese-Documentation/content/decision_tree.html)