import Vue from 'vue'

const jd = window.preload.jd

const state = {
  /**
   * 账号列表
   * @property pinId
   * @property name
   * @property cookie
   * @property isLogin
   * @property isPlusMember
   */
  account: {},
  address: '',
  password: '',
  eid: '',
  fp: ''
}
const getters = {
  accountList: (state) => {
    let result = []
    for (const key in state.account) {
      // eslint-disable-next-line no-prototype-builtins
      if (state.account.hasOwnProperty(key)) {
        result.push(state.account[key])
      }
    }
    return result
  }
}
const mutations = {
  SAVE_OR_UPDATE(state, { pinId, name, cookie, isLogin, isPlusMember }) {
    const origin = state.account[pinId]
    let params = { pinId, name, cookie, isLogin, isPlusMember }
    params.name = name || origin.name
    params.cookie = cookie || origin.cookie
    if (isLogin === undefined) {
      params.isLogin = origin.isLogin
    }
    if (isPlusMember === undefined) {
      params.isPlusMember = origin.isPlusMember
    }
    Vue.set(state.account, pinId, params)
  },
  REMOVE(state, pinId) {
    Vue.delete(state.account, pinId)
  },
  CLEAR_ALL(state) {
    state.account = {}
  },
  SAVE_ADDRESS_ID(state, address) {
    state.address = address
  },
  SAVE_REMEMBER(state, password) {
    state.password = password
  },
  SAVE_EID_FP(state, { eid, fp }) {
    state.eid = eid
    state.fp = fp
  }
}

const actions = {
  /**
   * 保存账号
   * @param commit
   * @param cookie
   * @param accountType
   * @returns {Promise<void>}
   */
  async saveAccount({ commit }, { cookie, accountType }) {
    const pinId = accountType ? cookie.match(/authId=(.*?);/)[1] : cookie.match(/pinId=(.*?);/)[1]
    const name = accountType ? cookie.match(/nick=(.*?);/)[1] : cookie.match(/unick=(.*?);/)[1]
    let res = { isLogin: false, isPlusMember: false }
    try {
      res = await jd.cookieCheck(cookie)
    } finally {
      commit('SAVE_OR_UPDATE', {
        pinId,
        cookie,
        name: window.decodeURIComponent(name),
        isLogin: res.isLogin,
        isPlusMember: res.isPlusMember
      })
    }
  },
  /**
   * 检查state里边所有账号有效性
   * @param state
   * @param commit
   * @returns {Promise<void>}
   */
  async checkAccountList({ state, commit }) {
    for (const key in state.account) {
      // eslint-disable-next-line no-prototype-builtins
      if (state.account.hasOwnProperty(key)) {
        const account = state.account[key]
        let res = { isLogin: false, isPlusMember: false }
        try {
          res = await jd.cookieCheck(account.cookie)
        } finally {
          commit('SAVE_OR_UPDATE', {
            pinId: key,
            isLogin: res.isLogin,
            isPlusMember: res.isPlusMember
          })
        }
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
