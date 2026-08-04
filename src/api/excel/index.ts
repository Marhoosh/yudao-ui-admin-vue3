import request from '@/config/axios'

/**
 * Excel 数据表与匹配表匹配
 * @param data FormData 格式的数据，包含匹配表和数据表文件
 * @returns 返回匹配结果Excel文件
 */

export const matchExcel = async (data: FormData) => {
  return await request.upload({
    url: `/excel/match`,
    data,
    responseType: 'blob' // 关键点
  })
}
