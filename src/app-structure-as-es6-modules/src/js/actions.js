export default createActions

var model = undefined

function createActions(mdl) {
    model = mdl
    
    return {
        onIncrease: onIncrease
    }
}

function onIncrease() {
    model.clickCount += 1 
    model.msg = model.msg.toUpperCase()
}