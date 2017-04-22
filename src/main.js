var prefix 			= 'sd',
		Filters 		= require('./filters'),
		Directives 	= require('./directives'),
		selector 		= Object.keys(Directives).map(function(d){
			return '[' + prefix + '-' + d + ']'
		}).join();

console.log(selector)

function Seed(opts){
	var self = this,
			root = this.el = document.getElementById(opts.id),
			els = root.querySelectorAll(selector);

	var bindings = self._bindings = {}; // 内部真正的数据
	self.scope = {} // 外部接口

	;[].forEach.call(els, processNode)
	;processNode(root)

	// 通过调用set初始化所有的数据
	for (var key in bindings) {
		self.scope[key] = opts.scope[key];
	}



	function processNode(el){
		cloneAttributes(el.attributes).forEach(function(attr){
			var directive = parseDirective(attr);
			if (directive) {
				bindDirective(self, el, bindings, directive);
			}

		})
	}
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
		this._bindings[key].directives.forEach(function(directive){
			if (directive.definition.unbind) {
				directive.definition.unbind(directive.el, directive.argument, directive);
			}
		})
	}

	this.el.parentNode.remove(this.el)
}


function cloneAttributes(attributes){
	return [].map.call(attributes, function(attr) {
		return {
			name:attr.name,
			value:attr.value
		}
	})
}


// 绑定指令
function bindDirective(seed, el, bindings, directive){
	el.removeAttribute(directive.attr.name)
	var key = directive.key, // key是变量名 每一个变量名所在的指令
			binding = bindings[key]; 

	if (!binding) {
		bindings[key] = binding = {
			value:undefined,
			directives:[]
		}
	}

	directive.el = el;
	binding.directives.push(directive)

	if (directive.bind) {
		directive.bind(el, binding.value)
	}

	if (!seed.scope.hasOwnProperty(key)) { 
		bindAccessors(seed, key, binding);
	}
}


function bindAccessors(seed,key,binding){
	Object.defineProperty(seed.scope, key, {
		set:function(value){
			binding.value = value;
			binding.directives.forEach(function(directive){
			
				var filteredValue = value && directive.filters 
						? applyFilters(value,directive) 
						: value

				directive.update(directive.el, filteredValue, directive.argument, directive, seed);

			})
		},
		get:function(){
			return binding.value
		}
	})
}


function applyFilters(value, directive){
	if (directive.definition.customFilter) {
		return directive.definition.customFilter(value, directive.filters)
	} else {
		directive.filters.forEach(function(filter){
			if (Filters[filter]) {
				value = Filters[filter](value)
			}
		})
		return value
	}


}


// 解析指令
function parseDirective(attr){

	if(attr.name.indexOf(prefix) === -1) return;

	//  解析指令名称和参数
	var noprefix = attr.name.slice(prefix.length + 1),
			argIndex = noprefix.indexOf('-'), // 指令后是否跟有参数
			dirname = argIndex === -1 ? noprefix : noprefix.slice(0,argIndex),
			def = Directives[dirname],
			arg = argIndex === -1 ? null : noprefix.slice(argIndex + 1);

	// 解析变量和过滤器
	var exp = attr.value,
			pipeIndex = exp.indexOf('|'),
			key = pipeIndex === -1 ? exp.trim() : exp.slice(0,pipeIndex).trim(),
			filters = pipeIndex === -1 ? null : exp.slice(pipeIndex + 1).split('|').map(function(filter){
				return filter.trim()
			});

	return def ? {
		attr:attr,
		key:key,
		filters:filters,
		definition:def,
		argument:arg,
		update:typeof def === 'function' ? def : def.update
	} : null

}




module.exports = {
	create: function(opts){
		return new Seed(opts)
	},
	filters:Filters,
	directives:Directives
}