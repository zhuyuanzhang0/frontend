<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'
const t = useTemplateRef('tippy')

onMounted(() => {
  setTimeout(() => {
    t.value.show()
    console.log(t.value.show)
  }, 1000)
})
const visible = defineModel()

const doc = document.body
</script>

<template>
  567890{{ visible }}
  <tippy trigger="manual" ref="tippy" :interactive="true" :append-to="() => doc">
    <!-- 弹窗锚点（可以为空） -->
    <template #default>
      <slot name="trigger" />
    </template>

    <!-- 内容由父组件提供 -->
    <template #content>
      9999
      <slot />
    </template>
  </tippy>
</template>
