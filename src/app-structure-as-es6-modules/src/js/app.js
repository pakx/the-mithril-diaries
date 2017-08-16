import createModel from "./model"
import createActions from "./actions"
import createView from "./view"

window.addEventListener("DOMContentLoaded", main)

function main() {
    var model = createModel()
        , actions = createActions(model)
        , view = createView()

    m.mount(document.body, view(model, actions))
}
