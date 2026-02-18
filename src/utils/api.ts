const BASE_URL = 'http://49.233.117.232:9000/kv'
import { useUserStore } from '@/stores/user'
import { generateId } from '@/utils/ulid'
const userInfo = useUserStore()
interface KvSetPayload {
  k: string
  v: any
}

// 保存
export async function kvSet(payload: KvSetPayload) {
  if (!userInfo.userInfo?.userAccountId) {
    alert('请完善用户信息')
    return
  }
  payload.k = userInfo.userInfo.userAccountId + payload.k
  payload.v = JSON.stringify(payload.v)
  const res = await fetch(`${BASE_URL}/set`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('kv set failed')
  }

  return res.json()
}

// 获取
export async function kvGet(k: string, flag: boolean = true) {
  if (!userInfo.userInfo?.userAccountId) {
    alert('请完善用户信息')
    return
  }

  if (flag) {
    k = userInfo.userInfo.userAccountId + k
  }

  const res = await fetch(`${BASE_URL}/get`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ k }),
  })

  if (!res.ok) {
    throw new Error('kv get failed')
  }

  return res.json()
}

export async function uploadFile(file: File) {
  const form = new FormData()
  let i = generateId('file')
  form.append('f', file)
  form.append('k', i)

  const res = await fetch('http://49.233.117.232:9000/save_file', {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    throw new Error('upload failed')
  }

  return await res.json()
}
