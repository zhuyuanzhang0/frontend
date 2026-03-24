<template>
    <div class="con text-slate-900" style="overflow: auto;">
        <div class="mx-auto max-w-[70vw] p-6">
            <div class="rounded-2xl border border-slate-200  shadow-sm liquid-bg">
                <div
                    class="flex flex-col gap-4 border-b border-slate-200 px-5 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex flex-wrap items-center gap-3">
                        <h1 class="text-2xl font-semibold tracking-tight">日历日程</h1>
                        <span class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{{ headerLabel
                        }}</span>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <div class="inline-flex rounded-xl border border-slate-200 bg-slate-50">
                            <button class="rounded-lg px-4 py-1 text-sm font-medium transition"
                                :class="viewMode === 'month' ? ' text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                                @click="viewMode = 'month'">
                                月视图
                            </button>
                            <button class="rounded-lg px-4 py-1 text-sm font-medium transition"
                                :class="viewMode === 'week' ? ' text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                                @click="viewMode = 'week'">
                                周视图
                            </button>
                        </div>

                        <div class="flex items-center gap-2">
                            <Button text @click="goToday">
                                <span class="text-white hover:text-slate-800">今天</span>
                            </Button>

                            <Button icon="picon:left" text rounded aria-label="prev" @click="goPrev">
                                <Icon icon="picon:left" width="24" height="24" class="text-white hover:text-slate-800" />
                            </Button>
                            <Button icon="picon:left" text rounded aria-label="prev" @click="goNext">
                                <Icon icon="picon:right" width="24" height="24" class="text-white hover:text-slate-800" />
                            </Button>
                            <!-- <Button icon="pi pi-angle-right" text rounded aria-label="next" @click="goNext" /> -->
                        </div>

                    </div>
                </div>

                <div v-if="viewMode === 'month'" class="p-5">
                    <div class="grid grid-cols-7 overflow-hidden rounded-2xl border border-slate-200">
                        <div v-for="weekDay in weekDayLabels" :key="weekDay"
                            class="border-b border-r border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm font-medium text-slate-600 last:border-r-0">
                            {{ weekDay }}
                        </div>

                        <div v-for="day in monthDays" :key="day.key"
                            class="relative min-h-[50px] border-r border-b border-slate-200  p-2 last:border-r-0 "
                            :class="day.isCurrentMonth ? 'bg-slate-50/10 text-white' : 'bg-slate-50/70 text-slate-900'"
                            @dblclick="openCreateDialog(day.date)">
                            <div class="mb-2 flex items-center justify-between">
                                <button
                                    class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition "
                                    :class="isSameDate(day.date, today) ? 'bg-slate-900' : 'hover:bg-slate-100 hover:text-black'"
                                    @click.stop="openCreateDialog(day.date)">
                                    {{ day.date.getDate() }}
                                </button>
                            </div>

                            <div class="space-y-1">
                                <button v-for="calendarEvent in getMonthCellVisibleEvents(day.date)"
                                    :key="calendarEvent.id"
                                    class="block w-full truncate rounded-md px-2 py-1 text-left text-xs font-medium text-white"
                                    :style="{ backgroundColor: calendarEvent.color }"
                                    @click.stop="openEventCard($event, calendarEvent)">
                                    {{ getMonthEventLabel(calendarEvent, day.date) }}
                                </button>

                                <div v-if="getDayEvents(day.date).length > monthEventLimit"
                                    class="px-1 text-xs text-slate-500">
                                    + {{ getDayEvents(day.date).length - monthEventLimit }} 条更多
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="p-5">
                    <div class="overflow-hidden rounded-2xl border border-slate-200">
                        <div
                            class="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-slate-50">
                            <div class="border-r border-slate-200"></div>
                            <div v-for="day in weekDays" :key="day.toISOString()"
                                class="border-r border-slate-200 px-3 py-3 text-center last:border-r-0">
                                <div class="text-sm font-medium text-slate-600">{{ formatWeekDay(day) }}</div>
                                <div class="mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                                    :class="isSameDate(day, today) ? 'bg-slate-900 text-white' : 'text-slate-900'">
                                    {{ day.getDate() }}
                                </div>
                            </div>
                        </div>

                        <div class="max-h-[50vh] overflow-auto">
                            <div class="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]"
                                :style="{ minHeight: `${weekGridHeight}px` }">
                                <div class="relative border-r border-slate-200 ">
                                    <div v-for="hour in 24" :key="hour" class="relative border-b border-slate-200"
                                        :style="{ height: `${hourRowHeight}px` }">
                                        <span class="absolute -top-2 right-2  px-1 text-xs text-black">
                                            {{ formatHour(hour - 1) }}
                                        </span>
                                    </div>
                                </div>

                                <div v-for="day in weekDays" :key="day.toISOString() + '-column'"
                                    class="relative border-r border-slate-200  last:border-r-0"
                                    :style="{ height: `${weekGridHeight}px` }">
                                    <div v-for="hour in 24" :key="`${day.toISOString()}-${hour}`"
                                        class="border-b border-slate-200" :style="{ height: `${hourRowHeight}px` }">
                                    </div>

                                    <button v-for="segment in getWeekSegments(day)" :key="segment.segmentKey"
                                        class=" absolute left-1 right-1 overflow-hidden rounded-xl border px-2 py-1 text-left text-xs shadow-sm transition hover:shadow-md"
                                        :style="getWeekEventStyle(segment)"
                                        @click.stop="openEventCard($event, segment.event)"
                                        style="background: hsla(0, 0%, 100%, 0.5);"
                                        >
                                        <div class="truncate font-semibold text-slate-900">{{ segment.event.title }}
                                        </div>
                                        <div class="truncate text-[11px] text-slate-600">{{ getSegmentTimeLabel(segment)
                                        }}</div>
                                        <div v-if="segment.event.location" class="truncate text-[11px] text-slate-500">
                                            {{ segment.event.location }}</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="createDialogVisible" modal :style="{ width: '720px', maxWidth: 'calc(100vw - 32px)' }"
            header="新增日程">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="md:col-span-2">
                    <label class="mb-2 block text-sm font-medium text-slate-700">标题</label>
                    <InputText v-model="form.title" class="w-full" placeholder="请输入标题" />
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">开始时间</label>
                    <input v-model="form.start" type="datetime-local"
                        class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500" />
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">结束时间</label>
                    <input v-model="form.end" type="datetime-local"
                        class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500" />
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">地点</label>
                    <InputText v-model="form.location" class="w-full" placeholder="例如：会议室 A / 线上会议" />
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">颜色</label>
                    <div class="flex flex-wrap items-center gap-3">
                        <button v-for="color in presetColors" :key="color"
                            class="h-8 w-8 rounded-full border-2 transition"
                            :class="form.color === color ? 'border-slate-900 scale-110' : 'border-white ring-1 ring-slate-200'"
                            :style="{ backgroundColor: color }" @click="form.color = color"></button>
                        <input v-model="form.color" type="color"
                            class="h-10 w-12 cursor-pointer rounded-lg border border-slate-200  p-1" />
                        <span class="text-xs text-slate-500">当前：{{ form.color }}</span>
                    </div>
                </div>

                <div class="md:col-span-2">
                    <label class="mb-2 block text-sm font-medium text-slate-700">介绍</label>
                    <textarea v-model="form.description" rows="4"
                        class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                        placeholder="请输入日程介绍"></textarea>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="取消" text @click="createDialogVisible = false" />
                    <Button label="保存" @click="saveEvent" />
                </div>
            </template>
        </Dialog>

        <div v-if="selectedEvent" class="fixed z-50 w-[320px] rounded-2xl border border-slate-200  p-4 shadow-2xl"
            :style="eventCardStyle"
            
            style="background: hsla(0, 0%, 100%, 0.5);"
            >
            <div class="mb-3 flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <div class="mb-2 flex items-center gap-2">
                        <span class="inline-block h-3 w-3 rounded-full"
                            :style="{ backgroundColor: selectedEvent.color }"></span>
                        <h3 class="truncate text-base font-semibold text-slate-900">{{ selectedEvent.title }}</h3>
                    </div>
                    <p class="text-sm text-slate-500">{{ formatDateTime(selectedEvent.start) }} - {{
                        formatDateTime(selectedEvent.end) }}</p>
                </div>
                <button class="rounded-lg p-1 text-slate-800 transition hover:bg-slate-100 hover:text-slate-700"
                    @click="closeEventCard">
                    <i class="pi pi-times"></i>
                </button>
            </div>

            <div class="space-y-3 text-sm text-slate-900">
                <div>
                    <div class="mb-1 text-xs font-medium uppercase tracking-wide text-balck">地点</div>
                    <div>{{ selectedEvent.location || '未填写' }}</div>
                </div>
                <div>
                    <div class="mb-1 text-xs font-medium uppercase tracking-wide text-balck">介绍</div>
                    <div class="whitespace-pre-wrap break-words">{{ selectedEvent.description || '未填写' }}</div>
                </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
                <div class="text-red-800" @click="removeEvent(selectedEvent.id)" style="cursor: pointer;font-weight: 600;" >删除</div>
            </div>
        </div>

        <div v-if="selectedEvent" class="fixed inset-0 z-40" @click="closeEventCard"></div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { kvGet, kvSet } from '@/utils/api';
import { Icon } from '@iconify/vue'

const STORAGE_KEY = '@CALCENDAR';
const weekDayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const presetColors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];
const monthEventLimit = 3;
const hourRowHeight = 64;
const weekGridHeight = hourRowHeight * 24;

const today = new Date();
const currentDate = ref(startOfDay(today));
const viewMode = ref('month');
const events = ref([]);
const createDialogVisible = ref(false);
const selectedEvent = ref(null);
const eventCardPosition = reactive({ x: 0, y: 0 });

const form = reactive({
    title: '',
    start: '',
    end: '',
    location: '',
    description: '',
    color: presetColors[0],
});

const headerLabel = computed(() => {
    if (viewMode.value === 'month') {
        const y = currentDate.value.getFullYear();
        const m = currentDate.value.getMonth() + 1;
        return `${y} 年 ${m} 月`;
    }
    const start = weekStart(currentDate.value);
    const end = addDays(start, 6);
    return `${formatDate(start, 'MM-DD')} ~ ${formatDate(end, 'MM-DD')}`;
});

const monthDays = computed(() => {
    const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
    const gridStart = weekStart(firstDay);
    return Array.from({ length: 42 }, (_, index) => {
        const date = addDays(gridStart, index);
        return {
            key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
            date,
            isCurrentMonth: date.getMonth() === firstDay.getMonth(),
        };
    });
});

const weekDays = computed(() => {
    const start = weekStart(currentDate.value);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
});

const eventCardStyle = computed(() => ({
    left: `${eventCardPosition.x}px`,
    top: `${eventCardPosition.y}px`,
}));

onMounted(async () => {
    await loadEvents();
});

function goToday() {
    currentDate.value = startOfDay(new Date());
}

function goPrev() {
    const base = new Date(currentDate.value);
    if (viewMode.value === 'month') {
        base.setMonth(base.getMonth() - 1, 1);
    } else {
        base.setDate(base.getDate() - 7);
    }
    currentDate.value = startOfDay(base);
}

function goNext() {
    const base = new Date(currentDate.value);
    if (viewMode.value === 'month') {
        base.setMonth(base.getMonth() + 1, 1);
    } else {
        base.setDate(base.getDate() + 7);
    }
    currentDate.value = startOfDay(base);
}

function openCreateDialog(date = null) {
    resetForm();
    if (date) {
        const start = new Date(date);
        start.setHours(9, 0, 0, 0);
        const end = new Date(date);
        end.setHours(10, 0, 0, 0);
        form.start = toDatetimeLocalValue(start);
        form.end = toDatetimeLocalValue(end);
    }
    createDialogVisible.value = true;
}

function resetForm() {
    form.title = '';
    form.start = '';
    form.end = '';
    form.location = '';
    form.description = '';
    form.color = presetColors[0];
}

async function saveEvent() {
    if (!form.title.trim()) {
        window.alert('请先填写标题');
        return;
    }
    if (!form.start || !form.end) {
        window.alert('请填写完整的开始和结束时间');
        return;
    }

    const start = new Date(form.start);
    const end = new Date(form.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        window.alert('时间格式不正确');
        return;
    }
    if (end <= start) {
        window.alert('结束时间必须晚于开始时间');
        return;
    }

    const newEvent = {
        id: createId(),
        title: form.title.trim(),
        start: start.toISOString(),
        end: end.toISOString(),
        location: form.location.trim(),
        description: form.description.trim(),
        color: form.color,
        createdAt: new Date().toISOString(),
    };

    events.value = [...events.value, newEvent].sort((a, b) => new Date(a.start) - new Date(b.start));
    await persistEvents();
    createDialogVisible.value = false;
}

async function removeEvent(id) {
    const shouldDelete = window.confirm('确认删除这个日程吗？');
    if (!shouldDelete) return;

    events.value = events.value.filter((item) => item.id !== id);
    await persistEvents();
    closeEventCard();
}

function openEventCard(mouseEvent, calendarEvent) {
    const cardWidth = 320;
    const cardHeight = 260;
    const margin = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = mouseEvent.clientX + 12;
    let y = mouseEvent.clientY + 12;

    if (x + cardWidth > viewportWidth - margin) {
        x = viewportWidth - cardWidth - margin;
    }
    if (y + cardHeight > viewportHeight - margin) {
        y = viewportHeight - cardHeight - margin;
    }

    eventCardPosition.x = Math.max(margin, x);
    eventCardPosition.y = Math.max(margin, y);
    selectedEvent.value = calendarEvent;
}

function closeEventCard() {
    selectedEvent.value = null;
}

function getDayEvents(day) {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    return events.value
        .filter((item) => {
            const start = new Date(item.start);
            const end = new Date(item.end);
            return start <= dayEnd && end >= dayStart;
        })
        .sort((a, b) => new Date(a.start) - new Date(b.start));
}

function getMonthCellVisibleEvents(day) {
    return getDayEvents(day).slice(0, monthEventLimit);
}

function getMonthEventLabel(calendarEvent, day) {
    const start = new Date(calendarEvent.start);
    if (!isSameDate(start, day)) {
        return `持续中 · ${calendarEvent.title}`;
    }
    return `${formatTime(start)} ${calendarEvent.title}`;
}

function getWeekSegments(day) {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    return events.value
        .filter((item) => {
            const start = new Date(item.start);
            const end = new Date(item.end);
            return start <= dayEnd && end >= dayStart;
        })
        .map((item) => {
            const rawStart = new Date(item.start);
            const rawEnd = new Date(item.end);
            const segmentStart = rawStart < dayStart ? dayStart : rawStart;
            const segmentEnd = rawEnd > dayEnd ? dayEnd : rawEnd;
            return {
                segmentKey: `${item.id}-${day.toDateString()}`,
                event: item,
                start: segmentStart,
                end: segmentEnd,
            };
        })
        .sort((a, b) => a.start - b.start);
}

function getWeekEventStyle(segment) {
    const startMinutes = segment.start.getHours() * 60 + segment.start.getMinutes();
    const endMinutes = segment.end.getHours() * 60 + segment.end.getMinutes();
    const top = (startMinutes / 60) * hourRowHeight;
    const height = Math.max(((endMinutes - startMinutes) / 60) * hourRowHeight, 24);

    return {
        top: `${top + 2}px`,
        height: `${height - 4}px`,
        backgroundColor: `${segment.event.color}22`,
        borderColor: `${segment.event.color}`,
        borderLeftWidth: '4px',
    };
}

function getSegmentTimeLabel(segment) {
    return `${formatTime(segment.start)} - ${formatTime(segment.end)}`;
}

function formatWeekDay(date) {
    return weekDayLabels[(date.getDay() + 6) % 7];
}

function formatHour(hour) {
    return `${String(hour).padStart(2, '0')}:00`;
}

function formatTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateTime(value) {
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${formatTime(d)}`;
}

function formatDate(date, pattern = 'YYYY-MM-DD') {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    if (pattern === 'MM-DD') return `${m}-${d}`;
    return `${y}-${m}-${d}`;
}

function isSameDate(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function weekStart(date) {
    const d = startOfDay(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

function createId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function toDatetimeLocalValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function loadEvents() {
    try {
        const response = await kvGet( STORAGE_KEY );
        console.log(response);
        
        const rawValue = response.v
        if (!rawValue) {
            return;
        }
        const parsed = JSON.parse(rawValue);
        console.log(parsed);
        
        events.value = Array.isArray(parsed)
            ? parsed.sort((a, b) => new Date(a.start) - new Date(b.start))
            : [];
    } catch (error) {
        console.error('加载日程失败', error);
        events.value = [];
    }
}

async function persistEvents() {
    try {
        await kvSet({
            k: STORAGE_KEY,
            v: events.value,
        });
    } catch (error) {
        console.error('保存日程失败', error);
        window.alert('保存失败，请稍后重试');
    }
}

function extractKvValue(response) {
    if (typeof response === 'string') return response;
    if (typeof response?.v === 'string') return response.v;
    if (typeof response?.data?.v === 'string') return response.data.v;
    if (typeof response?.data === 'string') return response.data;
    if (typeof response?.result?.v === 'string') return response.result.v;
    return '';
}
</script>
