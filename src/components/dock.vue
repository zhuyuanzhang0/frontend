<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'

const tabs = [
  { key: 'home', label: '首页', icon: 'material-symbols:home-rounded' },
  { key: 'doc', label: '文档', icon: 'lets-icons:file-dock-fill' },
  { key: 'assets', label: '资产', icon: 'clarity:resource-pool-solid-badged' },
  //   { key: 'calendar', label: '日历', icon: 'tabler:calendar-filled' },
  //   { key: 'resume', label: '简历', icon: 'mdi:resume' },
  { key: 'setting', label: '设置', icon: 'ant-design:setting-filled' },
  //   { key: 'profile', label: '账户', icon: 'iconamoon:profile-fill' },
]

const activeItem = defineModel()
// const activeIndex = computed(() => tabs.findIndex((t) => t.key === activeItem.value))
const route = useRoute()
const activeIndex = computed(() => {
  return tabs.findIndex((t) => t.key === String(route.name))
})

watch(
  () => route.name,
  (name) => {
    activeItem.value = String(name)
  },
  { immediate: true },
)

const isUserEdit = ref(false)
const userInfo = useUserStore()
const editUserInfo = reactive(JSON.parse(JSON.stringify(userInfo.userInfo || {})))
const router = useRouter()
function goto(key: string) {
  router.push({ name: key })
}
watch(isUserEdit, () => {
  if (!isUserEdit.value) {
    userInfo.updateUser(editUserInfo)
  }
})
const doc = document.body
</script>

<template>
  <div>
    <div class="dock-con liquid-bg">
      <div
        v-for="tab in tabs"
        class="dock-btn"
        :class="{
          active: activeItem == tab.key,
        }"
        @click="goto(tab.key)"
      >
        <Icon :icon="tab.icon" width="24" height="24" />
        <p style="font-size: 0.5em">{{ tab.label }}</p>
      </div>

      <div
        class="active-bg"
        :style="{
          transform: `translateX(${activeIndex * 80}px)`,
        }"
      />
    </div>

    <div class="dock-con liquid-bg user-bg">
      <tippy
        trigger="click"
        :hide-on-click="true"
        :interactive="true"
        placement="top"
        :append-to="() => doc"
      >
        <div class="dock-btn">
          <Icon icon="iconamoon:profile-fill" width="24" height="24" />
          <p style="font-size: 0.5em">账户</p>
        </div>

        <template #content>
          <div class="user-card liquid-bg">
            <div class="header">
              <span>{{ isUserEdit ? '编辑资料' : '个人信息' }}</span>
              <button class="edit-btn" @click="isUserEdit = !isUserEdit">
                {{ isUserEdit ? '保存' : '编辑' }}
              </button>
            </div>

            <div class="body">
              <img
                v-if="userInfo.userInfo?.avatar"
                :src="userInfo.userInfo?.avatar"
                class="avatar"
              />

              <Icon v-else icon="dinkie-icons:apple-filled" class="avatar" />
              {{ userInfo.userInfo?.avatar }}
              <div v-if="!isUserEdit" class="name">
                {{ userInfo.userInfo?.name }}
              </div>

              <div v-else>
                <div class="name-input-row" style="margin-bottom: 10px">
                  <span>呢称:</span>
                  <input v-model="editUserInfo.name" class="name-input" />
                </div>
                <div class="name-input-row">
                  <span>ID:</span>

                  <input v-model="editUserInfo.userAccountId" class="name-input" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </tippy>
    </div>
  </div>
</template>
<style scoped>
/* 会移动的背景 */
.active-bg {
  position: absolute;
  left: 5px;
  top: 5px;
  width: 80px;
  height: 50px;
  border-radius: 32px;

  background: hsla(0, 0%, 100%, 0.5);
  border: 1px solid hsla(0, 0%, 100%, 0.28);
  /* backdrop-filter: blur(20px) saturate(150%); */
  box-shadow:
    inset 0 1px 0 hsla(0, 0%, 100%, 0.25),
    2px 5px 20px rgba(0, 0, 0, 0.1);

  /* transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1); */
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 0;
}

.dock-con {
  display: flex;
  align-items: center;
  justify-content: center;
  height: max-content;
  /* gap: 50px; */
  width: max-content;
  padding: 5px;
  border-radius: 50px;
}
.dock-btn {
  height: 50px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  cursor: pointer;
  color: #e9edf5;
  flex-direction: column;
}
.active {
  color: rgb(52 124 244);
  z-index: 1;
}

.user-bg {
  width: 50px;
  height: 50px;
  margin-left: 50px;
}

.user-card {
  width: 220px;
  min-height: 30vh;
  padding: 12px;
  background: hsla(0, 0%, 100%, 0.5);
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
}

.edit-btn {
  border: none;
  background: transparent;
  color: #409eff;
  cursor: pointer;
}

.body {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-direction: column;
  gap: 40px;
}

.avatar {
  width: 50%;
  flex: 1;
  border-radius: 50%;
}

.name {
  font-size: 14px;
}

.name-input {
  flex: 1;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.name-input-row:first {
  margin-bottom: 10px;
}
.name-input-row {
  width: 100%;
  display: flex;
  align-items: center;
}
.name-input-row span {
  width: 3em;
  font-size: 12px;
}
.name-input {
  padding: 5px;
  border-radius: 0px;
  border: none;
  background: transparent;
  border-bottom: 2px solid white;
  transition: 0.45s;
  flex: 1;
}
.name-input:focus {
  outline: none;
  border-bottom: 2px solid rgb(52 124 244);
  background: white;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
</style>
