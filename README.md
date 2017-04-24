### 指令过滤器原理初探
1. 创建指令 指令对应某一些操作；创建过滤器 对值进行修改
2. 分析指令 找出指令名称、绑定的值【方法、变量】、绑定的过滤器、指令所在的元素等
3. 将变量作为键值 绑定到该作用域，并保存该变量所涉及的指令  bindings  scope
4. 将指令的变量[3中的键值]与作用域内[scope 用户定义的]的键值进行映射，并通过get、set方法对其赋值或取值，调用set方法修改变量时，应用过滤器，将变量所对应的所有指令进行全部DOM操作。

知识点: 
every  e.target.webkitMatchesSelector  slice  [].forEach.call  Object.defineProperty()


### 第一次重构
1. 将指令进行剥离 各司其职
2. 正则表达式来分析指令，更加简洁


### 第二次重构
1. 代码封装，提高扩展性和易用性 
2. 增加each，修改数组操作，数组改变时发出通知  watchArray.js
3. apply方法与arguments参数 main.js Seed.apply(this,arguments)

### sd-each works

### 一次大的重构
1. 增加controller
2. 嵌套scope
3. 指令绑定方式修改  click:remove  :
4. Directive类 => Binding类


### 修改控制器controller逻辑
1. 将controller的控制 放到Seed内部处理
2. each循环的修缮[TODO: 有BUG待处理, 内部元素渲染DOM失败]