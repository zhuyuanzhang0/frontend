<template>
  <div class="con">
    <tree class="tree-con liquid-bg"></tree>
    <editor class="editor-con liquid-bg"></editor>
  </div>
</template>
<script setup>
import tree from './tree.vue'
import editor from './editor.vue'
</script>
<style scoped>
.con {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
.editor-con {
  height: 75vh;
  width: 100%;
  background: hsla(0, 0%, 100%, 0.95);
  color: rgb(40, 40, 40);
  margin-right: 20px;
}
.tree-con {
  min-width: max-content;
  height: 75vh;
  width: 20vw;
  /* background: hsla(0, 0%, 100%, 0.95); */
  color: rgb(255, 255, 255);
  margin-right: auto;
  margin-left: 20px;
}
</style>
