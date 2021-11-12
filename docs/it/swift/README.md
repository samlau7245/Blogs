# Swift

[[toc]]

## 系统版本选择

```swift
if #available(iOS 13.0, *) {}
```

## 可选类型

`可选类型(optionals)` 用来处理值可能缺失的情况。可选类型值的两种情况：`nil` 或者`有值`。

在Swift中，`nil`不是指针，它是一个确定的值，**用来表示值缺失。** 任何类型的可选状态都可以被设置为 `nil`，不只是对象类型。

### if语句来判断可选值

:::details 使用 if语句来判断可选值
```swift {7}
public class Cls2Useage {
    init() {
        let possibleNumber = "123"
        let convertedNumber = Int(possibleNumber) // convertedNumber 被推测为类型 "Int?"， 或者类型 "optional Int"
        print(convertedNumber) // Optional(123) 警告： Expression implicitly coerced from 'Cls1?' to 'Any'
        
        if convertedNumber != nil {
            print("convertedNumber has an integer value of \(convertedNumber!).")
        } else {
            print("convertedNumber did not contains some integer value.")
        }
        // 结果： convertedNumber has an integer value of 123.
    }
}
```
:::

:::warning
使用`!`来获取一个不存在的可选值会导致运行时错误。使用`!`来强制解析值之前，一定要确定可选包含一个非`nil`的值。
:::

### 可选绑定(Optional Binding)

`可选绑定(Optional Binding)`用来判断可选类型是否包含值，如果包含就把值赋给一个临时常量或者变量。

可选绑定可以用在`if`和`while`语句中，这条语句不仅可以用来判断可选类型中是否有值，同时可以将可选类型中的值赋给一个常量或者变量。

:::details 点击查看代码
```swift
public class Cls2Useage {
    init() {
        let possibleNumber = "123"
        if let actualNumber = Int(possibleNumber) {
            print("\'\(possibleNumber)\' has an integer value of \(actualNumber)")
        } else {
            print("\'\(possibleNumber)\' could not be converted to an integer")
        }
        // '123' has an integer value of 123
    }
}
```
:::

1. 如果 `Int(possibleNumber)` 返回的可选 `Int` 包含一个值，创建一个叫做 `actualNumber` 的新常量并将可选包含的值赋给它。
2. 如果转换成功，`actualNumber` 常量可以在 `if` 语句的第一个分支中使用。它已经被可选类型 包含的 值初始化过，所以不需要再使用 `!` 后缀来获取它的值。在这个例子中，`actualNumber` 只被用来输出转换结果。
3. 你可以在可选绑定中使用常量和变量。如果你想在 `if` 语句的第一个分支中操作 `actualNumber` 的值，你可以改成 `if var actualNumber`，这样可选类型包含的值就会被赋给一个变量而非常量。

> 一个`if`语句中可以包含多个 **可选绑定** 或者多个 **Bool条件句**，只需要用`逗号`分开。
>
> 只要有任意一个**可选绑定**的值为`nil`，或者任意一个**Bool条件判断**为`false`，则整个`if`条件判断为`false`。

:::details 点击查看代码
```swift
public class Cls2Useage {
    init() {
        if let firstNumber = Int("4"), let secondNumber = Int("42"), firstNumber < secondNumber && secondNumber < 100 {
            print("\(firstNumber) < \(secondNumber) < 100")
        }
        // 输出：4 < 42 < 100

        /// 等价于：
        if let firstNumber = Int("4") {
            if let secondNumber = Int("42") {
                if firstNumber < secondNumber && secondNumber < 100 {
                    print("\(firstNumber) < \(secondNumber) < 100")
                }
            }
        }

        let mixed:[Any] = ["A","A"]
        if let first = mixed.first as? String, let second =  mixed.last as? String, first == second {
            print("\(first)---\(second)")
        } else {
            print("Error")
        }
        // 运行结果： A---A
        
        guard let first = mixed.first as? String, let second =  mixed.last as? String, first == second else {
            print("Error")
            return
        } 
        print("\(first)---\(second)")  
        // 运行结果： A---A
    }
}
```
:::

>* 在 `if` 条件语句中使用常量和变量来创建一个**可选绑定**，仅在 `if` 语句`中`才能获取到值(也就是 `if` 语句中创建的变量或者常量只有在 `if` 语句中才可使用。)。
>* 在 [guard](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/05_control_flow#early-exit) 语句中使用常量和变量来创建一个**可选绑定**，仅在 `条件` 语句`外`才能获取到值(也就是 `guard` 语句中创建的变量或者常量只有在 `guard` 语句中才可使用。)。

### 隐式解析可选类型(Implicitly Unwrapped Optionals)

通过把可选类型后面的`问号(String?)`修改成`感叹号(String!)`，来声明一个`隐式解析可选类型(Implicitly Unwrapped Optionals)`。

使用场景：可选类型被第一次赋值之后就可以确定之后一直有值的时候。

:::details 点击查看代码
```swift
public class Cls2Useage {
    init() {
        let possibleString: String? = "An optional string."
        let forcedString: String = possibleString! // 需要感叹号来获取值
        print(forcedString)
        
        let assumedString: String! = "An implicitly unwrapped optional string."
        let implicitString: String = assumedString  // 不需要感叹号
        print(implicitString)
    }
}
```
:::

## 可选链

**可选链式调用** 是一种可以在`当前值可能为 nil 的可选值` 上 `调用` `属性、方法和下标`的方法。

如果当前可选值有值，那么调用就会成功；如果当前可选值为`nil`，那么调用将返回 `nil`。多个调用可以连接在一起形成一个 **调用链** ，如果其中任何一个节点为 `nil`，那么整个调用链都会失败，即结果返回为`nil`。

### 用可选链式调用代替强制解包

**可选链** 在想调用的属性、方法，或下标的可选值后面放一个`问号(?)`。

在可选链中，调用的属性、方法和下标返回的值不管是不是可选值，可选链返回的的最终结果都是一个**可选值**。如果结果有值则可选链调用成功；结果为`nil`则调用失败。

使用可选链调用的结果与不用调用的返回结果具有相同的类型，只不过被包装成了一个可选值。

:::details 点击查看代码
```swift
/// Person 具有一个可选的 residence 属性，其类型为 Residence?
class Person {
    var residence: Residence?
}

/// Residence 有一个 Int 类型的属性 numberOfRooms，其默认值为 1
class Residence {
    var numberOfRooms = 1
}

class Useage {
    init() {
        let john = Person()
        let roomCount1 = john.residence?.numberOfRooms
        print(roomCount1) // nil
        // 虽然 numberOfRooms是一个非可选的 Int ， 当使用可选链式调用就意味着 numberOfRooms 会返回一个 Int? 而不是 Int。
        
        if let roomCount2 =  john.residence?.numberOfRooms {
            print("John's residence has \(roomCount2) room(s).")
        } else {
            print("Unable to retrieve the number of rooms.")
        }
        // 运行时结果: Unable to retrieve the number of rooms.

        let roomCount3 = john.residence!.numberOfRooms
        print(roomCount3) // 运行时错误: Thread 1: Fatal error: Unexpectedly found nil while unwrapping an Optional value
        // 强制解包时，当 residence 为 nil 的时候，运行时会报错。
    }
}
```
:::

### 用可选链式调用定义模型类

:::details 点击查看代码
```swift {37}
class Person {
    var residence: Residence?
}

class Residence {
    var rooms: [Room] = []
    var numberOfRooms: Int {
        return rooms.count
    }
    subscript(i: Int) -> Room {
        get {
            return rooms[i]
        }
        set {
            rooms[i] = newValue
        }
    }
    func printNumberOfRooms() {
        print("The number of rooms is \(numberOfRooms)")
    }
    var address: Address?
}

class Room {
    let name: String
    init(name: String) { self.name = name }
}

class Address {
    var buildingName: String?
    var buildingNumber: String?
    var street: String?
    
    func buildingIdentifier() -> String? {
        if buildingName != nil {
            return buildingName
        } else if let buildingNumber = buildingNumber, let street = street { // 如果 buildingNumber 和 street 均有值，则返回两者拼接得到的字符串。否则，返回 nil。
            return "\(buildingNumber) \(street)"
        } else {
            return nil
        }
    }
}
```
:::

### 用可选链式调用访问属性、方法、下标

:::details 点击查看代码
```swift
/// 通过可选链式调用 访问属性
func invokeProperty() {
    let john = Person()
    if let roomCount = john.residence?.numberOfRooms {
        print("John's residence has \(roomCount) room(s).")
    } else {
        print("Unable to retrieve the number of rooms.")
    }
    // 运行结果： Unable to retrieve the number of rooms.
}

/// 通过可选链式调用 访问方法
func invokeFunction() {
    let john = Person()
    // 返回类型会是 Void?，而不是 Void。判断返回值是否为 nil 可以判断调用是否成功
    if john.residence?.printNumberOfRooms() != nil {
        print("It was possible to print the number of rooms.")
    } else {
        print("It was not possible to print the number of rooms.")
    }
    // 运行结果： It was not possible to print the number of rooms.
}

/// 通过可选链式调用 访问下标
func invokeIndex() {
    let john = Person()
    if let firstRoomName = john.residence?.rooms[0].name {
        print("The first room name is \(firstRoomName).")
    } else {
        print("Unable to retrieve the first room name.")
    }
    // 运行结果： Unable to retrieve the first room name.
    
    let johnsHouse = Residence()
    johnsHouse.rooms.append(Room(name: "Living Room"))
    johnsHouse.rooms.append(Room(name: "Kitchen"))
    john.residence = johnsHouse
    
    if let firstRoomName = john.residence?.rooms[0].name {
        print("The first room name is \(firstRoomName).")
    } else {
        print("Unable to retrieve the first room name.")
    }
    // 运行结果： The first room name is Living Room.
    
    var testScores = ["Dave": [86, 82, 84], "Bev": [79, 94, 81]]
    testScores["Dave"]?[0] = 91
    print(testScores)
    // 运行结果：["Dave": [91, 82, 84], "Bev": [79, 94, 81]]
}
```
:::


## 类型转换

* `类型检查操作符(is)`: 检查一个实例是否属于特定子类型。

:::details 点击查看代码
```swift {35,38}
class MediaItem {
    var name: String
    init(name: String) {
        self.name = name
    }
}
class Movie: MediaItem {
    var director: String
    init(name: String, director: String) {
        self.director = director
        super.init(name: name)
    }
}

class Song: MediaItem {
    var artist: String
    init(name: String, artist: String) {
        self.artist = artist
        super.init(name: name)
    }
}

class MediaItemUseage {
    init() {
        let library = [
            Movie(name: "Casablanca", director: "Michael Curtiz"),
            Song(name: "Blue Suede Shoes", artist: "Elvis Presley"),
            Movie(name: "Citizen Kane", director: "Orson Welles"),
            Song(name: "The One And Only", artist: "Chesney Hawkes"),
            Song(name: "Never Gonna Give You Up", artist: "Rick Astley")
        ]
        
        var movieCount = 0
        var songCount = 0
        for item in library {
            if item is Movie {
                movieCount += 1
            } else if item is Song {
                songCount += 1
            }
        }
    }
    
}
```
:::

**向下转型**

* `类型转换操作符(as?)`: 返回一个你试图向下转成的类型的**可选值**。
* `类型转换操作符(as!)`: 可以确定向下转型一定会成功时，才使用`强制形式（as!）`。当你试图向下转型为一个不正确的类型时，强制形式的类型转换会触发一个运行时错误。

:::details 点击查看代码
```swift {2,4}
for item in library {
    if let movie = item as? Movie {
        print("Movie: \(movie.name), dir. \(movie.director)")
    } else if let song = item as? Song { // 尝试将 item 转为 Movie 类型。若成功，设置一个新的临时常量 movie 来存储返回的可选 Movie 中的值
        print("Song: \(song.name), by \(song.artist)")
    }
}
/*
 Movie: Casablanca, dir. Michael Curtiz
 Song: Blue Suede Shoes, by Elvis Presley
 Movie: Citizen Kane, dir. Orson Welles
 Song: The One And Only, by Chesney Hawkes
 Song: Never Gonna Give You Up, by Rick Astley
 */
``` 
:::

* `Any`: 可以表示任何类型，包括函数类型。
* `AnyObject`: 可以表示任何类类型的实例。

:::details 点击查看代码
```swift {13,15,17,19,21,23,25,27,29}
var things: [Any] = []
things.append(0)
things.append(0.0)
things.append(42)
things.append(3.14159)
things.append("hello")
things.append((3.0, 5.0))
things.append(Movie(name: "Ghostbusters", director: "Ivan Reitman"))
things.append({ (name: String) -> String in "Hello, \(name)" })

for item in things {
    switch item {
    case 0 as Int:
        print("zero as an Int")
    case 0 as Double:
        print("zero as an Double")
    case let someInt as Int:
        print("an integer value of \(someInt)")
    case let someDouble as Double where someDouble > 0.0 :
        print("a positive double value of \(someDouble)")
    case is Double:
        print("some other double value that I don't want to print")
    case let someString as String:
        print("a string value of \"\(someString)\"")
    case let (x, y) as (Double, Double):
        print("an (x, y) point at \(x), \(y)")
    case let movie as Movie:
            print("a movie called \(movie.name), dir. \(movie.director)")
    case let stringConverter as (String) -> String:
            print(stringConverter("Michael"))
    default:
        print("something else")
    }
}
/* 运行结果：
 zero as an Int
 zero as an Double
 an integer value of 42
 a positive double value of 3.14159
 a string value of "hello"
 an (x, y) point at 3.0, 5.0
 a movie called Ghostbusters, dir. Ivan Reitman
 Hello, Michael
 */
```
:::

## 类型

* **类型标识符**: 可以引用命名型类型
    * 类型一： 使用`typealias`。
    * 类型二： 使用点语法`.`来表示。

```swift
typealias Point = (Int, Int)
let origin: Point = (0, 0)
```

* **元组类型**: 使用括号括起来的零个或多个类型，类型间用逗号隔开。

```swift
typealias DemoInset = (left: Double, top: Double, bottom: Double, right: Double)
let inset: DemoInset = (1,2,3,4)
```

* **数组类型**: `Array<Element>`，或者使用糖语法 `[类型]`。

```swift
let someArray: Array<String> = ["Alex", "Brian", "Dave"]
let someArray: [String] = ["Alex", "Brian", "Dave"]

var array3D: [[[Int]]] = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
print(array3D[0][1]) // [3, 4]
print(array3D[0][1][1]) // 4
```

* **字典类型**: `Dictionary<Key, Value>`，或者使用糖语法 `[键类型 : 值类型]`。

```swift
let someDictionary: [String: Int] = ["Alex": 31, "Paul": 39]
let someDictionary: Dictionary<String, Int> = ["Alex": 31, "Paul": 39]
```

> 通过下标访问会获取对应值的可选类型。如果键在字典中不存在的话，则这个下标返回 `nil`。

* **可选类型**: 

```swift
var optionalInteger: Int? // 可选整型类型
var optionalInteger: Optional<Int> // 可选整型类型

let implicitlyUnwrappedArray: [Int]?
let implicitlyUnwrappedTuple: (Int, Int)?
```

> 如果你在声明可选变量或属性的时候没有提供初始值，它的值则会自动赋为默认值 `nil`。

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

:::details RxSwift挂钩 枚举、扩展
```swift
struct ValidationColors {
    static let okColor = UIColor(red: 138.0 / 255.0, green: 221.0 / 255.0, blue: 109.0 / 255.0, alpha: 1.0)
    static let errorColor = UIColor.red
}

extension ValidationResult {
    var textColor: UIColor {
        switch self {
        case .ok:
            return ValidationColors.okColor
        case .empty:
            return UIColor.black
        case .validating:
            return UIColor.black
        default:
            return ValidationColors.errorColor
        }
    }
    var description: String {
        switch self {
        case let .ok(message):
            return message
        case .validating:
            return "validating..."
        case let .failed(message):
            return message
        default:
            return ""
        }
    }
}

extension Reactive where Base: UILabel {
    var validationResult: Binder<ValidationResult> {
        return Binder(self.base) { (label, result) in
            label.textColor = result.textColor
            label.text = result.description
        }
    }
}
```
:::

## 构造器

[构造过程](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/14_initialization)

### 类的继承和构造过程

:::details 点击查看代码
```swift {9}
public class RACommandViewModel: NSObject {
    public var name: String!
    
    public override init() {
        super.init()
        self.name = ""
    }
    
    public required init(name: String) {
        super.init()
        if name.isEmpty {
            self.name = ""
        } else {
            self.name = name
        }
    }
}

/// let vm = RACommandViewModel(name: "ABC")
```
:::

:::details 使用 convenience 关键字进行构造
```swift {4}
public class RACommandViewModel: NSObject {
    public var name: String!
    
    convenience public init(name: String) {
        self.init()
        self.name = name
    }
}

/// let vm = RACommandViewModel(name: "ABC")
```
:::


## 扩展

[SwiftGG教程：扩展](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/20_extensions)

## 零碎知识记录

* [guard](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/05_control_flow#early-exit) 和`if`语句一样，不同的点是 `guard`语句总是有一个`else`从句。

### 单例

:::details 点击查看代码
```swift {4,13,24-35}
/// 全局变量
/// let sharedNetworkManager = NetworkManager(baseURL: API.baseURL)
class NetworkManager {
    let baseURL: URL
    init(baseURL: URL) {
        self.baseURL = baseURL
    }
}

/// 静态变量
/// NetworkManager.shared
class NetworkManager {
    static let shared = NetworkManager(baseURL: API.baseURL)

    let baseURL: URL
    init(baseURL: URL) {
        self.baseURL = baseURL
    }
}

/// 单例
/// NetworkManager.shared()
class NetworkManager {
    class func shared() -> NetworkManager {
        return sharedNetworkManager
    }

    private static var sharedNetworkManager: NetworkManager = {
        let networkManager = NetworkManager(baseURL: API.baseURL)

        // Configuration
        // ...

        return networkManager
    }()

    static let shared = NetworkManager(baseURL: API.baseURL)

    let baseURL: URL
    init(baseURL: URL) {
        self.baseURL = baseURL
    }
}
```
:::

## 学习资源

* [SwiftGG](https://swiftgg.gitbook.io/swift/)、[Swift 基础教程](https://itisjoe.gitbooks.io/swiftgo/content/ch1/ch1.html)