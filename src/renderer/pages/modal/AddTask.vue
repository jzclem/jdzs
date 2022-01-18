<template>
  <a-modal title="添加任务" :visible="visible" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="handleCancel">
    <a-form-model ref="form" :model="formParams" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="formRules">
      <a-form-model-item label="选择账号">
        <a-select v-model="formParams.account">
          <a-select-option value="all">所有账号</a-select-option>
          <a-select-option v-for="item in accountList" :key="item.pinId" :value="item.name">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="定时">
        <a-switch v-model="formParams.isSetTime" />
      </a-form-model-item>
      <a-form-model-item v-if="formParams.isSetTime" label="抢购时间">
        <a-date-picker
          v-model="formParams.startTime"
          show-time
          type="date"
          placeholder="选择抢购时间"
          style="width: 100%;"
        />
      </a-form-model-item>
      <a-form-model-item label="抢购提前">
        <a-select v-model="formParams.advanceTime">
          <a-select-option v-for="(item, index) in selectArr" :key="index" :value="item">{{ item }}ms</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="商品ID" prop="skuId">
        <a-input v-model="formParams.skuId" @keyup.enter="handleOk" />
      </a-form-model-item>
      <a-form-model-item label="购买数量">
        <a-input-number :min="1" v-model="formParams.buyNum" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
<script>
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
export default {
  name: 'AddTask',
  data() {
    return {
      visible: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      selectArr: [50, 100, 200, 300, 500, 750, 1000],
      formParams: {
        account: 'all',
        taskType: 1,
        isSetTime: true,
        advanceTime: 100,
        startTime: '2021-11-11 10:00:00',
        skuId: '',
        buyNum: 1
      },
      formRules: {
        // taskType: [{ required: true, message: '必填' }],
        skuId: [{ required: true, message: '必填' }]
      },
      timeArr: ['08', '10', '12', '14', '16', '18', '20', '22'],
      confirmLoading: false
    }
  },
  created() {
    for (let i = 0; i < this.timeArr.length; i++) {
      let str = `${dayjs().format('YYYY-MM-DD')} ${this.timeArr[i]}:00:00`
      if (dayjs().valueOf() - dayjs(str).valueOf() < 0) {
        this.formParams.startTime = str
        break
      }
    }
  },
  computed: {
    ...mapGetters('user', ['accountList'])
  },
  methods: {
    handleOk() {
      this.confirmLoading = true
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$store.dispatch('task/addTask', this.formParams)
          this.$message.success('任务正在添加！')
          this.handleCancel()
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.$refs.form.resetFields()
      this.hide()
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
