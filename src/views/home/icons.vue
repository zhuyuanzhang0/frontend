<template>
  <div style="position: relative">
    <div class="icons liquid-bg bg" v-if="!showModal">
      <div v-for="item in icons" :key="item.url" class="icon">
        <div class="drop img-con" @click="open(item.url)">
          <img
            :src="item.faviconUrl"
            style="width: 25px; height: 25px; z-index: 9; border-radius: 40px"
          />
        </div>
        <span class="fluent-icons">{{ item.title }}</span>
      </div>
    </div>

    <div class="settings liquid-bg bg" style="max-height: 40vh; overflow: auto" v-else>
      <div v-for="(item, index) in icons" :key="item.url" class="input-line">
        <input type="text" v-model="item.title" class="input" placeholder="Title" />
        <input type="text" v-model="item.url" class="input" placeholder="URL" />
        <input type="text" v-model="item.faviconUrl" class="input" placeholder="Favicon URL" />
        <div class="btns">
          <Icon
            icon="emojione-monotone:up-arrow"
            width="24"
            height="24"
            @click="moveUp(index)"
            class="btn"
          />
          <Icon
            icon="emojione-monotone:down-arrow"
            width="24"
            height="24"
            @click="moveDown(index)"
            class="btn"
          />
          <Icon
            icon="streamline-ultimate:delete-2-bold"
            width="24"
            height="24"
            @click="deleteLink(index)"
            class="btn"
          />
        </div>
      </div>
    </div>

    <Icon
      v-if="!showModal"
      class="modelblack"
      icon="ant-design:setting-filled"
      width="24"
      height="24"
      @click="showModal = true"
    />

    <Icon
      v-if="showModal"
      class="modelblack"
      icon="subway:add"
      width="24"
      height="24"
      style="left: 10px"
      @click="addline"
    />

    <Icon
      v-if="showModal"
      class="modelblack"
      icon="ant-design:setting-filled"
      width="24"
      height="24"
      @click="save"
    />
  </div>

  <!-- <Teleport to="body">
      <Modal v-model="showModal">
        <template #header>
          <h3>修改链接</h3>
        </template>
        <template #body>
          <div style="max-height: 40vh; overflow: auto">
            <div v-for="(item, index) in icons" :key="item.url" class="input-line">
              <input type="text" v-model="item.title" class="input" placeholder="Title" />
              <input type="text" v-model="item.url" class="input" placeholder="URL" />
              <input
                type="text"
                v-model="item.faviconUrl"
                class="input"
                placeholder="Favicon URL"
              />
              <div @click="moveUp(index)" class="btn">↑</div>
              <div @click="moveDown(index)" class="btn">↓</div>
              <div @click="deleteLink(index)" class="delete-btn">-</div>
            </div>
          </div>
        </template>
      </Modal>
    </Teleport> -->
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user'
const showModal = ref(false)

const userInfo = useUserStore()
const icons = ref([])

let l = localStorage.getItem('index-link')
if (l) {
  icons.value = JSON.parse(l)
}
async function fetchdata() {
  if (!userInfo.userInfo.userAccountId) {
    alert('请完善用户信息')
    return
  }
  const response = await fetch('http://49.233.117.232:9000/kv/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ k: userInfo.userInfo.userAccountId + '-index-link' }),
  })
  if (response.ok) {
    const data = await response.json()
    icons.value = JSON.parse(data.v)
    localStorage.setItem('index-link', data.v)
  }
}
fetchdata()

function open(searchUrl) {
  window.location.href = searchUrl
}
function save() {
  if (!userInfo.userInfo.userAccountId) {
    alert('请完善用户信息')
    return
  }
  localStorage.setItem('index-link', JSON.stringify(icons.value))

  fetch('http://49.233.117.232:9000/kv/set', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      k: userInfo.userInfo.userAccountId + '-index-link',
      v: JSON.stringify(icons.value),
    }),
  })
  showModal.value = false
}
function addline() {
  icons.value.push({
    title: '',
    url: '',
    faviconUrl: '',
  })
}
//     addLink() {
//       icons.value.push({ title: "", url: "", faviconUrl: "" });
//     },
function deleteLink(index) {
  icons.value.splice(index, 1)
}

function moveUp(index) {
  if (index > 0) {
    let item = icons.value.splice(index, 1)[0]
    icons.value.splice(index - 1, 0, item)
  }
}
function moveDown(index) {
  if (index < icons.value.length - 1) {
    let item = icons.value.splice(index, 1)[0]
    icons.value.splice(index + 1, 0, item)
  }
}
</script>

<style scoped>
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
}
.bg {
  height: 40vh;
  overflow: auto;
}
.modelblack {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  cursor: pointer;
  justify-content: center;
  color: white;
}
.btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.btn {
  cursor: pointer;
  color: rgb(52 124 244);
}
.icons {
  display: grid;
  margin: 0 auto;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  width: 100%;
  gap: 10px 0px;
  padding: 20px 0;
  justify-items: center;
  align-items: start;
  background: hsla(0, 0%, 100%, 0.5);
  position: relative;
}
.settings {
  margin: 0 auto;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  width: 100%;
  gap: 10px 0px;
  padding: 20px 0;
  justify-items: center;
  align-items: start;
  position: relative;
  background: hsla(0, 0%, 100%, 0.5);
}
.input-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  margin-bottom: 10px;
  gap: 10px;
}
.input {
  padding: 5px;
  border-radius: 0px;
  border: none;
  background: transparent;
  border-bottom: 2px solid white;
  width: 100%;
  transition: 0.45s;
}
.input:focus {
  outline: none;
  border-bottom: 2px solid rgb(52 124 244);
  background: white;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
.img-con {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: hsla(0, 0%, 100%, 0.5);
}
.icon {
  width: 75%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
}
.fluent-icons {
  font-size: 13px;
  text-align: center;
  color: white;
}
.fluent-icons {
  position: relative;
  color: white;
  z-index: 1;
}

.fluent-icons::before {
  content: '';
  position: absolute;
  inset: 0px -8px;
  background: rgba(0, 0, 0, 0.4);
  filter: blur(8px);
  z-index: -1;
  border-radius: 8px;
}
</style>
