<template>
  <div>
    <a-button type="primary" @click="login">
      添加账号
    </a-button>
    <a-button type="primary" class="mg-l10" @click="clear">
      清空账号
    </a-button>
    <a-select class="mg-l10" v-model="accountType">
      <a-select-option :value="0">京东</a-select-option>
      <!--      <a-select-option :value="1">苏宁</a-select-option>-->
    </a-select>
    <a-table :columns="columns" :data-source="accountList" class="mg-t10" rowKey="pinId">
      <span slot="isLogin" slot-scope="text, record">
        <a-tag v-if="record.isLogin" color="green">已登录</a-tag>
        <a-tag v-else color="red">未登录</a-tag>
      </span>
      <span slot="isPlusMember" slot-scope="text, record">
        {{ record.isPlusMember ? '是' : '否' }}
      </span>
      <span slot="action" slot-scope="text, record">
        <a type="link" @click="deleteAccount(record)">删除</a>
        <a-divider type="vertical" />
        <a type="link" @click="clearAccountCart(record)">清空购物车</a>
      </span>
    </a-table>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
const { BrowserWindow } = require('electron').remote
const jd = window.preload.jd
export default {
  name: 'account',
  components: {},
  props: {},
  data() {
    return {
      columns: [
        {
          title: '账号',
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: '登录状态',
          dataIndex: 'isLogin',
          key: 'isLogin',
          scopedSlots: { customRender: 'isLogin' }
        },
        {
          title: 'plus会员',
          dataIndex: 'isPlusMember',
          key: 'isPlusMember',
          scopedSlots: { customRender: 'isPlusMember' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          key: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      accountType: 0
    }
  },
  computed: {
    ...mapGetters('user', ['accountList'])
  },
  activated() {
    this.$store.dispatch('user/checkAccountList')
  },
  methods: {
    clearAccountCart(row) {
      jd.clearCart(row.cookie)
    },
    login() {
      const loginWin = new BrowserWindow({
        width: 1024,
        height: 768
      })
      let loadURL = this.accountType
        ? 'https://passport.suning.com/ids/login'
        : 'https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F'
      let domain = this.accountType ? 'suning' : 'jd'
      loginWin.loadURL(loadURL)
      loginWin.webContents.on('did-navigate', (event, url) => {
        if (url !== `https://www.${domain}.com/`) return
        loginWin.webContents.session.cookies
          .get({ domain: `.${domain}.com` })
          .then((cookies) => {
            const cookieStr = cookies.reduce((str, cookie) => {
              const { name, value } = cookie
              str += `${name}=${value};`
              return str
            }, '')
            loginWin.destroy()
            this.$store.dispatch('user/saveAccount', { cookie: cookieStr, accountType: this.accountType })
            this.$message.success('账号已添加！')
          })
          .catch(() => {
            this.$message.error('获取Cookie失败！')
          })
      })
    },
    clear() {
      this.$store.commit('user/CLEAR_ALL')
    },
    deleteAccount(row) {
      this.$store.commit('user/REMOVE', row.pinId)
    }
  }
}
</script>
