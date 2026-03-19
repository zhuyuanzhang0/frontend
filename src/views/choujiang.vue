<template>
    <div class="lottery-page">
        <div class="bg-decor"></div>

        <header class="top-banner">
            <h1>公司年会抽奖</h1>
            <p>Lucky Draw · 祝大家好运连连</p>
        </header>

        <main class="content">
            <!-- 左侧配置区 -->
            <section class="panel config-panel">
                <h2>抽奖配置</h2>

                <div class="block">
                    <label class="block-title">参与用户（每行一个）</label>
                    <textarea v-model="userText" class="textarea" placeholder="例如：
张三
李四
王五
赵六"></textarea>
                    <div class="tips">当前共 {{ userList.length }} 位用户</div>
                </div>

                <div class="block">
                    <div class="row-between">
                        <label class="block-title">奖项设置</label>
                        <button class="mini-btn" @click="addPrize">+ 添加奖项</button>
                    </div>

                    <div v-for="(prize, index) in prizeConfigs" :key="prize.id" class="prize-config-item">
                        <input v-model="prize.name" class="input" placeholder="奖项名称，如：一等奖" />
                        <input v-model.number="prize.count" type="number" min="1" class="input small-input"
                            placeholder="数量" />
                        <button class="danger-btn" @click="removePrize(index)">删除</button>
                    </div>
                </div>

                <div class="block">
                    <label class="block-title">当前抽取奖项</label>
                    <select v-model="currentPrizeIndex" class="select">
                        <option v-for="(prize, index) in prizeConfigs" :key="prize.id" :value="index">
                            {{ prize.name || `未命名奖项${index + 1}` }}
                        </option>
                    </select>
                </div>

                <div class="block">
                    <div class="action-group">
                        <button class="primary-btn" @click="startLottery" :disabled="isRolling">
                            开始抽奖
                        </button>
                        <button class="warn-btn" @click="stopLottery" :disabled="!isRolling">
                            停止抽奖
                        </button>
                        <button class="ghost-btn" @click="resetAll">重置结果</button>
                    </div>
                </div>
            </section>

            <!-- 中间主展示区 -->
            <section class="panel stage-panel">
                <div class="stage-prize">
                    当前奖项：
                    <span class="highlight">
                        {{ currentPrize?.name || '未选择奖项' }}
                    </span>
                </div>

                <div class="lottery-screen">
                    <div class="screen-title">幸运之星</div>
                    <div class="rolling-name">
                        {{ displayName }}
                    </div>
                    <div class="screen-subtitle">
                        {{
                            isRolling
                                ? '抽奖进行中，请等待结果...'
                                : '点击“开始抽奖”，再点击“停止抽奖”揭晓中奖者'
                        }}
                    </div>
                </div>

                <div class="winner-preview">
                    <h3>本奖项已中奖人数</h3>
                    <div class="preview-list">
                        <span v-for="winner in currentPrizeWinners" :key="winner" class="winner-tag">
                            {{ winner }}
                        </span>
                        <span v-if="currentPrizeWinners.length === 0" class="empty-text">
                            暂无中奖者
                        </span>
                    </div>
                </div>
            </section>

            <!-- 右侧结果区 -->
            <section class="panel result-panel">
                <h2>中奖结果</h2>

                <div v-for="prize in prizeConfigs" :key="prize.id" class="result-card">
                    <div class="result-header">
                        <span class="result-title">{{ prize.name || '未命名奖项' }}</span>
                        <span class="result-count">
                            {{ lotteryResults[prize.id]?.length || 0 }} / {{ prize.count || 0 }}
                        </span>
                    </div>

                    <div class="result-body">
                        <template v-if="lotteryResults[prize.id]?.length">
                            <span v-for="winner in lotteryResults[prize.id]" :key="winner" class="result-user">
                                {{ winner }}
                            </span>
                        </template>
                        <div v-else class="empty-text">还没有抽取</div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from 'vue'

const userText = ref(`张三
李四
王五
赵六
小明
小红
小刚
Lucy
Tom
Jerry
陈晨
林静
周航
许诺
王凯`)

const prizeConfigs = ref([
    { id: 1, name: '一等奖', count: 1 },
    { id: 2, name: '二等奖', count: 2 },
    { id: 3, name: '三等奖', count: 3 }
])

const currentPrizeIndex = ref(0)
const displayName = ref('点击开始抽奖')
const isRolling = ref(false)
const lotteryResults = ref({})

let timer = null

const userList = computed(() => {
    return userText.value
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean)
})

const currentPrize = computed(() => {
    return prizeConfigs.value[currentPrizeIndex.value]
})

const allWinners = computed(() => {
    return Object.values(lotteryResults.value).flat()
})

const availableUsers = computed(() => {
    const winnerSet = new Set(allWinners.value)
    return userList.value.filter(user => !winnerSet.has(user))
})

const currentPrizeWinners = computed(() => {
    const prize = currentPrize.value
    if (!prize) return []
    return lotteryResults.value[prize.id] || []
})

function addPrize() {
    prizeConfigs.value.push({
        id: Date.now(),
        name: `新奖项${prizeConfigs.value.length + 1}`,
        count: 1
    })
}

function removePrize(index) {
    const removed = prizeConfigs.value[index]
    if (!removed) return

    prizeConfigs.value.splice(index, 1)

    if (lotteryResults.value[removed.id]) {
        delete lotteryResults.value[removed.id]
    }

    if (currentPrizeIndex.value >= prizeConfigs.value.length) {
        currentPrizeIndex.value = Math.max(0, prizeConfigs.value.length - 1)
    }
}

function startLottery() {
    if (!currentPrize.value) {
        alert('请先配置奖项')
        return
    }

    if (userList.value.length === 0) {
        alert('请先输入参与抽奖的用户')
        return
    }

    const prize = currentPrize.value
    const currentWinners = lotteryResults.value[prize.id] || []

    if (currentWinners.length >= prize.count) {
        alert(`【${prize.name}】的中奖人数已经达到上限`)
        return
    }

    if (availableUsers.value.length === 0) {
        alert('没有可抽取的用户了')
        return
    }

    isRolling.value = true

    timer = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * availableUsers.value.length)
        displayName.value = availableUsers.value[randomIndex]
    }, 80)
}

function stopLottery() {
    if (!isRolling.value) return

    clearInterval(timer)
    timer = null
    isRolling.value = false

    const prize = currentPrize.value
    if (!prize) return

    const currentWinners = lotteryResults.value[prize.id] || []

    if (currentWinners.length >= prize.count) {
        alert(`【${prize.name}】的中奖人数已经达到上限`)
        return
    }

    if (availableUsers.value.length === 0) {
        alert('没有可抽取的用户了')
        displayName.value = '抽奖结束'
        return
    }

    const randomIndex = Math.floor(Math.random() * availableUsers.value.length)
    const winner = availableUsers.value[randomIndex]

    if (!lotteryResults.value[prize.id]) {
        lotteryResults.value[prize.id] = []
    }

    lotteryResults.value[prize.id].push(winner)
    displayName.value = winner
}

function resetAll() {
    clearInterval(timer)
    timer = null
    isRolling.value = false
    displayName.value = '点击开始抽奖'
    lotteryResults.value = {}
}

onBeforeUnmount(() => {
    clearInterval(timer)
})
</script>

<style scoped>
* {
    box-sizing: border-box;
}

.lottery-page {
    min-height: 100vh;
    color: #fff;
    padding: 24px;
    position: relative;
    overflow: hidden;
    background:
        radial-gradient(circle at top left, rgba(255, 215, 0, 0.25), transparent 30%),
        radial-gradient(circle at top right, rgba(255, 80, 80, 0.2), transparent 30%),
        linear-gradient(135deg, #1f1c2c, #2d1b4e, #111827);
}

.bg-decor {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
        radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.2;
}

.top-banner {
    position: relative;
    z-index: 1;
    text-align: center;
    margin-bottom: 24px;
}

.top-banner h1 {
    font-size: 40px;
    margin: 0;
    letter-spacing: 4px;
    color: #ffd666;
    text-shadow: 0 0 12px rgba(255, 214, 102, 0.35);
}

.top-banner p {
    margin-top: 8px;
    color: #ddd;
    font-size: 14px;
}

.content {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 320px 1fr 320px;
    gap: 20px;
}

.panel {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    padding: 20px;
}

.config-panel h2,
.result-panel h2 {
    margin-top: 0;
    margin-bottom: 18px;
    color: #ffd666;
}

.block {
    margin-bottom: 18px;
}

.block-title {
    display: block;
    font-size: 14px;
    margin-bottom: 8px;
    color: #f3f3f3;
}

.textarea {
    width: 100%;
    min-height: 180px;
    resize: vertical;
    border: none;
    outline: none;
    border-radius: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.12);
    color: white;
    font-size: 14px;
}

.textarea::placeholder,
.input::placeholder {
    color: rgba(255, 255, 255, 0.45);
}

.input,
.select {
    width: 100%;
    height: 40px;
    border: none;
    outline: none;
    border-radius: 10px;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.12);
    color: white;
}

.select option {
    color: #333;
}

.small-input {
    width: 90px;
}

.row-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.prize-config-item {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.tips {
    margin-top: 8px;
    color: #ccc;
    font-size: 12px;
}

.action-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.primary-btn,
.warn-btn,
.ghost-btn,
.mini-btn,
.danger-btn {
    border: none;
    cursor: pointer;
    border-radius: 10px;
    padding: 10px 14px;
    color: #fff;
    transition: all 0.2s;
}

.primary-btn {
    background: linear-gradient(135deg, #ff9a3c, #ff4d4f);
}

.warn-btn {
    background: linear-gradient(135deg, #faad14, #d48806);
}

.ghost-btn {
    background: rgba(255, 255, 255, 0.14);
}

.mini-btn {
    background: rgba(255, 255, 255, 0.14);
    font-size: 12px;
    padding: 8px 12px;
}

.danger-btn {
    background: rgba(255, 77, 79, 0.8);
    font-size: 12px;
}

.primary-btn:hover,
.warn-btn:hover,
.ghost-btn:hover,
.mini-btn:hover,
.danger-btn:hover {
    transform: translateY(-1px);
    opacity: 0.92;
}

.primary-btn:disabled,
.warn-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
}

.stage-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.stage-prize {
    text-align: center;
    font-size: 22px;
    margin-bottom: 20px;
}

.highlight {
    color: #ffd666;
    font-weight: bold;
}

.lottery-screen {
    min-height: 320px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background:
        linear-gradient(135deg, rgba(255, 215, 0, 0.12), rgba(255, 77, 79, 0.08)),
        rgba(0, 0, 0, 0.18);
    border: 2px solid rgba(255, 214, 102, 0.25);
    box-shadow: inset 0 0 30px rgba(255, 214, 102, 0.08);
}

.screen-title {
    font-size: 24px;
    color: #ffd666;
    margin-bottom: 18px;
    letter-spacing: 2px;
}

.rolling-name {
    font-size: 64px;
    font-weight: 800;
    color: #fff;
    text-shadow: 0 0 16px rgba(255, 255, 255, 0.35);
    margin-bottom: 16px;
    word-break: break-word;
    text-align: center;
    padding: 0 20px;
}

.screen-subtitle {
    font-size: 14px;
    color: #ddd;
}

.winner-preview {
    margin-top: 20px;
}

.winner-preview h3 {
    margin: 0 0 12px;
    color: #ffd666;
}

.preview-list,
.result-body {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.winner-tag,
.result-user {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    font-size: 14px;
}

.result-card {
    margin-bottom: 16px;
    padding: 14px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.06);
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.result-title {
    font-size: 16px;
    font-weight: bold;
    color: #ffd666;
}

.result-count {
    color: #ccc;
    font-size: 13px;
}

.empty-text {
    color: #bbb;
    font-size: 13px;
}

@media (max-width: 1200px) {
    .content {
        grid-template-columns: 1fr;
    }

    .rolling-name {
        font-size: 46px;
    }
}
</style>