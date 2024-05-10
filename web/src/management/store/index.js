import { createStore } from 'vuex'
import edit from './edit'
import user from './user'
import logic from './logic'

import actions from './actions'
import mutations from './mutations'
import state from './state'

export default createStore({
  state,
  getters: {},
  mutations,
  actions,
  modules: {
    edit,
    user,
    logic
  }
})
