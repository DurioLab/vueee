var prefix 			= 'sd',
		Directive 	= require('./directive'),
		Directives 	= require('./directives'),
		selector 		= Object.keys(Directives).map(function(d){
			return '[' + prefix + '-' + d + ']'
		}).join();

console.log(selector)

function Seed(opts){
	var self = this,
			root = this.el = document.getElementById(opts.id),
			els = root.querySelectorAll(selector);

	self.bindings = {}; // 内部真正的数据
	self.scope = {} // 外部接口

	;[].forEach.call(els, this.compileNode.bind(this))
	;this.compileNode(root)

	// 通过调用set初始化所有的数据
	for (var key in self.bindings) {
		self.scope[key] = opts.scope[key];
	}


}


Seed.prototype.compileNode = function(node){
	var self = this
	cloneAttributes(node.attributes).forEach(function(attr){
		var directive = Directive.parse(attr, prefix)
		if (directive) {
			self.bind(node, directive)
		}
	})
}

Seed.prototype.bind = function(node, directive){

	directive.el = node
	node.removeAttribute(directive.attr.name)

	var key = directive.key,
			binding = this.bindings[key] || this.createBinding(key)

	binding.directives.push(directive)

	if (directive.bind) {
		directive.bind(node, binding.value)
	}

}

Seed.prototype.createBinding = function(key){
	var binding = {
		value:undefined,
		directives:[]
	}
	this.bindings[key] = binding

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
	for (var key in this.bindings) {
		data[key] = this.bindings[key].value
	}
	return data;
}

Seed.prototype.destroy = function(){

	for (var key in this.bindings) {
		this.bindings[key].directives.forEach(unbind)
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


module.exports = {
	create: function(opts){
		return new Seed(opts)
	},
	directive:function(){

	},
	filter:function(){

	}
}