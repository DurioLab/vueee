### 指令过滤器原理初探
1. 创建指令 指令对应某一些操作；创建过滤器 对值进行修改
2. 分析指令 找出指令名称、绑定的值【方法、变量】、绑定的过滤器、指令所在的元素等
3. 将变量作为键值 绑定到该作用域，并保存该变量所涉及的指令  bindings  scope
4. 将指令的变量[3中的键值]与作用域内[scope 用户定义的]的键值进行映射，并通过get、set方法对其赋值或取值，调用set方法修改变量时，应用过滤器，将变量所对应的所有指令进行全部DOM操作。

知识点: 
every  e.target.webkitMatchesSelector  slice  [].forEach.call  Object.defineProperty()
