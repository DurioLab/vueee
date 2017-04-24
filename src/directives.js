var config     = require('./config'),
		watchArray = require('./watchArray'),
		controllers = require('./controllers')

module.exports = {
	text: function (value) {
		this.el.textContent = value || ''
	},
	show: function (value) {
		this.el.style.display = value ? '' : 'none'
	},
	class: function (value) {
		this.el.classList[value ? 'add':'remove'](this.arg)
	},
	on: {
		update: function(handler) {

			if (this.handler) {
				this.el.removeEventListener(event, this.handler)
			}

			if (handler) {
				this.el.addEventListener(event, handler)
				this.handler = handler
			}

		},
		unbind: function() {
			var event = this.arg
			if (this.handlers) {
				this.el.removeEventListener(event, this.handlers[event])
			}
		}
	},

	each: {
		bind: function(){
			this.el.removeAttribute(config.prefix + '-each')
			this.prefixRE = new RegExp('^' + this.arg + '.')  // todo.
			var ctn = this.container = this.el.parentNode
			this.marker = document.createComment('sd-each-' + this.arg + '-marker')
			ctn.insertBefore(this.marker, this.el)
			ctn.removeChild(this.el)
			this.childSeeds = []
		},
		update:function(collection){
			if (this.childSeeds.length) {
				this.childSeeds.forEach(function(child){
					child.destroy()
				})
				this.childSeeds = []
			}

			watchArray(collection, this.mutate.bind(this))

			var self = this
			collection.forEach(function(item, i){
				self.childSeeds.push(self.buildItem(item, i, collection))
			})

		},
		mutate: function(mutation){
			console.log(mutation)
			console.log(this)
		},
		buildItem: function(data,index,collection){

			var Seed = require('./seed'),
					node = this.el.cloneNode(true)
					
			var spore = new Seed(node, data, {
						parentSeed:this.seed,
						eachPrefixRE:this.prefixRE
					})

			this.container.insertBefore(node, this.marker)
			collection[index] = spore.scope
			return spore

		}
	}
}

var push = [].push,
		slice = [].slice

function argmentArray(collection, directive){
	collection.push = function(element){
		push.call(this, arguments)
		directive.mutate({
			event:'push',
			elements:slice.call(arguments),
			collection:collection
		})
	}
}