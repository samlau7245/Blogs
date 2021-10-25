# RxSwift

## RxSwift 核心

* `Observable` - 产生事件
* `Observer` - 响应事件
* `Operator` - 创建变化组合事件
* `Disposable` - 管理绑定（订阅）的生命周期
* `Schedulers` - 线程队列调配

### 事件Event

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

* Single
* Completable
* Maybe
* Driver
* Signal
* ControlEvent

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

#### Maybe

`Maybe`: 它介于 `Single` 和 `Completable` 之间，它要么只能发出一个元素，要么产生一个 `completed` 事件，要么产生一个 `error` 事件。。

* 不会共享附加作用。
* 发出一个元素。

#### Driver

`Driver` 作用是为了简化 UI 层的代码。

任何可监听序列都可以被转换为`Driver`，只要他满足 3 个条件:

* 不会产生 error 事件
* 一定在 MainScheduler 监听（主线程监听）
* 共享附加作用

::: warning
`drive` 方法只能被 `Driver` 调用。这意味着，如果你发现代码所存在 `drive`，那么这个序列不会产生错误事件并且一定在主线程监听。这样你可以安全的绑定 UI 元素。
:::

#### Signal

Signal 和 [Driver](/it/swift/RxSwift.md#Driver) 相似