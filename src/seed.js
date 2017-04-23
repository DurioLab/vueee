var config 			= require('./config'),
		bindingParser 	= require('./binding')

var map = Array.prototype.map,
		each = Array.prototype.forEach



function Seed(el, data, options){


	if (typeof el === 'string') {
		el = document.querySelector(el)
	}

	this.el = el
	this._bindings = {}; // 内部真正的数据
	this.scope = data // 外部接口
	this._options = options || {}


	var key, dataCopy = {}
	for (key in data) {
		dataCopy[key] = data[key]
	}

	this._compileNode(el)



	// 修改为 => 遍历子节点
	// var els = el.querySelectorAll(config.selector)
	// ;[].forEach.call(els, this._compileNode.bind(this))


	// 通过调用set初始化所有的数据
	for (var key in this._bindings) {
		this.scope[key] = dataCopy[key];
	}


}


Seed.prototype._compileNode = function(node){
	var self = this,
			ctrl = config.prefix + '-controller'

	if (node.nodeType === 3) {
	
		self._compileTextNode(node) //编译文本节点
	
	} else if (node.attributes && node.attributes.length) {
		
		var attrs = map.call(node.attributes, function(attr) {
			return {
				name:attr.name,
				expressions:attr.value.split(',')
			}
		})

		attrs.forEach(function(attr){

			if (attr.name === ctrl) return alert('ctrl')

			attr.expressions.forEach(function(exp){
				var binding = bindingParser.parse(attr.name, exp)
				if (binding) {
					self._bind(node, binding)
				}

			})
			
		})
	}

	if (!node['sd-block'] && node.childNodes.length) {
		each.call(node.childNodes, function(child){
			self._compileNode(child)  // 递归调用
		})
	}

}

Seed.prototype._compileTextNode = function(node){
	return node
}

Seed.prototype._bind = function(node, bindingInstance){

	bindingInstance.seed = this
	bindingInstance.el = node
	node.removeAttribute(config.prefix + '-' + bindingInstance.directiveName)

	var key = bindingInstance.key, //each
			scope = this.scope,
			epr = this._options.eachPrefixRE,
			isEach = epr && epr.test(key)
	

	// 确保作用域链工作在嵌套控制器中
	if (isEach) {
		// todo. 移除掉  todo.title
		key = key.replace(epr, '')
		scope = this._options.parentScope  // 对于循环 继承父作用域
	}

	var binding = this._bindings[key] || this._createBinding(key, scope)

	binding.instances.push(bindingInstance)

	if (bindingInstance.bind) {
		bindingInstance.bind(binding.value) //binding.value 作用不大
	}

}

Seed.prototype._createBinding = function(key, scope){
	var binding = {
		value:null,
		instances:[]
	}
	this._bindings[key] = binding

	Object.defineProperty(scope, key, {
		get:function(){
			return binding.value
		},
		set:function(value){
			binding.value = value
			binding.instances.forEach(function(instance){
				instance.update(value)
			})
		}
	})

	return binding
}

Seed.prototype.dump = function(){
	var data = {};
	for (var key in this._bindings) {
		data[key] = this._bindings[key].value
	}
	return data;
}

Seed.prototype.destroy = function(){

	for (var key in this._bindings) {
		this._bindings[key].instances.forEach(unbind)
		delete this._bindings[key]
	}

	this.el.parentNode.removeChild(this.el)

	function unbind(instance){
		if (instance.unbind) {
			instance.unbind()
		}
	}

}



module.exports = Seed