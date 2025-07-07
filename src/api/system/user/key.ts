import request from '@/config/axios'

export interface KeyVO {
  id: number
  number: string
  validDays: number | null
  status: number
  useTime: string
  expireTime: string | null
  userId: number
  createTime: number
  updateTime: number
}

// 获取指定用户编号的激活码
export const getUserKeyByUserId = (userId: number) => {
  return request.get({ url: '/system/key/get-by-user-id', params: { userId } })
}

// 激活码验证接口
export const activateKey = (keyNumber: string) => {
  return request.post({
    url: '/system/key/activate',
    params: { keyNumber }
  })
} 
