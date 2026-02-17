<script setup>
import { ref } from 'vue'
const nginx = ref('google')
const text = ref('')
function search() {
  let query = encodeURIComponent(text.value.trim())
  if (!query) return
  let url = ''
  switch (nginx.value) {
    case 'google':
      url = `https://www.google.com/search?q=${query}`
      break
    case 'bing':
      url = `https://www.bing.com/search?q=${query}`
      break
    case 'baidu':
      url = `https://www.baidu.com/s?wd=${query}`
      break
  }
  window.location.href = url
}
</script>

<template>
  <div id="search-bar" class="liquid-bg" style="background: hsla(0, 0%, 100%, 0.5); padding: 0">
    <select id="search-engine" v-model="nginx">
      <option value="google" class="search-option">Google</option>
      <option value="bing" class="search-option">Bing</option>
      <option value="baidu" class="search-option">百度</option>
    </select>
    <input
      id="search-text"
      type="text"
      v-model="text"
      autocomplete="off"
      @keydown.enter.prevent="search()"
    />
    <button id="search-button" @click="search()">
      <!-- 搜索图标（SVG） -->
      <svg
        class="icon-search"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
        <line
          x1="16.65"
          y1="16.65"
          x2="21"
          y2="21"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>
<style scoped>
#search-bar {
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}
.search-option {
  color: black;
}
#search-engine {
  border: none;
  color: white !important;
  cursor: pointer;
  background-color: transparent;
  outline: none;
  padding: 0 10px;
}
#search-text {
  border: none !important;
  background-color: transparent;
  height: 40px;
  color: #000000 !important;
  min-width: 10px;
  padding: 0 10px;
  font-size: 14px;
  flex: 1;
  outline: none;
  font-size: 1em;
}
#search-button {
  cursor: pointer;
  border: none;
  background-color: transparent;
  height: 40px;
  width: 40px;
  /* background: rgb(0, 120, 212); */
  border-top-right-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-right-radius: 40px;
}
.icon-search {
  color: white !important;
  cursor: pointer;
}
</style>
