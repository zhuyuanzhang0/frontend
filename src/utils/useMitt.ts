// useMitt.ts
import emitter from '@/utils/mitt'
import { onUnmounted } from 'vue'

export function useMitt() {
  const on = (event: any, handler: any) => {
    emitter.on(event, handler)
    onUnmounted(() => emitter.off(event, handler))
  }

  return {
    emit: emitter.emit,
    on,
  }
}
