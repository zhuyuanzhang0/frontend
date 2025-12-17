<template>
  <div class="home">
    <product style="padding:20px"></product>

    <div style="flex:1;margin-top:10vh;gap:10vh;display:flex;flex-direction:column;">
        <search></search>
        <icons></icons>
    </div>

    <clock></clock>

  </div>
</template>

<script>
import search from "@/components/start/search.vue";
import icons from "@/components/start/icons.vue";
import product from "@/components/product/index.vue";
import clock from "@/components/clock/index.vue";
export default {
  name: "HomeView",
  components: {
    search,
    icons,
    product,
    clock,
  },
};
</script>

<style lang="less" scoped>

.home{
  display: flex;
}

</style>
