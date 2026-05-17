<script setup lang="ts">
import Importer from "./components/Importer.vue";

const columns = [
  { id: "firstName", title: "First Name" },
  { id: "lastName", title: "Last Name" },
  { id: "email", title: "Email" },
];

function onComplete(result: unknown) {
  console.log(result);
}
</script>

<template>
  <Importer
    api-key="YOUR_API_KEY"
    :columns="columns"
    primary-key="email"
    @complete="onComplete"
  />
</template>
