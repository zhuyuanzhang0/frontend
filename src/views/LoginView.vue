<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="title">Welcome Back</h2>
      <p class="subtitle">Please login to your account</p>

      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <input v-model="form.username" type="text" placeholder="Username" />
        </div>

        <div class="form-item">
          <input v-model="form.password" type="password" placeholder="Password" />
        </div>

        <div class="options">
          <label>
            <input type="checkbox" v-model="remember" />
            Remember me
          </label>
          <a href="#">Forgot password?</a>
        </div>

        <button :disabled="loading" class="login-btn">
          <span v-if="!loading">Login</span>
          <span v-else class="loader"></span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface LoginForm {
  username: string
  password: string
}

const form = reactive<LoginForm>({
  username: '',
  password: '',
})

const remember = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    alert('请输入用户名和密码')
    return
  }

  loading.value = true

  // 模拟接口请求
  setTimeout(() => {
    loading.value = false
    alert('登录成功')
  }, 1500)
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.login-card {
  width: 380px;
  padding: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  color: #fff;
}

.title {
  text-align: center;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  font-size: 14px;
  margin-bottom: 30px;
  opacity: 0.8;
}

.form-item {
  margin-bottom: 20px;
}

.form-item input {
  width: 100%;
  padding: 12px 15px;
  border-radius: 10px;
  border: none;
  outline: none;
  font-size: 14px;
}

.options {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 20px;
}

.options a {
  color: #fff;
  text-decoration: none;
}

.login-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: #ffffff;
  color: #764ba2;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.login-btn:hover {
  background: #f1f1f1;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* loading 动画 */
.loader {
  width: 18px;
  height: 18px;
  border: 3px solid #764ba2;
  border-top: 3px solid transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
