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
    reportFileList.value.forEach((file, idx) => {
      formData.append('reportFiles', file.raw)
      formData.append(`reportSheetNames`, fileSettings.value[idx].sheetName)
      formData.append(`reportCols`, fileSettings.value[idx].col)
    })
    const patientIdx = fileSettings.value.findIndex(f => f.type === '患者库')
    formData.append('patientFile', patientFileList.value[0].raw)
    formData.append('patientSheetName', fileSettings.value[patientIdx].sheetName)
    formData.append('patientCol', fileSettings.value[patientIdx].col)
    // TODO: 替换为实际后端接口
    // const res = await api.matchExcel(formData)
    // matchResult.value = res.data
    // mock数据
    matchResult.value = [
      { reportFile: reportFileList.value[0].name, patientName: '张三', status: '匹配' },
      { reportFile: reportFileList.value[1]?.name || '', patientName: '李四', status: '未匹配' }
    ]
    ElMessage.success('匹配完成')
  } catch (e) {
    matchError.value = '匹配失败，请重试'
  } finally {
    matching.value = false
  }
}

// 导出结果
function handleExport() {
  // TODO: 调用后端导出接口
  ElMessage.info('导出功能待接入后端')
}
</script>

<style scoped>
.match-tool-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 0;
}
</style>
