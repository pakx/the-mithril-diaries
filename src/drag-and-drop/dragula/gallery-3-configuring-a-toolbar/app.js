// https://github.com/pakx/the-mithril-diaries/wiki/Dragula#gallery-3-configuring-a-toolbar

function main() {
	var model = createModel()
        , actions = createActions(model)
        , view = createView(model, actions)

    m.mount(document.body, view(model, actions))
}

function createModel() {
    var defButton = {name:"x", glyph:"X"}
        , toolbuttons = [
            "ꀀ", "ꀁ", "ꀂ", "ꀃ", "ꀄ", "ꀅ", "ꀆ", "ꀇ", "ꀈ", "ꀉ"
            , "ꀊ", "ꀋ", "ꀌ", "ꀍ", "ꀎ", "ꀏ", "ꀐ", "ꀑ", "ꀒ", "ꀓ"
            , "ꀔ", "ꀕ", "ꀖ", "ꀗ", "ꀘ", "ꀙ", "ꀚ", "ꀛ", "ꀜ", "ꀝ"
            , "ꀞ", "ꀟ", "ꀠ", "ꀡ", "ꀢ", "ꀣ", "ꀤ", "ꀥ", "ꀦ", "ꀧ"
        ].reduce(function(acc, itm, idx) {
            var name = "btn-" + idx
            acc[name] = {name:name, glyph:itm}
            return acc
        }, {})

    toolbuttons["copy"] = {name:"copy", glyph:"C"}
    toolbuttons["cut"] = {name:"cut", glyph:"X"}
    toolbuttons["paste"] = {name:"paste", glyph:"V"}

	return {
        toolbuttons: toolbuttons
        , toolbar: {
            groups: [
                { name:"edit"
                    , buttons: getToolbuttons(["copy", "cut", "paste"]) 
                }
                , { name:"custom"
                    , configurable: true
                    , buttons: getToolbuttons(["btn-1"] )
                }
            ]
        }
        , viewstate: {
            config: {
                drakeDlg: undefined
                , drakeBtns: undefined
                , showDlg: true
                , showMnu: false
                , mxyBody: undefined    // mousedown/touch pos wrt body
                , mxyWidget: undefined  // ...same wrt widget
            }
        }
    }

    // find + return toolbuttons by names
    function getToolbuttons(names) {
        return names.map(function(name) {
            return toolbuttons[name] || defButton
        })
    }
}

function createActions(model) {
    return {
        onDlgShow: setDlgShow.bind(null, true)
        , onDlgOK: setDlgShow.bind(null, false)
        , onDlgCancel: setDlgShow.bind(null, false)
    }

    function setDlgShow(ok) {
        model.viewstate.config.showMnu = false
        model.viewstate.config.showDlg = ok
        if (!ok) {
            // alternatively, destroy these in viewMgr
            model.viewstate.config.drakeDlg.destroy()
            model.viewstate.config.drakeBtns.destroy()
        }
    }
}

function createView(mdl, acts) {
    var viewMgr = createViewManager(mdl, acts)

    function view(model, actions) {
        return vwApp(model, actions)
    }

    function vwApp(model, actions) {
        return {
            view: function() {
                return m(".app"
                    , vwToolbar(model, actions)
                    , vwWorkspace(model, actions)
                )
            }
        }
    }

    function vwToolbar(model, actions) {
        return m(".toolbar"
            , {oncontextmenu:viewMgr.showContextMenu}
            , model.toolbar.groups.map(function(itm) {
                return vwToolbuttonGroup(model, itm, true)
            })
            , vwContextMenu(model, actions)
        )
    }

    function vwWorkspace(model, actions) {
        return m(".workspace"
            , ! model.viewstate.config.showDlg 
                ? null : vwConfigDialog(model, actions)
        )
    }

    function vwToolbuttonGroup(model, group, addActions) {
        return m(".toolbutton-group" 
                + ( model.viewstate.config.showDlg && group.configurable
                        ? ".toolbutton-group-configurable" : ""
                )
            , {title: group.name}
            , group.buttons.map(function(itm) {
                var attrs = {title:itm.name}
                if (addActions) {
                    attrs.onmousedown = viewMgr.saveWidgetMxy
                    attrs.ontouchstart = viewMgr.saveWidgetMxy
                }
                return m(".toolbutton", attrs, itm.glyph)
            })
        )
    }

    function vwConfigDialog(model, actions) {
        var btnsGroup = { name:"available"
                , buttons:Object.keys(model.toolbuttons)
                    .map(function(itm) {
                        return model.toolbuttons[itm]
                    })
            }

        return m(".config-dialog"
            , {oncreate:viewMgr.onDlgCreate}
            , m(".config-dialog-title"
                , { onmousedown: viewMgr.saveWidgetMxy
                    , ontouchstart: viewMgr.saveWidgetMxy
                }
                , "available toolbuttons"
            )
            , vwToolbuttonGroup(model, btnsGroup, false)
            , m(".config-dialog-controls"
                , m("button", {onclick:actions.onDlgOK}, "OK")
                , m("button", {onclick:actions.onDlgCancel}, "Cancel")
            )
        )
    }

    // toolbar context menu
    function vwContextMenu(model, actions) {
        var attrs = model.viewstate.config.showMnu && {
                style: { left:(model.viewstate.config.mxyBody.x - 3) + "px"
                    , top:(model.viewstate.config.mxyBody.y - 3) + "px"
                } || {}
                , onmouseleave: viewMgr.hideContextMenu
            }
        return !model.viewstate.config.showMnu ? ""
            : model.viewstate.config.showDlg ? ""
            : m(".context-mnu"
                , attrs
                , m(".mnu-itm", {onclick:actions.onDlgShow.bind(null, true)}, "Configure...")
                , m(".mnu-sep")
                , m(".mnu-itm", {onclick:viewMgr.hideContextMenu}, "Cancel")
            )
    }

    return view
}

function createViewManager(model, actions) {
    return {
        onDlgCreate: onDlgCreate
        , saveWidgetMxy: saveWidgetMxy
        , puffAt: puffAt
        , showContextMenu: showContextMenu
        , hideContextMenu: hideContextMenu
    }

    function onDlgCreate(vnode) {
        setupDlgDrag(vnode)
        setupToolbtnDrag(vnode)
    }

    function setupDlgDrag(vnode) {
        var containers = [ vnode.dom.parentNode ] // dlg<workspace
            , opts = {
                moves: function(el, source, handle, sibling) {
                    return handle.className == "config-dialog-title"
                }
            }
        model.viewstate.config.drakeDlg = dragula(containers, opts)
            .on("drag", function(el, source) {
                trackBodyMxy(true)
            })
            .on("dragend", function(el) {
                trackBodyMxy(false)
                var xyB = model.viewstate.config.mxyBody
                    , xyW = model.viewstate.config.mxyWidget || {x:10,y:10}
                    , xy = {x:(xyB.x - xyW.x), y:(xyB.y - xyW.y)}
                    , styl = vnode.dom.style
                styl.top = xy.y + "px"
                styl.left = xy.x + "px"
                styl.position = "absolute"
            })
    }

    function setupToolbtnDrag(vnode) {
        var app = vnode.dom.parentNode.parentNode
            , containers = [
                // app>toolbar>group
                app.children[0].children[1]
                // app>workspace>dialog>btngroup
                , app.children[1].children[0].children[1]
            ]
            , opts = {
                removeOnSpill: true
                , accepts: function(el, target) {
                    return target !== containers[1]
                }
                , copy: function(el, source) {
                    return source === containers[1]
                }
                , moves: function() {
                    return model.viewstate.config.showDlg
                }
            }
        model.viewstate.config.drakeBtns = dragula(containers, opts)
            .on("drag", function(el, source) {
                trackBodyMxy(true)
            })
            .on("dragend", function(el) {
                trackBodyMxy(false)
                if (! el.onmousedown) {
                    el.onmousedown = saveWidgetMxy
                    el.ontouchstart = saveWidgetMxy
                }
            })
            .on("remove", function(el, container, source) {
                var xyB = model.viewstate.config.mxyBody
                    , xyW = model.viewstate.config.mxyWidget || {x:10,y:10}
                    , xy = {x:(xyB.x - xyW.x), y:(xyB.y - xyW.y)}
                puffAt(xy, document)
            })
    }

    // track + save mouse position
    function trackBodyMxy(ok) {
        if (ok) {
            document.body.addEventListener("mousemove", onMouseMove, false)
        } else {
            document.body.removeEventListener("mousemove", onMouseMove, false)
        }

        function onMouseMove(evt) {
            model.viewstate.config.mxyBody = {x:evt.clientX, y:evt.clientY}
        }
    }

    function saveWidgetMxy(evt) {
        var pos = findPos(evt.target)
            , xy = evt.type == "touchstart"
                ? {x:evt.touches[0].clientX - pos.x, y:evt.touches[0].clientY - pos.y}
                : {x:evt.clientX - pos.x, y:evt.clientY - pos.y}
        model.viewstate.config.mxyWidget = xy
    }

    function findPos(obj) {
        // src: https://www.quirksmode.org/js/findpos.html
	    var curleft = curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return {x:curleft, y:curtop};
    }

    // puff-of-smoke effect at {x, y}
    function puffAt(xy) {
        var el = document.createElement("div")
        el.className = "puff puff-animated"
        el.style.left = (xy.x - 3) + "px"
        el.style.top = (xy.y - 3) + "px"
        document.body.appendChild(el)
        setTimeout(function() {
            document.body.removeChild(el)
        }, 500)
    }

    function showContextMenu(evt) {
        if (evt.target.className.indexOf("toolbar")<0) {return}
        evt.preventDefault()
        model.viewstate.config.mxyBody = {x:evt.clientX, y:evt.clientY}
        model.viewstate.config.showMnu = true
    }

    function hideContextMenu() {
        model.viewstate.config.showMnu = false
    }
}

main()