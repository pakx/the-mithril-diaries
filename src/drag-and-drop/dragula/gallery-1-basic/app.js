// https://github.com/pakx/the-mithril-diaries/wiki/Dragula#gallery-1-basic

function main() {
	var model = {
            listNum: [1,2,3,4,5]
            , listAlpha: ["A","B","C","D"]
        }

    m.mount(document.body, view(model))
}

function view(model) {
    return {
        oncreate: function(vnode) {
            var containers = [
                    vnode.dom.children[0]
                    , vnode.dom.children[1]
                ]
            dragula(containers)
        }
        , view: function() {
            console.log("view() " + Date.now())
            return m(".app"
                , vwDragList(model.listNum)
                , vwDragList(model.listAlpha)
            )
        }
    }
    
    function vwDragList(lst) {
        return m(".list"
            , lst.map(function(itm) {
                return m(".node", {key:itm}, itm)
            })
        )
    }

}

main()