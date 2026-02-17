<template>
  <div style="position: relative">
    <VTree ref="tree" :draggable="edit" droppable showLine>
      <template #node="{ node }">
        <div
          style="display: flex; align-items: center; gap: 10px; justify-content: space-between"
          @click.stop
        >
          <span v-if="!edit" @click.stop="choose_node(node)">{{ node.title }}</span>
          <input v-else type="text" v-model="node.title" class="input" placeholder="Title" />

          <span style="display: flex; align-items: center; gap: 10px">
            <Icon
              v-if="edit"
              icon="pepicons-pop:down-left-circle-filled"
              width="18"
              height="18"
              @click="handleAdd(node)"
            />
            <Icon
              v-if="edit"
              icon="fluent:arrow-circle-right-20-filled"
              width="22"
              height="22"
              @click="handleAppend(node)"
            />
            <Icon
              v-if="edit"
              icon="ion:remove-circle"
              width="22"
              height="22"
              @click="handleRemove(node)"
            />
          </span>
        </div>
      </template>
    </VTree>
    <!-- <div style="height: 100%; overflow: auto">
      <div v-for="value in listData" :key="value.id" class="list-line">
        <span v-if="!edit">{{ value.title }}</span>
        <span v-else>
          <input type="text" v-model="value.title" class="input" placeholder="Title" />
        </span>
        <span style="display: flex; align-items: center; gap: 10px" v-if="edit">
          <Icon icon="ion:remove-circle" width="22" height="22" @click="handleRemove(value)" />
        </span>
      </div>
    </div> -->

    <Icon
      class="modelblack"
      icon="ant-design:setting-filled"
      width="24"
      height="24"
      @click="changeSet"
    />
  </div>
</template>

<script setup>
import VTree from '@wsfe/vue-tree'
import { Icon } from '@iconify/vue'
import { onMounted, ref } from 'vue'
import { generateId } from '@/utils/ulid.ts'

const edit = ref(false)
const tree = ref()
function changeSet() {
  edit.value = !edit.value
  if (!edit.value) {
    console.log(tree.value.getNode())
  }
}
const choose_node = (node) => {
  console.log(node)
}
const handleAdd = (node) => {
  tree.value.insertAfter({ title: `新文件夹`, id: generateId('tree') }, node.id)
}

const handleAppend = (node) => {
  tree.value.append({ title: `新文件夹`, id: generateId('tree') }, node.id)
}

const handleRemove = (node) => {
  data.value.remove(node.id)
}

const data = ref([
  {
    title: 'node-1',
    id: 'node-1',
    children: [
      {
        title: 'node-1-1',
        id: 'node-1-1',
        children: [
          {
            title: 'node-1-1-1',
            id: 'node-1-1-1',
          },
          {
            title: 'node-1-1-2',
            id: 'node-1-1-2',
          },
          {
            title: 'node-1-1-3',
            id: 'node-1-1-3',
          },
        ],
      },
      {
        title: 'node-1-2',
        id: 'node-1-2',
        children: [
          {
            title: 'node-1-2-1',
            id: 'node-1-2-1',
          },
          {
            title: 'node-1-2-2',
            id: 'node-1-2-2',
          },
        ],
      },
      {
        title: 'node-1-3',
        id: 'node-1-3',
        children: [
          {
            title: 'node-1-3-1',
            id: 'node-1-3-1',
          },
          {
            title: 'node-1-3-2',
            id: 'node-1-3-2',
          },
        ],
      },
      {
        title: 'node-1-3',
        id: 'node-1-3w',
        children: [
          {
            title: 'node-1-3-1',
            id: 'node-1-3-1w',
          },
          {
            title: 'node-1-3-2',
            id: 'node-1-3-2qw',
          },
        ],
      },
      {
        title: 'node-1-3q',
        id: 'node-1-3q',
        children: [
          {
            title: 'node-1-3-1',
            id: 'node-1-3-1qq',
          },
          {
            title: 'node-1-3-2',
            id: 'node-1-3-2qq',
          },
        ],
      },
    ],
  },
  {
    title: 'node-2',
    id: 'node-2',
    children: [
      {
        title: 'node-2-1',
        id: 'node-2-1',
        children: [
          {
            title: 'node-2-1-1',
            id: 'node-2-1-1',
          },
          {
            title: 'node-2-1-2',
            id: 'node-2-1-2',
          },
        ],
      },
    ],
  },
])
onMounted(() => {
  // tree.value.setData(data)
  // console.log(tree.value)
})
</script>
<style scoped>
.modelblack {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  cursor: pointer;
  justify-content: center;
  color: white;
}
.list-line {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  margin-bottom: 10px;
  cursor: pointer;
}
.input {
  padding: 5px;
  border-radius: 0px;
  border: none;
  background: transparent;
  border-bottom: 2px solid white;
  width: 100%;
  transition: 0.45s;
}
.input:focus {
  outline: none;
  border-bottom: 2px solid rgb(52 124 244);
  background: rgba(255, 255, 255, 0);
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
</style>
<style>
@import '@wsfe/vue-tree/style.css';

.vtree-tree-node__title {
  border-radius: 10px;
  transition: ease 0.5s;
}
.vtree-tree-node__title:hover {
  background-color: #ebf5ff6e;
  border-radius: 10px;
}
.vtree-tree-node__expand i:after {
  /* border-left-color: white; */
}
.vtree-tree__iframe {
  display: none;
}
</style>
