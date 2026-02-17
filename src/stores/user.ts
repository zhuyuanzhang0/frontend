import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserInfo {
  avatar?: string
  email?: string
  name: string
  token: string
  userAccountId: string | number
  otherData?: any
}

export const useUserStore = defineStore(
  'user',
  () => {
    // ===== state =====
    const userInfo = ref<UserInfo | null>(null)

    // ===== getters =====
    const token = computed(() => userInfo.value?.token || '')
    const isLogin = computed(() => !!userInfo.value?.token)

    // ===== actions =====

    // 登录 / 更新用户信息
    function setUser(data: UserInfo) {
      userInfo.value = data
    }

    // 更新部分字段（真实项目很常用）
    function updateUser(partial: Partial<UserInfo>) {
      if (!userInfo.value) return
      userInfo.value = {
        ...userInfo.value,
        ...partial,
      }
    }

    // 退出登录
    function logout() {
      userInfo.value = null
    }

    return {
      userInfo,
      token,
      isLogin,
      setUser,
      updateUser,
      logout,
    }
  },

  // ===== persistedstate 配置 =====
  {
    persist: {
      key: 'user-store',
      storage: localStorage,
    },
  },
)
