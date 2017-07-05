/* https://github.com/pakx/the-mithril-diaries/wiki/AnimeJS#gallery-main */

function main() {
    var settings = {
            paths:[{name:"A", route:"/A"}
                , {name:"B", route:"/B"}
            ]
        }
        , model = createModel(settings)
        , actions = createActions(model)
        , routeResolver = createRouteResolver(model, actions)
        , defaultRoute = settings.paths[0].route
        
    m.route(document.body, defaultRoute, routeResolver)
}

function createModel(settings) {
    var elasticItems = [0,1,2,3,4,5,6,7,8,9]
        , initialStates = [
            { translateX: 0 }
            , { rotate: "0turn", scale: 1 }
            , { rotate: 0, scale: 1, translateX: 0 }
            , { elasticItems: elasticItems.map(function(itm) {
                    return {translateX: 0}
                })
            }
            , { backgroundColor: "#00FFFF", translateX: 0 }
            , { height: 25, translateX: 0, width: 25 }
            , { square: {translateX: 0, translateY: 0}
                , circle: {translateX: 0, translateY: 0}
                , triangle: {translateX: 0, translateY: 0}
                , progress: 0
                , callbacks: {} // populated in createActions()
            }
            , { points: "64 69.17821114346133 8.574"
                + " 99.96373240273172 62.94848110067368 67.35649303236691"
                + " 64 3.9637324027317162 65.05151889932631 67.35649303236691"
                + " 119.426 99.96373240273172" 
            }
            // switch-widgets
            , { translateX: 0
                , widgetId: 0
                , isAnimating: false
            }
            // switch-route
            , { rotate: 0, scale: 1, translateX: 0, opacity:1, isAnimating: false}
        ]

    return {
        paths: settings.paths.slice()
        , routeName: undefined
        , viewstate: {
            demos : initialStates.map(function(itm, idx) {
                return Object.assign(itm, {demoIdx: idx})
            })
        }
    }
}

function createRouteResolver(model, actions) {
    return model.paths.reduce(function(acc, itm) {
        acc[itm.route] = {
            onmatch: function(params, route) {
                actions.onNavigateTo(itm.name, params)
            }
            , render: function() {
                return view(model, actions)
            }
        }
        return acc
    }, {})
}

function createActions(model) {
    var initialStates = createModel({paths:[]}).viewstate.demos
        , animationFuncs = [
            function(demoIdx) { // translateX
                anime({
                    targets: model.viewstate.demos[demoIdx]
                    , translateX: 250
                    , update: m.redraw
                })
            }
            , function(demoIdx) { // rotate-scale
                anime({
                    targets: model.viewstate.demos[demoIdx]
                    , rotate: "5turn"
                    , scale: 2
                    , translateX: 250
                    , update: m.redraw
                })
            }
            , function(demoIdx) { // rotate-scale-translateX
                anime({
                    targets: model.viewstate.demos[demoIdx]
                    , rotate: {value:360, duration:1800, easing:"easeInOutSine"}
                    , scale: {value:2, duration:1600, delay:800, easing:"easeInOutQuart"}
                    , translateX: {value:250, duration:800}
                    , update: m.redraw
                })
            }
            , function(demoIdx) { // elasticity-timeline
                var p = model.viewstate.demos[demoIdx].elasticItems
                    , tm = anime.timeline({update: m.redraw})

                p.forEach(function(itm, idx) {
                    tm.add({
                        targets: itm, translateX: 250, offset: 0
                        , duration: 3000
                        , elasticity: idx * 100
                    })  
                })
            }
            , function(demoIdx) { // color
                anime({
                    targets: model.viewstate.demos[demoIdx]
                    , backgroundColor: {value:"#00FF00", duration:2000}
                    , easing: "linear"
                    , translateX: {value:250, duration:3000}
                    , update: m.redraw
                })
            }
            , function(demoIdx) { // relative
                anime({
                    targets: model.viewstate.demos[demoIdx]
                    , height: {value:"*=4", duration:1800, easing: "easeInOutSine"}
                    , direction: "alternate"
                    , translateX: {value:"+=150", duration:1000}
                    , width: {value:"-=10", duration:1800, easing: "easeInOutSine"}
                    , update: m.redraw
                })
            }
            , function(demoIdx) { // timeline controls
                var p = model.viewstate.demos[demoIdx]
                    , tm = anime.timeline({
                        direction: "alternate",
                        easing: "linear"
                        , update: function(anim) {
                            p.progress = anim.progress
                            m.redraw()
                        }
                    })

                // callbacks in a "model" smells, but here arguably faint
                p.callbacks = {
                    onPlay: tm.play
                    , onPause: tm.pause
                    , onRestart: tm.restart
                    , onProgress: function(val) { tm.seek(tm.duration * (val / 100)) }
                }

                tm.add({
                    targets: p.square
                    , translateX: [ { value: 80 }, { value: 160 }, { value: 250 } ]
                    , translateY: [ { value: 30 }, { value: 60 }, { value: 60 } ]
                    , duration: 3000
                    , offset: 0
                })
                tm.add({
                    targets: p.circle
                    , translateX: [ { value: 80 }, { value: 160 }, { value: 250 } ]
                    , translateY: [ { value: 30 }, { value: -30 }, { value: -30 } ]
                    , duration: 3000
                    , offset: 0
                })
                tm.add({
                    targets: p.triangle
                    , translateX: [ { value: 80 }, { value: 250 } ]
                    , translateY: [ { value: -60 }, { value: -30 }, { value: -30 } ]
                    , duration: 3000
                    , offset: 0
                })
            }
            , function(demoIdx) { // svg attributes
                anime({
                    targets: model.viewstate.demos[demoIdx]
                    , easing: "easeInOutExpo"
                    , points: "64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96"
                    , update: m.redraw
                })
            }
        ]
        , animations = animationFuncs.map(function(itm, demoIdx) {
            return itm.bind(null, demoIdx)
        })

    return {
        onNavigateTo: onNavigateTo
        , onStart: onStart
        , onStartAll: onStartAll
        , onReset: onReset
        , onResetAll: onResetAll
        , onSwitchWidgets: onSwitchWidgets
    }

    function onNavigateTo(routeName, params) {
        if (model.routeName == undefined) {
            model.routeName = routeName
        } else if (routeName != model.routeName) {
            animateRouteSwitch(routeName)
        }
    }
    
    function onStart(demoIdx) {
        animations[demoIdx]()
    }

    function onStartAll() {
        animations.forEach(function(itm) {
            itm()
        })
    }

    function onReset(demoIdx) {
        model.viewstate.demos[demoIdx] // ~ "deep-copy"
            = JSON.parse(JSON.stringify(initialStates[demoIdx]))
        return model.viewstate.demos[demoIdx]
    }

    function onResetAll() {
        animations.forEach(function(itm, idx) {
            onReset(idx)
        })
    }

    function onSwitchWidgets(demoIdx) {
        var p = model.viewstate.demos[demoIdx]

        if (p.isAnimating) {return}
        p.isAnimating = true

        var attrs = {
                targets: p
                , duration: 1500
                , easing: "easeInSine"
                , translateX: -200
                , update: m.redraw
            }
            , anim = anime(attrs)

        anim.finished.then(function() {
            p.widgetId = p.widgetId == 0 ? 1 : 0
            attrs.translateX = 0
            anime(attrs)
                .finished.then(function() {
                    p.isAnimating = false
                })
        })
    }

    function animateRouteSwitch(routeName) {
        var demoIdx = model.viewstate.demos.length - 1
            , p = model.viewstate.demos[demoIdx]
            , deg = 360
        
        if (p.isAnimating) {return}
        p.isAnimating = true
        
        var dir = routeName == "A" ? -1 : 1
            , width = document.documentElement.clientWidth
            , attrs = {
                targets: p
                , rotate: {value:dir * deg, duration:1000, easing:"easeInOutSine"}
                , scale: {value:0.25, duration:1000, easing:"easeInOutQuart"}
                , update: m.redraw
            }
            , pr = anime(attrs)

        pr.finished.then(function() {
            attrs.rotate.value = dir * deg * -1
            attrs.scale.value = 1
            pr = anime(attrs)
            pr.finished.then(function() {
                onReset(demoIdx)
                p.isAnimating = false
                model.routeName = routeName
                m.redraw()
            })
        })
    }
}

var view = (function() {

    function view(model, actions) {
        return vwApp(model, actions)
    }

    function vwApp(model, actions) {
        var p = model.viewstate.demos[model.viewstate.demos.length - 1]
            , attrs = {
                style: { transform: "translateX(" + p.translateX + "px)"
                    + " scale(" + p.scale + ")"
                    + " rotate(" + p.rotate + "deg)"
                    , opacity: p.opacity
                }
            }
        return m(".app"
            , attrs
            , vwAppHeader(model, actions)
            , vwDemos(model, actions)
        )
    }

    function vwAppHeader(model, actions) {
        return m(".app-hdr"
            , m("button", {onclick:actions.onStartAll}, "Start All")
            , m("button", {onclick:actions.onResetAll}, "Reset All")
            , m("span.note", " (Expand window for multi-column)")
            , m("span", {style:"float:right"}, model.routeName)
        )
    }

    function vwDemos(model, actions) {
        var demos = [
                vwTranslateX
                , vwRotateScale
                , vwRotateScaleTranslateX
                , vwElasticityTimeline
                , vwColor
                , vwRelative
                , vwTimelineControls
                , vwSvgAttributes
                , vwSwitchWidget
            ]

        return m(".demos"
            , demos.map(function(itm, idx) {
                return itm(model.viewstate.demos[idx], actions)
            })
            , vwSwitchRoute(model, actions)
        )
    }

    function vwTranslateX(demoState, actions) {
        var p = demoState
            , attrs = {
                style: { transform:"translateX(" + p.translateX + "px)" }
            }

        return m(".demo"
            , m(".demo-hdr"
                , m("", p.demoIdx, " . translateX")
                , vwDemoButtons(p.demoIdx, actions)
            )
            , m(".line", m(".square", attrs))
        )
    }

    function vwRotateScale(demoState, actions) {
        var p = demoState
            , attrs = {
                style: { transform: "scale(" + p.scale + ")"
                        + " rotate(" + p.rotate + ")"
                }
            }

        return m(".demo"
            , m(".demo-hdr"
                , m("", p.demoIdx, " . rotate, scale")
                , vwDemoButtons(p.demoIdx, actions)
            )
            , m(".line", m(".square", attrs))
        )
    }

    function vwRotateScaleTranslateX(demoState, actions) {
        var p = demoState
            , attrs = {
                style: { transform: "translateX(" + p.translateX + "px)"
                    + " scale(" + p.scale + ")"
                    + " rotate(" + p.rotate + "deg)"
                }
            }

        return m(".demo"
            , m(".demo-hdr"
                , m("", p.demoIdx, " . rotate, scale, translateX, duration, easing")
                , vwDemoButtons(p.demoIdx, actions)
            )
            , m(".line", m(".square", attrs))
        )
    }

    function vwElasticityTimeline(demoState, actions) {
        var p = demoState
        return m(".demo"
            , m(".demo-hdr"
                , m("", p.demoIdx, " . "
                    , m("a[href='http://animejs.com/documentation/#elasticity'][target='_new']"
                        , "elasticity, timeline"
                    )
                )
                , vwDemoButtons(p.demoIdx, actions)
            )
            , m(".line"
                , demoState.elasticItems.map(function(itm) {
                    var attrs = { style: {transform: "translateX(" + itm.translateX + "px)"}}
                    return m(".square.stretched", attrs)
                })
            )
        )
    }

    function vwColor(demoState, actions) {
        var p = demoState
        ,   attrs = {
                style: { backgroundColor: p.backgroundColor
                    , transform: "translateX(" + p.translateX + "px)"
                }
            }
        return m(".demo"
            , m(".demo-hdr"
                , m("", p.demoIdx, " . "
                    , m("a[href='http://animejs.com/documentation/#colors'][target='_new']"
                        , "color"
                    )
                )
                , vwDemoButtons(p.demoIdx, actions)
            )
            , m(".line", m(".square", attrs))
        )
    }

    function vwRelative(demoState, actions) {
        var p = demoState
        ,   attrs = {
                style: { height: p.height + "px"
                    , transform: "translateX(" + p.translateX + "px)"
                    , width: p.width + "px"
                }
            }
        return m(".demo"
            , m(".demo-hdr"
                , m("", p.demoIdx, " . "
                    , m("a[href='http://animejs.com/documentation/#relativeValues'][target='_new']"
                        , "relative"
                    )
                )
                , vwDemoButtons(p.demoIdx, actions)
            )
            , m(".line", m(".square", attrs))
        )
    }

    function vwTimelineControls(demoState, actions) {
        var p = demoState
            , attrsSquare = {style:{
                transform: "translateX(" + p.square.translateX + "px)"
                    + " translateY(" + p.square.translateY + "px)"
            }}
            , attrsCircle = {style:{
                transform: "translateX(" + p.circle.translateX + "px)"
                    + " translateY(" + p.circle.translateY + "px)"
            }}
            , attrsTriangle = {style:{
                transform: "translateX(" + p.triangle.translateX + "px)"
                    + " translateY(" + p.triangle.translateY + "px)"
            }}
            , hasMethods = p.callbacks.onPlay

        return m(".demo"
            , m(".demo-hdr"
                , m("", p.demoIdx, " . "
                    , m("a[href='http://animejs.com/documentation/#TLcontrols'][target='_new']"
                        , "timeline controls"
                    )
                )
                , vwDemoButtons(p.demoIdx, actions)
            )
            , m(".square", attrsSquare)
            , m(".circle", attrsCircle)
            , m(".triangle", attrsTriangle)
            , m(".line .timeline-controls"
                , m("button", {onclick:p.callbacks.onPlay, disabled:!hasMethods}, "Play")
                , m("button", {onclick:p.callbacks.onPause, disabled:!hasMethods}, "Pause")
                , m("button", {onclick:p.callbacks.onRestart, disabled:!hasMethods}, "Restart")
                , m("input[type='range']", {
                    min:0, max:100, step:2
                    , disabled: !hasMethods
                    , value: p.progress
                    , oninput: hasMethods
                        ? function() {p.callbacks.onProgress(this.value)}
                        : null
                })
            )
        )
    }

    function vwSvgAttributes(demoState, actions) {
        var p = demoState
        return m(".demo"
            , m(".demo-hdr"
                , m("", p.demoIdx, " . "
                    , m("a[href='http://animejs.com/documentation/#svgAttributes'][target='_new']"
                        , "SVG attributes"
                    )
                )
                , vwDemoButtons(p.demoIdx, actions)
            )
            , m("svg", {height:128, width:128, viewBox:"0 0 128 128"}
                , m("polygon", { points: p.points, fill: "cyan" })
            )
        )
    }

    function vwSwitchWidget(demoState, actions) {
        var p = demoState
            , attrs = {style: { transform: "translateX(" + p.translateX + "px)"}
                , onclick:actions.onSwitchWidgets.bind(null, p.demoIdx)
            }
        return m(".demo"
            , m(".demo-hdr", "use case: switch widget")
            , m(".switch-widget"
                , p.widgetId == 0
                    ? m(".widget.widget1", attrs, "Hello", m("span.note", " (click to switch)"))
                    : m(".widget.widget2", attrs, "World!", m("span.note", " (click to switch)"))
            )
        )
    }

    function vwSwitchRoute(model, actions) {
        return m(".demo"
            , m(".demo-hdr", "use case: switch route")
            , m(".switch-route"
                , model.paths.map(function(itm) {
                    return m("a.route" + isActive(itm.name)
                        , {href:itm.route, oncreate:m.route.link}
                        , "Route " + itm.name
                    )
                })
            )
        )
        function isActive(routeName) {
            return routeName == model.routeName ? " active" : ""
        }
    }

    function vwDemoButtons(demoIdx, actions) {
        return [
            m("button", {onclick:actions.onStart.bind(null, demoIdx)}, "Animate")
            , m("button", {onclick:actions.onReset.bind(null, demoIdx)}, "Reset")
        ]
    }
    return view
})()

main()