<script setup lang="ts">
import { ref, computed } from 'vue'

import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'
import ProgressBar from 'primevue/progressbar';
import InputText from 'primevue/inputtext'

import { Icon } from '@iconify/vue'

/* ===== 接口数据 ===== */
import { kvSet, kvGet, uploadFile } from '@/utils/api'
kvGet('asset_tracker_products_v').then((raw) => {

    products.value = JSON.parse(raw.v).products
    console.log(JSON.parse(raw.v));

}).catch(e => {
    products.value = []
})



const products = ref<AssetItem[]>([])

/* ===== 工具函数 ===== */

const DAY = 1000 * 60 * 60 * 24

function calcUseDays(p: any) {
    const start = new Date(p.purchaseDate).getTime()
    const now = Date.now()
    return Math.max(1, Math.floor((now - start) / DAY))
}

function dailyCost(p: any) {
    return p.price / calcUseDays(p)
}

function targetDays(p: any) {
    return Math.ceil(p.price / p.targetDaily)
}

function progress(p: any) {
    const use = calcUseDays(p)
    const target = targetDays(p)
    return Math.min(100, (use / target) * 100)
}

function reached(p: any) {
    return progress(p) >= 100
}



/* ===== 排序 + 筛选 ===== */

const dialogVisible = ref(false)

const sortType = ref('date_desc')
const maxPrice = ref(10000)
const filterCategory = ref('')
const filterStatus = ref('')
const filterName = ref('')
const filterTag = ref('')

const sortOptions = [
    { label: '购买时间（新→旧）', value: 'date_desc' },
    { label: '购买时间（旧→新）', value: 'date_asc' },
    { label: '价格（高→低）', value: 'price_desc' },
    { label: '价格（低→高）', value: 'price_asc' },
    { label: '日均成本（高→低）', value: 'daily_desc' }
]

interface AssetItem {
    id: string
    name: string
    price: number
    category: string
    status: string
    tags: string[]
    purchaseDate: string
    targetDaily?: number
    imageUrl?: string
    tagsText?: string
    location?: string
    expiryDate?: string
    soldDate?: string
    note?: string
}

const filteredList = computed<AssetItem[]>(() => {
    let list = products.value.filter(p => {
        if (p.price > maxPrice.value) return false

        if (filterCategory.value && p.category !== filterCategory.value)
            return false

        if (filterStatus.value && p.status !== filterStatus.value)
            return false

        if (
            filterName.value &&
            !p.name.toLowerCase().includes(filterName.value.toLowerCase())
        )
            return false

        if (
            filterTag.value &&
            !(p.tags || []).some(tag =>
                tag.toLowerCase().includes(filterTag.value.toLowerCase())
            )
        )
            return false

        return true
    })

    switch (sortType.value) {
        case 'price_desc':
            list.sort((a, b) => b.price - a.price)
            break
        case 'price_asc':
            list.sort((a, b) => a.price - b.price)
            break
        case 'date_asc':
            list.sort(
                (a, b) =>
                    new Date(a.purchaseDate).getTime() -
                    new Date(b.purchaseDate).getTime()
            )
            break
        case 'daily_desc':
            list.sort((a, b) => dailyCost(b) - dailyCost(a))
            break
        default:
            list.sort(
                (a, b) =>
                    new Date(b.purchaseDate).getTime() -
                    new Date(a.purchaseDate).getTime()
            )
    }

    return list
})

/* ===== 统计 ===== */

const totalAsset = computed(() =>
    filteredList.value.reduce((s, p) => s + p.price, 0)
)

const todayDailyCost = computed(() => {
    if (!filteredList.value.length) return 0
    const total = filteredList.value.reduce(
        (s, p) => s + dailyCost(p),
        0
    )
    return total
})

const formVisible = ref(false)
const editingId = ref<string | null>(null)


interface AssetForm {
    name: string
    price: number
    category: string
    status: string
    purchaseDate: string
    targetDaily?: number
    imageUrl?: string

    tagsText?: string
    location?: string
    expiryDate?: string
    soldDate?: string
    note?: string
}

const form = ref<AssetForm>({
    purchaseDate: '',
    category: '',
    name: '',
    price: 0,
    imageUrl: '',
    location: '',
    expiryDate: '',
    tagsText: '',
    targetDaily: 0,
    status: 'using',
    soldDate: '',
    note: ''
})


function resetForm() {
    form.value = {
        purchaseDate: '',
        category: '',
        name: '',
        price: 0,
        imageUrl: '',
        location: '',
        expiryDate: '',
        tagsText: '',
        targetDaily: 0,
        status: 'using',
        soldDate: '',
        note: ''
    }
}
function saveForm() {
    const data = {
        ...form.value,
        tags: form.value.tagsText
            ? form.value.tagsText.split(',').map(t => t.trim())
            : [],
        id: editingId.value || `p_${Date.now()}`
    }

    if (editingId.value) {
        const index = products.value.findIndex(p => p.id === editingId.value)
        products.value[index] = data
    } else {
        products.value.unshift(data)
    }

    kvSet({
        k: 'asset_tracker_products_v',
        v: {
            products: products.value
        }
    })

    formVisible.value = false
}

function openEdit(item: any) {
    editingId.value = item.id

    form.value = {
        ...item,
        tagsText: (item.tags || []).join(',')
    }

    formVisible.value = true
}

function remove(id: string) {
    products.value = products.value.filter(p => p.id !== id)
    formVisible.value = false
}

function openCreate() {
    editingId.value = null
    resetForm()
    formVisible.value = true
}


const preview = computed(() => {
    if (!form.value.purchaseDate || !form.value.price) {
        return {
            days: 0,
            dailyCost: 0,
            targetDaily: 0,
            goalActive: false,
            goalReached: false,
            remaining: 0
        }
    }

    const days = Math.max(
        1,
        Math.floor(
            (Date.now() -
                new Date(form.value.purchaseDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
    )

    const dailyCost = form.value.price / days

    const goalActive = !!form.value.targetDaily
    console.log(goalActive, form.value.targetDaily);

    const totalDays = (goalActive && form.value.targetDaily)
        ? Math.ceil(form.value.price / form.value.targetDaily)
        : 0

    const goalReached = goalActive && days >= totalDays

    return {
        days,
        dailyCost,
        targetDaily: form.value.targetDaily,
        goalActive,
        goalReached,
        remaining: Math.max(0, totalDays - days)
    }
})


function fmtMoney(v: number) {
    return Number(v || 0).toFixed(2)
}


const map: Record<string, string> = {
    using: '使用中',
    idle: '闲置',
    sold: '已出售'
}


</script>

<template>
    <div class="con" style="position: relative;">

        <div class="liquid-bg" style="height: 75vh;width: 100%;display: flex;flex-direction: column;">


            <!-- ===== 顶部统计 ===== -->
            <div class="top">
                <div class="">
                    <div class="">总资产</div>
                    <h1 class="">¥ {{ totalAsset.toFixed(2) }}</h1>
                </div>

                <div class="">
                    <div style="text-align: right;">今日日均成本</div>
                    <h1 class="">
                        ¥ {{ todayDailyCost.toFixed(2) }}
                    </h1>
                </div>
            </div>



            <!-- ===== 列表 ===== -->
            <div class="assets">
                <div v-for="item in filteredList" :key="item.id" class="liquid-bg item" @click="openEdit(item)">
                    <div class="item-top">
                        <img :src="item.imageUrl" class="" />


                        <div class="daily">
                            ¥{{ dailyCost(item).toFixed(2) }} <span>/天</span>
                            <div class="">
                                {{ map[item.status] }}
                            </div>
                        </div>

                    </div>
                    <div class="">
                        <div class="">
                            <div class="name">{{ item.name }}</div>
                        </div>

                        <div class="desc">
                            价格：¥{{ item.price }} | 使用 {{ calcUseDays(item) }} 天
                        </div>

                        <div class="got">
                            <span>目标：¥{{ item.targetDaily }}/天</span>
                            <span v-if="!reached(item)">
                                还需 {{ targetDays(item) - calcUseDays(item) }} 天
                            </span>
                            <span v-else>
                                已达成目标
                            </span>

                        </div>
                        <!-- 未达成 -->
                        <div class="trak" v-if="!reached(item)">

                            <div class="goalTrack">
                                <div class="goalFill" :style="{ width: progress(item) + '%' }" />
                            </div>
                            <span class="desc">
                                {{ progress(item).toFixed(2) + '%' }}
                            </span>

                        </div>

                    </div>
                </div>
            </div>
        </div>
        <!-- ===== Dialog ===== -->
        <Dialog v-model:visible="dialogVisible" header="筛选与排序" modal>
            <div class="space-y-4">

                <div>
                    <div class="mb-2 ">排序方式</div>
                    <Dropdown v-model="sortType" :options="sortOptions" optionLabel="label" optionValue="value"
                        class="w-full" />
                </div>

                <div>
                    <div class="mb-2 ">
                        最大价格：¥{{ maxPrice }}
                    </div>
                    <Slider v-model="maxPrice" :min="0" :max="10000" />
                </div>

                <div>
                    <div class="mb-2 text-sm">分类</div>
                    <InputText v-model="filterCategory" class="w-full" />
                </div>

                <div>
                    <div class="mb-2 text-sm">状态</div>
                    <Dropdown v-model="filterStatus" :options="[
                        { label: '全部', value: '' },
                        { label: '使用中', value: 'using' },
                        { label: '闲置中', value: 'idle' },
                        { label: '已卖出', value: 'sold' }
                    ]" optionLabel="label" optionValue="value" class="w-full" />
                </div>

                <div>
                    <div class="mb-2 text-sm">名称关键词</div>
                    <InputText v-model="filterName" class="w-full" />
                </div>

                <div>
                    <div class="mb-2 text-sm">标签</div>
                    <InputText v-model="filterTag" class="w-full" />
                </div>


            </div>
        </Dialog>

        <Dialog v-model:visible="formVisible" modal :style="{ width: '720px', maxWidth: '95vw' }" :closable="false">
            <div class="glass form">

                <!-- ===== 头部 ===== -->
                <div class="formHead">
                    <div class="t">
                        {{ editingId ? '编辑产品' : '新增产品' }}
                    </div>

                    <div style="display: flex; gap: 10px; align-items: center">
                        <Button label="返回" @click="formVisible = false" />
                        <Button label="保存" severity="success" @click="saveForm" />
                    </div>
                </div>

                <!-- ===== 表单 ===== -->
                <div class="formGrid">

                    <div class="field">
                        <label>购买时间 *</label>
                        <input type="date" v-model="form.purchaseDate" />
                    </div>

                    <div class="field">
                        <label>分类 *</label>
                        <input v-model.trim="form.category" placeholder="例如：电子产品" />
                    </div>

                    <div class="field">
                        <label>名称 *</label>
                        <input v-model.trim="form.name" placeholder="例如：iPhone 12 pro" />
                    </div>

                    <div class="field">
                        <label>价格（¥）*</label>
                        <input type="number" min="0" step="0.01" v-model.number="form.price" />
                    </div>

                    <div class="field" style="grid-column: 1/-1">
                        <label>图片 URL（可选）</label>
                        <input v-model.trim="form.imageUrl" placeholder="https://..." />

                        <div class="imgPreview" v-if="form.imageUrl">
                            <div class="box">
                                <img :src="form.imageUrl" />
                            </div>
                            <div class="txt">{{ form.imageUrl }}</div>
                        </div>
                    </div>

                    <div class="field">
                        <label>位置（可选）</label>
                        <input v-model.trim="form.location" />
                    </div>

                    <div class="field">
                        <label>过期时间（可选）</label>
                        <input type="date" v-model="form.expiryDate" />
                    </div>

                    <div class="field">
                        <label>标签（逗号分隔）</label>
                        <input v-model.trim="form.tagsText" placeholder="摄影,通勤,学习" />
                    </div>

                    <div class="field">
                        <label>目标成本（¥/天）</label>
                        <input type="number" min="0" step="0.01" v-model.number="form.targetDaily" />
                    </div>

                    <div class="field">
                        <label>状态 *</label>
                        <select v-model="form.status">
                            <option value="using">使用中</option>
                            <option value="idle">闲置中</option>
                            <option value="sold">已卖出</option>
                        </select>
                    </div>

                    <div class="field" v-if="form.status === 'sold'">
                        <label>卖出日期</label>
                        <input type="date" v-model="form.soldDate" />
                    </div>

                    <div class="field" style="grid-column: 1/-1">
                        <label>备注</label>
                        <textarea v-model.trim="form.note"></textarea>
                    </div>

                </div>

                <!-- ===== 底部预览 ===== -->
                <div class="actions">

                    <div style="font-size: 12px; color: rgba(0,0,0,.55); font-weight: 900">
                        预览：已使用 {{ preview.days }} 天 · 日均 ¥{{ fmtMoney(preview.dailyCost) }}/天

                        <span v-if="preview.goalActive && preview.targetDaily">
                            · 目标 ¥{{ fmtMoney(preview.targetDaily) }}/天 ·
                            <span v-if="preview.goalReached">已达成 ✿</span>
                            <span v-else>还需 {{ preview.remaining }} 天</span>
                        </span>
                    </div>

                    <Button v-if="editingId" label="删除" severity="danger" @click="remove(editingId)" />

                </div>
            </div>
        </Dialog>


        <div class="icons liquid-bg">
            <Icon icon="solar:sort-bold" width="24" height="24" @click="dialogVisible = true" />
            <Icon icon="basil:add-solid" width="28" height="28" @click="openCreate" />
            <!-- <Icon icon="solar:sort-bold" width="24" height="24" /> -->
        </div>

    </div>
</template>

<style lang="scss" scoped>
.icons {
    position: absolute;
    right: -50px;
    top: 6vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5px 3px;
    border-radius: 12px;

    &>* {
        cursor: pointer;
        color: white;
    }
}

.con {
    width: 70%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.assets {

    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 5vh;
    gap: 1vw;
    overflow: auto;

    .item {
        background: hsla(0, 0%, 100%, 0.2);

        .daily {
            font-size: 20px;
            font-weight: 950;
            letter-spacing: 0.2px;

            span {
                font-size: 13px;
                font-weight: 900;
                color: rgba(0, 0, 0, 0.56);
                margin-left: 2px;
            }

            div {
                font-size: 13px;
                font-weight: 900;
                color: rgba(0, 0, 0, 0.56);
                margin-left: 2px;
                text-align: right;
            }
        }

        .trak {
            margin-top: 5px;
            display: flex;
            align-items: center;
            margin-bottom: -10px;

        }

        .goalTrack {
            flex: 1;
            height: 6px;
            border-radius: 999px;
            background: rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(0, 0, 0, 0.03);
            overflow: hidden;

            .goalFill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, rgba(123, 224, 0, 0.95), rgba(155, 246, 75, 0.85));
                border-radius: 999px;
                background: linear-gradient(90deg, rgb(255 255 255 / 60%), rgb(255 255 255))
            }
        }

        .got {
            margin-top: 8px;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.58);
            font-weight: 800;
            display: flex;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
        }

        .item-top {
            display: flex;
            justify-content: space-between;
        }

        height: max-content;

        .name {
            margin: 6px 0 4px;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 0.1px;
            color: rgba(0, 0, 0, 0.88);
        }

        .desc {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.56);
            font-weight: 800;
        }

    }

    img {
        width: 46px;
        height: 46px;
        border-radius: 14px;
        background: rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex: 0 0 auto;
    }
}

.top {
    h1 {
        color: rgb(52, 52, 52);
    }

    color: white;
    display: flex;
    justify-content: space-between;
    border-radius: 12px;
    padding: 10px;
    background: hsla(0, 0%, 100%, 0.5);
    border: 1px solid hsla(0, 0%, 100%, 0.28);
    /* backdrop-filter: blur(20px) saturate(150%); */
    box-shadow: inset 0 1px 0 hsla(0, 0%, 100%, 0.25),
    2px 5px 20px rgba(0, 0, 0, 0.1);
}
</style>