<template>
  <div class="thor-login-wrapper">
    <div class="global-gradient-bg">
      <div class="thor-giant-text">THOR</div>
    </div>

    <div class="glass-bg">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="login-main-content">
      <div class="visual-section">
        <div class="brand-header animate__animated animate__fadeInDown">
          <thunderbolt-filled class="logo-icon" />
          <div class="brand-info">
            <div class="name">Thor Admin</div>
            <div class="tag">分布式文件调度系统</div>
          </div>
        </div>

        <div class="dispatch-container">
          <div class="text-info animate__animated animate__fadeInLeft">
            <h1 class="main-title">高性能数据文件传输底座</h1>
            <p class="sub-title">基于 Netty 的分布式文件调度系统</p>
          </div>

          <div class="stage" ref="stageRef">
            <svg class="lightning-canvas" ref="canvasRef"></svg>
            <div class="center-node" ref="centerNodeRef">
              <file-zip-outlined class="file-icon" />
              <div class="energy-ring"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="jelly-card animate__animated animate__zoomIn">
          <div class="electric-snake-border">
            <svg width="100%" height="100%" class="circuit-svg">
              <defs>
                <filter id="lightning-snake" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
              <rect class="snake-track" rx="32" ry="32"></rect>
              <g class="snake-glow-group">
                <rect class="snake-head" rx="32" ry="32" filter="url(#lightning-snake)"></rect>
              </g>
            </svg>
          </div>

          <div class="card-inner-content">
            <div class="card-header">
              <h2 class="form-title">系统登录</h2>
              <p class="form-subtitle">欢迎使用 Thor 2.0 控制台</p>
            </div>

            <a-form :model="loginForm" layout="vertical" @finish="onLogin">
              <a-form-item name="username">
                <a-input v-model:value="loginForm.username" size="large" placeholder="管理账号 (admin)" class="glass-input">
                  <template #prefix><user-outlined /></template>
                </a-input>
              </a-form-item>
              <a-form-item name="password" class="mt-6">
                <a-input-password v-model:value="loginForm.password" size="large" placeholder="密码 (123456)" class="glass-input">
                  <template #prefix><lock-outlined /></template>
                </a-input-password>
              </a-form-item>
              <div class="form-footer">
                <a-checkbox v-model:checked="loginForm.remember"><span class="opt-text">记住会话</span></a-checkbox>
                <a class="forgot-link">安全中心</a>
              </div>
              <a-button type="primary" block size="large" html-type="submit" :loading="loading" class="login-btn">
                立即进入控制台
              </a-button>
            </a-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { gsap } from 'gsap';
import { message } from 'ant-design-vue';
import { ThunderboltFilled, FileZipOutlined, UserOutlined, LockOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const loading = ref(false);
const stageRef = ref<HTMLElement | null>(null);
const centerNodeRef = ref<HTMLElement | null>(null);
const canvasRef = ref<SVGSVGElement | null>(null); 

const loginForm = reactive({ username: '', password: '', remember: true });

const generateJaggedPath = (x1: number, y1: number, x2: number, y2: number, segments: number) => {
  let path = `M ${x1} ${y1}`;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    const jitterX = (Math.random() - 0.5) * 80;
    const jitterY = (Math.random() - 0.5) * 80;
    if (i === segments) path += ` L ${x2} ${y2}`;
    else path += ` L ${px + jitterX} ${py + jitterY}`;
  }
  return path;
};

const triggerThunderStrike = () => {
  if (!stageRef.value || !centerNodeRef.value || !canvasRef.value) return;
  const stageRect = stageRef.value.getBoundingClientRect();
  const nodeRect = centerNodeRef.value.getBoundingClientRect();
  const centerX = (nodeRect.left + nodeRect.width / 2) - stageRect.left;
  const centerY = (nodeRect.top + nodeRect.height / 2) - stageRect.top;

  const tl = gsap.timeline({ onComplete: () => { if (canvasRef.value) canvasRef.value.innerHTML = ''; } });
  const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  mainPath.setAttribute('d', generateJaggedPath(centerX + (Math.random() - 0.5) * 150, -150, centerX, centerY, 5));
  mainPath.setAttribute('class', 'main-strike');
  canvasRef.value.appendChild(mainPath);
  const mainLen = mainPath.getTotalLength();
  gsap.set(mainPath, { strokeDasharray: mainLen, strokeDashoffset: mainLen });
  tl.to(mainPath, { strokeDashoffset: 0, duration: 0.05, ease: "power4.in" }).to(mainPath, { opacity: 0, duration: 0.08 }, "+=0.02");
  tl.to(centerNodeRef.value, { filter: 'brightness(4) drop-shadow(0 0 60px #fff)', scale: 1.35, duration: 0.05, yoyo: true, repeat: 1 }, "-=0.08"); 

  const numBranches = 8 + Math.floor(Math.random() * 4);
  for (let i = 0; i < numBranches; i++) {
    const branchPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const angle = (Math.PI * 2 * i) / numBranches + (Math.random() - 0.5);
    const distance = 350 + Math.random() * 400; 
    branchPath.setAttribute('d', generateJaggedPath(centerX, centerY, centerX + Math.cos(angle) * distance, centerY + Math.sin(angle) * distance, 6));
    branchPath.setAttribute('class', 'branch-strike');
    canvasRef.value.appendChild(branchPath);
    const branchLen = branchPath.getTotalLength();
    gsap.set(branchPath, { strokeDasharray: branchLen, strokeDashoffset: branchLen });
    tl.to(branchPath, { strokeDashoffset: 0, duration: 0.08 + Math.random() * 0.05, ease: "power2.out" }, "-=0.15").to(branchPath, { opacity: 0, duration: 0.15 + Math.random() * 0.1 }, "-=0.05");
  }
};

const onLogin = () => {
  loading.value = true;
  gsap.to(".jelly-card", { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: "back.out(2)" });
  setTimeout(() => {
    localStorage.setItem('THOR_TOKEN', 'AUTH_TOKEN_0x54484f52');
    message.success('Thor 系统验证成功');
    router.push('/monitor/realtime');
    loading.value = false;
  }, 800);
};

onMounted(() => {
  setTimeout(triggerThunderStrike, 500);
  setInterval(triggerThunderStrike, 3500);
  if (centerNodeRef.value) gsap.to(centerNodeRef.value, { scale: 1.08, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" });
});
</script>

<style scoped lang="less">
.thor-login-wrapper { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
.global-gradient-bg {
  position: absolute; inset: 0; background: linear-gradient(110deg, #09101f 0%, #1e293b 40%, #e2e8f0 75%, #f8fafc 100%); z-index: 0; display: flex; justify-content: center; align-items: center; overflow: hidden;
  .thor-giant-text { font-size: 35vw; font-weight: 900; color: rgba(9, 96, 189, 0.04); filter: blur(12px); user-select: none; letter-spacing: -2vw; }
}
.glass-bg { position: absolute; inset: 0; z-index: 1; pointer-events: none; .circle { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.3; } .circle-1 { width: 600px; height: 600px; background: #00d2ff; top: -10%; left: -5%; } .circle-2 { width: 400px; height: 400px; background: #0960bd; bottom: 5%; right: 5%; } }
.login-main-content { position: relative; display: flex; width: 100%; height: 100%; z-index: 10; }
.visual-section { flex: 1.3; padding: 60px; display: flex; flex-direction: column; .brand-header { display: flex; align-items: center; gap: 15px; .logo-icon { font-size: 36px; color: #38bdf8; filter: drop-shadow(0 0 10px rgba(0, 210, 255, 0.6)); } .brand-info { .name { color: #fff; font-size: 24px; font-weight: 800; line-height: 1.2; } .tag { color: #38bdf8; font-size: 12px; } } } .dispatch-container { margin: auto; text-align: center; .main-title { color: #fff; font-size: 40px; font-weight: 800; margin-bottom: 16px; } .sub-title { color: rgba(255, 255, 255, 0.6); font-size: 18px; } .stage { position: relative; height: 400px; display: flex; justify-content: center; align-items: center; .lightning-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 8; overflow: visible; :deep(.main-strike) { fill: none; stroke: #ffffff; stroke-width: 6px; filter: drop-shadow(0 0 15px #00d2ff) drop-shadow(0 0 30px #00d2ff); } :deep(.branch-strike) { fill: none; stroke: #00d2ff; stroke-width: 3px; stroke-linecap: round; filter: drop-shadow(0 0 8px #00d2ff); } } .center-node { position: relative; z-index: 10; .file-icon { font-size: 90px; color: #00d2ff; filter: drop-shadow(0 0 20px rgba(0, 210, 255, 0.8)); transition: all 0.05s; } .energy-ring { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 140px; height: 140px; border: 2px solid #00d2ff; border-radius: 50%; opacity: 0.3; animation: ripple 2.5s infinite ease-out; } } } } }
.form-section { flex: 1; display: flex; justify-content: center; align-items: center; padding-right: 40px; .jelly-card { position: relative; width: 100%; max-width: 460px; padding: 3px; border-radius: 32px; background: transparent; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15); transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); &:hover { transform: translateY(-8px) scale(1.01); } .electric-snake-border { position: absolute; inset: 0; pointer-events: none; z-index: 1; svg { width: 100%; height: 100%; overflow: visible; } .snake-track { width: 100%; height: 100%; fill: none; stroke: rgba(255, 255, 255, 0.6); stroke-width: 1.5px; } .snake-glow-group { filter: drop-shadow(0 0 10px #00d2ff); } .snake-head { width: 100%; height: 100%; fill: none; stroke: #00d2ff; stroke-width: 5px; stroke-linecap: round; stroke-dasharray: 80 2500; stroke-dashoffset: 2620; animation: snakeRun 3.5s linear infinite; } } .card-inner-content { position: relative; z-index: 2; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(25px); padding: 50px; border-radius: 30px; } .form-title { font-size: 34px; font-weight: 800; color: #1e293b; margin-bottom: 8px; } .form-subtitle { color: #64748b; margin-bottom: 40px; font-size: 14px; } .glass-input { :deep(.ant-input-affix-wrapper) { background: rgba(255, 255, 255, 0.5); border: 1px solid rgba(255, 255, 255, 0.8); height: 56px; border-radius: 12px; font-size: 16px; transition: all 0.3s; &:hover, &-focused { background: #fff; border-color: #0960bd; box-shadow: 0 4px 12px rgba(9, 96, 189, 0.1); } } } .form-footer { display: flex; justify-content: space-between; margin-bottom: 30px; align-items: center; .opt-text { color: #64748b; } .forgot-link { color: #0960bd; font-weight: 600; cursor: pointer; } } .login-btn { height: 58px; border-radius: 16px; font-size: 18px; font-weight: bold; margin-top: 10px; background: linear-gradient(135deg, #0960bd, #00d2ff); border: none; box-shadow: 0 10px 25px rgba(9, 96, 189, 0.3); transition: all 0.3s; &:active { transform: scale(0.96); } &:hover { box-shadow: 0 15px 35px rgba(9, 96, 189, 0.5); transform: translateY(-2px); } } } }
@keyframes ripple { from { width: 130px; height: 130px; opacity: 0.5; } to { width: 380px; height: 380px; opacity: 0; } }
@keyframes snakeRun { 100% { stroke-dashoffset: 0; } }
</style>