import request from '@/config/axios'

// 激活码 VO
export interface KeyVO {
  id: number // 卡主键
  number: string // 卡号
  validDays: number | null // 卡的天数
  status: number // 卡的状态(0-未使用，1-正在使用，2-已过期）
  useTime: Date // 使用时间
  expireTime: Date | null // 过期时间
  userId: number // 用户id
  createTime?: number // 创建时间
  updateTime?: number // 更新时间
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

  // 获取指定用户编号的激活码
  getUserKeyByUserId: async (userId: number) => {
    return await request.get({ url: '/system/key/get-by-user-id', params: { userId } })
  },

  // 激活码验证接口
  activateKey: async (keyNumber: string) => {
    return await request.post({ url: '/system/key/activate', params: { keyNumber } })
  }
}
