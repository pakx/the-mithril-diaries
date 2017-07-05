// https://github.com/pakx/the-mithril-diaries/wiki/Model-and-Route-Management-with-Meiosis

window.addEventListener("DOMContentLoaded", main)

function main() {
    var settings = {
            routePrefix: "#"
            , defaultRoute: "/"
            , routesDesc: [
                {name:"Home", route: "/"}
                , {name:"Login", route: "/login"}
                , {name:"Item", route: "/item/:id"}
            ]
        }
        , model = createModel(settings)
        , update = m.stream()
        , actions = createActions(update)
        , routeResolver = createRouteResolver(model, actions)
        , models = m.stream.scan(
            function(mdl, mdlUpdate) {return mdlUpdate(mdl)}, model, update
        )
        , routeSync = createRouteSync(settings)
        , stub = document.createElement("div")

    m.route.prefix(settings.routePrefix)
    m.route(stub, settings.defaultRoute, routeResolver)
    models.map(routeSync)

    models.map(function(model) {m.render(document.body, view(model, actions))})
}

var view = (function(){
    
    function view(model, actions) {
        return m(".app"
            , vwNav(model, actions)
            , vwPage(model, actions)
        )
    }

    function vwNav(model, actions) {
        var defaults = {
            "/item/:id" : "/item/42"
            , Item : { id: 42 }
        }
        return m("ul.nav"
            , model.routesDesc.map(function(itm) {
                var href = defaults[itm.route] || itm.route
                return m("li" + isActive(itm.name)
                    , m("a", {href: href, oncreate: m.route.link}, itm.name)
                )  
            })
            , model.routesDesc.map(function(itm) {
                var params = defaults[itm.name] || {}
                return m("li"
                    , m("button"
                        , { onclick: actions.onNavigateTo.bind(null, itm.name, params) }
                        , itm.name
                    )
                )  
            })
        )

        function isActive(page) {
            return model.page == page ? ".active" : "";
        }
    }

    function vwPage(model, actions) {
        return model.page == "Login" ? vwLogin(model, actions)
            : model.page == "Item" ? vwItem(model, actions)
            : vwHome(model, actions)
    }

    function vwHome(model, actions) {
        return m("div"
            , "Home Page"
            , " | ", vwExternalLink()
        )
    }

    function vwLogin(model, actions) {
        return m("div"
            , "Login Page"
            , " | ", vwExternalLink()
        )
    }

    function vwItem(model, actions) {
        return m("div"
            , "Item Page - viewing item " + model.params.id
            , " | ", vwExternalLink()
        )
    }

    function vwExternalLink() {
        return m("a[href='https://duckduckgo.com']", "DuckDuckGo")
    }

    return view;
})()

function createModel(settings) {
    return {
        routesDesc : settings.routesDesc
        , page: undefined
        , params: {}
    }
}

function createActions(update) {
    return { 
        onNavigateTo : onNavigateTo
    }

    function onNavigateTo(routeName, params) {
        update(function(model) {
            model.page = routeName
            Object.assign(model.params, params)
            return model
        })
    }
}

function createRouteResolver(model, actions) {
    var noRender = function() { return null }
    return model.routesDesc.reduce(function(acc, itm) {
        acc[itm.route] = {
            onmatch: function(params, route) {
                actions.onNavigateTo(itm.name, params)
            }
            , render: noRender 
        }
        return acc
    }, {})
}

/// Returns a function that modifies browser URL to reflect model
function createRouteSync(settings) {
    var name2Route = settings.routesDesc.reduce(
            function(acc, itm) {
                acc[itm.name] = itm.route;
                return acc;
            }, {}
        )
        , routeCompile = settings.routesDesc.reduce(
            function(acc, itm) {
                acc[itm.route] = pathToRegexp.compile(itm.route);
                return acc;
            }, {}
        )

    return function (model) {
        var segment = name2Route[model.page] || settings.defaultRoute
            , route = routeCompile[segment](model.params)
        if (document.location.hash.substring(1) !== route) {
            window.history.pushState({}, "", settings.routePrefix + route)
        }
    }
}