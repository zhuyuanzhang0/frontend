<template>
  <div id="search-bar" class="drop">
    <select id="search-engine" v-model="nginx">
      <option value="google">Google</option>
      <option value="bing">Bing</option>
      <option value="baidu">百度</option>
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

<script>
export default {
  name: "SearchBar",
  data() {
    return {
      nginx: "google",
      text: "",
    };
  },
  methods: {
    search() {
      let query = encodeURIComponent(this.text.trim());
      if (!query) return;
      let url = "";
      switch (this.nginx) {
        case "google":
          url = `https://www.google.com/search?q=${query}`;
          break;
        case "bing":
          url = `https://www.bing.com/search?q=${query}`;
          break;
        case "baidu":
          url = `https://www.baidu.com/s?wd=${query}`;
          break;
      }
      window.location.href = url;
    },
  },
};
</script>

<style lang="less" scoped>
#search {
  box-shadow: 0px 2px 8px 0px rgba(60, 64, 67, 0.25);
  border-radius: 40px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  background: rgba(255, 255, 255, 0.2); /* 半透明背景 */
  backdrop-filter: blur(10px); /* 模糊效果 */
  border: 1px solid rgba(255, 255, 255, 0.3); /* 边框 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 阴影 */
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
#search-bar {
  width:90%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}
#search-engine {
  border: none;
  color: #e9edf5 !important;
  cursor: pointer;
  background-color: transparent;
  outline: none;
  padding: 0 10px;
}
#search-text {
  border: none !important;
  background-color: transparent;
  height: 40px;
  color: #e9edf5 !important;
  min-width: 10px;
  padding: 0 10px;
  font-size: 14px;
  flex: 1;
  outline: none;
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
  color: #e9edf5 !important;
  cursor: pointer;
}
</style>
