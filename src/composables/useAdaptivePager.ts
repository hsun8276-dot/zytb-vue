import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 按窗口高度计算列表页大小: 可用高度 ≈ innerHeight - chrome(页头/统计卡/筛选等固定区域),
 * 每条约 item px, 夹在 [min, max]
 */
export function adaptivePageSize(chrome = 460, item = 160, min = 3, max = 15): number {
  const h = typeof window !== 'undefined' ? window.innerHeight : 900
  return Math.min(max, Math.max(min, Math.floor((h - chrome) / item)))
}

/**
 * 窗口高度自适应分页: resize 时自动重算页大小并回调(用户手动选过页大小后不再自适应)
 */
export function useAdaptivePager(
  onAdapt: (size: number) => void,
  opts: { chrome?: number; item?: number; min?: number; max?: number } = {}
) {
  const pageSize = ref(adaptivePageSize(opts.chrome, opts.item, opts.min, opts.max))
  let userSet = false

  const onResize = () => {
    if (userSet) return
    const next = adaptivePageSize(opts.chrome, opts.item, opts.min, opts.max)
    if (next !== pageSize.value) {
      pageSize.value = next
      onAdapt(next)
    }
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  return {
    pageSize,
    /** 用户在分页器里手动选了页大小后调用, 之后不再随窗口变化 */
    markUserSet: () => { userSet = true }
  }
}
