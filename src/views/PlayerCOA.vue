<template>
  <CoAAccessGate :tokenId="tokenId" :userEmail="userEmail">
    <div v-if="metadata" class="coa-view">
      <h2>{{ metadata.name }}</h2>
      <img
        :src="metadata.image"
        alt="COA Image"
        style="max-width: 100%; margin-top: 1rem;"
      />
      <p>{{ metadata.description }}</p>

      <div v-if="metadata.attributes && metadata.attributes.length" class="attributes">
        <h3>Certificate Details</h3>
        <table>
          <tbody>
            <tr v-for="(attr, index) in metadata.attributes" :key="index">
              <td><strong>{{ attr.trait_type }}</strong></td>
              <td>{{ attr.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else>
      <p>Loading metadata...</p>
    </div>
  </CoAAccessGate>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import CoAAccessGate from '../components/CoAAccessGate.vue';

const route = useRoute();
const tokenId = route.params.id;
const userEmail = ''; // Placeholder for Privy logic

const metadata = ref(null);

// TEMP: Hardcoded metadata URI for PIA test
const uri = 'https://aquamarine-adequate-rhinoceros-296.mypinata.cloud/ipfs/bafybeihyokbxtq5sdd477tkuws6ujwt3xtpgkluxf4cvkibnarrwhghopi/B075167.json';

onMounted(async () => {
  try {
    const res = await fetch(uri);
    metadata.value = await res.json();
  } catch (err) {
    console.error('Failed to fetch metadata:', err);
  }
});
</script>

<style scoped>
.coa-view {
  text-align: center;
  padding: 2rem;
}

.attributes {
  margin-top: 2rem;
  text-align: left;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.attributes table {
  width: 100%;
  border-collapse: collapse;
}

.attributes td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}
</style>
