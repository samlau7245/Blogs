# UITableView

[[toc]]

## 基础用法

:::details 点击查看代码
```swift
class ViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {
    
    let myTabeView:UITableView! = UITableView(frame: CGRect(x: 0, y: 0, width: UIScreen.main.bounds.size.width, height: UIScreen.main.bounds.size.height), style: .grouped)
    
    var info = [
        ["林書豪","陳信安"],
        ["陳偉殷","王建民","陳金鋒","林智勝"]
    ]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initViews()
    }
    
    func initViews() {
        // 注册CELL
        myTabeView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
        // 代理
        myTabeView.delegate = self
        myTabeView.dataSource = self
        // 分割线样式
        myTabeView.separatorStyle = .singleLine
        // 分割线间距
        myTabeView.separatorInset = UIEdgeInsetsMake(0, 20, 0, 20)
        self.view.addSubview(myTabeView)
    }
    
    // MARK: - UITableViewDelegate
    func numberOfSections(in tableView: UITableView) -> Int {
        return info.count
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return info[section].count
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
    }
    
    // MARK: - UITableViewDataSource
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath)
        cell.textLabel?.text = info[indexPath.section][indexPath.row]
        return cell
    }
}
```
:::

![](http://msnewlifefitness.com/img/20211102101832.png)