# RxSwift

## RxSwift 核心

* `Observable` - 产生事件
* `Observer` - 响应事件
* `Operator` - 创建变化组合事件
* `Disposable` - 管理绑定（订阅）的生命周期
* `Schedulers` - 线程队列调配

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