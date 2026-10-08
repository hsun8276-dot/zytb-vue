import { reactive } from 'vue'

export type NotifyType = 'success' | 'danger' | 'warning' | 'info' | 'primary'

interface NotifyItem {
  id: number
  message: string
  title: string
  type: NotifyType
}

interface SwalButton { text: string; className: string }

interface SwalState {
  visible: boolean
  title: string
  text: string
  icon: 'warning' | ''
  confirm: SwalButton
  cancel: SwalButton | null
  resolve: ((ok: boolean) => void) | null
}

const state = reactive({
  notifies: [] as NotifyItem[],
  loading: false,
  loadingText: '',
  swal: {
    visible: false,
    title: '',
    text: '',
    icon: 'warning',
    confirm: { text: 'OK', className: 'btn btn-success' },
    cancel: null,
    resolve: null
  } as SwalState
})

let seq = 0

/** bootstrap-notify: 右下角, delay=0 不自动关闭 */
function notify(message: unknown, title: string, type: NotifyType, delay: number) {
  const id = ++seq
  const text = message instanceof Error ? message.message : String(message ?? '')
  state.notifies.push({ id, message: text, title, type })
  if (delay > 0) setTimeout(() => closeNotify(id), delay)
}

function closeNotify(id: number) {
  const i = state.notifies.findIndex(n => n.id === id)
  if (i >= 0) state.notifies.splice(i, 1)
}

/** sweetalert: 确认/取消, 返回是否确认 */
function confirm(title: string, text: string, opts?: { confirmText?: string; cancelText?: string }) {
  return openSwal(title, text, { text: opts?.confirmText ?? '确认', className: 'btn btn-success' },
    { text: opts?.cancelText ?? '取消', className: 'btn btn-danger' })
}

/** sweetalert: 仅提示 */
function alert(title: string, text: string, className = 'btn btn-warning') {
  return openSwal(title, text, { text: 'OK', className }, null)
}

function openSwal(title: string, text: string, ok: SwalButton, cancel: SwalButton | null) {
  return new Promise<boolean>(resolve => {
    Object.assign(state.swal, { visible: true, title, text, icon: 'warning', confirm: ok, cancel, resolve })
  })
}

function closeSwal(ok: boolean) {
  const r = state.swal.resolve
  state.swal.visible = false
  state.swal.resolve = null
  r?.(ok)
}

/** jquery-loading-overlay */
function showLoading(text = '正在检索数据，请等待...') {
  state.loadingText = text
  state.loading = true
}

function hideLoading() {
  state.loading = false
}

export function useGx() {
  return { state, notify, closeNotify, confirm, alert, closeSwal, showLoading, hideLoading }
}
