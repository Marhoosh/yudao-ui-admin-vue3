<template>
  <div class="match-tool-container">
    <!-- 1. 上传文件 -->
    <el-card class="mb-16px">
      <div class="flex flex-wrap gap-24px">
        <!-- 报表文件上传（多选） -->
        <div class="flex-1 min-w-300px">
          <div class="mb-8px font-bold">上传报表文件（可多选）</div>
          <el-upload
            :file-list="reportFileList"
            :auto-upload="false"
            :multiple="true"
            :show-file-list="true"
            :limit="10"
            :on-remove="handleRemoveReport"
            :before-upload="() => false"
            :on-change="handleReportChange"
            drag
          >
            <el-button type="primary">上传报表文件（可多选）</el-button>
          </el-upload>
        </div>
        <!-- 患者库文件上传（单选） -->
        <div class="flex-1 min-w-300px">
          <div class="mb-8px font-bold">上传患者库文件（仅1个）</div>
          <el-upload
            :file-list="patientFileList"
            :auto-upload="false"
            :multiple="false"
            :show-file-list="true"
            :limit="1"
            :on-remove="handleRemovePatient"
            :before-upload="() => false"
            :on-change="handlePatientChange"
            drag
          >
            <el-button type="primary">上传患者库文件（仅1个）</el-button>
          </el-upload>
        </div>
      </div>
    </el-card>

    <!-- 2. 设置工作表名与列号 -->
    <el-card class="mb-16px">
      <div class="mb-12px font-bold">2. 设置工作表名与列号</div>
      <div class="flex gap-24px mb-12px">
        <div>
          <span>报表工作表名：</span>
          <el-input v-model="unifyReportSheet" placeholder="如Sheet1" size="small" style="width:120px" />
        </div>
        <div>
          <span>报表列号：</span>
          <el-input v-model="unifyReportCol" placeholder="如A" size="small" style="width:60px" />
        </div>
        <div>
          <span>患者库工作表名：</span>
          <el-input v-model="unifyPatientSheet" placeholder="如患者信息" size="small" style="width:120px" />
        </div>
        <div>
          <span>患者库列号：</span>
          <el-input v-model="unifyPatientCol" placeholder="如A" size="small" style="width:60px" />
        </div>
        <el-button type="primary" size="small" @click="applyUnifySetting">应用到全部</el-button>
      </div>
      <el-table :data="fileSettings" border size="small">
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column prop="sheetName" label="工作表名">
          <template #default="{ row }">
            <el-input v-model="row.sheetName" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="col" label="列号" width="80">
          <template #default="{ row }">
            <el-input v-model="row.col" size="small" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 3. 匹配与导出 -->
    <el-card class="mb-16px">
      <div class="flex gap-16px items-center">
        <el-button type="primary" :loading="matching" @click="handleMatch">执行匹配</el-button>
        <el-button type="success" :disabled="!matchResult.length" @click="handleExport">下载结果EXCEL</el-button>
        <el-alert v-if="matchError" type="error" :closable="false" show-icon class="ml-16px">{{ matchError }}</el-alert>
      </div>
    </el-card>

    <!-- 4. 匹配结果预览 -->
    <!-- <el-card>
      <div class="mb-12px font-bold">4. 匹配结果预览</div>
      <el-table :data="matchResult" border size="small">
        <el-table-column prop="reportFile" label="报表文件" />
        <el-table-column prop="patientName" label="患者姓名" />
        <el-table-column prop="status" label="匹配状态">
          <template #default="{ row }">
            <el-tag v-if="row.status === '匹配'" type="success">✔ 匹配</el-tag>
            <el-tag v-else type="danger">✖ 未匹配</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { matchExcel, exportMatchResult } from '@/api/excel'
import { Document } from '@element-plus/icons-vue'

// 文件上传相关
const reportFileList = ref<any[]>([])
const patientFileList = ref<any[]>([])

// 文件参数设置
const tabType = ref<'unify' | 'single'>('unify')
const unifyReportSheet = ref('Sheet1')
const unifyReportCol = ref('A')
const unifyPatientSheet = ref('患者信息')
const unifyPatientCol = ref('A')

// 文件设置表格数据
const fileSettings = ref<any[]>([])

// 匹配结果
const matchResult = ref<any[]>([])
const matching = ref(false)
const matchError = ref('')

// 监听文件变化，自动同步到设置表格
watch([reportFileList, patientFileList], () => {
  const settings: any[] = []
  reportFileList.value.forEach(file => {
    settings.push({
      type: '报表',
      fileName: file.name,
      sheetName: unifyReportSheet.value,
      col: unifyReportCol.value
    })
  })
  patientFileList.value.forEach(file => {
    settings.push({
      type: '患者库',
      fileName: file.name,
      sheetName: unifyPatientSheet.value,
      col: unifyPatientCol.value
    })
  })
  fileSettings.value = settings
}, { immediate: true })

// 应用统一设置到所有文件
function applyUnifySetting() {
  fileSettings.value.forEach(setting => {
    if (setting.type === '报表') {
      setting.sheetName = unifyReportSheet.value
      setting.col = unifyReportCol.value
    } else {
      setting.sheetName = unifyPatientSheet.value
      setting.col = unifyPatientCol.value
    }
  })
  ElMessage.success('已应用统一设置')
}

// 文件上传相关事件
function handleReportChange(file, fileList) {
  reportFileList.value = fileList
}
function handleRemoveReport(file, fileList) {
  reportFileList.value = fileList
}
function handlePatientChange(file, fileList) {
  patientFileList.value = fileList.slice(-1) // 只保留最后一个
}
function handleRemovePatient(file, fileList) {
  patientFileList.value = fileList
}

// 下载文件工具函数
function downloadFile(res, fileName) {
  // 创建Blob对象，设置文件类型
  const blob = new Blob([res], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  // 创建新的URL并指向blob对象
  const url = window.URL.createObjectURL(blob)
  // 创建a标签，设置href属性为blob URL，设置download属性后点击
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName || '匹配结果.xlsx')
  document.body.appendChild(link)
  link.click()
  // 移除a标签
  document.body.removeChild(link)
  // 释放URL对象
  window.URL.revokeObjectURL(url)
}

// 执行匹配
async function handleMatch() {
  if (!reportFileList.value.length || !patientFileList.value.length) {
    ElMessage.error('请上传报表文件和患者库文件')
    return
  }
  // 校验参数填写
  for (const setting of fileSettings.value) {
    if (!setting.sheetName || !setting.col) {
      ElMessage.error('请填写所有文件的工作表名和列号')
      return
    }
  }
  matching.value = true
  matchError.value = ''
  try {
    // 构造FormData
    const formData = new FormData()
    
    // 添加患者库信息
    const patientIdx = fileSettings.value.findIndex(f => f.type === '患者库')
    if (patientIdx !== -1) {
      formData.append('patientFile', patientFileList.value[0].raw)
      formData.append('patientSheetName', fileSettings.value[patientIdx].sheetName)
      formData.append('patientColumnIndex', fileSettings.value[patientIdx].col)
    }
    
    // 添加报表信息
    const reportSettings = fileSettings.value.filter(f => f.type === '报表')
    reportFileList.value.forEach((file, idx) => {
      if (idx < reportSettings.length) {
        formData.append(`reportConfigs[${idx}].reportFile`, file.raw)
        formData.append(`reportConfigs[${idx}].sheetName`, reportSettings[idx].sheetName)
        formData.append(`reportConfigs[${idx}].columnIndex`, reportSettings[idx].col)
      }
    })
    
    // 调用匹配接口
    const res = await matchExcel(formData)
    // 下载返回的Excel文件
    downloadFile(res, '匹配结果.xlsx')
    
    // 显示成功消息
    ElMessage.success('匹配成功，已自动下载结果文件')
    
    // 这里是假数据展示，实际应根据需求调整
    // 如果需要展示匹配结果预览，可能需要额外的API接口获取匹配结果数据
    matchResult.value = reportFileList.value.map((file, index) => ({
      reportFile: file.name,
      patientName: index % 2 === 0 ? `患者${index+1}` : '',
      status: index % 2 === 0 ? '匹配' : '未匹配'
    }))
  } catch (e) {
    console.error('匹配出错', e)
    matchError.value = '匹配失败，请检查参数和文件后重试'
  } finally {
    matching.value = false
  }
}

// 导出结果
async function handleExport() {
  if (!matchResult.value.length) {
    ElMessage.warning('暂无匹配结果可导出')
    return
  }
  
  try {
    // 直接调用匹配API，因为接口本身就返回Excel文件
    // 如果有专门的导出接口，可以改用exportMatchResult
    const formData = new FormData()
    
    // 添加患者库信息
    const patientIdx = fileSettings.value.findIndex(f => f.type === '患者库')
    if (patientIdx !== -1) {
      formData.append('patientFile', patientFileList.value[0].raw)
      formData.append('patientSheetName', fileSettings.value[patientIdx].sheetName)
      formData.append('patientColumnIndex', fileSettings.value[patientIdx].col)
    }
    
    // 添加报表信息
    const reportSettings = fileSettings.value.filter(f => f.type === '报表')
    reportFileList.value.forEach((file, idx) => {
      if (idx < reportSettings.length) {
        formData.append(`reportConfigs[${idx}].reportFile`, file.raw)
        formData.append(`reportConfigs[${idx}].sheetName`, reportSettings[idx].sheetName)
        formData.append(`reportConfigs[${idx}].columnIndex`, reportSettings[idx].col)
      }
    })
    
    const res = await matchExcel(formData)
    downloadFile(res, '匹配结果.xlsx')
    ElMessage.success('导出成功')
  } catch (e) {
    console.error('导出出错', e)
    ElMessage.error('导出失败，请重试')
  }
}
</script>

<style scoped>
.match-tool-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 0;
}
</style>
