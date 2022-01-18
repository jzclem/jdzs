import Vue from 'vue'

const jd = window.preload.jd
import message from 'ant-design-vue/es/message'

const state = {
  /**
   * 任务列表
   * @property account
   * @property skuId
   * @property taskType
   * @property isSetTime
   * @property startTime
   * @property buyNum
   * @property advanceTime
   * @property buyInfo
   */
  task: {}
}
const getters = {
  taskList: (state) => {
    let result = []
    for (const key in state.task) {
      // eslint-disable-next-line no-prototype-builtins
      if (state.task.hasOwnProperty(key)) {
        result.push(state.task[key])
      }
    }
    return result
  }
}
const mutations = {
  SAVE_OR_UPDATE(state, { skuId, taskType, isSetTime, startTime, buyNum, detail, advanceTime, account }) {
    const origin = state.task[skuId]
    let params = {}
    params.skuId = skuId || origin.skuId
    params.taskType = taskType || origin.taskType
    params.buyNum = buyNum || origin.buyNum
    params.detail = detail || origin.detail
    params.advanceTime = advanceTime || origin.advanceTime
    params.account = account || origin.account
    params.isSetTime = isSetTime || origin.isSetTime
    if (params.isSetTime) {
      params.startTime = startTime || origin.startTime
    }
    Vue.set(state.task, skuId, params)
  },
  REMOVE(state, skuId) {
    Vue.delete(state.task, skuId)
  },
  CLEAR_ALL(state) {
    state.task = {}
  }
}

const actions = {
  /**
   * 添加任务
   * @param commit
   * @param skuId
   * @param taskType
   * @param isSetTime
   * @param startTime
   * @param buyNum
   * @param advanceTime
   * @param account
   * @param form
   * @returns {Promise<void>}
   */
  async addTask({ commit }, { skuId, taskType, isSetTime, startTime, buyNum, advanceTime, account }) {
    let detail = false
    while (!detail) {
      message.warning('正在请求接口...')
      detail = await jd.getItemInfo(skuId)
    }
    message.success('请求接口成功！')
    commit('SAVE_OR_UPDATE', {
      skuId,
      taskType,
      isSetTime,
      startTime,
      buyNum,
      advanceTime,
      account,
      detail
    })
  },
  /**
   * 更新商品信息
   * @param state
   * @param commit
   * @returns {Promise<void>}
   */
  async checkTaskList({ state, commit }) {
    for (const key in state.task) {
      // eslint-disable-next-line no-prototype-builtins
      if (state.task.hasOwnProperty(key)) {
        let detail = false
        while (!detail) {
          message.warning('正在请求接口...')
          detail = await jd.getItemInfo(key)
        }
        message.success('请求接口成功！')
        commit('SAVE_OR_UPDATE', {
          skuId: key,
          detail
        })
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
