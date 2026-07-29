import request from '@/config/axios'

/**
 * 激活码状态。
 */
export enum KeyStatusEnum {
  UNUSED = 0,
  ACTIVE = 1,
  EXPIRED = 2
}

/**
 * 激活码支付套餐编码。
 */
export enum KeyPaymentPackageCodeEnum {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

/**
 * 激活码支付订单状态。
 */
export enum KeyPaymentOrderStatusEnum {
  WAITING_PAYMENT = 0,
  PAID = 10,
  CLOSED = 20,
  FAILED = 30
}

/**
 * 激活码支付套餐展示信息。
 *
 * 金额仅用于前端展示，实际下单金额和有效天数始终以后端套餐配置为准。
 */
export interface KeyPaymentPackageVO {
  code: KeyPaymentPackageCodeEnum
  name: string
  validDays: number
  originalAmountFen: number
  amountFen: number
  monthlyEquivalentAmountFen: number
  badge?: string
}

export const KEY_PAYMENT_PACKAGES: readonly KeyPaymentPackageVO[] = [
  {
    code: KeyPaymentPackageCodeEnum.MONTHLY,
    name: '月卡',
    validDays: 30,
    originalAmountFen: 3_000,
    amountFen: 2_800,
    monthlyEquivalentAmountFen: 2_800
  },
  {
    code: KeyPaymentPackageCodeEnum.QUARTERLY,
    name: '季卡',
    validDays: 90,
    originalAmountFen: 9_000,
    amountFen: 6_800,
    monthlyEquivalentAmountFen: 2_200,
    badge: '最多人选择'
  },
  {
    code: KeyPaymentPackageCodeEnum.YEARLY,
    name: '年卡',
    validDays: 365,
    originalAmountFen: 36_000,
    amountFen: 21_800,
    monthlyEquivalentAmountFen: 1_800
  }
]

// 激活码 VO
export interface KeyVO {
  id: number // 卡主键
  number: string // 卡号
  validDays: number | null // 卡的天数
  status: KeyStatusEnum // 卡的状态
  useTime: string | null // 使用时间
  expireTime: string | null // 过期时间
  userId: number | null // 用户id
  createTime?: number // 创建时间
  updateTime?: number // 更新时间
}

/**
 * 创建激活码支付订单请求。
 */
export interface KeyPaymentOrderCreateReqVO {
  packageCode: KeyPaymentPackageCodeEnum
}

/**
 * 激活码支付订单。
 */
export interface KeyPaymentOrderVO {
  merchantOrderNo: string
  packageCode: KeyPaymentPackageCodeEnum
  validDays: number
  amountFen: number
  status: KeyPaymentOrderStatusEnum
  payUrl: string | null
  payExpireTime: string | null
  paidTime: string | null
  keyNumber: string | null
  keyExpireTime: string | null
}

// 激活码 API
export const KeyApi = {
  // 查询激活码分页
  getKeyPage: async (params: any) => {
    return await request.get({ url: `/system/key/page`, params })
  },

  // 查询激活码详情
  getKey: async (id: number) => {
    return await request.get({ url: `/system/key/get?id=` + id })
  },

  // 新增激活码
  createKey: async (data: KeyVO) => {
    return await request.post({ url: `/system/key/create`, data })
  },

  // 修改激活码
  updateKey: async (data: KeyVO) => {
    return await request.put({ url: `/system/key/update`, data })
  },

  // 删除激活码
  deleteKey: async (id: number) => {
    return await request.delete({ url: `/system/key/delete?id=` + id })
  },

  // 导出激活码 Excel
  exportKey: async (params) => {
    return await request.download({ url: `/system/key/export-excel`, params })
  },

  // 获取当前登录用户的激活码
  getCurrentUserKey: async () => {
    return await request.get<KeyVO | null>({ url: '/system/key/get-current-user-key' })
  },

  // 激活码验证接口
  activateKey: async (keyNumber: string) => {
    return await request.post<KeyVO>({ url: '/system/key/activate', params: { keyNumber } })
  },

  // 创建激活码支付订单
  createPaymentOrder: async (packageCode: KeyPaymentPackageCodeEnum) => {
    const data: KeyPaymentOrderCreateReqVO = { packageCode }
    return await request.post<KeyPaymentOrderVO>({
      url: '/system/key/payment/order/create',
      data
    })
  }
}
