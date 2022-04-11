<template>
  <a-modal title="添加商品" :visible="visible" @ok="hide" @cancel="hide">
    <a-list item-layout="horizontal" :data-source="miaoShaList">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-list-item-meta
          :description="
            `编号：${item.spuId} ,
             价格：￥${item.miaoShaPrice} ,
             ${item.specificationLabel}`
          "
        >
          <a slot="title">{{ item.shortWname }}</a>
          <a-avatar slot="avatar" :src="`http:${item.imageurl}`" />
        </a-list-item-meta>
        <a-button type="link" size="small" slot="actions" @click="select(item.spuId)">
          选择
        </a-button>
      </a-list-item>
    </a-list>
  </a-modal>
</template>
<script>
import { mapGetters } from 'vuex'
const jd = window.preload.jd
export default {
  name: 'AddGoods',
  data() {
    return {
      visible: false,
      gid: '',
      miaoShaList: []
    }
  },
  computed: {
    ...mapGetters('user', ['accountList'])
  },
  methods: {
    select(skuId) {
      this.$emit('select', skuId)
      this.hide()
    },
    start(time) {
      this.getList(time).then(async () => {
        let data = await this.getList()
        this.miaoShaList = data.miaoShaList.filter((i) => i.tagText === '超级秒杀')
      })
    },
    getList(time) {
      return new Promise((resolve) => {
        jd.pcMiaoShaAreaList(this.accountList[0].cookie, this.gid).then((data) => {
          let all = JSON.parse(data.slice(18, data.length - 2))
          if (time) this.gid = `{"gid":${all.groups.filter((i) => i.displayTime === time)[0].gid}}`
          resolve(all)
        })
      })
    },
    show() {
      this.visible = true
    },
    hide() {
      this.visible = false
    }
  }
}
</script>
