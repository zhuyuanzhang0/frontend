<template>
  <aside class="clockPanel" :style="panelStyle">
    <!-- Header -->
    <div class="panelHeader glass">
      <div class="title">
        打卡
        <span class="subTitle">{{ today }}</span>
      </div>

      <div class="actions">
        <button class="btn glass" @click="openCreate">新建</button>
        <button class="btn glass" @click="syncNow" :disabled="syncing">
          {{ syncLabel }}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs glass">
      <button
        class="tab"
        :class="{ active: tab === 'daily' }"
        @click="tab = 'daily'"
      >
        今日
      </button>
      <button
        class="tab"
        :class="{ active: tab === 'month' }"
        @click="tab = 'month'"
      >
        月视图
      </button>
      <button
        class="tab"
        :class="{ active: tab === 'stats' }"
        @click="tab = 'stats'"
      >
        统计
      </button>
      <button
        class="tab"
        :class="{ active: tab === 'points' }"
        @click="tab = 'points'"
      >
        积分
      </button>
    </div>

    <!-- Body -->
    <div class="panelBody">
      <!-- Daily -->
      <section v-show="tab === 'daily'" class="section glass">
        <div class="sectionHeader">
          <div class="h1">快速打卡（默认）</div>
          <div class="meta">
            今日得分：<b>{{ pointsByDay[today] || 0 }}</b>
          </div>
        </div>

        <div v-if="defaultEntries.length === 0" class="empty">
          还没有默认条目。点击右上角“新建”并勾选“设为默认”。
        </div>

        <div class="list">
          <div
            v-for="e in defaultEntries"
            :key="e.id"
            class="row glassRow"
            :style="{ background: convertToOpacity01Color(e.color) }"
          >
            <!-- <div class="dot" :style="{ background: e.color }"></div> -->
            <div class="rowMain">
              <div class="rowTitle">{{ e.name }}</div>
              <div class="rowSub">
                <span>本次连续：{{ streakOnDate(e.id, today) }} 天</span>
                <span
                  >总分：{{
                    (entryStats[e.id] && entryStats[e.id].totalPoints) || 0
                  }}</span
                >
              </div>
            </div>

            <button
              class="pill"
              :class="{ on: isChecked(e.id, today) }"
              @click="toggleCheckin(e.id, today)"
            >
              {{ isChecked(e.id, today) ? "已打卡" : "打卡" }}
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <div class="sectionHeader">
          <div class="h1">全部条目</div>
          <div class="meta">共 {{ state.entries.length }} 个</div>
        </div>

        <div v-if="state.entries.length === 0" class="empty">
          还没有条目。点击“新建”开始。
        </div>

        <div class="list">
          <div
            v-for="e in state.entries"
            :key="e.id"
            class="row glassRow"
            :style="{ background: convertToOpacity01Color(e.color) }"
          >
            <!-- <div class="dot" :style="{ background: e.color }"></div> -->
            <div class="rowMain">
              <div class="rowTitle">
                {{ e.name }}
                <span v-if="e.isDefault" class="badge">默认</span>
              </div>
              <div class="rowSub">
                <span>今日连续：{{ streakOnDate(e.id, today) }} 天</span>
                <span
                  >今日得分：{{
                    isChecked(e.id, today) ? streakOnDate(e.id, today) : 0
                  }}</span
                >
              </div>
            </div>

            <button
              class="pill"
              :class="{ on: isChecked(e.id, today) }"
              @click="toggleCheckin(e.id, today)"
            >
              {{ isChecked(e.id, today) ? "已打卡" : "打卡" }}
            </button>
          </div>
        </div>
      </section>

      <!-- Month -->
      <section v-show="tab === 'month'" class="section glass">
        <div class="monthHeader">
          <button class="iconBtn glass" @click="shiftMonth(-1)">‹</button>
          <div class="monthTitle">{{ monthLabel }}</div>
          <button class="iconBtn glass" @click="shiftMonth(1)">›</button>
        </div>

        <div class="weekdays">
          <div class="wd" v-for="w in weekdays" :key="w">{{ w }}</div>
        </div>

        <div class="monthGrid">
          <div
            v-for="cell in monthCells"
            :key="cell.key"
            class="dayCell glassCell"
            :class="{ dim: !cell.inMonth, today: cell.date === today }"
            @mouseenter="hoverDate = cell.date"
            @mouseleave="hoverDate = ''"
          >
            <div class="dayTop">
              <div class="dayNum">{{ cell.day }}</div>
            </div>

            <!-- stacked colors -->
            <div class="stack">
              <div
                v-for="(id, idx) in state.logs[cell.date] || []"
                :key="id + '_' + idx"
                class="stackBar"
                :style="{
                  background:
                    (entryById[id] && entryById[id].color) || '#ffffff55',
                }"
              ></div>
            </div>

            <!-- hover tooltip -->
            <div
              v-if="
                hoverDate === cell.date && (state.logs[cell.date] || []).length
              "
              class="tooltip glass"
            >
              <div class="tipTitle">{{ cell.date }}</div>
              <div class="tipList">
                <div
                  v-for="id in state.logs[cell.date]"
                  :key="id"
                  class="tipRow"
                >
                  <span
                    class="tipDot"
                    :style="{
                      background:
                        (entryById[id] && entryById[id].color) || '#fff',
                    }"
                  ></span>
                  <span class="tipName">{{
                    (entryById[id] && entryById[id].name) || id
                  }}</span>
                  <span class="tipMeta"
                    >+{{ streakOnDate(id, cell.date) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section v-show="tab === 'stats'" class="section glass">
        <div class="sectionHeader">
          <div class="h1">近 14 天得分</div>
          <div class="meta">最高：{{ max(points14) }}</div>
        </div>

        <div class="barChart">
          <div
            v-for="d in days14"
            :key="d"
            class="barCol"
            :title="d + '：' + (pointsByDay[d] || 0) + ' 分'"
          >
            <div
              class="bar"
              :style="{ height: barHeight(pointsByDay[d] || 0, max(points14)) }"
            ></div>
            <div class="barLabel">{{ d.slice(8) }}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="sectionHeader">
          <div class="h1">本月条目打卡次数</div>
          <div class="meta">按次数排序</div>
        </div>

        <div class="rankList">
          <div
            v-for="e in monthRankedEntries"
            :key="e.id"
            class="rankRow glassRow"
          >
            <div class="dot" :style="{ background: e.color }"></div>
            <div class="rankMain">
              <div class="rankTitle">{{ e.name }}</div>
              <div class="rankSub">{{ monthCounts[e.id] || 0 }} 次</div>
            </div>
            <div class="rankBarTrack">
              <div
                class="rankBarFill"
                :style="{ width: rankPercent(monthCounts[e.id] || 0) }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Points -->
      <section v-show="tab === 'points'" class="section glass">
        <div class="sectionHeader">
          <div class="h1">积分概览</div>
          <div class="meta">
            总分：<b>{{ totalPoints }}</b>
          </div>
        </div>

        <div class="rankList">
          <div
            v-for="e in pointsRankedEntries"
            :key="e.id"
            class="rankRow glassRow"
          >
            <div class="dot" :style="{ background: e.color }"></div>
            <div class="rankMain">
              <div class="rankTitle">{{ e.name }}</div>
              <div class="rankSub">
                总分
                {{ (entryStats[e.id] && entryStats[e.id].totalPoints) || 0 }} ·
                最长连续
                {{ (entryStats[e.id] && entryStats[e.id].longestStreak) || 0 }}
                天 · 累计
                {{ (entryStats[e.id] && entryStats[e.id].checkins) || 0 }} 次
              </div>
            </div>
            <div class="pill ghost">
              {{ (entryStats[e.id] && entryStats[e.id].lastStreak) || 0 }} 连
            </div>
          </div>
        </div>

        <div class="note glassSub">
          计分规则：某条目在某天打卡获得的积分 =
          该条目当日连续打卡天数。中断一天后，下一次打卡从 1 分重新开始。
        </div>
      </section>
    </div>

    <!-- Create Modal (append to body to avoid clipping) -->
    <div v-if="showCreate" v-append-to-body class="modalLayer">
      <div class="modalMask" @click="closeCreate"></div>

      <div class="modal glass">
        <div class="modalTitle">新建打卡条目</div>

        <div class="field">
          <div class="label">名称</div>
          <input
            class="input glassInset"
            v-model.trim="form.name"
            placeholder="例如：阅读 / 运动 / 早睡"
          />
        </div>

        <div class="field">
          <div class="label">颜色</div>

          <div class="palette">
            <button
              v-for="c in presetColors"
              :key="c"
              class="swatch"
              :class="{ active: form.color === c }"
              :style="{ background: c }"
              @click="form.color = c"
              type="button"
            ></button>

            <input class="colorInput" type="color" v-model="form.color" />
          </div>
        </div>

        <div class="field">
          <label class="checkbox">
            <input type="checkbox" v-model="form.isDefault" />
            <span>设为默认（在“今日”里快速打卡）</span>
          </label>
        </div>

        <div class="modalActions">
          <button class="btn glass" @click="closeCreate">取消</button>
          <button
            class="btn primary"
            @click="createEntry"
            :disabled="!form.name"
          >
            创建
          </button>
        </div>

        <div class="modalHint">
          数据将以 JSON 形式存储到：k = "{{ storageKey }}"
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
function pad2(n) {
  return String(n).padStart(2, "0");
}

function toYMD(dateObj) {
  const y = dateObj.getFullYear();
  const m = pad2(dateObj.getMonth() + 1);
  const d = pad2(dateObj.getDate());
  return y + "-" + m + "-" + d;
}

function parseYMD(ymd) {
  const parts = (ymd || "").split("-");
  const y = Number(parts[0] || 0);
  const m = Number(parts[1] || 1);
  const d = Number(parts[2] || 1);
  return new Date(y, m - 1, d);
}

function addDays(ymd, delta) {
  const dt = parseYMD(ymd);
  dt.setDate(dt.getDate() + delta);
  return toYMD(dt);
}

function diffDays(a, b) {
  const ta = parseYMD(a).getTime();
  const tb = parseYMD(b).getTime();
  return Math.round((tb - ta) / 86400000);
}

function uid(prefix) {
  return (
    (prefix || "id") +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function safeJSONParse(s, fallback) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return fallback;
  }
}

export default {
  name: "ClockInSidePanel",
  directives: {
    // v-append-to-body: avoid overflow/transform clipping
    appendToBody: {
      inserted(el) {
        el.__originParent__ = el.parentNode;
        el.__placeholder__ = document.createComment("append-to-body");
        if (el.__originParent__)
          el.__originParent__.insertBefore(el.__placeholder__, el);
        document.body.appendChild(el);
      },
      unbind(el) {
        try {
          if (el.parentNode) el.parentNode.removeChild(el);
        } catch (e) {}
        try {
          if (el.__placeholder__ && el.__placeholder__.parentNode) {
            el.__placeholder__.parentNode.removeChild(el.__placeholder__);
          }
        } catch (e) {}
        el.__originParent__ = null;
        el.__placeholder__ = null;
      },
    },
  },
  props: {
    apiBase: { type: String, default: "http://49.233.117.232:9000" },
    storageKey: { type: String, default: "clock-in" },
    panelStyle: {
      type: Object,
      default() {
        return {
          overflow: "auto",
          height: "100vh",
          width: "300px",
        };
      },
    },
    weekStartsOnMonday: { type: Boolean, default: true },
  },
  data() {
    const today = toYMD(new Date());
    return {
      tab: "daily",
      syncing: false,
      syncState: "idle", // idle | saving | ok | error
      syncError: "",
      hoverDate: "",

      // month cursor
      monthCursor: today.slice(0, 7) + "-01",

      // main state (stored as ONE JSON)
      state: {
        version: 1,
        entries: [],
        logs: {}, // { 'YYYY-MM-DD': [entryId, ...] }
      },

      showCreate: false,
      form: { name: "", color: "#0A84FF", isDefault: true },

      presetColors: [
        "#0A84FF", // iOS blue
        "#30D158", // green
        "#FFD60A", // yellow
        "#FF9F0A", // orange
        "#FF375F", // pink/red
        "#FF453A", // red
        "#BF5AF2", // purple
        "#5E5CE6", // indigo
        "#64D2FF", // cyan
        "#AC8E68", // warm neutral
      ],

      _saveTimer: null,
    };
  },
  watch: {
    hoverDate: {
      deep: true,
      handler() {
        console.log(this.hoverDate);
      },
    },
  },
  computed: {
    today() {
      return toYMD(new Date());
    },
    syncLabel() {
      if (this.syncing) return "同步中…";
      if (this.syncState === "ok") return "已同步";
      if (this.syncState === "error") return "同步失败";
      return "同步";
    },

    entryById() {
      const m = {};
      for (let i = 0; i < this.state.entries.length; i++) {
        const e = this.state.entries[i];
        m[e.id] = e;
      }
      return m;
    },

    defaultEntries() {
      return this.state.entries.filter((e) => !!e.isDefault);
    },

    // build stats in one pass over dates (deterministic; no need to store points separately)
    computedStats() {
      const entries = this.state.entries;
      const logs = this.state.logs || {};
      const dates = Object.keys(logs).sort(); // YMD lexical sort == chronological
      const idSet = {};
      entries.forEach((e) => {
        idSet[e.id] = true;
      });

      const perEntry = {}; // id -> { totalPoints, checkins, longestStreak, lastDate, lastStreak }
      entries.forEach((e) => {
        perEntry[e.id] = {
          totalPoints: 0,
          checkins: 0,
          longestStreak: 0,
          lastDate: "",
          lastStreak: 0,
        };
      });

      const perDayPoints = {}; // date -> points
      const streakState = {}; // id -> { lastDate, streak }

      for (let di = 0; di < dates.length; di++) {
        const date = dates[di];
        const arr = Array.isArray(logs[date]) ? logs[date] : [];
        let dayPts = 0;

        for (let ai = 0; ai < arr.length; ai++) {
          const id = arr[ai];
          if (!idSet[id]) continue;

          if (!streakState[id]) streakState[id] = { lastDate: "", streak: 0 };

          const prev = streakState[id].lastDate;
          if (prev && diffDays(prev, date) === 1) {
            streakState[id].streak += 1;
          } else {
            streakState[id].streak = 1;
          }
          streakState[id].lastDate = date;

          const s = streakState[id].streak;
          dayPts += s;

          const st = perEntry[id];
          st.totalPoints += s;
          st.checkins += 1;
          st.lastDate = date;
          st.lastStreak = s;
          if (s > st.longestStreak) st.longestStreak = s;
        }

        if (dayPts) perDayPoints[date] = dayPts;
      }

      return { perEntry, perDayPoints };
    },

    entryStats() {
      return this.computedStats.perEntry;
    },
    pointsByDay() {
      return this.computedStats.perDayPoints;
    },
    totalPoints() {
      const perEntry = this.entryStats;
      let sum = 0;
      for (let i = 0; i < this.state.entries.length; i++) {
        const id = this.state.entries[i].id;
        sum += (perEntry[id] && perEntry[id].totalPoints) || 0;
      }
      return sum;
    },

    // month view helpers
    monthLabel() {
      const d = parseYMD(this.monthCursor);
      const y = d.getFullYear();
      const m = pad2(d.getMonth() + 1);
      return y + " 年 " + m + " 月";
    },
    weekdays() {
      return this.weekStartsOnMonday
        ? ["一", "二", "三", "四", "五", "六", "日"]
        : ["日", "一", "二", "三", "四", "五", "六"];
    },
    monthCells() {
      const first = parseYMD(this.monthCursor);
      const year = first.getFullYear();
      const month = first.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const inMonthStart = toYMD(firstDay);
      const inMonthEnd = toYMD(lastDay);

      // compute grid start (6 rows * 7 cols)
      // JS: 0 Sun .. 6 Sat
      let dow = firstDay.getDay();
      if (this.weekStartsOnMonday) dow = (dow + 6) % 7; // convert so Mon=0
      const gridStart = addDays(inMonthStart, -dow);

      const cells = [];
      for (let i = 0; i < 42; i++) {
        const date = addDays(gridStart, i);
        const dt = parseYMD(date);
        const inMonth = dt.getMonth() === month;
        cells.push({
          key: date,
          date: date,
          day: dt.getDate(),
          inMonth: inMonth,
        });
      }

      // ensure cursor is in current month if today changed across months
      return cells;
    },

    // stats tab
    days14() {
      const list = [];
      const t = this.today;
      for (let i = 13; i >= 0; i--) list.push(addDays(t, -i));
      return list;
    },
    points14() {
      return this.days14.map((d) => this.pointsByDay[d] || 0);
    },

    // monthly counts per entry
    monthCounts() {
      const counts = {};
      const first = parseYMD(this.monthCursor);
      const year = first.getFullYear();
      const month = first.getMonth();

      const logs = this.state.logs || {};
      const keys = Object.keys(logs);
      for (let i = 0; i < keys.length; i++) {
        const date = keys[i];
        const dt = parseYMD(date);
        if (dt.getFullYear() !== year || dt.getMonth() !== month) continue;
        const arr = Array.isArray(logs[date]) ? logs[date] : [];
        for (let j = 0; j < arr.length; j++) {
          const id = arr[j];
          counts[id] = (counts[id] || 0) + 1;
        }
      }
      return counts;
    },
    monthRankedEntries() {
      const arr = this.state.entries.slice();
      const counts = this.monthCounts;
      arr.sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
      return arr;
    },

    pointsRankedEntries() {
      const arr = this.state.entries.slice();
      const st = this.entryStats;
      arr.sort(
        (a, b) =>
          ((st[b.id] && st[b.id].totalPoints) || 0) -
          ((st[a.id] && st[a.id].totalPoints) || 0)
      );
      return arr;
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    convertToOpacity01Color(colorStr) {
      // 去除字符串中的空格（处理用户输入的 rgb(255, 69, 58) 或 rgb(255, 69 ,58) 等情况）
      const cleanStr = colorStr.replace(/\s+/g, "");
      let r, g, b;

      // 匹配 RGB 格式：rgb(255,69,58)
      const rgbReg = /^rgb\((\d+),(\d+),(\d+)\)$/;
      if (rgbReg.test(cleanStr)) {
        const matches = cleanStr.match(rgbReg);
        r = parseInt(matches[1], 10);
        g = parseInt(matches[2], 10);
        b = parseInt(matches[3], 10);
      }
      // 匹配 16 进制格式：#fff 或 #ffffff
      else if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cleanStr)) {
        let hex = cleanStr.slice(1);
        // 处理 3 位的 16 进制颜色（如 #f46 转为 #ff4466）
        if (hex.length === 3) {
          hex = hex
            .split("")
            .map((char) => char + char)
            .join("");
        }
        // 转换为十进制的 RGB 值
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      }
      // 不支持的颜色格式，返回原字符串
      else {
        console.warn("不支持的颜色格式：", colorStr);
        return colorStr;
      }

      // 生成 0.1 透明度的 RGBA 颜色
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    },
    // ---------- UI ----------
    openCreate() {
      this.form = { name: "", color: this.presetColors[0], isDefault: true };
      this.showCreate = true;
    },
    closeCreate() {
      this.showCreate = false;
    },

    // ---------- Core: checkins ----------
    isChecked(entryId, date) {
      const arr = this.state.logs && this.state.logs[date];
      if (!Array.isArray(arr)) return false;
      return arr.indexOf(entryId) >= 0;
    },
    toggleCheckin(entryId, date) {
      if (!this.state.logs) this.state.logs = {};
      const arr = Array.isArray(this.state.logs[date])
        ? this.state.logs[date].slice()
        : [];

      const idx = arr.indexOf(entryId);
      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        arr.push(entryId);
      }

      // keep stable order (by entry creation order)
      const order = {};
      for (let i = 0; i < this.state.entries.length; i++)
        order[this.state.entries[i].id] = i;
      arr.sort((a, b) => (order[a] || 9999) - (order[b] || 9999));

      if (arr.length) this.$set(this.state.logs, date, arr);
      else this.$delete(this.state.logs, date);

      this.scheduleSave();
    },

    // streak as of a date (only meaningful if checked that day; else 0)
    streakOnDate(entryId, date) {
      if (!this.isChecked(entryId, date)) return 0;

      // compute by walking backwards from date until break
      let s = 0;
      let cur = date;
      while (this.isChecked(entryId, cur)) {
        s += 1;
        cur = addDays(cur, -1);
      }
      return s;
    },

    // ---------- Create entry ----------
    createEntry() {
      const name = (this.form.name || "").trim();
      if (!name) return;

      const entry = {
        id: uid("ci"),
        name: name,
        color: this.form.color || this.presetColors[0],
        isDefault: !!this.form.isDefault,
        createdAt: Date.now(),
      };

      this.state.entries = [entry].concat(this.state.entries);
      this.showCreate = false;
      this.scheduleSave();
    },

    // ---------- Month nav ----------
    shiftMonth(delta) {
      const d = parseYMD(this.monthCursor);
      d.setMonth(d.getMonth() + delta);
      d.setDate(1);
      this.monthCursor = toYMD(d);
    },

    // ---------- Stats helpers ----------
    max(arr) {
      let m = 0;
      for (let i = 0; i < arr.length; i++) if (arr[i] > m) m = arr[i];
      return m;
    },
    barHeight(v, max) {
      if (!max) return "2px";
      const p = Math.max(0.05, Math.min(1, v / max));
      return Math.round(p * 120) + "px";
    },
    rankPercent(v) {
      const maxV = this.max(
        this.monthRankedEntries.map((e) => this.monthCounts[e.id] || 0)
      );
      if (!maxV) return "0%";
      return Math.round((v / maxV) * 100) + "%";
    },

    // ---------- Persistence ----------
    scheduleSave() {
      this.syncState = "idle";
      if (this._saveTimer) clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => this.save(), 600);
    },

    async syncNow() {
      await this.save(true);
    },

    async load() {
      try {
        const v = await this.apiGet(this.storageKey);
        if (typeof v === "string" && v.trim()) {
          const parsed = safeJSONParse(v, null);
          if (parsed && typeof parsed === "object") {
            console.log(parsed);
            
            // minimal shape protection
            this.state.version = parsed.version || 1;
            this.state.entries = Array.isArray(parsed.entries)
              ? parsed.entries
              : [];
            this.state.logs =
              parsed.logs && typeof parsed.logs === "object" ? parsed.logs : {};
          }
        }
      } catch (e) {
        // keep empty state; allow user to continue
      }
    },

    async save(force) {
      if (this.syncing) return;
      if (this._saveTimer) {
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
      }

      this.syncing = true;
      this.syncError = "";
      this.syncState = "saving";

      try {
        const payload = JSON.stringify(this.state);
        await this.apiSet(this.storageKey, payload);
        this.syncState = "ok";
      } catch (e) {
        this.syncState = "error";
        this.syncError = String(e && e.message ? e.message : e);
      } finally {
        this.syncing = false;
      }
    },

    async apiSet(k, v) {
      const url = this.apiBase.replace(/\/$/, "") + "/kv/set";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ k: k, v: v }),
      });
      if (!res.ok) throw new Error("kv/set HTTP " + res.status);
      // server may return json or text; ignore content
      return true;
    },

    async apiGet(k) {
      const base = this.apiBase.replace(/\/$/, "");
      const url = base + "/kv/get";

      // Try POST JSON first
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({ k: k }),
        });
        if (res.ok) {
          const j = await res.json().catch(() => null);
          if (j) {
            if (typeof j.v === "string") return j.v;
            if (j.data && typeof j.data.v === "string") return j.data.v;
            if (j.data && typeof j.data === "string") return j.data;
          }
          const t = await res.text().catch(() => "");
          return t;
        }
      } catch (e) {}

      // Fallback GET ?k=
      const res2 = await fetch(url + "?k=" + encodeURIComponent(k), {
        method: "GET",
        mode: "cors",
      });
      if (!res2.ok) throw new Error("kv/get HTTP " + res2.status);
      const j2 = await res2.json().catch(() => null);
      if (j2) {
        if (typeof j2.v === "string") return j2.v;
        if (j2.data && typeof j2.data.v === "string") return j2.data.v;
        if (j2.data && typeof j2.data === "string") return j2.data;
      }
      const t2 = await res2.text().catch(() => "");
      return t2;
    },
  },
};
</script>

<style scoped>
/* ----- Layout ----- */
.clockPanel {
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  gap: 10px;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.92);
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text",
    "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
}

/* ----- iOS-like liquid glass ----- */
.glass {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border-radius: 16px;
}

.glassInset {
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  border-radius: 12px;
}

.glassRow {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
}

.glassCell {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
}

/* ----- Header ----- */
.panelHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px;
}
.title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.subTitle {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.78;
}
.actions {
  display: flex;
  gap: 8px;
}

.btn {
  border: 0;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.1);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn.primary {
  background: rgba(10, 132, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* ----- Tabs ----- */
.tabs {
  display: flex;
  gap: 6px;
  padding: 6px;
}
.tab {
  flex: 1;
  border: 0;
  cursor: pointer;
  padding: 10px 8px;
  border-radius: 12px;
  background: transparent;
  color: rgba(255, 255, 255, 0.82);
  font-weight: 700;
  letter-spacing: 0.2px;
}
.tab.active {
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.95);
}

/* ----- Body ----- */
.panelBody {
  flex: 1;
  overflow: hidden;
  padding-bottom: 6px;
}
.section {
  padding: 12px;
  margin-bottom: 10px;
}
.sectionHeader {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 10px;
}
.h1 {
  font-size: 14px;
  font-weight: 800;
}
.meta {
  font-size: 12px;
  opacity: 0.78;
}
.empty {
  padding: 14px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.16);
  border: 1px dashed rgba(255, 255, 255, 0.18);
  font-size: 13px;
  opacity: 0.9;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  flex: 0 0 auto;
}
.rowMain {
  flex: 1;
  min-width: 0;
}
.rowTitle {
  font-weight: 800;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge {
  margin-left: 6px;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.16);
  opacity: 0.95;
}
.rowSub {
  margin-top: 2px;
  display: flex;
  gap: 10px;
  font-size: 12px;
  opacity: 0.78;
}
.pill {
  border: 0;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
}
.pill.on {
  background: rgba(48, 209, 88, 0.28);
  border: 1px solid rgba(48, 209, 88, 0.35);
}
.pill.ghost {
  background: rgba(255, 255, 255, 0.08);
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 12px 0;
  border-radius: 999px;
}

/* ----- Month view ----- */
.monthHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.monthTitle {
  font-weight: 900;
  letter-spacing: 0.3px;
}
.iconBtn {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 0;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}
.wd {
  text-align: center;
  font-size: 12px;
  opacity: 0.75;
  font-weight: 800;
}

.monthGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  justify-items: center;

  gap: 8px;
}
.dayCell {
  position: relative;
  /* min-height:58px; */
  min-height: 30px;
  width: 20px;
  overflow: hidden;
  text-align: center;
  /* padding:8px; */
  /* overflow:visible; */
}
.dayCell.dim {
  opacity: 0.45;
}
.dayCell.today {
  outline: 2px solid rgba(10, 132, 255, 0.45);
  outline-offset: 0px;
}
.dayTop {
  margin: 5px 0;
}
.dayNum {
  font-weight: 900;
  font-size: 12px;
  opacity: 0.92;
}
.dayPts {
  font-weight: 900;
  font-size: 11px;
  opacity: 0.85;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 5px 0px;
}
.stackBar {
  height: 6px;
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

/* Tooltip */
.tooltip {
  position: absolute;
  left: 8px;
  right: 8px;
  top: calc(100% + 8px);
  z-index: 50;
  padding: 10px;
  border-radius: 14px;
}
.tipTitle {
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 8px;
  opacity: 0.95;
}
.tipList {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tipRow {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tipDot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex: 0 0 auto;
}
.tipName {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 800;
}
.tipMeta {
  font-size: 12px;
  font-weight: 900;
  opacity: 0.85;
}

/* ----- Charts ----- */
.barChart {
  display: flex;
  overflow: auto;
  gap: 6px;
  align-items: flex-end;
  height: 160px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.barCol {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.bar {
  width: 100%;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
  min-height: 2px;
}
.barLabel {
  font-size: 11px;
  opacity: 0.75;
  font-weight: 800;
}

.rankList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rankRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
}
.rankMain {
  flex: 1;
  min-width: 0;
}
.rankTitle {
  font-weight: 900;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rankSub {
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.78;
}
.rankBarTrack {
  width: 110px;
  height: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
}
.rankBarFill {
  height: 100%;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.glassSub {
  margin-top: 10px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 12px;
  opacity: 0.88;
}

/* ----- Modal ----- */
.modalLayer {
  position: fixed;
  inset: 0;
  z-index: 99999;
}
.modalMask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.modal {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 360px;
  max-width: calc(100vw - 40px);
  padding: 14px;
  border-radius: 18px;
}
.modalTitle {
  font-weight: 900;
  font-size: 14px;
  margin-bottom: 12px;
}
.field {
  margin-bottom: 12px;
}
.label {
  font-size: 12px;
  font-weight: 800;
  opacity: 0.82;
  margin-bottom: 6px;
}
.input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 10px;
  color: rgba(255, 255, 255, 0.92);
  outline: none;
  border: 0;
}
.palette {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.swatch {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  outline: none;
}
.swatch.active {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}
.colorInput {
  width: 36px;
  height: 26px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}
.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  opacity: 0.9;
}
.modalActions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
.modalHint {
  margin-top: 10px;
  font-size: 11px;
  opacity: 0.72;
}
</style>
