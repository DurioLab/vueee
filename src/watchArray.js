var proto = Array.prototype,
		slice = proto.slice,
		mutatorMethods = [
			'pop',
			'push',
			'reverse',
			'shift',
			'unshift',
			'splice',
			'sort'
		]

module.exports = function(arr, callback){
	mutatorMethods.forEach(function(method){
		arr[method] = function(){
			proto[method].apply(this, arguments) // 对该数组进行操作
			callback({
				event:method,
				args:slice.call(arguments),
				array:arr
			})
		}
	})
}