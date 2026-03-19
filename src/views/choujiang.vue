<template>
  <div
    class="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#b91c1c_0%,#7f1d1d_22%,#450a0a_58%,#1f0708_100%)] text-rose-50"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-300/[0.12] blur-3xl"></div>
      <div class="absolute right-0 top-24 h-80 w-80 rounded-full bg-amber-200/10 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-red-500/10 blur-3xl"></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:26px_26px] opacity-[0.15]"
      ></div>
    </div>

    <div class="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-5 sm:px-6 lg:px-8">
      <header :class="heroClass">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div class="space-y-4">
            <div
              class="inline-flex items-center gap-2 rounded-full border border-amber-200/[0.15] bg-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-amber-100/90 shadow-[inset_1px_1px_0_rgba(255,255,255,0.2)]"
            >
              Annual Gala Lucky Draw
            </div>
            <div class="space-y-2">
              <h1 class="text-3xl font-black tracking-[0.2em] text-amber-100 sm:text-4xl lg:text-5xl">
                公司年会抽奖
              </h1>
              <p class="max-w-2xl text-sm leading-6 text-rose-100/75 sm:text-base">
                以红金新拟态风格重做的年会抽奖大屏，兼顾展示感和现场操作效率。
              </p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div
              v-for="card in overviewCards"
              :key="card.label"
              class="min-w-[170px] rounded-[26px] border border-white/10 bg-white/[0.06] px-5 py-4 shadow-[14px_14px_28px_rgba(72,8,21,0.42),-10px_-10px_24px_rgba(255,121,144,0.05),inset_1px_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
            >
              <div class="text-xs uppercase tracking-[0.24em] text-rose-100/[0.55]">{{ card.label }}</div>
              <div class="mt-3 text-2xl font-black text-amber-100">{{ card.value }}</div>
              <div class="mt-1 text-xs text-rose-100/60">{{ card.tip }}</div>
            </div>
          </div>
        </div>
      </header>

      <main class="mt-6 grid flex-1 gap-6 xl:grid-cols-[360px,minmax(0,1fr),340px]">
        <section :class="panelClass">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold tracking-[0.14em] text-amber-100">抽奖配置</h2>
              <p class="mt-1 text-xs text-rose-100/[0.55]">录入参与名单并设置每个奖项的名额。</p>
            </div>
            <div
              class="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-rose-100/70 shadow-[inset_1px_1px_0_rgba(255,255,255,0.12)]"
            >
              操作台
            </div>
          </div>

          <div class="mt-5 space-y-5">
            <div :class="insetCardClass">
              <div class="flex items-center justify-between">
                <label class="text-sm font-semibold text-rose-50">参与名单</label>
                <span class="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-rose-100/[0.65]">
                  共 {{ userList.length }} 人
                </span>
              </div>
              <textarea
                v-model="userText"
                class="mt-4 h-60 w-full resize-none rounded-[22px] border border-white/[0.08] bg-[#7f1328]/[0.55] px-4 py-4 text-sm text-rose-50 outline-none shadow-[inset_10px_10px_24px_rgba(72,8,21,0.45),inset_-8px_-8px_18px_rgba(255,123,146,0.06)] placeholder:text-rose-100/30 focus:border-amber-200/30 focus:ring-2 focus:ring-amber-200/20"
                placeholder="例如：&#10;张三&#10;李四&#10;王五&#10;赵六"
              ></textarea>
              <div class="mt-4 flex flex-wrap gap-2 text-xs text-rose-100/60">
                <span class="rounded-full bg-white/[0.07] px-3 py-1">未中奖 {{ availableUsers.length }} 人</span>
                <span class="rounded-full bg-white/[0.07] px-3 py-1">已中奖 {{ totalWinners }} 人</span>
              </div>
            </div>

            <div :class="insetCardClass">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-rose-50">奖项设置</div>
                  <div class="mt-1 text-xs text-rose-100/[0.55]">支持多档奖项和自定义数量。</div>
                </div>
                <button :class="secondaryButtonClass" :disabled="isRolling" @click="addPrize">
                  添加奖项
                </button>
              </div>

              <div class="mt-4 space-y-3">
                <div
                  v-for="(prize, index) in prizeConfigs"
                  :key="prize.id"
                  class="rounded-[22px] border border-white/[0.08] bg-white/5 p-3 shadow-[inset_8px_8px_18px_rgba(70,8,21,0.3),inset_-4px_-4px_12px_rgba(255,123,146,0.04)]"
                >
                  <div class="flex gap-3">
                    <input
                      v-model="prize.name"
                      :disabled="isRolling"
                      class="min-w-0 flex-1 rounded-[18px] border border-white/[0.08] bg-[#731126]/60 px-4 py-3 text-sm text-rose-50 outline-none placeholder:text-rose-100/30 focus:border-amber-200/[0.35] focus:ring-2 focus:ring-amber-200/20 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="例如：一等奖"
                    />
                    <input
                      v-model.number="prize.count"
                      :disabled="isRolling"
                      type="number"
                      min="1"
                      class="w-24 rounded-[18px] border border-white/[0.08] bg-[#731126]/60 px-3 py-3 text-center text-sm text-rose-50 outline-none placeholder:text-rose-100/30 focus:border-amber-200/[0.35] focus:ring-2 focus:ring-amber-200/20 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="数量"
                    />
                  </div>
                  <div class="mt-3 flex items-center justify-between text-xs text-rose-100/[0.55]">
                    <span>已抽 {{ lotteryResults[prize.id]?.length || 0 }} / {{ normalizedPrizeCount(prize) }}</span>
                    <button :class="dangerButtonClass" :disabled="isRolling" @click="removePrize(index)">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div :class="insetCardClass">
              <label class="text-sm font-semibold text-rose-50">当前抽取奖项</label>
              <select
                v-model="currentPrizeIndex"
                :disabled="isRolling"
                class="mt-4 w-full rounded-[20px] border border-white/[0.08] bg-[#7a1227]/[0.65] px-4 py-3 text-sm text-rose-50 outline-none shadow-[inset_8px_8px_18px_rgba(72,8,21,0.38),inset_-6px_-6px_16px_rgba(255,123,146,0.05)] focus:border-amber-200/30 focus:ring-2 focus:ring-amber-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option v-for="(prize, index) in prizeConfigs" :key="prize.id" :value="index">
                  {{ prize.name || `未命名奖项 ${index + 1}` }}
                </option>
              </select>
              <div class="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div class="rounded-[18px] bg-white/[0.06] px-4 py-3 text-rose-100/[0.65]">
                  当前进度
                  <div class="mt-1 text-base font-bold text-amber-100">{{ currentPrizeProgress }}</div>
                </div>
                <div class="rounded-[18px] bg-white/[0.06] px-4 py-3 text-rose-100/[0.65]">
                  剩余席位
                  <div class="mt-1 text-base font-bold text-amber-100">{{ remainingSlots }}</div>
                </div>
              </div>
            </div>

            <div :class="insetCardClass">
              <div class="text-sm font-semibold text-rose-50">抽奖控制</div>
              <div class="mt-4 grid gap-3 sm:grid-cols-3">
                <button :class="primaryButtonClass" :disabled="isRolling" @click="startLottery">
                  开始抽奖
                </button>
                <button :class="warningButtonClass" :disabled="!isRolling" @click="stopLottery">
                  停止抽奖
                </button>
                <button :class="ghostButtonClass" @click="resetAll">重置结果</button>
              </div>
              <p class="mt-4 text-xs leading-6 text-rose-100/[0.55]">
                建议现场使用大屏投放，操作员只需要切换奖项并点击开始/停止即可。
              </p>
            </div>
          </div>
        </section>

        <section :class="stagePanelClass">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div class="text-xs uppercase tracking-[0.3em] text-rose-100/[0.55]">Now Drawing</div>
              <div class="mt-2 text-2xl font-black tracking-[0.12em] text-amber-100 sm:text-3xl">
                {{ currentPrize?.name || '请先选择奖项' }}
              </div>
            </div>

            <div class="w-full max-w-xs rounded-[24px] border border-white/10 bg-white/[0.06] p-4 shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)]">
              <div class="flex items-center justify-between text-xs text-rose-100/[0.55]">
                <span>奖项完成度</span>
                <span>{{ currentPrizeProgress }}</span>
              </div>
              <div class="mt-3 h-3 rounded-full bg-[#5f0d1a]/80 p-[2px] shadow-[inset_4px_4px_10px_rgba(43,4,11,0.5)]">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-red-300 shadow-[0_0_18px_rgba(253,224,71,0.45)] transition-all duration-500"
                  :style="{ width: `${currentPrizeFill * 100}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div class="relative mt-6 flex-1 rounded-[38px] border border-white/10 bg-white/5 p-4 shadow-[18px_18px_40px_rgba(60,7,18,0.48),-14px_-14px_30px_rgba(255,130,150,0.05),inset_1px_1px_0_rgba(255,255,255,0.06)]">
            <div class="absolute inset-6 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(253,230,138,0.16),transparent_40%),linear-gradient(145deg,rgba(128,17,42,0.88),rgba(69,10,20,0.96))]"></div>
            <div
              class="relative flex min-h-[460px] flex-col items-center justify-center rounded-[32px] border border-white/10 bg-[#7a1024]/40 px-6 py-10 text-center shadow-[inset_16px_16px_30px_rgba(73,8,21,0.4),inset_-12px_-12px_28px_rgba(255,123,146,0.05)]"
            >
              <div
                class="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/[0.08] px-4 py-2 text-xs uppercase tracking-[0.3em] text-amber-100/[0.85]"
                :class="{ 'animate-pulse': isRolling }"
              >
                幸运时刻
              </div>

              <div class="mt-8 text-sm tracking-[0.28em] text-rose-100/[0.55]">Lucky Name</div>
              <div
                class="mt-6 max-w-full break-words px-4 text-5xl font-black tracking-[0.08em] text-amber-50 drop-shadow-[0_0_28px_rgba(255,244,212,0.28)] sm:text-6xl xl:text-7xl"
              >
                {{ displayName }}
              </div>
              <div class="mt-8 max-w-2xl text-sm leading-7 text-rose-100/[0.65]">
                {{ stageHint }}
              </div>

              <div class="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
                <div
                class="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4 text-left shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)]"
                >
                  <div class="text-xs uppercase tracking-[0.22em] text-rose-100/50">当前状态</div>
                  <div class="mt-2 text-base font-bold text-amber-100">{{ isRolling ? '滚动中' : '等待开奖' }}</div>
                </div>
                <div
                class="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4 text-left shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)]"
                >
                  <div class="text-xs uppercase tracking-[0.22em] text-rose-100/50">剩余候选</div>
                  <div class="mt-2 text-base font-bold text-amber-100">{{ availableUsers.length }} 人</div>
                </div>
                <div
                class="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4 text-left shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)]"
                >
                  <div class="text-xs uppercase tracking-[0.22em] text-rose-100/50">本轮中奖</div>
                  <div class="mt-2 text-base font-bold text-amber-100">{{ currentPrizeWinners.length }} 人</div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
            <div :class="insetCardClass">
              <div class="flex items-center justify-between">
                <div class="text-sm font-semibold text-rose-50">本奖项中奖名单</div>
                <div class="text-xs text-rose-100/[0.55]">{{ currentPrizeWinners.length }} 人</div>
              </div>
              <div class="mt-4 flex min-h-[92px] flex-wrap gap-3">
                <template v-if="currentPrizeWinners.length">
                  <span
                    v-for="winner in currentPrizeWinners"
                    :key="winner"
                    class="inline-flex items-center rounded-full border border-amber-200/10 bg-white/[0.08] px-4 py-2 text-sm text-amber-50 shadow-[6px_6px_12px_rgba(72,8,21,0.28),-4px_-4px_10px_rgba(255,123,146,0.04)]"
                  >
                    {{ winner }}
                  </span>
                </template>
                <div v-else class="flex items-center text-sm text-rose-100/45">当前奖项还没有抽出中奖者。</div>
              </div>
            </div>

            <div :class="insetCardClass">
              <div class="text-sm font-semibold text-rose-50">舞台提示</div>
              <ul class="mt-4 space-y-3 text-sm leading-6 text-rose-100/[0.58]">
                <li>1. 先在左侧录入名单和奖项，再选择当前抽取的奖项。</li>
                <li>2. 点击“开始抽奖”进入滚动，再点击“停止抽奖”锁定中奖人。</li>
                <li>3. 右侧结果区会自动累计所有奖项的中奖记录。</li>
              </ul>
            </div>
          </div>
        </section>

        <section :class="panelClass">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold tracking-[0.14em] text-amber-100">中奖结果</h2>
              <p class="mt-1 text-xs text-rose-100/[0.55]">按奖项分组展示，适合现场核对和拍照留档。</p>
            </div>
            <div
              class="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-rose-100/70 shadow-[inset_1px_1px_0_rgba(255,255,255,0.12)]"
            >
              已抽 {{ totalWinners }} 人
            </div>
          </div>

          <div class="mt-5 space-y-4">
            <div
              v-for="prize in prizeConfigs"
              :key="prize.id"
              class="rounded-[26px] border border-white/10 bg-white/[0.06] p-4 shadow-[16px_16px_28px_rgba(71,8,21,0.38),-8px_-8px_20px_rgba(255,123,146,0.05),inset_1px_1px_0_rgba(255,255,255,0.08)]"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-base font-bold text-amber-100">{{ prize.name || '未命名奖项' }}</div>
                  <div class="mt-1 text-xs text-rose-100/50">
                    剩余 {{ remainingCount(prize) }} 个名额
                  </div>
                </div>
                <div
                  class="rounded-full border border-amber-200/10 bg-white/[0.08] px-3 py-1 text-xs text-amber-100/90"
                >
                  {{ lotteryResults[prize.id]?.length || 0 }} / {{ normalizedPrizeCount(prize) }}
                </div>
              </div>

              <div class="mt-4 h-2 rounded-full bg-[#5f0d1a]/80 p-[2px] shadow-[inset_4px_4px_10px_rgba(43,4,11,0.5)]">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-red-300 transition-all duration-500"
                  :style="{ width: `${prizeFill(prize) * 100}%` }"
                ></div>
              </div>

              <div class="mt-4 flex min-h-[76px] flex-wrap gap-2">
                <template v-if="lotteryResults[prize.id]?.length">
                  <span
                    v-for="winner in lotteryResults[prize.id]"
                    :key="`${prize.id}-${winner}`"
                    class="inline-flex items-center rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm text-rose-50 shadow-[6px_6px_12px_rgba(72,8,21,0.28),-4px_-4px_10px_rgba(255,123,146,0.04)]"
                  >
                    {{ winner }}
                  </span>
                </template>
                <div v-else class="flex items-center text-sm text-rose-100/40">这个奖项还没有抽奖结果。</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

type PrizeConfig = {
  id: number
  name: string
  count: number
}

type LotteryResults = Record<number, string[]>

const defaultDisplayName = '点击开始抽奖'
const initialUserText = `张三
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
王凯`

const createInitialPrizeConfigs = (): PrizeConfig[] => [
  { id: 1, name: '一等奖', count: 1 },
  { id: 2, name: '二等奖', count: 2 },
  { id: 3, name: '三等奖', count: 3 },
]

const heroClass =
  'rounded-[38px] border border-white/10 bg-[linear-gradient(145deg,rgba(138,20,41,0.9),rgba(94,12,28,0.92))] p-6 shadow-[22px_22px_44px_rgba(61,7,18,0.5),-16px_-16px_32px_rgba(255,122,145,0.05),inset_1px_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-8'
const panelClass =
  'rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(125,16,36,0.84),rgba(88,10,24,0.92))] p-5 shadow-[20px_20px_40px_rgba(61,7,18,0.48),-14px_-14px_28px_rgba(255,122,145,0.05),inset_1px_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl'
const stagePanelClass =
  'rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(134,18,39,0.82),rgba(85,10,24,0.92))] p-5 shadow-[20px_20px_40px_rgba(61,7,18,0.48),-14px_-14px_28px_rgba(255,122,145,0.05),inset_1px_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl'
const insetCardClass =
  'rounded-[28px] border border-white/[0.08] bg-white/5 p-4 shadow-[inset_14px_14px_24px_rgba(72,8,21,0.32),inset_-10px_-10px_24px_rgba(255,123,146,0.04)]'
const buttonBaseClass =
  'inline-flex items-center justify-center rounded-[18px] px-4 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-45'
const primaryButtonClass = `${buttonBaseClass} bg-gradient-to-br from-amber-200 via-orange-300 to-red-300 text-red-950 shadow-[10px_10px_20px_rgba(62,7,18,0.28),inset_1px_1px_0_rgba(255,255,255,0.4)] hover:-translate-y-0.5`
const warningButtonClass = `${buttonBaseClass} bg-gradient-to-br from-red-200 via-rose-200 to-orange-200 text-red-950 shadow-[10px_10px_20px_rgba(62,7,18,0.28),inset_1px_1px_0_rgba(255,255,255,0.35)] hover:-translate-y-0.5`
const ghostButtonClass = `${buttonBaseClass} border border-white/10 bg-white/[0.08] text-rose-50 shadow-[10px_10px_20px_rgba(62,7,18,0.2),inset_1px_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-0.5`
const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-semibold text-rose-50 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45'
const dangerButtonClass =
  'inline-flex items-center justify-center rounded-full border border-red-200/[0.15] bg-red-500/[0.18] px-3 py-1 text-xs font-medium text-rose-50 transition hover:bg-red-500/[0.28] disabled:cursor-not-allowed disabled:opacity-45'

const userText = ref(initialUserText)
const prizeConfigs = ref<PrizeConfig[]>(createInitialPrizeConfigs())
const currentPrizeIndex = ref(0)
const displayName = ref(defaultDisplayName)
const isRolling = ref(false)
const lotteryResults = ref<LotteryResults>({})

let timer: ReturnType<typeof setInterval> | null = null

const userList = computed(() =>
  userText.value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean),
)

const currentPrize = computed(() => prizeConfigs.value[currentPrizeIndex.value] ?? null)

const allWinners = computed(() => Object.values(lotteryResults.value).flat())

const availableUsers = computed(() => {
  const winnerSet = new Set(allWinners.value)
  return userList.value.filter((user) => !winnerSet.has(user))
})

const currentPrizeWinners = computed(() => {
  const prize = currentPrize.value
  if (!prize) return []
  return lotteryResults.value[prize.id] ?? []
})

const totalPrizeSlots = computed(() =>
  prizeConfigs.value.reduce((total, prize) => total + normalizedPrizeCount(prize), 0),
)

const totalWinners = computed(() => allWinners.value.length)

const remainingSlots = computed(() => Math.max(totalPrizeSlots.value - totalWinners.value, 0))

const currentPrizeProgress = computed(() => {
  const prize = currentPrize.value
  if (!prize) return '0 / 0'
  return `${currentPrizeWinners.value.length} / ${normalizedPrizeCount(prize)}`
})

const currentPrizeFill = computed(() => {
  const prize = currentPrize.value
  if (!prize) return 0
  const total = normalizedPrizeCount(prize)
  if (total === 0) return 0
  return Math.min(currentPrizeWinners.value.length / total, 1)
})

const stageHint = computed(() => {
  if (isRolling.value) {
    return '正在快速滚动候选名单，适合现场配合音乐和主持人口播制造开奖氛围。'
  }

  if (totalWinners.value === 0) {
    return '点击“开始抽奖”进入滚动状态，再点击“停止抽奖”锁定中奖者。'
  }

  return '当前已停止滚动，你可以切换奖项继续下一轮，或直接重置后重新开始。'
})

const overviewCards = computed(() => [
  {
    label: '参与人数',
    value: `${userList.value.length} 人`,
    tip: '已录入抽奖池名单',
  },
  {
    label: '已中奖',
    value: `${totalWinners.value} 人`,
    tip: '所有奖项累计结果',
  },
  {
    label: '剩余席位',
    value: `${remainingSlots.value} 个`,
    tip: '待抽奖项名额总数',
  },
])

function normalizedPrizeCount(prize: PrizeConfig) {
  const count = Number(prize.count)
  if (!Number.isFinite(count) || count < 0) return 0
  return Math.floor(count)
}

function prizeFill(prize: PrizeConfig) {
  const total = normalizedPrizeCount(prize)
  if (total === 0) return 0
  return Math.min((lotteryResults.value[prize.id]?.length ?? 0) / total, 1)
}

function remainingCount(prize: PrizeConfig) {
  return Math.max(normalizedPrizeCount(prize) - (lotteryResults.value[prize.id]?.length ?? 0), 0)
}

function clearTimer() {
  if (!timer) return
  clearInterval(timer)
  timer = null
}

function randomUser(list: string[]) {
  if (list.length === 0) return ''
  const index = Math.floor(Math.random() * list.length)
  return list[index]
}

function addPrize() {
  prizeConfigs.value.push({
    id: Date.now(),
    name: `新奖项 ${prizeConfigs.value.length + 1}`,
    count: 1,
  })
}

function removePrize(index: number) {
  if (prizeConfigs.value.length === 1) {
    window.alert('至少保留一个奖项')
    return
  }

  clearTimer()
  isRolling.value = false

  const removed = prizeConfigs.value[index]
  if (!removed) return

  prizeConfigs.value.splice(index, 1)

  if (lotteryResults.value[removed.id]) {
    const nextResults = { ...lotteryResults.value }
    delete nextResults[removed.id]
    lotteryResults.value = nextResults
  }

  if (currentPrizeIndex.value >= prizeConfigs.value.length) {
    currentPrizeIndex.value = Math.max(prizeConfigs.value.length - 1, 0)
  }

  displayName.value = defaultDisplayName
}

function ensureLotteryReady() {
  const prize = currentPrize.value

  if (!prize) {
    window.alert('请先配置奖项')
    return null
  }

  if (userList.value.length === 0) {
    window.alert('请先输入参与抽奖的名单')
    return null
  }

  const prizeCount = normalizedPrizeCount(prize)
  if (prizeCount <= 0) {
    window.alert('当前奖项数量必须大于 0')
    return null
  }

  if ((lotteryResults.value[prize.id]?.length ?? 0) >= prizeCount) {
    window.alert(`“${prize.name || '当前奖项'}”的中奖人数已经达到上限`)
    return null
  }

  if (availableUsers.value.length === 0) {
    window.alert('没有可抽取的候选人了')
    return null
  }

  return prize
}

function startLottery() {
  const prize = ensureLotteryReady()
  if (!prize) return

  clearTimer()
  isRolling.value = true

  timer = setInterval(() => {
    displayName.value = randomUser(availableUsers.value) || prize.name
  }, 90)
}

function stopLottery() {
  if (!isRolling.value) return

  clearTimer()
  isRolling.value = false

  const prize = currentPrize.value
  if (!prize) {
    displayName.value = defaultDisplayName
    return
  }

  const prizeCount = normalizedPrizeCount(prize)
  const winners = lotteryResults.value[prize.id] ?? []

  if (winners.length >= prizeCount) {
    window.alert(`“${prize.name || '当前奖项'}”的中奖人数已经达到上限`)
    return
  }

  const winner = randomUser(availableUsers.value)
  if (!winner) {
    displayName.value = '抽奖完成'
    return
  }

  lotteryResults.value = {
    ...lotteryResults.value,
    [prize.id]: [...winners, winner],
  }

  displayName.value = winner
}

function resetAll() {
  clearTimer()
  isRolling.value = false
  displayName.value = defaultDisplayName
  lotteryResults.value = {}
}

onBeforeUnmount(() => {
  clearTimer()
})
</script>
