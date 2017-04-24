var config 			= require('./config'),
		bindingParser 	= require('./binding')

var map = Array.prototype.map,
		each = Array.prototype.forEach

//lazy init
var ctrlAttr,
		eachAttr




function Seed(el, data, options){

	ctrlAttr = config.prefix + '-controller'
	eachAttr = config.prefix + '-each'

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



	// 如果有controller
	var ctrlID = el.getAttribute(ctrlAttr),
			controller = null

	if (ctrlID) {
		controller = controllers[ctrlID]
		el.removeAttribute(ctrlAttr) 
		if (!controller) throw new Error('controller ' + ctrlID + ' is not defined.')
	}

	this._compileNode(el, true)

	// 调用controller  注入scope 通过赋值scope 修改dom
	if (controller) {
		controller.call(null, this.scope, this)
	}

	// 通过调用set初始化所有的数据
	for (var key in dataCopy) {
		this.scope[key] = dataCopy[key];
	}


}


Seed.prototype._compileNode = function(node, root){
	
	var self = this
	
	if (node.nodeType === 3) {

		self._compileTextNode(node) //编译文本节点
	
	} else if (node.attributes && node.attributes.length) {

		var eachExp = node.getAttribute(eachAttr),
				ctrlExp = node.getAttribute(ctrlAttr)

		if (eachExp) { // 是each循环

			var binding = bindingParser.parse(eachAttr, eachExp)
			if (binding) {
				self._bind(node, binding)
			}

		} else if (!ctrlExp || root) { // 跳过嵌套controllers

			var attrs = map.call(node.attributes, function(attr) {
				return {
					name:attr.name,
					expressions:attr.value.split(',')
				}
			})

			attrs.forEach(function(attr){
				var valid = false
				attr.expressions.forEach(function(exp){
					var binding = bindingParser.parse(attr.name, exp)
					if (binding) {
						valid = true
						self._bind(node, binding)
					}

					if (valid) {
						node.removeAttribute(attr.name) // 防止重复指令
					}
				})
			})

			if (node.childNodes.length) {
				each.call(node.childNodes, function(child){
					self._compileNode(child)  // 递归调用
				})
			}

		}
	}




}

Seed.prototype._compileTextNode = function(node){
	return node
}

Seed.prototype._bind = function(node, bindingInstance){

	bindingInstance.seed = this
	bindingInstance.el = node

	var key = bindingInstance.key, //todo.title
			epr = this._options.eachPrefixRE, // todo.
			isEachKey = epr && epr.test(key), // /todo./.test('todo.title')
			seed = this

	// 确保作用域链工作在嵌套控制器中
	if (isEachKey) {
		// todo. 移除掉  todo.title
		key = key.replace(epr, '')
	} else if( epr ){
		seed = this._options.parentSeed
	}

	var binding = seed._bindings[key] || seed._createBinding(key)

	binding.instances.push(bindingInstance)

	if (bindingInstance.bind) { // each有bind
		bindingInstance.bind(binding.value) //binding.value 作用不大
	}

}

Seed.prototype._createBinding = function(key){
	var binding = {
		value:null,
		instances:[]
	}

	this._bindings[key] = binding

	Object.defineProperty(this.scope, key, {
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