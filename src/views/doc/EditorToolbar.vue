<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea';

const visible = ref(false)
const mdValue = ref('')
const props = defineProps<{ editor: any }>()

/* ===== 表格输入 ===== */
const rows = ref(3)
const cols = ref(3)

/* ===== 通用操作 ===== */
const run = (fn: () => void) => {
  if (!props.editor) return
  fn()
}

/* ===== 插入表格 ===== */
const insertTable = () => {
  run(() => {
    props.editor
      .chain()
      .focus()
      .insertTable({
        rows: rows.value,
        cols: cols.value,
        withHeaderRow: true,
      })
      .run()
  })
}
const textColor = ref('#000000')
const bgColor = ref('#fff59d')

const tableCellColor = ref('#f5f5f5')

/* ========= 是否在表格中 ========= */
const inTable = computed(() => props.editor?.isActive('table'))

const insertMarkdown = () => {
  visible.value = true
  mdValue.value = ''


}
watch(visible, () => {
  if (!visible.value) {
    console.log(mdValue.value);

    if (!mdValue.value || !props.editor) return
    props.editor.chain().focus().insertContent(mdValue.value, { contentType: 'markdown' }).run()
  }
})

/* ========= 公式 ========= */

const insertInlineMath = () => {
  const latex = prompt('inline formula')
  if (!latex) return

  props.editor.chain().focus().insertInlineMath({ latex }).run()
}

const insertBlockMath = () => {
  const latex = prompt('block formula')
  if (!latex) return

  props.editor.chain().focus().insertBlockMath({ latex }).run()
}


</script>

<template>
  <div class="toolbar">
    <Dialog v-model:visible="visible" modal header="Edit Profile" :style="{ width: '25rem' }">
      <Textarea v-model="mdValue" rows="5" cols="30" />
    </Dialog>
    <details open>
      <summary>工具</summary>
      <div class="btns" style="margin-top: 10px">
        <button v-for="i in 6" :key="i" @click="run(() => editor.chain().focus().toggleHeading({ level: i }).run())">
          H{{ i }}
        </button>

        <!-- ===== 基础格式 ===== -->
        <button @click="run(() => editor.chain().focus().toggleBold().run())">
          <Icon icon="mdi:format-bold" />
        </button>

        <button @click="run(() => editor.chain().focus().toggleItalic().run())">
          <Icon icon="mdi:format-italic" />
        </button>

        <button @click="run(() => editor.chain().focus().toggleStrike().run())">
          <Icon icon="mdi:format-strikethrough" />
        </button>

        <!-- ===== 列表 ===== -->
        <button @click="run(() => editor.chain().focus().toggleBulletList().run())">
          <Icon icon="mdi:format-list-bulleted" />
        </button>

        <button @click="run(() => editor.chain().focus().toggleOrderedList().run())">
          <Icon icon="mdi:format-list-numbered" />
        </button>

        <!-- ===== 引用 ===== -->
        <button @click="run(() => editor.chain().focus().toggleBlockquote().run())">
          <Icon icon="mdi:format-quote-close" />
        </button>

        <!-- ===== 分割线 ===== -->
        <button @click="run(() => editor.chain().focus().setHorizontalRule().run())">
          <Icon icon="mdi:minus" />
        </button>

        <!-- ===== 代办列表 ===== -->
        <button @click="run(() => editor.chain().focus().toggleTaskList().run())">
          <Icon icon="mdi:checkbox-marked-outline" />
        </button>

        <!-- ===== 折叠 ===== -->
        <button @click="run(() => editor.chain().focus().setDetails().run())">
          <Icon icon="wordpress:details" />
        </button>

        <!-- ===== 清除格式 ===== -->
        <button @click="run(() => editor.chain().focus().unsetAllMarks().clearNodes().run())">
          <Icon icon="mdi:format-clear" />
        </button>

        <!-- ===== 对齐 ===== -->
        <button @click="run(() => editor.chain().focus().setTextAlign('left').run())">
          <Icon icon="mdi:format-align-left" />
        </button>

        <button @click="run(() => editor.chain().focus().setTextAlign('center').run())">
          <Icon icon="mdi:format-align-center" />
        </button>

        <button @click="run(() => editor.chain().focus().setTextAlign('right').run())">
          <Icon icon="mdi:format-align-right" />
        </button>

        <button @click="run(() => editor.chain().focus().setTextAlign('justify').run())">
          <Icon icon="mdi:format-align-justify" />
        </button>

        <button @click="insertMarkdown">MD</button>

        <!-- ===== 数学公式 ===== -->
        <button @click="insertInlineMath">
          <Icon icon="mdi:function-variant" />
        </button>

        <button @click="insertBlockMath">
          <Icon icon="mdi:math-integral-box" />
        </button>

        <!-- ===== 字体颜色 ===== -->
        <input type="color" v-model="textColor" @change="run(() => editor.chain().focus().setColor(textColor).run())" />

        <!-- ===== 背景色 ===== -->
        <input type="color" v-model="bgColor"
          @change="run(() => editor.chain().focus().toggleHighlight({ color: bgColor }).run())" />
        <!-- ===== 表格区域 ===== -->

        <template v-if="inTable">
          <button @click="run(() => editor.chain().focus().addRowAfter().run())">
            <Icon icon="carbon:row-expand" />
          </button>

          <button @click="run(() => editor.chain().focus().deleteRow().run())">
            <Icon icon="carbon:row-delete" />
          </button>

          <button @click="run(() => editor.chain().focus().addColumnAfter().run())">
            <Icon icon="mdi:table-column-add-after" />
          </button>

          <button @click="run(() => editor.chain().focus().deleteColumn().run())">
            <Icon icon="mdi:table-column-remove" />
          </button>

          <!-- 单元格背景色 -->
          <input type="color" v-model="tableCellColor" @change="
            run(() =>
              editor.chain().focus().setCellAttribute('backgroundColor', tableCellColor).run(),
            )
            " />
        </template>
        <div class="btns">
          <input v-model.number="rows" />

          <input v-model.number="cols" />

          <button @click="insertTable">
            <Icon icon="mdi:table-plus" />
          </button>
        </div>

        <!-- ================================================= -->
        <!-- ================= 表格工具 ====================== -->
        <!-- ================================================= -->
      </div>
    </details>
  </div>
</template>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid #ddd;
  width: 100%;
}

details {
  .btns {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  input {
    height: 32px;
    width: 32px;
    padding: 6px 8px;

    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;

    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(2px) saturate(170%);
    -webkit-backdrop-filter: blur(30px) saturate(170%);
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.65);
    overflow: hidden;
  }

  button {
    height: 32px;
    width: 32px;
    padding: 0 8px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;

    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(2px) saturate(170%);
    -webkit-backdrop-filter: blur(30px) saturate(170%);
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.65);
    overflow: hidden;
  }

  button:hover {
    background: #f3f3f3;
  }
}

.divider {
  width: 1px;
  height: 24px;
  background: #ddd;
  margin: 0 6px;
}
</style>
