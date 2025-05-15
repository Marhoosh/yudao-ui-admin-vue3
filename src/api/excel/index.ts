import request from '@/config/axios'

/**
 * Excel报表与患者库匹配
 * @param data FormData格式的数据，包含患者库和报表文件
 * @returns 返回匹配结果Excel文件
 */
// export const matchExcel = (data: FormData) => {
//   return request.postOriginal({
//     url: '/excel/match',
//     data,
//     responseType: 'blob',
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   })
// }

export const matchExcel = async (data: FormData) => {
  return await request.upload({
    url: `/excel/match`,
    data,
    responseType: 'blob' // 关键点
  })
}

