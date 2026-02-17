<template>
  <div class="LeftMenu_con_box">
    <template>
      <div class="LeftMenu_con">
                <div class="title">AI</div>

        <div
          class="item"
          v-for="item in AiMenuItems"
          :key="item.key"
          @click="handleLeftItemClick(item)"
        >
          <img
            :src="require('@/assets/img/' + item.img)"
            style="width: 16px; margin-right: 9px; margin-left: 1px"
          />
          <div class="name">{{ item.name }}</div>
          <div class="space">#</div>
        </div>
        <div v-show="click_type">
          <div class="title">{{ zdh ? zdh.t1 : "" }}</div>

          <div
            class="item"
            @click="
              handleLeftItemClick({
                key: 'tableInsrert',
                l: left_col,
                type: 1,
              })
            "
          >
            <i class="iconfont icon-zuochalie"> </i>
            <div class="name">
              {{ zdh ? zdh.t2 : ""
              }}<input
                v-model="left_col"
                @input="handleInput"
                @keydown.enter="
                  handleLeftItemClick({
                    key: 'tableInsrert',
                    l: left_col,
                    type: 1,
                  })
                "
                @click.stop
              />{{ zdh ? zdh.t3 : "" }}
            </div>
            <div class="space">#</div>
          </div>
          <div
            class="item"
            @click="
              handleLeftItemClick({
                key: 'tableInsrert',
                l: right_col,
                type: 2,
              })
            "
          >
            <i class="iconfont icon-youchalie"> </i>
            <div class="name">
              {{ zdh ? zdh.t4 : ""
              }}<input
                v-model="right_col"
                @input="handleInput"
                @keydown.enter="
                  handleLeftItemClick({
                    key: 'tableInsrert',
                    l: right_col,
                    type: 2,
                  })
                "
                @click.stop
              />{{ zdh ? zdh.t5 : "" }}
            </div>
            <div class="space">#</div>
          </div>
          <div
            class="item"
            @click="
              handleLeftItemClick({
                key: 'tableInsrert',
                l: top_row,
                type: 3,
              })
            "
          >
            <i class="iconfont icon-shangchahang"> </i>
            <div class="name">
              {{ zdh ? zdh.t6 : ""
              }}<input
                v-model="top_row"
                @input="handleInput"
                @keydown.enter="
                  handleLeftItemClick({
                    key: 'tableInsrert',
                    l: top_row,
                    type: 3,
                  })
                "
                @click.stop
              />{{ zdh ? zdh.t7 : "" }}
            </div>
            <div class="space">#</div>
          </div>
          <div
            class="item"
            @click="
              handleLeftItemClick({
                key: 'tableInsrert',
                l: bottom_row,
                type: 4,
              })
            "
          >
            <i class="iconfont icon-xiachahang"> </i>
            <div class="name">
              {{ zdh ? zdh.t8 : ""
              }}<input
                v-model="bottom_row"
                @input="handleInput"
                @keydown.enter="
                  handleLeftItemClick({
                    key: 'tableInsrert',
                    l: bottom_row,
                    type: 4,
                  })
                "
                @click.stop
              />{{ zdh ? zdh.t9 : "" }}
            </div>
            <div class="space">#</div>
          </div>

          <div
            v-for="item in tableMenuItems"
            :key="item.key"
            class="item"
            @click="handleLeftItemClick(item)"
          >
            <i class="iconfont" :class="item.icon"></i>
            <div class="name">{{ item.name }}</div>
            <div class="space">#</div>
          </div>
        </div>

        <div class="title">{{ zdh ? zdh.t10 : "" }}</div>

        <div
          class="item"
          v-for="item in baseMenuItems"
          :key="item.key"
          @click="handleLeftItemClick(item)"
        >
          <i class="iconfont" :class="item.icon"></i>
          <div class="name">{{ item.name }}</div>
          <div class="space">#</div>
        </div>

        <div class="title">{{ zdh ? zdh.t11 : "" }}</div>

        <el-popover
          v-model="TableMenuVisible"
          placement="right"
          trigger="hover"
        >
          <div>
            <div v-for="row in 6" :key="row" class="table-box-choose-hang">
              <div
                v-for="column in 6"
                :key="column"
                :data="row + '#' + column"
                class="table-box-choose-item"
                :class="show_blue_table(row, column)"
                @mouseover="handle_box_mouseover"
                @click="handleLeftItemClick({ key: 'table', row, column })"
              ></div>
            </div>
          </div>
          <div slot="reference" class="item">
            <i class="iconfont icon-biaoge"> </i>
            <div class="name">{{ zdh ? zdh.t12 : "" }}</div>
            <div class="space"># <i class="el-icon-arrow-right"></i></div>
          </div>
        </el-popover>

        <el-popover
          v-model="EmojiMenuVisible"
          placement="right"
          trigger="hover"
        >
          <div class="emoji-grid">
            <button
              v-for="(emoji, index) in emojis"
              :key="index"
              @click="handleLeftItemClick({ key: 'emoji', emoji })"
            >
              {{ emoji }}
            </button>
          </div>
          <div slot="reference" class="item">
            <i class="iconfont icon-biaoqing"> </i>
            <div class="name">{{ zdh ? zdh.t13 : "" }}</div>
            <div class="space">#<i class="el-icon-arrow-right"></i></div>
          </div>
        </el-popover>

        <div
          class="item"
          v-for="item in generalMenuItems"
          :key="item.key"
          @click="handleLeftItemClick(item)"
        >
          <i class="iconfont" :class="item.icon"></i>
          <div class="name">{{ item.name }}</div>
          <div class="space">#</div>
          <div class="tooltip_left_menu" v-if="item.tip">

            <el-tooltip
              :open-delay="100"
              placement="right-end"
            >
              <div slot="content" v-html="item.tip"></div>
              <span style="display: flex; align-items: center">
                <i class="el-icon-question"></i>
              </span>
            </el-tooltip>
            
          </div>
        </div>

        <div class="title">{{ zdh ? zdh.t14 : "" }}</div>

        <div
          class="item"
          v-for="item in thirdPartyItems"
          :key="item.key"
          @click="handleLeftItemClick(item)"
        >
          <img
            :src="require('@/assets/img/' + item.img)"
            style="width: 16px; margin-right: 9px; margin-left: 1px"
          />
          <div class="name">{{ item.name }}</div>
          <div class="space">#</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {
  tableMenuItems,
  baseMenuItems,
  generalMenuItems,
  thirdPartyItems,
  AiMenuItems,
} from "./menuConfig.js";
import constants from "./constants.js";
import vmson from "@/utils/vmson";

export default {
  props: {
    items: {
      type: Array,
      required: true,
    },

    command: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      left_col: 1,
      right_col: 1,
      top_row: 1,
      bottom_row: 1,
      emojis: constants.emojis,
      EmojiMenuVisible: false,
      TableMenuVisible: false,
      tableMenuItems,
      baseMenuItems,
      generalMenuItems,
      thirdPartyItems,
      AiMenuItems,
      table_choose_row: 0,
      table_choose_column: 0,
      click_type: false,
      zdh: {
        t1: "表格操作",
        t2: "向左插入",
        t3: "列",
        t4: "向右插入",
        t5: "列",
        t6: "向上插入",
        t7: "行",
        t8: "向下插入",
        t9: "行",
        t10: "基础",
        t11: "通用",
        t12: "表格",
        t13: "表情",
        t14: "第三方应用",
      },
    };
  },
  created() {
    let l = localStorage.getItem("lang");
    if (l) {
      if (l == "en") {
        this.zdh = {
          t1: "Table Operations",
          t2: "Insert L",
          t3: "Column",
          t4: "Insert R",
          t5: "Column",
          t6: "Insert U",
          t7: "Row",
          t8: "Insert D",
          t9: "Row",
          t10: "Basic",
          t11: "General",
          t12: "Table",
          t13: "Emoji",
          t14: "Third - party Application",
        };
      }
    }
  },
  mounted() {
    this.click_type = this.items[0].isActive("table");
  },
  methods: {
    handleInput(event) {
      let value = event.target.value.replace(/[^0-9]/g, "");
      if (value === "" || parseInt(value) <= 0) {
        value = "";
      }
      event.target.value = value; // 更新输入框的值
    },
    handle_box_mouseover(e) {
      let l = e.target.attributes.data.nodeValue.split("#");
      this.table_choose_row = l[0];
      this.table_choose_column = l[1];
    },
    show_blue_table(row, column) {
      if (row <= this.table_choose_row && column <= this.table_choose_column) {
        return "boxactive";
      } else {
        return "";
      }
    },
    handleLeftItemClick(e) {
      this.command({
        title: "Heading 1hide",
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).run();
        },
      });
      vmson.$emit("navLeftItemClick", { key: e.key, e: e, node:this.items[0].options.projectInfo.key });
    },
    onKeyDown({ event }) {
      // if (event.key === "ArrowUp") {
      //   this.upHandler();
      //   return true;
      // }

      // if (event.key === "ArrowDown") {
      //   this.downHandler();
      //   return true;
      // }

      // if (event.key === "Enter") {
      //   this.enterHandler();
      //   return true;
      // }

      // return false;
    },
  },
};
</script>
<style lang="scss">
.LeftMenu_con_box {
  background: white;
  // max-width: 200px;
  font-size: 12px;
  height: 300px;
  padding: 10px 0 !important;
  overflow-y: auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  border: 1px solid #ebeef5;
  z-index: 9999999999999999999999;
}
.LeftMenu_con {
  .title {
    padding: 2px 10px;
    background: #f7f8fa;
    font-size: 12px;
    color: #87888a;
  }
  .item {
    cursor: pointer;
    // font-size: 14px;
    font-size: 12px;

    padding: 6px 10px;
    color: #2d2d2e;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .iconfont {
      margin-right: 10px;
    }
    .name {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      input {
        margin: 0 5px;
        width: 25px;
        text-align: center;
      }
    }
    .space {
      color: rgb(144, 144, 144);
      font-size: 12px;
      display: none;
    }
  }
  .item:hover {
    background: #f7f8fa;
  }
}
.table-box-choose-hang {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  .table-box-choose-item {
    margin: 5px;
    width: 15px;
    height: 15px;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
  .boxactive {
    background: #0064ff;
  }
}
</style>
