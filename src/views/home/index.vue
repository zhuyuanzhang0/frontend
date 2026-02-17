<script setup>
import icons from '@/views/home/icons.vue'
import search from '@/views/home/search.vue'
</script>

<template>
  <div class="con">
    <div style="height: 10vh"></div>
    <search></search>
    <div style="height: 10vh"></div>
    <icons></icons>
  </div>
</template>
<style scoped>
.con {
  width: 70%;
  margin: 0 auto;
}
</style>
