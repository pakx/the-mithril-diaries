// https://github.com/pakx/the-mithril-diaries/wiki/Dragula#gallery-2-keeping-model-in-sync

function main() {
	var model = createModel()
  		, actions = createActions(model)

    m.mount(document.body, view(model, actions))
}

function createModel() {
	return {
        listNum: [1,2,3,4,5]
        , listAlpha: ["A", "B", "C", "D"]
    }
}

function createActions(model) {
	return {
        syncModelOnDrop: syncModelOnDrop
    }

    function syncModelOnDrop(el, target, source, sibling) {
        // following code is app-specific. Ignore
        var e = (e = el.getAttribute("data-item")
                , el.className.match(/num/) ? 0|e : e
            )
            , tar = target.className.match(/num/)
                ? model.listNum
                : model.listAlpha
            , src = source.className.match(/num/)
                ? model.listNum
                : model.listAlpha
            , sib = ( sib = sibling
                    ? sibling.getAttribute("data-item") : null
                , sib && sibling.className.match(/num/)
                    ? 0|sib : sib
            )
            , idxSrc = src.indexOf(e)
            , idxTar = sib == null
                ? tar.length
                : tar.indexOf(sib)

        if (tar != src || idxTar < idxSrc) {
            src.splice(idxSrc, 1)
            tar.splice(idxTar, 0, e)
        } else {
            tar.splice(idxTar, 0, e)
            src.splice(idxSrc, 1)
        }
        m.redraw()
    }
}

var view = (function() {
	function view(model, actions) {
        return vwApp(model, actions)
    }

    function vwApp(model, actions) {
        return {
            oncreate: function(vnode) {
                var cs = vnode.dom.children[0].children[1].children
                    , containers = [cs[0], cs[1]]
                dragula(containers)
                    .on("drop", actions.syncModelOnDrop)
            }
            , view: function() {
                return m(".app"
                    , vwDragLists(model)
                    , vwModel(model)
                )
            }
        }
    }

    function vwDragLists(model) {
        return m(".panel"
            , m("", "Drag within/between these 2 lists")
            , m(".lists"
                , vwList(model.listNum, ".list-num")
                , vwList(model.listAlpha, ".list-alpha")
            )
        )
    }

    function vwModel(model) {
        return m(".panel.model"
            , m("", "model (kept in sync)")
            , m(".lists"
                , vwList(model.listNum, ".list-num")
                , vwList(model.listAlpha, ".list-alpha")
            )
        )
    }

    function vwList(lst, cls) {
        return m(".list" + cls + (lst.length ? "" : ".list-empty")
            , lst.map(function(itm) {
                return vwNode(itm)
            })
        )
    }

    function vwNode(node, cls) {
        var attrs = {key: node, "data-item":node}
            , cls = ("" + node).match(/[A-Z]/) ? ".alpha" : ".num"
        return m(".node" + cls, attrs, node)
    }

    return view
})()

main()