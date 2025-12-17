<template>
  <div>
    <div class="drop overview">
      <div class="overviewTop">
        <div
          class="metric"
          style="
            display: flex;
            flex-direction: row-reverse;
            justify-content: space-between;
          "
        >
          <div class="k">总资产</div>
          <div class="v">¥{{ totalAssets }}</div>
        </div>
        <div
          class="metric"
          style="
            display: flex;
            flex-direction: row-reverse;
            justify-content: space-between;
          "
        >
          <div class="k">日均成本</div>
          <div class="v">¥{{ totalDailyCost }}</div>
        </div>
      </div>
    </div>

    <div
      v-for="item in items"
      :key="item.id"
      class="drop card"
      :style="{ '--expire': 0 }"
    >
      <div class="cardTop">
        <div title="产品图片" class="thumb">
          <img :src="item.imageUrl" />
        </div>
        <div class="cardName">
          {{ item.name }}
        </div>
      </div>

      <div class="cardTop">
        <div class="cardMeta">
          ¥{{ item.price.toFixed(2) }} | 已使用 {{ usedDays(item) }} 天
        </div>

        <div class="metric" style="font-size: 10px; padding: 2px 5px">
          {{ statusText(item.status) }}
        </div>
      </div>

      <div class="cardTop">
        <div class="daily">
          ¥{{ dailyCost(item) }}
          <span>/天</span>
        </div>
      </div>

      <div class="goalWrap" v-if="item.targetDaily">
        <div class="goalTrack">
          <div
            class="goalFill"
            :style="{ width: goalPercent(item) + '%' }"
          ></div>
        </div>
      </div>
      <div class="goalText">
        <span>目标 ¥{{ item.targetDaily.toFixed(2) }}/天</span>
        <span>还需 {{ remainingDays(item) }} 天</span>
      </div>
    </div>
  </div>
</template>

<script>
function diffDays(from, to = Date.now()) {
  const start = new Date(from).getTime();
  const end = typeof to === "number" ? to : new Date(to).getTime();
  const day = Math.floor((end - start) / 86400000);
  return Math.max(day, 1);
}
export default {
  data() {
    return {
      items: [],
    };
  },
  computed: {
    // 总资产（仅统计服役中的）
    totalAssets() {
      return this.items
        .filter((i) => i.status === "using")
        .reduce((sum, i) => sum + Number(i.price || 0), 0);
    },

    // 全部物品的“综合日均成本”
    totalDailyCost() {
      let totalCost = 0;
      let totalDays = 0;

      this.items.forEach((i) => {
        if (i.status !== "using") return;
        const days = diffDays(i.purchaseDate);
        totalCost += i.price;
        totalDays += days;
      });

      let n = totalDays ? totalCost / totalDays : 0;

      return n.toFixed(2);
    },
  },
  mounted() {
    this.reload();
  },
  methods: {
    statusText(status) {
      const map = {
        using: "服役中",
        sold: "已出售",
        expired: "已过期",
      };
      return map[status] || status;
    },

    usedDays(item) {
      return diffDays(item.purchaseDate);
    },

    dailyCost(item) {
      const days = this.usedDays(item);
      return (item.price / days).toFixed(2);
    },

    goalPercent(item) {
      const current = item.price / this.usedDays(item);
      return Math.min((item.targetDaily / current) * 100, 100);
    },

    remainingDays(item) {
      const T = Number(item.targetDaily || 0);
      if (!T) return 0;

      const P = Number(item.price || 0);
      const D = this.usedDays(item);

      // 达到目标所需的“总使用天数”
      const totalDaysNeeded = Math.ceil(P / T);

      return Math.max(0, totalDaysNeeded - D);
    },

    async kvGet(key) {
      try {
        const res = await fetch("http://49.233.117.232:9000/kv/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ k: key }),
        });
        const data = await res.json();
        return data.v != null ? String(data.v) : null;
      } catch (err) {
        console.log(err);
      }
    },
    async reload() {
      let raw = null;
      raw = await this.kvGet("asset_tracker_products_v1");

      if (!raw) {
        return;
      }

      const obj = JSON.parse(raw);

      this.items = obj.products;
    },

    normalizeProduct(p) {
      const out = Object.assign(
        {
          id: genId(),
          purchaseDate: todayISO(),
          category: "",
          name: "",
          price: 0,
          imageUrl: "",
          location: "",
          expiryDate: "",
          tags: [],
          targetDaily: null,
          status: "using",
          soldDate: "",
          note: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        p || {}
      );

      out.price = Number(out.price) || 0;
      out.imageUrl = String(out.imageUrl || "").trim();
      out.location = String(out.location || "").trim();
      out.expiryDate = String(out.expiryDate || "").trim();

      out.targetDaily =
        out.targetDaily === null ||
        out.targetDaily === "" ||
        typeof out.targetDaily === "undefined"
          ? null
          : Number(out.targetDaily) || null;

      if (!Array.isArray(out.tags))
        out.tags = parseTags(String(out.tags || ""));
      out.tags = out.tags
        .map((t) => String(t).trim())
        .filter(Boolean)
        .slice(0, 12);

      if (!out.purchaseDate) out.purchaseDate = todayISO();
      if (!["using", "idle", "sold"].includes(out.status)) out.status = "using";
      if (out.status === "sold" && !out.soldDate) out.soldDate = todayISO();

      return out;
    },
  },
};
</script>

<style lang="less" scoped>
.overview,
.card {
  --accent: #8ec5ff;
  --accent-strong: #6faefc;
  --text-strong: #f7fbff;
  --text-muted: rgba(233, 239, 255, 0.75);
}

.overview {
  padding: 16px 18px;
  margin-bottom: 14px;
  width: min(620px, 100%);
  background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.16),
      rgba(142, 197, 255, 0.1)
    ),
    rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(142, 197, 255, 0.42);
  box-shadow: 0 18px 55px rgba(14, 36, 74, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.overviewTop {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.metric {
  padding: 10px 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.metric .k {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 700;
}
.metric .v {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.2px;
  line-height: 1;
  color: var(--text-strong);
  text-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}
.card {
  width: 250px;
  padding: 16px 18px;
  transition: transform 0.08s ease;
  position: relative;
  margin-top: 20px;
  background: linear-gradient(
      150deg,
      rgba(255, 255, 255, 0.14),
      rgba(142, 197, 255, 0.12)
    ),
    rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(142, 197, 255, 0.42);
  box-shadow: 0 26px 70px rgba(14, 36, 74, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
  overflow: hidden;
  isolation: isolate;
}
.card:active {
  transform: scale(0.99);
}

.cardTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.thumb {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(
      135deg,
      rgba(142, 197, 255, 0.2),
      rgba(255, 255, 255, 0.08)
    ),
    rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(142, 197, 255, 0.35);
  box-shadow: 0 12px 30px rgba(20, 52, 115, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex: 0 0 auto;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb svg {
  width: 26px;
  height: 26px;
  fill: rgba(233, 239, 255, 0.6);
}

.statusPill {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 800;
  background: linear-gradient(
      125deg,
      rgba(142, 197, 255, 0.28),
      rgba(255, 255, 255, 0.08)
    ),
    rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(142, 197, 255, 0.55);
  color: var(--text-strong);
  box-shadow: 0 10px 28px rgba(55, 116, 200, 0.28);
  white-space: nowrap;
}
.statusPill.using,
.statusPill.idle,
.statusPill.sold {
  filter: saturate(1.05);
}
.statusPill.sold {
  opacity: 0.85;
}

.cardName {
  margin: 6px 0 4px;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.1px;
  color: var(--text-strong);
  text-shadow: 0 8px 26px rgba(0, 0, 0, 0.2);
}
.cardMeta {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 800;
}
.daily {
  font-size: 17px;
  font-weight: 950;
  letter-spacing: 0.2px;
  color: var(--text-strong);
  text-shadow: 0 10px 32px rgba(0, 0, 0, 0.25);
}
.daily span {
  font-size: 13px;
  font-weight: 900;
  color: var(--text-muted);
  margin-left: 2px;
}

.goalWrap {
  margin-top: 6px;
}
.goalTrack {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(142, 197, 255, 0.32);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
  overflow: hidden;
}
.goalFill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #8ec5ff, #73a7ff 55%, #bfe7ff);
  border-radius: 999px;
  box-shadow: 0 10px 30px rgba(115, 183, 255, 0.35);
}
.goalText {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 800;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
