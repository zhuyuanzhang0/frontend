<script setup lang="ts">
import Home from '@/views/home/index.vue'
import Setting from '@/views/setting/index.vue'
import Doc from '@/views/doc/index.vue'
import Assets from '@/views/assets/index.vue'
import Dock from '@/components/dock.vue'

import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
const userInfo = useUserStore()

if (!userInfo.userInfo) {
  let s = 'User' + new Date().getTime()
  userInfo.setUser({
    name: s,
    token: s,
    userAccountId: s,
  })
}

const componentMap = {
  home: Home,
  setting: Setting,
  doc: Doc,
  assets: Assets,
}
const actived = ref<keyof typeof componentMap>('home')
</script>

<template>
  <div class="home">
    <!-- 顶部组件 -->
    <Transition name="fade" mode="out-in">
      <keep-alive>
        <component :is="componentMap[actived]" :key="actived" class="main-con" />
      </keep-alive>
    </Transition>
    <!-- 底部dock -->
    <Dock class="dock" v-model="actived"></Dock>
  </div>
</template>

<style scoped>
.home {
  background: url('@/assets/bg.jpg');
  background-size: 100% 100%;
  backdrop-filter: saturate(1700%);
  height: 100vh;
  width: 100vw;
}
.main-con {
  height: calc(100vh - 100px);
}
.dock {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-wrapper {
  position: relative;
  overflow: hidden;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 10s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
