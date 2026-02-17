<template>
  <div style="position: relative; padding: 20px 0">
    <Tree
      :value="nodes"
      draggableNodes
      droppableNodes
      :key="treeVersion"
      v-model:selectionKeys="selectedKey"
      v-model:expandedKeys="expandedKeys"
      selectionMode="single"
      @node-select="openPage"
    >
      <template #default="slotProps">
        <div
          class="tree-node"
          @contextmenu="onRightClick($event, slotProps.node)"
          @click="openPage(slotProps.node)"
        >
          <Icon icon="mage:folder" width="16" height="16" v-if="slotProps.node.children" />
          <Icon icon="mage:file" width="16" height="16" v-else />
          <p style="margin-left: 5px">
            {{ slotProps.node.label }}
          </p>
        </div>
      </template>
    </Tree>
    <ContextMenu ref="menu" :model="items">
      <template #item="{ item, props }">
        <div @click="onItemClick(item)" style="cursor: pointer">
          <span style="font-size: 12px">{{ item.label }}</span>
        </div>
      </template>
    </ContextMenu>

    <Dialog v-model:visible="visible" modal header="编辑标题" :style="{ width: '25rem' }">
      <div class="flex items-center gap-4 mb-8">
        <label for="email" class="font-semibold w-24">标题：</label>
        <InputText type="text" v-model="editName" />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ContextMenu from 'primevue/contextmenu'
import Dialog from 'primevue/dialog'
import Tree from 'primevue/tree'
import InputText from 'primevue/inputtext'

import { Icon } from '@iconify/vue'

import { generateId } from '@/utils/ulid.ts'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
const userInfo = useUserStore()
const nodes = ref([])
const selectedKey = ref(null)
const treeVersion = ref(0)
const expandedKeys = ref({})
const route = useRoute()
// watch(
//   expandedKeys,
//   (val) => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
//   },
//   { deep: true }
// )

watch(
  () => route.query.docId,
  (id) => {
    if (!id) {
      expandedKeys.value = {}
      selectedKey.value = null
      return
    }

    selectedKey.value = {
      [id]: true,
    }
    treeVersion.value++
  },
  { immediate: true },
)

function save() {
  if (!userInfo.userInfo.userAccountId) {
    alert('请完善用户信息')
    return
  }

  fetch('http://49.233.117.232:9000/kv/set', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      k: userInfo.userInfo.userAccountId + '-doc-tree',
      v: JSON.stringify(nodes.value),
    }),
  })
}
async function fetchdata() {
  if (!userInfo.userInfo.userAccountId) {
    alert('请完善用户信息')
    return
  }
  const response = await fetch('http://49.233.117.232:9000/kv/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ k: userInfo.userInfo.userAccountId + '-doc-tree' }),
  })
  if (response.ok) {
    const data = await response.json()
    nodes.value = JSON.parse(data.v)
  } else {
    nodes.value = [
      {
        label: '新建文档',
        key: generateId('tree'),
      },
    ]
  }
}
fetchdata()

const router = useRouter()
import { useMitt } from '@/utils/useMitt'
const { on, emit } = useMitt()
const openPage = (node) => {
  emit('chenge-doc')
  router.push({
    name: 'doc',
    query: {
      docId: node.key,
    },
  })
}

const selectedId = ref(null)
const menu = ref()
const visible = ref(false)
const editName = ref('')
function refreshTree() {
  treeVersion.value++
  save()
}

watch(visible, () => {
  if (!visible.value) {
    const id = selectedId.value.key
    if (!id) return
    const currentNode = findNode(nodes.value, id)
    if (!currentNode) return
    currentNode.label = editName.value
    refreshTree()
  }
})
const onItemClick = (menuItem) => {
  const action = menuItem.action
  const id = selectedId.value.key || selectedId.value.id

  if (!id) return

  // 当前节点
  const currentNode = findNode(nodes.value, id)

  if (!currentNode) return

  switch (action) {
    // ===== 新增子节点 =====
    case 'edit': {
      visible.value = true
      editName.value = selectedId.value.label
      break
    }
    case 'tab': {
      if (!currentNode.children) {
        currentNode.children = []
      }

      currentNode.children.push({
        label: '新节点',
        key: generateId('tree'),
      })

      refreshTree()
      break
    }

    // ===== 新增同级节点 =====
    case 'enter': {
      const parent = findParent(nodes.value, id)

      // 根节点同级
      if (!parent) {
        nodes.value.push({
          label: '新节点',
          key: generateId('tree'),
        })
      } else {
        parent.children.push({
          label: '新节点',
          key: generateId('tree'),
        })
      }
      refreshTree()
      break
    }

    // ===== 删除 =====
    case 'delete': {
      const removeNode = (list, key) => {
        const index = list.findIndex((n) => n.key === key)
        if (index !== -1) {
          list.splice(index, 1)
          return true
        }

        for (const n of list) {
          if (n.children && removeNode(n.children, key)) {
            return true
          }
        }
        return false
      }

      removeNode(nodes.value, id)
      refreshTree()
      break
    }
  }
}

const onRightClick = (event, id) => {
  selectedId.value = id
  menu.value.show(event)
}

const items = ref([
  {
    label: '新增子节点',
    action: 'tab',
  },
  {
    label: '新增同级节点',
    action: 'enter',
  },
  {
    label: '删除',
    action: 'delete',
  },
  {
    label: '编辑',
    action: 'edit',
  },
])

function findNode(list, id) {
  for (const node of list) {
    if (node.key === id) return node

    if (node.children) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

function findParent(list, id, parent = null) {
  for (const node of list) {
    if (node.key === id) return parent

    if (node.children) {
      const found = findParent(node.children, id, node)
      if (found) return found
    }
  }
  return null
}
</script>
<style scoped>
.tree-node {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

:deep(.p-tree-node-content) {
  gap: 0;
}
:deep(.p-tree) {
  background: transparent;
  padding: 0;
}
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
.p-tree-node-content {
  transition: ease 0.5s;
  color: white !important;
}

.p-tree-node-content:hover {
  transition: ease 0.5s;
  color: black !important;
  background: hsla(0, 0%, 100%, 0.6) !important;
}
.p-tree-node-toggle-button {
  color: white !important;
}
.p-tree-node-selected {
  border-bottom: 2px solid white;
  color: white !important;

  border-radius: 32px;
  background: hsla(0, 0%, 100%, 0.5) !important;
  border: 1px solid hsla(0, 0%, 100%, 0.28);
  /* backdrop-filter: blur(20px) saturate(150%); */
  box-shadow:
    inset 0 1px 0 hsla(0, 0%, 100%, 0.25),
    2px 5px 20px rgba(0, 0, 0, 0.1);
  /* transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1); */
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
