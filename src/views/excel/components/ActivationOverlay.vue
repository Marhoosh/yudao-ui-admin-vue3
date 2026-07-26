<template>
  <div class="activation-overlay">
    <div class="activation-content">
      <div class="activation-form">
        <!-- 激活码过期时间显示 -->
        <div v-if="userKey && userKey.status === 1" class="key-info">
          <div class="key-status success">
            <i class="el-icon-check"></i> 激活码有效
          </div>
          <div class="key-expire">
            过期时间：{{ formatExpireTime(userKey.expireTime) }}
          </div>
        </div>
        <div v-else-if="userKey && userKey.status === 0" class="key-info">
          <div class="key-status warning">
            <i class="el-icon-warning"></i> 激活码未激活
          </div>
        </div>
        <div v-else-if="userKey && userKey.status === 2" class="key-info">
          <div class="key-status error">
            <i class="el-icon-close"></i> 激活码已过期
          </div>
          <div class="key-expire">
            过期时间：{{ formatExpireTime(userKey.expireTime) }}
          </div>
        </div>
        
        <div v-if="!hasActiveKey" class="purchase-section">
          <h3 class="purchase-title">请选择激活码套餐</h3>
          <div class="package-list">
            <button
              v-for="paymentPackage in KEY_PAYMENT_PACKAGES"
              :key="paymentPackage.code"
              type="button"
              class="package-card"
              :class="{ selected: selectedPackageCode === paymentPackage.code }"
              @click="selectedPackageCode = paymentPackage.code"
            >
              <span class="package-name">{{ paymentPackage.name }}</span>
              <span class="package-days">{{ paymentPackage.validDays }} 天</span>
              <span class="package-price">¥{{ formatAmount(paymentPackage.amountFen) }}</span>
            </button>
          </div>
          <el-alert
            v-if="purchaseError"
            :title="purchaseError"
            type="error"
            :closable="false"
            show-icon
            class="purchase-error"
          />
          <el-button
            type="primary"
            class="purchase-button"
            :loading="creatingOrder"
            @click="handlePurchase"
          >
            立即支付
          </el-button>
          <div class="payment-tip">
            <div>若已完成支付，请刷新页面。</div>
            <div>有问题请联系微信号：workTech168</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  KEY_PAYMENT_PACKAGES,
  KeyApi,
  KeyPaymentPackageCodeEnum,
  KeyStatusEnum
} from '@/api/system/key/index'
import type { KeyVO } from '@/api/system/key/index'
import { formatDate } from '@/utils/formatTime'

const props = defineProps<{
  userKey?: KeyVO | null
}>()

const selectedPackageCode = ref(KeyPaymentPackageCodeEnum.MONTHLY)
const creatingOrder = ref(false)
const purchaseError = ref('')
const hasActiveKey = computed(() => props.userKey?.status === KeyStatusEnum.ACTIVE)

const handlePurchase = async () => {
  purchaseError.value = ''
  creatingOrder.value = true
  try {
    const paymentOrder = await KeyApi.createPaymentOrder(selectedPackageCode.value)
    if (!paymentOrder.payUrl) {
      throw new Error('支付平台未返回有效的支付地址')
    }
    const paymentUrl = new URL(paymentOrder.payUrl, window.location.origin)
    if (!['http:', 'https:'].includes(paymentUrl.protocol)) {
      throw new Error('支付平台返回的支付地址无效')
    }
    const paymentWindow = window.open(paymentUrl.href, '_blank', 'noopener,noreferrer')

  } catch (error) {
    purchaseError.value = error instanceof Error ? error.message : '创建支付订单失败，请稍后重试'
  } finally {
    creatingOrder.value = false
  }
}

const formatAmount = (amountFen: number) => (amountFen / 100).toFixed(2).replace(/\.00$/, '')

// 格式化过期时间
const formatExpireTime = (expireTime: string | null) => {
  if (!expireTime) return '永久有效'
  return formatDate(new Date(expireTime))
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
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.key-info {
  margin-top: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.key-status {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.key-status.success {
  color: #67c23a;
}

.key-status.warning {
  color: #e6a23c;
}

.key-status.error {
  color: #f56c6c;
}

.key-expire {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
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

.package-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.package-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 10px;
  color: #303133;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.package-card:hover,
.package-card.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-7);
}

.package-name {
  font-size: 16px;
  font-weight: 600;
}

.package-days {
  font-size: 13px;
  color: #909399;
}

.package-price {
  font-size: 22px;
  font-weight: 700;
  color: #f56c6c;
}

.purchase-error,
.purchase-button {
  margin-top: 16px;
}

.purchase-button {
  width: 100%;
}

.payment-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

@media screen and (max-width: 768px) {
  .activation-content {
    width: 95%;
    padding: 24px;
    max-height: 95vh;
  }

  .purchase-section {
    margin-top: 24px;
  }

  .purchase-title {
    font-size: 14px;
  }

}

@media screen and (max-width: 480px) {
  .activation-content {
    width: 98%;
    padding: 16px;
  }

  .key-info {
    padding: 8px;
  }

  .purchase-section {
    margin-top: 16px;
  }

  .purchase-title {
    font-size: 13px;
  }

  .package-list {
    grid-template-columns: 1fr;
  }
}
</style> 
