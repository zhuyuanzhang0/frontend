<template>
    <div class="p-6 bg-gray-50 min-h-screen">
        <!-- 头部导航 -->
        <div class="flex items-center justify-between mb-6">
            <div class="flex space-x-4 text-sm font-medium text-gray-700 border-b pb-2">
                <button class="border-b-2 border-transparent hover:border-blue-500">大模型配置</button>
                <button class="border-b-2 border-blue-500 text-blue-600">大模型使用记录</button>
            </div>
            <div class="flex space-x-2">
                <button
                    class="px-4 py-1.5 text-sm rounded-md bg-white border border-gray-300 hover:bg-gray-50">个人</button>
                <button
                    class="px-4 py-1.5 text-sm rounded-md bg-gray-100 text-gray-600 border border-gray-300">团队</button>
            </div>
        </div>

        <!-- 日期与导出按钮 -->
        <div class="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div class="flex items-center space-x-2">
                <i class="iconify" data-icon="carbon:calendar" style="color: #6B7280; font-size: 16px;"></i>
                <input type="date" v-model="selectedDate"
                    class="border border-gray-300 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button @click="exportReport" class="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                <i class="iconify" data-icon="carbon:export" style="color: #2563eb; font-size: 16px;"></i>
                <span>Export Report</span>
            </button>
        </div>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow-sm border">
                <div class="text-sm text-gray-500">总token</div>
                <div class="text-2xl font-bold mt-1">{{ totalTokens }}</div>
                <div class="text-xs mt-1 text-green-600">+14%</div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border">
                <div class="text-sm text-gray-500">本月使用token</div>
                <div class="text-2xl font-bold mt-1">{{ monthlyTokens }}</div>
                <div class="text-xs mt-1 text-green-600">+14%</div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border">
                <div class="text-sm text-gray-500">较上周浮动</div>
                <div class="text-2xl font-bold mt-1 text-green-600">+42%</div>
                <div class="flex items-center mt-1">
                    <i class="iconify" data-icon="carbon:chart-up" style="color: #10b981; font-size: 14px;"></i>
                </div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border">
                <div class="text-sm text-gray-500">较上月浮动</div>
                <div class="text-2xl font-bold mt-1 text-red-600">-28%</div>
                <div class="flex items-center mt-1">
                    <i class="iconify" data-icon="carbon:chart-down" style="color: #ef4444; font-size: 14px;"></i>
                </div>
            </div>
        </div>

        <!-- 使用趋势图 -->
        <div class="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-800">使用趋势</h3>
                <div class="flex items-center space-x-2">
                    <div class="flex items-center space-x-1">
                        <div class="w-3 h-3 rounded-full bg-purple-600"></div>
                        <span class="text-xs text-gray-600">花费</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span class="text-xs text-gray-600">Tokens</span>
                    </div>
                </div>
            </div>
            <div class="h-64 flex items-center justify-center relative">
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <i class="iconify" data-icon="carbon:chart-line" style="color: #9ca3af; font-size: 48px;"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Token使用明细和分布 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Token使用明细 -->
            <div class="bg-white p-6 rounded-lg shadow-sm border">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-800">Token使用明细</h3>
                    <div class="flex items-center space-x-2 text-xs">
                        <div class="flex items-center space-x-1">
                            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>已使用: 8,000</span>
                        </div>
                        <div class="flex items-center space-x-1">
                            <div class="w-3 h-3 rounded-full bg-gray-300"></div>
                            <span>剩余: 2,000</span>
                        </div>
                    </div>
                </div>
                <div class="space-y-3">
                    <div v-for="item in tokenDetails" :key="item.id" >
                        <div class="flex items-center justify-between">

                        <div class="flex items-center space-x-2">
                            <div :class="`w-3 h-3 rounded-full`" :style="`background:${item.color}`"></div>
                            <span class="text-gray-700">{{ item.name }}</span>
                        </div>

                        <div class="flex items-center space-x-2">
                            <span class="font-medium">{{ item.value }}</span>
                            <span class="text-xs text-gray-500">{{ item.percent }}%</span>
                        </div>

                        </div>
                        <ProgressBar :value="item.percent" :class="`progress-bar-custom`" :style="{ '--progress-color': item.color }"></ProgressBar>

                    </div>
                </div>
            </div>



            <!-- 不同类型token使用分布 -->
            <div class="bg-white p-6 rounded-lg shadow-sm border">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-800">不同类型token使用分布</h3>
                    <div class="text-sm text-gray-600">总量：8,790</div>
                </div>
                <div class="h-64 flex items-center justify-center relative">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <i class="iconify" data-icon="carbon:pie-chart"
                                style="color: #9ca3af; font-size: 48px;"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import ProgressBar from 'primevue/progressbar';
import { ref } from 'vue'
const selectedDate = ref('2025-07-09')
const totalTokens = ref('1,200,000')
const monthlyTokens = ref('1,100')
const tokenDetails = [
    { id: 1, name: '对话', value: '2,645', percent: 33.1, color: '#1f2937' },
    { id: 2, name: '文件生成', value: '1,920', percent: 24.0, color: '#8b5cf6' },
    { id: 3, name: '追溯性建立', value: '1,580', percent: 19.8, color: '#dc2626' },
    { id: 4, name: '评审', value: '1,230', percent: 15.4, color: '#ea580c' },
    { id: 5, name: '使用指南问答', value: '880', percent: 11.0, color: '#3b82f6' },
    { id: 6, name: 'RAG', value: '535', percent: 6.7, color: '#f97316' }
]
function exportReport() {
    // 占位方法，实际逻辑由团队统一处理
}
</script>

<style scoped>
/* 自定义 ProgressBar 样式 */
::v-deep .p-progressbar-value {
  background: var(--progress-color) !important; /* 使用 CSS 变量 */
}
</style>