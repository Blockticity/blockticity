<template>
  <div v-if="!unlocked" class="access-gate-container">
    <div class="access-gate-card">
      <!-- Blockticity Logo/Header -->
      <div class="gate-header">
        <h1 class="brand-title">BLOCKTICITY</h1>
        <p class="brand-tagline">Trustless Trade at Scale™</p>
      </div>

      <!-- Main Gate Content -->
      <div class="gate-content">
        <div class="lock-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <h2 class="gate-title">Certificate Access Required</h2>
        <p class="gate-description">This Certificate of Authenticity contains protected information. Please authenticate to view the complete details.</p>
        
        <!-- Passkey Input Section -->
        <div class="input-group">
          <label for="passkey" class="input-label">Access Code</label>
          <input 
            id="passkey"
            v-model="passkeyInput" 
            type="password"
            placeholder="Enter your access code"
            class="passkey-input"
            @keyup.enter="checkPasskey"
          />
          <button @click="checkPasskey" class="btn btn-primary">
            Unlock Certificate
          </button>
        </div>

        <!-- Error Message -->
        <transition name="fade">
          <div v-if="!valid && tried" class="message message-error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="error-icon">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            Invalid access code. Please check your credentials and try again.
          </div>
        </transition>

        <!-- Alternative Login -->
        <div class="divider">
          <span>or</span>
        </div>

        <div class="alt-login">
          <p class="alt-login-text">Authenticate with your wallet</p>
          <button @click="loginPrivy" class="btn btn-secondary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="wallet-icon">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/>
            </svg>
            Connect Wallet
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="gate-footer">
        <p class="compliance-text">ASTM D8558-24 Compliant • Privacy Enhanced</p>
      </div>
    </div>
  </div>

  <div v-else>
    <slot /> <!-- This will render the unlocked content -->
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import accessConfig from '../data/accessConfig.json';

const props = defineProps({
  tokenId: String,
  userEmail: String
});

const passkeyInput = ref('');
const unlocked = ref(false);
const valid = ref(true);
const tried = ref(false);

const checkPasskey = () => {
  const config = accessConfig[props.tokenId] || accessConfig["default"];
  tried.value = true;

  if (passkeyInput.value === config.passkey) {
    unlocked.value = true;
    valid.value = true;
  } else {
    valid.value = false;
  }
};

const loginPrivy = () => {
  // Hook this to your existing Privy login flow
  // For now, show a branded message
  alert("Wallet authentication coming soon. Please use your access code.");
};
</script>

<style scoped>
.access-gate-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--light-gray) 0%, #ffffff 100%);
}

.access-gate-card {
  background: var(--white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
}

.gate-header {
  background: linear-gradient(135deg, var(--deep-teal) 0%, var(--primary-teal) 100%);
  color: var(--white);
  padding: var(--spacing-xl);
  text-align: center;
}

.brand-title {
  font-size: 2rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: 0.05em;
  color: var(--white);
}

.brand-tagline {
  margin: var(--spacing-xs) 0 0;
  font-size: 0.875rem;
  font-weight: 300;
  opacity: 0.9;
}

.gate-content {
  padding: var(--spacing-2xl) var(--spacing-xl);
}

.lock-icon {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  color: var(--primary-teal);
}

.gate-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark-gray);
  margin: 0 0 var(--spacing-md);
}

.gate-description {
  text-align: center;
  color: var(--text-light);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.input-group {
  margin-bottom: var(--spacing-lg);
}

.input-label {
  display: block;
  font-weight: 500;
  color: var(--text-dark);
  margin-bottom: var(--spacing-sm);
  font-size: 0.875rem;
}

.passkey-input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1rem;
  border: 2px solid var(--border-gray);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--spacing-md);
  transition: all var(--transition-base);
}

.passkey-input:focus {
  outline: none;
  border-color: var(--primary-teal);
  box-shadow: 0 0 0 3px rgba(91, 209, 215, 0.1);
}

.btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-2xl);
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  min-height: 48px;
}

.btn-primary {
  background-color: var(--deep-teal);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: #067a80;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: var(--white);
  color: var(--deep-teal);
  border: 2px solid var(--deep-teal);
}

.btn-secondary:hover {
  background-color: var(--deep-teal);
  color: var(--white);
}

.message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-2xl);
  margin-top: var(--spacing-md);
  font-size: 0.875rem;
}

.message-error {
  background-color: var(--error-bg);
  color: var(--error-red);
  border: 1px solid rgba(211, 47, 47, 0.2);
}

.error-icon {
  flex-shrink: 0;
}

.divider {
  text-align: center;
  margin: var(--spacing-xl) 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--border-gray);
}

.divider span {
  background-color: var(--white);
  padding: 0 var(--spacing-md);
  position: relative;
  color: var(--text-light);
  font-size: 0.875rem;
}

.alt-login-text {
  text-align: center;
  color: var(--text-light);
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
}

.wallet-icon {
  width: 20px;
  height: 20px;
}

.gate-footer {
  background-color: var(--light-gray);
  padding: var(--spacing-lg);
  text-align: center;
  border-top: 1px solid var(--border-gray);
}

.compliance-text {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-light);
  font-weight: 500;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .access-gate-container {
    padding: var(--spacing-md);
  }
  
  .gate-content {
    padding: var(--spacing-lg);
  }
  
  .gate-title {
    font-size: 1.25rem;
  }
}
</style>