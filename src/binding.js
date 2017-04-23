var directives = require('./directives'),
		filters = require('./filters'),
		config  = require('./config')

var KEY_RE = /^[^\|]+/g,
		FILTERS_RE = /\|[^\|]+/g,
		FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g,
    QUOTE_RE        = /'/g,
    ARG_RE          = /([^:]+):(.+)$/

function Binding(directiveName, expression){

	var directive = directives[directiveName]

	if (typeof directive === 'function') {
		this._update = directive
	} else {
		for (var prop in directive) {
			if (prop === 'update') {
				this['_update'] = directive.update 
				continue
			}
			this[prop] = directive[prop]
		}
	}

	this.directiveName = directiveName

	var rawKey   = expression.match(KEY_RE)[0],
			argMatch = rawKey.match(ARG_RE) //click:remove   remove=>key  click=>arg


	this.key = argMatch ? argMatch[2].trim() : rawKey.trim()
	this.arg = argMatch ? argMatch[1].trim() : null

	var filterExpressions = expression.match(FILTERS_RE)
	if (filterExpressions) {
		
		this.filters = filterExpressions.map(function(filter){
			
			var tokens = filter.slice(1).match(FILTER_TOKEN_RE).map(function(token){
				return token.replace(QUOTE_RE, '').trim()
			})
			// var tokens = filter.replace('|','').trim().split(/\s+/)
			return {
				name:tokens[0],
				apply: filters[tokens[0]],
				args: tokens.length > 1 ? tokens.slice(1) : null
			}

		})	

	} else {
		this.filters = null
	}
}

Binding.prototype.update = function(value){
	if (this.filters) {
		value = this.applyFilters(value)
	}
	this._update(value)
}

Binding.prototype.applyFilters = function(value){
	var filtered = value
	this.filters.forEach(function(filter){
		if (!filter.apply) throw new Error('Unknown filter: ' + filter.name)
		filtered = filter.apply(filtered, filter.args)
	})
	return filtered
}

module.exports = {


	parse:function(dirname, expression){

		var prefix = config.prefix

		if(dirname.indexOf(prefix) === -1) return null

		dirname = dirname.slice(prefix.length + 1)


		var dir = directives[dirname],
				valid = KEY_RE.test(expression)

		if (!dir) console.warn('unknown directive: ' + dirname)
		if (!valid) console.warn('invalid directive expression: ' + expression)


		return dir && valid 
				? new Binding(dirname, expression) 
				: null
	}
}


