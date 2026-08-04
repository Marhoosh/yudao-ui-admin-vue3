<template>
  <div class="match-tool-container">
    <!-- 激活码信息展示区 -->
    <el-card v-if="userKey && userKey.status === 1" class="mb-16px key-info-card">
      <div class="key-info-content">
        <div class="key-info-item">
          <span class="key-label">激活码：</span>
          <span class="key-value">{{ userKey.number }}</span>
        </div>
        <div class="key-info-item">
          <span class="key-label">过期时间：</span>
          <span class="key-value expire-date">{{ formatExpireTime(userKey.expireTime) }}</span>
        </div>
        <div class="key-info-item">
          <span class="key-label">状态：</span>
          <span class="key-status-badge success">有效</span>
        </div>
      </div>
    </el-card>

    <ActivationOverlay
      v-if="showActivation"
      :user-key="userKey"
    />
    <!-- 1. 上传文件 -->
    <el-card class="mb-16px">
      <div class="flex flex-wrap gap-24px">
        <!-- 数据表文件上传（多选） -->
        <div class="flex-1 min-w-300px">
          <div class="mb-8px font-bold">上传数据表文件（可多选）</div>
          <el-upload
            :file-list="dataTableFileList"
            :auto-upload="false"
            :multiple="true"
            :show-file-list="true"
            :limit="100"
            :on-remove="handleRemoveDataTable"
            :before-upload="() => false"
            :on-change="handleDataTableChange"
            drag
          >
            <el-button type="primary">上传数据表文件（可多选）</el-button>
          </el-upload>
        </div>
        <!-- 匹配表文件上传（单选） -->
        <div class="flex-1 min-w-300px">
          <div class="mb-8px font-bold">上传匹配表文件（仅1个）</div>
          <el-upload
            :file-list="matchTableFileList"
            :auto-upload="false"
            :multiple="false"
            :show-file-list="true"
            :limit="1"
            :on-remove="handleRemoveMatchTable"
            :before-upload="() => false"
            :on-change="handleMatchTableChange"
            drag
          >
            <el-button type="primary">上传匹配表文件（仅1个）</el-button>
          </el-upload>
        </div>
      </div>
    </el-card>

    <!-- 2. 设置工作表名与列号 -->
    <el-card class="mb-16px">
      <div class="mb-12px font-bold">2. 设置工作表名与列号</div>
      <div class="flex gap-24px mb-12px">
        <div>
          <span>数据表工作表名：</span>
          <el-input v-model="unifiedDataTableSheetName" placeholder="如Sheet1" size="small" style="width:120px" />
        </div>
        <div>
          <span>数据表列号：</span>
          <el-select v-model="unifiedDataTableColumn" placeholder="选择列号" size="small" style="width:80px">
            <el-option v-for="letter in letters" :key="letter" :label="letter" :value="letter" />
          </el-select>
        </div>
        <div>
          <span>匹配表工作表名：</span>
          <el-input v-model="unifiedMatchTableSheetName" placeholder="如Sheet1" size="small" style="width:120px" />
        </div>
        <div>
          <span>匹配表列号：</span>
          <el-select v-model="unifiedMatchTableColumn" placeholder="选择列号" size="small" style="width:80px">
            <el-option v-for="letter in letters" :key="letter" :label="letter" :value="letter" />
          </el-select>
        </div>
        <el-button type="primary" size="small" @click="applyUnifySetting">应用到全部</el-button>
      </div>
      <!-- 模糊匹配配置 -->
      <div class="mb-12px">
        <el-tooltip
          content="开启模糊匹配，只要数据表中包含匹配表中的文字，就能匹配成功。关闭此功能，则需匹配文字完全一致，方能匹配成功。"
          placement="top"
        >
          <span class="fuzzy-match-control">
            <el-checkbox v-model="isFuzzyMatch" size="default" class="fuzzy-match-checkbox">
              模糊匹配
            </el-checkbox>
            <el-icon class="fuzzy-match-help-icon"><QuestionFilled /></el-icon>
          </span>
        </el-tooltip>
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
        <el-alert v-if="loading" type="info" :closable="false" show-icon class="ml-16px">正在匹配中，请稍等...</el-alert>
        <el-alert v-else-if="matchError" type="error" :closable="false" show-icon class="ml-16px">{{ matchError }}</el-alert>
      </div>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import { matchExcel } from '@/api/excel'
import download from '@/utils/download'
import { KeyApi, KeyStatusEnum } from '@/api/system/key/index'
import type { KeyVO } from '@/api/system/key/index'
import ActivationOverlay from './components/ActivationOverlay.vue'
import { formatDate } from '@/utils/formatTime'

// 文件上传相关
const dataTableFileList = ref<any[]>([])
const matchTableFileList = ref<any[]>([])

// 激活码相关
const showActivation = ref(false)
const userKey = ref<KeyVO | null>(null)

// 检查激活码
const checkUserKey = async () => {
  try {
    const res = await KeyApi.getCurrentUserKey()
    userKey.value = res
    if (res?.status === KeyStatusEnum.ACTIVE) {
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

// 格式化过期时间
const formatExpireTime = (expireTime: string | null) => {
  if (!expireTime) return '永久有效'
  return formatDate(new Date(expireTime))
}

onMounted(checkUserKey)

// 获取当天日期字符串，格式为 yyyy-MM-dd，个位数不补零
function getTodayStr() {
  const now = new Date();
  const month = now.getMonth() + 1;  // 月份从0开始，所以要加1
  const day = now.getDate();

  return `${month}.${day}`;
}

// 文件参数设置
const unifiedDataTableSheetName = ref(getTodayStr())
const unifiedDataTableColumn = ref('C')
const unifiedMatchTableSheetName = ref('Sheet1')
const unifiedMatchTableColumn = ref('A')

// 列号选项（A-Z的大写字母）
const letters = ref([
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
])

// 文件设置表格数据
const fileSettings = ref<any[]>([])

// 模糊匹配配置
const isFuzzyMatch = ref(true)

// 匹配结果
const matchError = ref('')
// 加载状态
const loading = ref(false)

// 监听文件变化，自动同步到设置表格
watch([dataTableFileList, matchTableFileList], () => {
  const settings: any[] = []
  dataTableFileList.value.forEach(file => {
    settings.push({
      type: '数据表',
      fileName: file.name,
      sheetName: unifiedDataTableSheetName.value,
      col: unifiedDataTableColumn.value
    })
  })
  matchTableFileList.value.forEach(file => {
    settings.push({
      type: '匹配表',
      fileName: file.name,
      sheetName: unifiedMatchTableSheetName.value,
      col: unifiedMatchTableColumn.value
    })
  })
  fileSettings.value = settings
}, { immediate: true })

// 应用统一设置到所有文件
function applyUnifySetting() {
  fileSettings.value.forEach(setting => {
    if (setting.type === '数据表') {
      setting.sheetName = unifiedDataTableSheetName.value
      setting.col = unifiedDataTableColumn.value
    } else {
      setting.sheetName = unifiedMatchTableSheetName.value
      setting.col = unifiedMatchTableColumn.value
    }
  })
  ElMessage.success('已应用统一设置')
}

// 文件上传相关事件
function handleDataTableChange(file, fileList) {
  dataTableFileList.value = fileList
}
function handleRemoveDataTable(file, fileList) {
  dataTableFileList.value = fileList
}
function handleMatchTableChange(file, fileList) {
  matchTableFileList.value = fileList.slice(-1) // 只保留最后一个
}
function handleRemoveMatchTable(file, fileList) {
  matchTableFileList.value = fileList
}

// 执行匹配
async function handleMatch() {
  if (!dataTableFileList.value.length || !matchTableFileList.value.length) {
    ElMessage.error('请上传数据表文件和匹配表文件')
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
    
    // 后端接口仍使用原有字段名，此处仅替换前端展示术语。
    const matchTableSettingIndex = fileSettings.value.findIndex(f => f.type === '匹配表')
    if (matchTableSettingIndex !== -1) {
      formData.append('patientFile', matchTableFileList.value[0].raw)
      formData.append('patientSheetName', fileSettings.value[matchTableSettingIndex].sheetName)
      formData.append('patientColumnIndex', fileSettings.value[matchTableSettingIndex].col)
    }
    
    // 添加模糊匹配参数
    formData.append('isFuzzyMatch', isFuzzyMatch.value.toString())
    
    // 添加数据表信息
    const dataTableSettings = fileSettings.value.filter(f => f.type === '数据表')
    dataTableFileList.value.forEach((file, idx) => {
      if (idx < dataTableSettings.length) {
        formData.append(`reportConfigs[${idx}].reportFile`, file.raw)
        formData.append(`reportConfigs[${idx}].sheetName`, dataTableSettings[idx].sheetName)
        formData.append(`reportConfigs[${idx}].columnIndex`, dataTableSettings[idx].col)
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
    matchError.value = '匹配失败'
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

.key-info-card {
  margin-bottom: 16px;
}

.key-info-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.key-info-item {
  display: flex;
  align-items: center;
}

.key-label {
  font-weight: bold;
  margin-right: 8px;
  color: #606266;
}

.key-value {
  color: #303133;
}

.key-value.expire-date {
  color: #f56c6c;
}

.key-status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.key-status-badge.success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.key-status-badge.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.key-status-badge.error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

/* 模糊匹配勾选框样式 */
.fuzzy-match-control {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.fuzzy-match-checkbox {
  font-size: 14px;
}

.fuzzy-match-checkbox :deep(.el-checkbox__input) {
  transform: scale(1.2);
}

.fuzzy-match-checkbox :deep(.el-checkbox__label) {
  font-size: 14px;
  font-weight: 500;
}

.fuzzy-match-help-icon {
  color: #909399;
  font-size: 14px;
  cursor: help;
}
</style>
