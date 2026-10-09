<template>
  <div>
    <h2 class="page-title">系统配置</h2>

    <el-card shadow="never" v-loading="loading">
      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="仅允许修改已有配置项。开通/续费年数、默认密码会直接影响用户管理开通账号行为。"
        style="margin-bottom:18px"
      />

      <el-form label-width="140px" style="max-width:640px">
        <el-form-item
          v-for="item in items"
          :key="item.configKey"
          :label="labelOf(item.configKey)"
        >
          <el-input
            v-if="item.configKey === 'membership_years'"
            v-model="form[item.configKey]"
            type="number"
            :min="1"
            :max="10"
            style="width:200px"
          />
          <el-input
            v-else-if="item.configKey === 'contact_hint'"
            v-model="form[item.configKey]"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
          />
          <el-input
            v-else
            v-model="form[item.configKey]"
            maxlength="100"
            show-word-limit
          />
          <div class="field-hint">{{ item.remark || item.configKey }}</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">保存</el-button>
          <el-button @click="load">重新加载</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminConfigList, saveAdminConfig } from '@/api/admin'
import type { SysConfigItem } from '@/api/admin'

const LABELS: Record<string, string> = {
  system_name: '系统名称',
  membership_years: '开通/续费年数',
  default_password: '默认初始密码',
  contact_hint: '忘记密码提示'
}

const loading = ref(false)
const saving = ref(false)
const items = ref<SysConfigItem[]>([])
const form = reactive<Record<string, string>>({})

function labelOf(key: string) {
  return LABELS[key] || key
}

async function load() {
  loading.value = true
  try {
    const list = await getAdminConfigList()
    items.value = list || []
    for (const k of Object.keys(form)) delete form[k]
    for (const it of items.value) {
      form[it.configKey] = it.configValue ?? ''
    }
  } catch (e: any) {
    ElMessage.error(e.message || '加载配置失败')
  } finally {
    loading.value = false
  }
}

async function save() {
  const years = Number(form.membership_years)
  if (!Number.isInteger(years) || years < 1 || years > 10) {
    ElMessage.warning('开通/续费年数须为 1~10 的整数')
    return
  }
  if (!(form.system_name || '').trim()) {
    ElMessage.warning('系统名称不能为空')
    return
  }
  saving.value = true
  try {
    const body: Record<string, string> = {}
    for (const it of items.value) {
      body[it.configKey] = (form[it.configKey] ?? '').trim()
    }
    await saveAdminConfig(body)
    ElMessage.success('已保存')
    await load()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.page-title {
  font-size: 20px;
  margin-bottom: 16px;
}

.field-hint {
  width: 100%;
  color: #999;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
