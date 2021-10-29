<template>
  <div>
    <a-button type="primary" @click="test">Test</a-button>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import log from 'electron-log'
const jd = window.preload.jd

export default {
  name: 'Test',
  data() {
    return {}
  },
  computed: {
    ...mapGetters('user', ['accountList'])
  },
  created() {},
  methods: {
    async test() {
      try {
        const data = await jd.getBuyInfo(this.accountList[0].cookie, 100017784106, 1)
        // const data = await jd.getStocks('100017784106', '19_1601_50283_62864')
        log.info(data)
      } catch (error) {
        log.info(error)
      }
    }
  }
}
</script>
