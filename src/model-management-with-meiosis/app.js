// https://github.com/pakx/the-mithril-diaries/wiki/Model-Management-with-Meiosis

window.addEventListener("DOMContentLoaded", main)

function main(){
    var model = createModel()
        , update = m.stream()
        , models = m.stream.scan(
            (mdl, mdlUpdate) => mdlUpdate(mdl), model, update
        )
        , actions = createActions(update)

    models.map(model => m.render(document.body, view(model, actions)))
}

function createModel() {
    return {
        msg: "Hello, world!"
        , clickCount: 0
    }
}

function createActions(update) {
    return {
        onButtonClick: onButtonClick
    }

    function onButtonClick() {
        update(function(model) {
            model.clickCount += 1 
            model.msg = model.msg.toUpperCase()
            return model
        })
    }
}

var view = (function() {

    function view(model, actions) {
        return vwApp(model, actions)
    }
  
    function vwApp(model, actions) {
        return m(".app"
            , vwHeader()
            , vwBody(model, actions)
            , vwFooter()
        )
    }

    function vwHeader() {
        return m(".header", "(HEADER)")
    }

    function vwBody(model, actions) {
        return m(".body"
            , m(".msg", model.msg)
            , m(".clickCount", model.clickCount)
            , m("button"
                , { onclick: actions.onButtonClick }
                , "Click Me"
            )
        )
    }

    function vwFooter() {
        return m(".footer", "(FOOTER)")
    }
    
    return view
})()