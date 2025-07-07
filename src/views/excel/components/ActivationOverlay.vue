<template>
  <div class="activation-overlay">
    <div class="activation-content">
      <div class="activation-form">
        <el-input
          v-model="activationCode"
          placeholder="请输入激活码"
          class="activation-input"
        >
          <template #append>
            <el-button type="primary" :loading="loading" @click="handleActivate" class="activation-button">
              激活
            </el-button>
          </template>
        </el-input>
        <div class="purchase-section">
          <h3 class="purchase-title">购买激活码</h3>
          <div class="purchase-method">
            <div class="method-item">
              <div class="method-title">方式一：复制链接购买</div>
              <div class="link-box">
                <span class="link-text">【闲鱼】https://m.tb.cn/h.h65BpPI?tk=ONDh4aqEBix HU108 「我在闲鱼发布了【Excel报表匹配处理系统激活码】」</span>
                <el-button type="primary" link @click="copyLink">复制链接</el-button>
              </div>
              <el-button type="primary" link @click="openLink">点击链接直接打开</el-button>
            </div>
            <div class="method-item">
              <div class="method-title">方式二：扫码购买</div>
              <el-button type="primary" link @click="openQrCode">点击链接扫码购买</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'



const emit = defineEmits<{
  (e: 'activate', code: string): void
}>()

const activationCode = ref('')
const purchaseLink = '【闲鱼】https://m.tb.cn/h.h65BpPI?tk=ONDh4aqEBix HU108 「我在闲鱼发布了【Excel报表匹配处理系统激活码】」'

const handleActivate = () => {
  if (!activationCode.value) {
    ElMessage.warning('请输入激活码')
    return
  }
  emit('activate', activationCode.value)
}

const copyLink = () => {
  navigator.clipboard.writeText(purchaseLink).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const openLink = () => {
  window.open('https://m.tb.cn/h.h65BpPI?tk=ONDh4aqEBix', '_blank')
}

const openQrCode = () => {
  window.open('/src/assets/imgs/buy_key.jpg', '_blank')
}
</script>

<style scoped>
.activation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.activation-content {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.activation-input {
  width: 100%;
}

.activation-button {
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
  color: white !important;
}

.purchase-section {
  margin-top: 32px;
}

.purchase-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #303133;
}

.purchase-method {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.method-item {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.method-title {
  font-weight: bold;
  margin-bottom: 12px;
  color: #303133;
}

.link-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  background-color: white;
  padding: 8px;
  border-radius: 4px;
}

.link-text {
  flex: 1;
  word-break: break-all;
  color: #606266;
  font-size: 14px;
}
</style> 
