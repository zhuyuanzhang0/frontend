<template>
  <div>
    <div class="drop overview">
      <div class="overviewTop">
        <div class="metric">
          <div class="k">总资产</div>
          <div class="v">¥{{ fmtMoney(overview.totalAsset) }}</div>
        </div>
        <div class="metric">
          <div class="k">日均成本</div>
          <div class="v">¥{{ fmtMoney(overview.weightedDailyCost) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function parseTags(text) {
  if (!text) return [];
  return text
    .split(/[,，]/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}
function genId() {
  return (
    "p_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function toMidnight(date) {
  if (!date) return null;

  if (date instanceof Date && !isNaN(date.getTime())) {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    return d;
  }

  if (typeof date === "string") {
    const d0 = parseYMD(date);
    if (d0) {
      d0.setHours(0, 0, 0, 0);
      return d0;
    }
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}
function parseYMD(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
function diffDays(a, b) {
  const da = toMidnight(a);
  const db = toMidnight(b);
  if (!da || !db) return 0;
  const ms = db.getTime() - da.getTime();
  return Math.floor(ms / 86400000);
}

export default {
  data() {
    return {
      products: [],
    };
  },
  computed: {
    overview() {
      const owned = this.products.filter((p) => p.status !== "sold");
      const totalAsset = owned.reduce((s, p) => s + (Number(p.price) || 0), 0);

      // 加权日均成本：Σprice / Σdays
      let sumPrice = 0;
      let sumDays = 0;
      owned.forEach((p) => {
        const price = Number(p.price) || 0;
        const days = Math.max(1, this.calcDaysUsed(p));
        sumPrice += price;
        sumDays += days;
      });
      const weightedDailyCost = sumDays > 0 ? sumPrice / sumDays : 0;

      return {
        totalAsset,
        weightedDailyCost,
        countUsing: this.products.filter((p) => p.status === "using").length,
        countIdle: this.products.filter((p) => p.status === "idle").length,
        countSold: this.products.filter((p) => p.status === "sold").length,
        totalCount: this.products.length,
      };
    },
  },
  mounted() {
    this.reload();
  },
  methods: {
    fmtMoney(n) {
      const x = Number(n);
      if (!isFinite(x)) return "0.00";
      return x.toFixed(2);
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
        if (err && err.response && err.response.status === 404) {
          return null;
        }
        throw err;
      }
    },

    async kvSet(key, value) {
      const res = await fetch("http://49.233.117.232:9000/kv/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ k: key, v: String(value) }),
      });

      return res && res.data;
    },

    localLoad() {
      const raw = localStorage.getItem("asset_tracker_products_v1");
      return raw || null;
    },

    localSave(raw) {
      localStorage.setItem("asset_tracker_products_v1", raw);
    },
    calcDaysUsed(p) {
      const start = p.purchaseDate;
      let end = todayISO();
      if (p.status === "sold" && p.soldDate) {
        end = p.soldDate;
      }
      const d = diffDays(start, end);
      return Math.max(1, d + 1); // 含当日
    },

    async reload() {
      let raw = null;
      raw = await this.kvGet("asset_tracker_products_v1");

      if (!raw) {
        this.products = [];
        return;
      }

      const obj = JSON.parse(raw);
      const list = Array.isArray(obj.products)
        ? obj.products
        : Array.isArray(obj)
        ? obj
        : [];
      this.products = list.map((p) => this.normalizeProduct(p));
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
.overview {
  padding: 14px;
  margin-bottom: 10px;
  width: min-content;
}
.overviewTop {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
  gap: 10px;
//   align-items: end;
}
.metric{
    margin-bottom: 10px;
}
.metric .k {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
  font-weight: 700;
}
.metric .v {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.2px;
  line-height: 1;
}
</style>
