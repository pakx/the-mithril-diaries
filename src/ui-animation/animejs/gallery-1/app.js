// https://github.com/pakx/the-mithril-diaries/wiki/ui-animation/AnimeJS#gallery-1-translatex

function main() {
    var model = createModel()
        , actions = createActions(model)
    m.mount(document.body, view(model, actions))
}

function createModel() {
    return {
        viewstate: {
            d1: { translateX: 0 }
        }
    }
}

function createActions(model) {
    return {
        onDemo1: onDemo1
    }
    function onDemo1() {
        anime({
            targets: model.viewstate.d1
            , translateX: 250
            , update: m.redraw
        })
    }
}

var view = (function(){
    function view(model, actions) {
        return {
            view: function() {
                return m(".app"
                    , vwDemo1(model, actions)
                )
            }
        }
    }

    function vwDemo1(model, actions) {
        var p = model.viewstate.d1
            , attrs = {
                style: {
                    transform:"translateX(" + p.translateX + "px)"
                }
            }
        return m(".demo"
            , m("button", {onclick:actions.onDemo1}, "Animate")
            , m(".square", attrs)
        )
    }
    return view
})()

main()