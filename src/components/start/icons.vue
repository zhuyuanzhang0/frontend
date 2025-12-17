<template>
  <div class="icon-con drop">
    <div class="setting drop" @click="showSetting">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15px"
        height="15px"
        viewBox="0 0 1024 1024"
      >
        <path
          fill="#e9e9e9"
          d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357.12 357.12 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a351.616 351.616 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357.12 357.12 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294.113 294.113 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293.12 293.12 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294.113 294.113 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288.282 288.282 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293.12 293.12 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a287.616 287.616 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384zm0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256z"
        />
      </svg>
    </div>
    <div
      v-for="item in link"
      :key="item.url"
      style="
        width: 75%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      "
    >
      <div
        class="drop"
        style="
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        "
        @click="open(item.url)"
      >
        <img
          :src="item.faviconUrl"
          style="width: 25px; height: 25px; z-index: 9; border-radius: 40px"
        />
      </div>
      <span class="fluent-icons">{{ item.title }}</span>
    </div>
    <div class="modelblack" v-append-to-body="show" v-show="show"></div>

    <div id="dialog" v-append-to-body="show" v-show="show">
      <div style="position: relative; z-index: 1; padding: 20px">
        <div style="max-height: 40vh; overflow: auto">
          <div v-for="(item, index) in link" :key="index" class="input-line">
            <input
              type="text"
              v-model="item.title"
              class="input"
              placeholder="Title"
            />
            <input
              type="text"
              v-model="item.url"
              class="input"
              placeholder="URL"
            />
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
        <div style="text-align: center; margin-top: 10px">
          <div @click="addline" class="btn">+</div>
          <input type="text" v-model="name" class="input" />
          <div @click="fetchdata" class="btn">获取</div>
          <div @click="save" class="btn">保存</div>
          <div @click="show = false" class="btn">关闭</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      name: "",
      link: [
        {
          title: "Home",
          url: "/",
          faviconUrl:
            "https://cdn.jsdelivr.net/gh/microsoft/vscode-codicons/dist/codicon/home-outline.svg",
        },
        {
          title: "Github",
          url: "https://github.com/",
        },
      ],
    };
  },
  mounted() {
    let l = localStorage.getItem("index-link");
    if (l) {
      this.link = JSON.parse(l);
    } else {
      localStorage.setItem("index-link", JSON.stringify(this.link));
    }
  },
  methods: {
    open(searchUrl) {
      window.location.href = searchUrl;
    },
    async fetchdata() {
      if (!this.name) {
        alert("请输入名称");
        return;
      }
      const response = await fetch("http://49.233.117.232:9000/kv/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ k: this.name + "-index-link" }),
      });
      if (response.ok) {
        const data = await response.json();
        this.link = JSON.parse(data.v);
        localStorage.setItem("index-link", JSON.stringify(this.link));
        alert("成功");
      } else {
        alert("失败");
      }
    },
    save() {
      if (!this.name) {
        alert("请输入名称");
        return;
      }
      fetch("http://49.233.117.232:9000/kv/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          k: this.name + "-index-link",
          v: JSON.stringify(this.link),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          localStorage.setItem("index-link", JSON.stringify(this.link));
          alert("保存成功");
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("保存失败");
        });
    },
    addline() {
      this.link.push({
        title: "",
        url: "",
        faviconUrl: "",
      });
    },

    showSetting() {
      this.show = true;
    },
    deleteLink(index) {
      this.link.splice(index, 1);
    },
    addLink() {
      this.link.push({ title: "", url: "", faviconUrl: "" });
    },
    moveUp(index) {
      if (index > 0) {
        let item = this.link.splice(index, 1)[0];
        this.link.splice(index - 1, 0, item);
      }
    },
    moveDown(index) {
      if (index < this.link.length - 1) {
        let item = this.link.splice(index, 1)[0];
        this.link.splice(index + 1, 0, item);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.icon-con {
  display: grid;
  margin: 0 auto;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  width: 90%;
  gap: 10px 0px;
  padding: 20px 0;
  justify-items: center;
  align-items: start;
  position: relative;
}

.setting {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  cursor: pointer;
  justify-content: center;
}

#dialog {
  position: fixed;
  top: 15vh;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.28);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  backdrop-filter: blur(20px) saturate(150%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 24px 60px rgba(0, 0, 0, 0.45);
  overflow: clip;
  border-radius: 32px;
  height: 50vh;
  width: 60%;
  transform: translateX(-50%);
  left: 50%;
  z-index: 11;
  color: #e9edf5 !important;
}
#dialog::before {
  content: "";
  position: absolute;
  inset: -10%;
  background: radial-gradient(
      180px 140px at 20% 30%,
      rgba(255, 255, 255, 0.25),
      transparent 60%
    ),
    radial-gradient(
      220px 160px at 80% 40%,
      rgba(255, 255, 255, 0.18),
      transparent 65%
    ),
    radial-gradient(
      320px 200px at 40% 85%,
      rgba(255, 255, 255, 0.12),
      transparent 70%
    );
  filter: blur(18px) saturate(140%);
  animation: drift 12s ease-in-out infinite alternate;
  pointer-events: none;
}
#dialog::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    110deg,
    rgba(255, 255, 255, 0.28) 0%,
    rgba(255, 255, 255, 0) 40% 60%,
    rgba(255, 255, 255, 0.16) 100%
  );
  mix-blend-mode: screen;
  pointer-events: none;
}
.input {
  outline: none;
}
.input-line {
  display: flex;
  align-items: center;
  margin: 5px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.input {
  flex: 1;
  margin: 0 5px;
  padding: 5px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #e9edf5;
  outline: none;
}
.delete-btn {
  cursor: pointer;
  padding: 5px 10px;
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #e9edf5;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.btn {
  display: inline-block;
  margin: 0 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  color: #e9edf5;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.modelblack {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.8);
}
.fluent-icons{
  font-size: 13px;
  text-align: center;
}
</style>
