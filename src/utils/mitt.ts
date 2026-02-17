// src/utils/mitt.ts
import mitt from 'mitt'

type Events = {
  'open-modal': string
  'refresh-list': void
}

const emitter = mitt<Events>()

export default emitter
