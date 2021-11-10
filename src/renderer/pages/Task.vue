<template>
  <div>
    <a-form ref="form" :model="formParams" layout="inline">
      <a-form-item>
        <a-button type="primary" @click="showAddTask">添加任务</a-button>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="stopAll">停止所有任务</a-button>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="updateMes">更新商品信息</a-button>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="updateAreaId">获取区域ID</a-button>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="howToGet">获取eid与fp</a-button>
      </a-form-item>
      <a-form-item label="区域ID">
        <a-input style="width: 170px" v-model="formParams.areaId" placeholder="区域id" />
      </a-form-item>
      <a-form-item label="eid">
        <a-input style="width: 170px" v-model="formParams.eid" placeholder="账号eid值" />
      </a-form-item>
      <a-form-item label="fp">
        <a-input style="width: 170px" v-model="formParams.fp" placeholder="账号fp值" />
      </a-form-item>
      <a-form-item label="支付密码">
        <a-input type="password" style="width: 120px" v-model="formParams.password" placeholder="支付密码" />
      </a-form-item>
    </a-form>
    <a-list item-layout="horizontal" :data-source="taskList">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-list-item-meta :description="`定时：${formatDate(item.startTime)} , 购买数量：${item.buyNum}`">
          <a slot="title">{{ item.detail.name }}</a>
          <a-avatar slot="avatar" :src="`http:${item.detail.imageSrc}`" />
        </a-list-item-meta>
        <a-button
          v-if="isTaskRunning(item.skuId)"
          type="link"
          size="small"
          slot="actions"
          @click="stopTaskBySku(item.skuId)"
        >
          停止
        </a-button>
        <a-button v-else type="link" size="small" slot="actions" @click="createOrders(item)">
          开抢
        </a-button>
        <a-button type="link" size="small" slot="actions" @click="deleteTask(item.skuId)">删除</a-button>
      </a-list-item>
    </a-list>
    <AddTask ref="addTask" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import AddTask from './modal/AddTask'
// import log from 'electron-log'
const jd = window.preload.jd

export default {
  name: 'Task',
  components: {
    AddTask
  },
  data() {
    return {
      timers: [],
      formParams: {
        areaId: this.$store.state.user.address,
        eid: this.$store.state.user.eid,
        fp: this.$store.state.user.fp,
        password: ''
      }
    }
  },
  computed: {
    ...mapGetters('user', ['accountList']),
    ...mapGetters('task', ['taskList'])
  },
  methods: {
    howToGet() {
      this.$confirm({
        title: '将以下代码在结算页控制台运行',
        content:
          "var eid = $('#eid').val();\n" + "var fp = $('#fp').val();\n" + 'console.log(`eid = ${eid}\\nfp = ${fp}`);',
        okText: '好的',
        cancelText: '取消'
      })
    },
    updateMes() {
      this.$store.dispatch('task/checkTaskList')
    },
    updateAreaId() {
      let that = this
      this.$confirm({
        title: '提示',
        content: '请确保购物车中留有商品',
        okText: '好的',
        cancelText: '取消',
        async onOk() {
          const data = await jd.getBuyInfo(that.accountList[0].cookie)
          that.formParams.areaId = data
          that.$store.commit('user/SAVE_ADDRESS_ID', data)
        }
      })
    },
    showAddTask() {
      this.$refs.addTask.show()
    },
    async createOrders({ skuId, buyNum, isSetTime, startTime }) {
      if (!this.formParams.password) {
        this.$notification.open({ message: '请输入支付密码', description: '', placement: 'bottomRight' })
        return
      }
      let StockState = await jd.getStocks(skuId, this.formParams.areaId)
      if (StockState) {
        this.$notification.open({
          message: '检测到该地区有货，开始抢购',
          description: '该商品是预约抢购商品，需要自行加入到购物车，并确保购物车里不含其他可提交商品',
          placement: 'bottomRight'
        })
        // 所有账号都加入抢购
        this.accountList.map((account) => {
          let task = setInterval(() => {
            if (!isSetTime || (isSetTime && +Date.now() >= +new Date(startTime))) {
              this.createOrder(account, skuId, buyNum)
              return
            }
            this.$message.info(`账号${account.name}抢购中，还未到抢购时间`)
          }, 1000)
          this.timers.push({
            pinId: account.pinId,
            skuId,
            task
          })
        })
      } else {
        this.$notification.open({
          message: '检测到该地区无货',
          description: '检测到该地区无货,停止抢购',
          placement: 'bottomRight'
        })
      }
    },
    async createOrder(account, skuId, buyNum) {
      this.stopTaskBySku(skuId)
      await jd.addGoodsToCart(account.cookie, skuId, buyNum) // 加入购物车
      let { eid, fp, password } = this.formParams
      this.$store.commit('user/SAVE_EID_FP', { eid, fp })
      const submitResult = await jd.orderSubmit(account.cookie, password.split('').join('u3'), eid, fp)
      if (submitResult && submitResult.success) {
        this.$notification.open({
          message: `恭喜,账号「${account.name}」已抢到`,
          description: '此账号不再参与本轮抢购~',
          placement: 'bottomRight'
        })
      } else if (submitResult && submitResult.resultCode === 600158) {
        this.$notification.open({
          message: `商品库存已空，无法继续抢购`,
          description: '已清除当前任务相关的定时器',
          placement: 'bottomRight'
        })
      } else if (submitResult && submitResult.message.indexOf('支付密码不正确') > -1) {
        this.$notification.open({
          message: `支付密码不正确`,
          description: '已清除当前任务相关的定时器',
          placement: 'bottomRight'
        })
      } else {
        this.$message.info(submitResult.message)
      }
    },
    stopAll() {
      this.timers.map((timer) => {
        clearInterval(timer.task)
      })
      this.timers = []
    },
    stopTaskByAccount(pinId, skuId) {
      this.timers = this.timers.filter((timer) => {
        if (timer.pinId === pinId && timer.skuId === skuId) {
          clearInterval(timer.task)
          return false
        }
        return true
      })
    },
    stopTaskBySku(skuId) {
      this.timers = this.timers.filter((timer) => {
        if (timer.skuId === skuId) {
          clearInterval(timer.task)
          return false
        }
        return true
      })
    },
    deleteTask(skuId) {
      this.stopTaskBySku(skuId)
      this.$store.commit('task/REMOVE', skuId)
    },
    clearAll() {
      this.$store.commit('task/CLEAR_ALL')
    },
    formatDate(value) {
      if (!value) {
        return '-'
      }
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    },
    isTaskRunning(skuId) {
      return this.timers.some((timer) => timer.skuId === skuId)
    }
  },
  destroyed() {
    this.stopAll()
    this.$message.info('定时器已全部清空')
  }
}
</script>
