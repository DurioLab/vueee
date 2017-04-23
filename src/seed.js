var config 			= require('./config'),
		Directive 	= require('./directive'),
		Directives 	= require('./directives')


		// selector 		= Object.keys(Directives).map(function(d){
		// 	return '[' + prefix + '-' + d + ']'
		// }).join();



function Seed(el, data){


	if (typeof el === 'string') {
		el = document.querySelector(el)
	}

	this.el = el
	this._bindings = {}; // 内部真正的数据
	this.scope = {} // 外部接口

	var els = el.querySelectorAll(config.selector)
	;[].forEach.call(els, this._compileNode.bind(this))
	;this._compileNode(el)

	// 通过调用set初始化所有的数据
	for (var key in this._bindings) {
		this.scope[key] = data[key];
	}


}


Seed.prototype._compileNode = function(node){
	var self = this
	cloneAttributes(node.attributes).forEach(function(attr){
		var directive = Directive.parse(attr)
		if (directive) {
			self._bind(node, directive)
		}
	})
}

Seed.prototype._bind = function(node, directive){

	directive.el = node
	node.removeAttribute(directive.attr.name)

	var key = directive.key,
			binding = this._bindings[key] || this._createBinding(key)

	binding.directives.push(directive)

	if (directive.bind) {
		directive.bind(node, binding.value)
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
	}

	this.el.parentNode.remove(this.el)

	function unbind(directive){
		if (directive.unbind) {
			directive.unbind()
		}
	}

}


function cloneAttributes(attributes){
	return [].map.call(attributes, function(attr) {
		return {
			name:attr.name,
			value:attr.value
		}
	})
}


module.exports = Seed