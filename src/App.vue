<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="less">
#app {
  max-height: 100vh;
  overflow: auto;
}

.drop {
  position: relative;
  border-radius: 32px;
  color: #e9edf5 !important;

  /* 玻璃主体：透明底 + 背景模糊 + 边框/阴影 */
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.28);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  backdrop-filter: blur(20px) saturate(150%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 2px 5px 20px 0px rgb(0 0 0 / 10%);
    
  overflow: clip;
}

/* 内部“液体”——多重径向渐变缓慢位移，营造流动与折射 */
.drop::before {
  content: "";
  position: absolute;
  inset: -10%;
  background: radial-gradient(
      180px 140px at 20% 30%,
      rgba(255, 255, 255, 0.25),
      transparent 60%
    ),
    radial-gradient(
      220px 160px at 80% 40%,
      rgba(255, 255, 255, 0.18),
      transparent 65%
    ),
    radial-gradient(
      320px 200px at 40% 85%,
      rgba(255, 255, 255, 0.12),
      transparent 70%
    );
  filter: blur(18px) saturate(140%);
  animation: drift 12s ease-in-out infinite alternate;
  pointer-events: none;
}

/* 斜向高光条 */
.drop::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    110deg,
    rgba(255, 255, 255, 0.28) 0%,
    rgba(255, 255, 255, 0) 40% 60%,
    rgba(255, 255, 255, 0.16) 100%
  );
  mix-blend-mode: screen;
  pointer-events: none;
}
</style>
