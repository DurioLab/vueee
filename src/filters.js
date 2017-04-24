module.exports = {
	capitalize: function(value) {
		value = value.toString()
		return value.charAt(0).toUpperCase() + value.slice(1)
	},
	uppercase: function(value) {
		return value.toString().toUpperCase()
	},
	delegate: function(handler, args){
		var selector = args[0]
		return function(e){
			if (delegateCheck(e.target,e.currentTarget,selector)) {
				handler.apply(this, arguments)
			}
		}
	}
}

function delegateCheck(current, top, selector){
	if (current.webkitMatchesSelector(selector)) {
		return true
	} else if(current === top){
		return false
	} else {
		return delegateCheck(current.parentNode, top, selector)
	}
}

//target在事件流的目标阶段；currentTarget在事件流的捕获，目标及冒泡阶段。
//只有当事件流处在目标阶段的时候，两个的指向才是一样的， 而当处于捕获和冒泡阶段的时候，target指向被单击的对象而currentTarget指向当前事件活动的对象（一般为父级）。