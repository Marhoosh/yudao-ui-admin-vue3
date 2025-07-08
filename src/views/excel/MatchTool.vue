<template>
  <div class="match-tool-container">
    <ActivationOverlay
      v-if="showActivation"
      :loading="activating"
      :user-key="userKey"
      @activate="handleActivate"
    />
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
          <el-select v-model="unifyReportCol" placeholder="选择列号" size="small" style="width:80px">
            <el-option v-for="letter in letters" :key="letter" :label="letter" :value="letter" />
          </el-select>
        </div>
        <div>
          <span>患者库工作表名：</span>
          <el-input v-model="unifyPatientSheet" placeholder="如患者信息" size="small" style="width:120px" />
        </div>
        <div>
          <span>患者库列号：</span>
          <el-select v-model="unifyPatientCol" placeholder="选择列号" size="small" style="width:80px">
            <el-option v-for="letter in letters" :key="letter" :label="letter" :value="letter" />
          </el-select>
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
        <el-table-column prop="col" label="列号" width="100">
          <template #default="{ row }">
            <el-select v-model="row.col" size="small" style="width:80px">
              <el-option v-for="letter in letters" :key="letter" :label="letter" :value="letter" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 3. 匹配与导出 -->
    <el-card class="mb-16px">
      <div class="flex gap-16px items-center">
        <el-button type="primary" :loading="loading" @click="handleMatch">执行匹配</el-button>
        <el-alert v-if="loading" type="info" :closable="false" show-icon class="ml-16px">服务器正在匹配中，请稍等...</el-alert>
        <el-alert v-else-if="matchError" type="error" :closable="false" show-icon class="ml-16px">{{ matchError }}</el-alert>
      </div>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { matchExcel } from '@/api/excel'
import download from '@/utils/download'
import { useUserStore } from '@/store/modules/user'
import { getUserKeyByUserId, activateKey, KeyVO } from '@/api/system/user/key'
import ActivationOverlay from './components/ActivationOverlay.vue'

// 文件上传相关
const reportFileList = ref<any[]>([])
const patientFileList = ref<any[]>([])

// 激活码相关
const userStore = useUserStore()
const showActivation = ref(false)
const activating = ref(false)
const userKey = ref<KeyVO | null>(null)

// 检查激活码
const checkUserKey = async () => {
  try {
    const res = await getUserKeyByUserId(userStore.getUser.id)
    userKey.value = res
    if (res && res.status === 1) {
      showActivation.value = false
      return true
    } else {
      showActivation.value = true
      return false
    }
  } catch (error) {
    console.error('检查激活状态失败:', error)
    showActivation.value = true
    return false
  }
}

// 处理激活码激活
const handleActivate = async (code: string) => {
  activating.value = true
  try {
    const res = await activateKey(code)
    ElMessage.success('激活成功')
    userKey.value = res
    showActivation.value = false
  } catch (error) {
  } finally {
    activating.value = false
  }
}

onMounted(() => {
  checkUserKey()
})

// 获取当天日期字符串，格式为 yyyy-MM-dd，个位数不补零
function getTodayStr() {
  const now = new Date();
  const month = now.getMonth() + 1;  // 月份从0开始，所以要加1
  const day = now.getDate();

  return `${month}.${day}`;
}

// 文件参数设置
const unifyReportSheet = ref(getTodayStr())
const unifyReportCol = ref('C')
const unifyPatientSheet = ref('Sheet1')
const unifyPatientCol = ref('A')

// 列号选项（A-Z的大写字母）
const letters = ref([
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
])

// 文件设置表格数据
const fileSettings = ref<any[]>([])

// 匹配结果
const matchError = ref('')
// 加载状态
const loading = ref(false)

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
  matchError.value = ''
  loading.value = true
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
    
    // 生成带日期时间的文件名
    const now = new Date()
    const dateStr = now.getFullYear() +
                   (now.getMonth() + 1).toString().padStart(2, '0') +
                   now.getDate().toString().padStart(2, '0') +
                   now.getHours().toString().padStart(2, '0') +
                   now.getMinutes().toString().padStart(2, '0') +
                   now.getSeconds().toString().padStart(2, '0')
    const fileName = `匹配结果${dateStr}.xlsx`
    
    download.excel(res, fileName)

    ElMessage.success('匹配成功，已自动下载结果文件')

  } catch (e) {
    console.error('匹配出错', e)
    matchError.value = '匹配失败，请检查工作表名称和列号是否正确'
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.match-tool-container {
  position: relative;
  height: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 0;
}
</style>
