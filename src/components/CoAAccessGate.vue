<template>
  <div v-if="!unlocked" class="gate">
    <h2>This Certificate is Private</h2>
    <p>Enter your access code to view:</p>
    <input v-model="passkeyInput" placeholder="Enter passkey..." />
    <button @click="checkPasskey">Unlock</button>

    <div v-if="!valid && tried" class="error">Invalid passkey or access denied.</div>

    <div class="alt-login">
      <p>Or log in to access:</p>
      <button @click="loginPrivy">Login with Privy</button>
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
  alert("⚠️ Add Privy login integration here");
};
</script>

<style scoped>
.gate {
  padding: 2rem;
  border: 1px dashed #ccc;
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}
input {
  margin-top: 0.5rem;
  padding: 0.5rem;
  width: 80%;
}
button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
.alt-login {
  margin-top: 2rem;
  font-size: 0.9rem;
}
</style>
