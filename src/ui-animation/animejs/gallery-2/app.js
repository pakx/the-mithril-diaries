// https://github.com/pakx/the-mithril-diaries/wiki/AnimeJS#gallery-2-several-more-properties
function main() {
    var model = createModel()
        , actions = createActions(model)
        
    m.mount(document.body, view(model, actions))
}

function createModel() {
    return {
        viewstate: {
            d1: { translateX: 0 }
            , d2: { rotate: '0turn', scale: 1 }
            , d3: { rotate: 0, scale: 1, translateX: 0 }
        }
    }
}

function createActions(model) {
    var modelDefaults = createModel().viewstate

    return {
        onDemo1: onDemo1
        , onDemo2: onDemo2
        , onDemo3: onDemo3
        , onReset: onReset
    }
    
    function onReset(id) {
        model.viewstate["d" + id] // ~ "deep-copy"
        		= JSON.parse(JSON.stringify(modelDefaults["d" + id]))
        m.redraw()
    }

    function onDemo1() {
        anime({
            targets: model.viewstate.d1
            , translateX: 250
            , update: m.redraw
        })
    }
    function onDemo2() {
        anime({
            targets: model.viewstate.d2
            , translateX: 250
            , rotate: "7turn"
            , scale: 2
						, update: m.redraw
        })
    }
    function onDemo3() {
        anime({
            targets: model.viewstate.d3
            , translateX: {value:250, duration:800}
            , rotate: {value:360, duration:1800, easing:"easeInOutSine"}
						, scale: {value:2, duration:1600, delay:800, easing:"easeInOutQuart"}
            , update: m.redraw
        })
    }

}

var view = (function(){
    function view(model, actions) {
        return vwApp(model, actions)
    }

    function vwApp(model, actions) {
        return {
            view: function() {
                return m(".app"
                    , vwDemo1(model, actions)
                    , vwDemo2(model, actions)
                    , vwDemo3(model, actions)
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
            , m(".header"
                , m("button", {onclick:actions.onDemo1}, "Animate")
                , m("button", {onclick:actions.onReset.bind(null, 1)}, "Reset")
                , " . translateX"
            )
            , m(".line", m(".square", attrs))
        )
    }

    function vwDemo2(model, actions) {
        var p = model.viewstate.d2
            , attrs = {
                style: {
                    transform: "scale(" + p.scale + ")"
                        + " rotate(" + p.rotate + ")"
                }
            }
        return m(".demo"
            , m(".header"
                , m("button", {onclick:actions.onDemo2}, "Animate")
                , m("button", {onclick:actions.onReset.bind(null, 2)}, "Reset")
                , " . scale, rotate"
            )
            , m(".line", m(".square", attrs))
        )
    }

    function vwDemo3(model, actions) {
        var p = model.viewstate.d3
            , attrs = {
                style: {
                    transform: "translateX(" + p.translateX + "px)"
                        + " scale(" + p.scale + ")"
                        + " rotate(" + p.rotate + "deg)"
                }
            }
        return m(".demo"
            , m(".header"
                , m("button", {onclick:actions.onDemo3}, "Animate")
                , m("button", {onclick:actions.onReset.bind(null, 3)}, "Reset")
                , " . translateX, scale, rotate, duration, easing"
            )
            , m(".line", m(".square", attrs))
        )
    }

    return view
})()

main()