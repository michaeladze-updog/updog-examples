<script lang="ts">
  import Importer from "./components/Importer.svelte";

  const columns = [
    { id: "firstName", title: "First Name" },
    { id: "lastName", title: "Last Name" },
    { id: "email", title: "Email" },
  ];

  function onComplete(result: unknown) {
    console.log(result);
  }
</script>

<Importer
  apiKey="YOUR_API_KEY"
  {columns}
  primaryKey="email"
  oncomplete={onComplete}
/>
