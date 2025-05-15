import request from '@/config/axios'

/**
 * Excel报表与患者库匹配
 * @param data FormData格式的数据，包含患者库和报表文件
 * @returns 返回匹配结果Excel文件
 */
export const matchExcel = (data: FormData) => {
  return request.post({ url: '/excel/match', data, responseType: 'blob' })
}

/**
 * 下载匹配结果Excel文件
 * @param params 参数
 * @returns 返回Excel文件
 */
export const exportMatchResult = (params: any) => {
  return request.download({
    url: '/excel/match/export',
    params
  })
} 