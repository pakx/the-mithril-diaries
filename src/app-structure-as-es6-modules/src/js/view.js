export default createView

function createView() {
    return vwApp
}

function vwApp(model, actions) {
    return {
        view: function() {
            return m(".app"
                , vwHeader()
                , vwBody(model, actions)
                , vwFooter()
            )
        }
    }
}

function vwHeader() {
    return m(".header", "(HEADER)")
}

function vwBody(model, actions) {
    return m(".body"
        , m(".msg", model.msg)
        , m(".clickCount", model.clickCount)
        , m("button"
            , { onclick: actions.onIncrease }
            , "Click Me"
        )
    )
}

function vwFooter() {
    return m(".footer", "(FOOTER)")
}