var config 			= require('./config'),
		Directive 	= require('./directive'),
		Directives 	= require('./directives')

var map = Array.prototype.map,
		each = Array.prototype.forEach



function Seed(el, data, options){


	if (typeof el === 'string') {
		el = document.querySelector(el)
	}

	this.el = el
	this._bindings = {}; // 内部真正的数据
	this.scope = {} // 外部接口
	this._options = options || {}

	this._compileNode(el)

	// 修改为 => 遍历子节点
	// var els = el.querySelectorAll(config.selector)
	// ;[].forEach.call(els, this._compileNode.bind(this))


	// 通过调用set初始化所有的数据
	for (var key in this._bindings) {
		this.scope[key] = data[key];
	}


}


Seed.prototype._compileNode = function(node){
	var self = this

	if (node.nodeType === 3) {
	
		self._compileTextNode(node) //编译文本节点
	
	} else if (node.attributes && node.attributes.length) {
		
		var attrs = map.call(node.attributes, function(attr) {
			return {
				name:attr.name,
				value:attr.value
			}
		})

		attrs.forEach(function(attr){
			var directive = Directive.parse(attr)
			if (directive) {
				self._bind(node, directive)
			}
		})
	}

	if (!node['sd-block'] && node.childNodes.length) {
		each.call(node.childNodes, function(child){
			self._compileNode(child)  // 递归调用
		})
	}

}

Seed.prototype._compileTextNode = function(node){

}

Seed.prototype._bind = function(node, directive){

	directive.seed = this
	directive.el = node
	node.removeAttribute(directive.attr.name)

	var key = directive.key,
			epr = this._options.eachPrefixRE
	
	if (epr) {
		// todo. 移除掉  todo.title
		key = key.replace(epr, '')
	}
	
	var binding = this._bindings[key] || this._createBinding(key)

	binding.directives.push(directive)

	if (directive.bind) {
		directive.bind.call(directive, binding.value) //binding.value 作用不大
	}

}

Seed.prototype._createBinding = function(key){
	var binding = {
		value:undefined,
		directives:[]
	}
	this._bindings[key] = binding

	Object.defineProperty(this.scope, key, {
		get:function(){
			return binding.value
		},
		set:function(value){
			binding.value = value
			binding.directives.forEach(function(directive){
				directive.update(value)
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
		this._bindings[key].directives.forEach(unbind)
		delete this._bindings[key]
	}

	this.el.parentNode.removeChild(this.el)

	function unbind(directive){
		if (directive.unbind) {
			directive.unbind()
		}
	}

}



module.exports = Seed