<template>
  <div class="col-group">
    <div class="main">
      <editor-content :editor="editor" class="editor tiptap" v-if="route.query.docId" />
      <div class="editor" v-else>请选择文档</div>
    </div>
    <div class="sidebar" v-if="route.query.docId">
      <div class="sidebar-options">
        <EditorTop :editor="editor" />
        <div class="label-large">目录</div>
        <div class="table-of-contents">
          <template v-if="editor">
            <ToC :editor="editor" :items="contentItems" />
          </template>
        </div>
      </div>
    </div>
    <Icon icon="mdi:content-save-move" width="24" height="24" class="save-icon" @click="save" />
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive, watchEffect, onBeforeMount } from 'vue'
import { Icon } from '@iconify/vue'
import { useDebounceFn } from '@vueuse/core'

import { useRoute } from 'vue-router'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import UniqueID from '@tiptap/extension-unique-id'
import { TextStyleKit } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import ToC from './ToC.vue'
import { getHierarchicalIndexes, TableOfContents } from '@tiptap/extension-table-of-contents'
import { TableKit } from '@tiptap/extension-table'
import { Mathematics, migrateMathStrings } from '@tiptap/extension-mathematics'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'

import { Markdown } from '@tiptap/markdown'
import suggestion from './suggestion.js'
import EditorTop from './EditorToolbar.vue'
import Mention from '@tiptap/extension-mention'
import { kvSet, kvGet, uploadFile } from '@/utils/api'
import 'katex/dist/katex.min.css'

import { Details, DetailsSummary, DetailsContent } from '@tiptap/extension-details'

import { useMitt } from '@/utils/useMitt'
const { on, emit } = useMitt()

on('chenge-doc', () => {
  //   autosave()
})
function save() {
  kvSet({
    k: '@DOC@' + route.query.docId,
    v: editor.value.getJSON(),
  })
}

const route = useRoute()
const lastSavedJson = ref('')

const autosave = useDebounceFn(() => {
  if (!route.query.docId) return

  const json = editor.value.getJSON()
  const str = JSON.stringify(json)

  if (str === lastSavedJson.value) return
  lastSavedJson.value = str

  kvSet({
    k: '@DOC@' + route.query.docId,
    v: editor.value.getJSON(),
  })
}, 1000)

watchEffect(async () => {
  if (!route.query.docId) return

  lastSavedJson.value = ''
  try {
    let res = await kvGet('@DOC@' + route.query.docId)
    editor.value.commands.setContent(JSON.parse(res.v))
  } catch (e) {
    editor.value.commands.setContent('<p>hello</p>')
  }
})

const contentItems = ref([])

const editor = useEditor({
  content: '',
  //   onUpdate({ editor, transaction }) {
  //     if (!transaction.docChanged) return
  //     autosave(editor)
  //   },
  editorProps: {
    handlePaste(view, event, slice) {
      const items = event.clipboardData?.items
      if (!items) return false

      for (const item of items) {
        if (item.kind !== 'file') continue

        const file = item.getAsFile()
        if (!file) continue

        uploadAndInsert(editor, file)

        // 阻止默认行为
        return true
      }

      return false
    },
  },
  extensions: [
    TextStyleKit,
    Markdown,
    StarterKit,
    DetailsSummary,
    DetailsContent,
    TableKit.configure({
      table: { resizable: true },
    }),
    Image.configure({
      inline: true,
      resize: {
        enabled: true,
        directions: ['top', 'bottom', 'left', 'right'], // can be any direction or diagonal combination
        minWidth: 50,
        minHeight: 50,
        alwaysPreserveAspectRatio: true,
      },
    }),
    Mathematics.configure({
      blockOptions: {
        onClick: (node, pos) => {
          const newCalculation = prompt('Enter new calculation:', node.attrs.latex)
          if (newCalculation) {
            editor.value
              .chain()
              .setNodeSelection(pos)
              .updateBlockMath({ latex: newCalculation })
              .focus()
              .run()
          }
        },
      },
      inlineOptions: {
        onClick: (node, pos) => {
          const newCalculation = prompt('Enter new calculation:', node.attrs.latex)
          if (newCalculation) {
            editor.value
              .chain()
              .setNodeSelection(pos)
              .updateInlineMath({ latex: newCalculation })
              .focus()
              .run()
          }
        },
      },
    }),
    Highlight.configure({ multicolor: true }),
    Details.configure({
      persist: true,
      HTMLAttributes: {
        class: 'details',
      },
    }),

    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    UniqueID.configure({
      types: ['heading', 'paragraph'],
    }),
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      suggestion: {
        ...suggestion,
        char: '/', // ⭐ 修改触发字符
      },
    }),
    TableOfContents.configure({
      getIndex: getHierarchicalIndexes,
      onUpdate: (content) => {
        contentItems.value = content
      },
    }),
  ],
})
async function uploadAndInsert(editor, file) {
  try {
    const result = await uploadFile(file)

    const url = 'http://49.233.117.232:9000' + result.url

    /* ===== 判断是否图片 ===== */
    const isImage = file.type.startsWith('image/')

    if (isImage) {
      // 插入图片
      console.log('img.url', url)

      editor.value.chain().focus().setImage({ src: url }).run()
    } else {
      // 插入文件链接
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: file.name,
          marks: [
            {
              type: 'link',
              attrs: { href: url },
            },
          ],
        })
        .run()
    }
  } catch (e) {
    console.error('upload error', e)
  }
}
</script>

<style scoped>
.editor {
  height: 100%;
}
.save-icon {
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
  color: black;
}
</style>
<style lang="scss">
.tiptap {
  height: 100%;
  outline: none;
  padding: 0 10px;
  overflow: auto;
}
.tiptap {
  font-size: 15px;
  text-align: left;
  color: rgb(23, 23, 23);
  font-family: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
  [data-resize-container] {
    display: inline-block !important;
  }
  [data-resize-handle] {
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    z-index: 10;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    /* Corner handles */
    &[data-resize-handle='top-left'],
    &[data-resize-handle='top-right'],
    &[data-resize-handle='bottom-left'],
    &[data-resize-handle='bottom-right'] {
      width: 8px;
      height: 8px;
    }

    &[data-resize-handle='top-left'] {
      top: -4px;
      left: -4px;
      cursor: nwse-resize;
    }

    &[data-resize-handle='top-right'] {
      top: -4px;
      right: -4px;
      cursor: nesw-resize;
    }

    &[data-resize-handle='bottom-left'] {
      bottom: -4px;
      left: -4px;
      cursor: nesw-resize;
    }

    &[data-resize-handle='bottom-right'] {
      bottom: -4px;
      right: -4px;
      cursor: nwse-resize;
    }

    /* Edge handles */
    &[data-resize-handle='top'],
    &[data-resize-handle='bottom'] {
      height: 6px;
      left: 8px;
      right: 8px;
    }

    &[data-resize-handle='top'] {
      top: -3px;
      cursor: ns-resize;
    }

    &[data-resize-handle='bottom'] {
      bottom: -3px;
      cursor: ns-resize;
    }

    &[data-resize-handle='left'],
    &[data-resize-handle='right'] {
      width: 6px;
      top: 8px;
      bottom: 8px;
    }

    &[data-resize-handle='left'] {
      left: -3px;
      cursor: ew-resize;
    }

    &[data-resize-handle='right'] {
      right: -3px;
      cursor: ew-resize;
    }
  }
  img {
    display: inline-block;
    height: auto;
    margin: 1.5rem 0;
    max-width: 100%;
  }
  [data-resize-state='true'] [data-resize-wrapper] {
    outline: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 0.125rem;
  }

  .details {
    flex-direction: column;
    display: flex;
    gap: 0.25em;
    margin: 1.5em 0;
    border: 1px solid #cfcfcf;
    border-radius: 0.5em;
    padding: 0.5em;

    summary {
      font-weight: 700;
      border-bottom: 1px solid #cfcfcf;
    }

    > button {
      border: none;
      cursor: pointer;
      align-items: center;
      background: transparent;
      border-radius: 4px;
      display: flex;
      font-size: 0.625em;
      justify-content: center;
      line-height: 1;
      margin-top: 0.1em;
      padding: 0;
      width: 1.25em;

      &:hover {
        background-color: #cfcfcf;
      }

      &::before {
        content: '\25B6';
      }
    }

    &.is-open > button::before {
      transform: rotate(90deg);
    }

    > div {
      display: flex;
      flex-direction: column;
      gap: 1em;
      width: 100%;

      > [data-type='detailsContent'] > :last-child {
        margin-bottom: 0.5em;
      }
    }

    .details {
      margin: 0.5em 0;
    }
  }
  .mention {
    font-size: 13px;
    background-color: #a9d5ff;
    border-radius: 4px;
    box-decoration-break: clone;
    color: #1873cc;
    padding: 1px 5px;
  }
  img {
    // display: block;
    height: auto;
    // margin: 1.5em 0;
    max-width: 100%;
    width: 500px;

    &.ProseMirror-selectednode {
      outline: 3px solid #0064ff;
    }
  }
  ul[data-type='taskList'] {
    list-style: none;
    margin-left: 0;
    padding: 0;
    p {
      margin: 5px 0;
    }
    li {
      align-items: flex-start;
      display: flex;
      align-items: baseline;

      > label {
        margin-right: 0.5em;
        user-select: none;
        width: 20px;
        input {
          // background: red;
        }
      }

      > div {
      }
    }
    label:has(input[type='checkbox']) {
      pointer-events: none;
    }
    input[type='checkbox'] {
      cursor: pointer;
    }

    ul[data-type='taskList'] {
      margin: 0;
    }
  }
  .collaboration-cursor__caret {
    border-left: 1px solid #0d0d0d;
    border-right: 1px solid #0d0d0d;
    margin-left: -1px;
    margin-right: -1px;
    pointer-events: none;
    position: relative;
    word-break: normal;
  }

  .collaboration-cursor__label {
    border-radius: 3px 3px 3px 0;
    color: #0d0d0d;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    left: -0.5px;
    line-height: normal;
    padding: 5px 3px;
    position: absolute;
    top: -2em;
    user-select: none;
    white-space: nowrap;
  }
  ul {
    padding-left: 25px;
  }
  ul li::marker {
    color: #0064ff;
  }
  ol {
    padding-left: 25px;
  }
  ol li::marker {
    color: #0064ff;
  }
  a {
    color: #0064ff;
    cursor: pointer;
    position: relative;

    &:hover {
      border-bottom: 2px solid #0064ff;
    }
  }

  hr {
    border: none;
    border-top: 1px solid #3d251414;
    border-top: 2px dashed #cccccc;
    cursor: pointer;
    margin: 10px 0;

    &.ProseMirror-selectednode {
      border-top: 1px solid #e3eeff;
    }
  }
  mark {
    // background-color: #faf594;
    border-radius: 0.4em;
    box-decoration-break: clone;
    padding: 0.1em 0.3em;
  }
  // 引用样式
  blockquote {
    margin: 0;
    border-left: 3px solid #e5e7eb;
    // margin: 1.5rem 0;
    padding-left: 10px;
    color: rgb(135, 136, 138);
    p {
      margin-top: 2.5px;
      margin-bottom: 2.5px;
    }
  }
  pre {
    background: black;
    border-radius: 5px;
    font-family: 'Consolas, Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
    margin: 10px 0;
    color: white;
    padding: 20px;
    font-size: 14px;

    code {
      background: none;
      color: inherit;
      // font-size: 0.8rem;
      padding: 0;
    }
    /* Code styling */
    .hljs-comment,
    .hljs-quote {
      color: #616161;
    }

    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      color: #f98181;
    }

    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
      color: #fbbc88;
    }

    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
      color: #b9f18d;
    }

    .hljs-title,
    .hljs-section {
      color: #faf594;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      color: #70cff8;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: 700;
    }
  }
  /* Table-specific styling */
  table {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100% !important;

    tr {
      height: 25px;
    }

    td,
    th {
      border: 1px solid #dfe1e5;
      box-sizing: border-box;
      min-width: 1em;
      padding: 6px 8px;
      position: relative;
      vertical-align: top;

      > * {
        margin: 0 !important;
      }
    }

    th {
      // background-color: gray;
      font-weight: bold;
      text-align: left;
    }

    .selectedCell:after {
      background: rgb(160 198 255 / 60%);
      content: '';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
      position: absolute;
      z-index: 2;
    }

    .column-resize-handle {
      background-color: #0064ff;
      bottom: -2px;
      pointer-events: none;
      position: absolute;
      right: -2px;
      top: 0;
      width: 4px;
    }
  }

  mark {
    border-radius: 0;
    padding: 0;
  }

  .tableWrapper {
    margin: 1.5em 0;
    overflow-x: auto;
  }

  &.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }

  h1 {
    font-size: 2em;
    font-weight: bold;
  }
}
.col-group {
  display: flex;
  flex-direction: row;
  position: relative;
}

.main {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  flex: 1;
}

.sidebar {
  border-left: 1px solid #545454;
  padding-left: 10px;
  flex-grow: 0;
  flex-shrink: 0;
  width: 30%;
  position: sticky;
  height: 100%;
  top: 0;
}

.sidebar-options {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.table-of-contents {
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
  gap: 0.25rem;
  overflow: auto;
  text-decoration: none;
  width: 100%;

  > div {
    border-radius: 0.25rem;
    padding-left: calc(0.875rem * (var(--level) - 1));
    transition: all 0.2s cubic-bezier(0.65, 0.05, 0.36, 1);

    &:hover {
      background-color: var(--gray-2);
    }
  }

  .empty-state {
    color: var(--gray-5);
    user-select: none;
  }

  .is-active a {
    color: var(--purple);
  }

  .is-scrolled-over a {
    color: var(--gray-5);
  }

  a {
    color: var(--black);
    display: flex;
    gap: 0.25rem;
    text-decoration: none;

    &::before {
      content: attr(data-item-index) '.';
    }
  }
}
</style>
