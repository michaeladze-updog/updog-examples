<script lang="ts">
  import type {
    DataEditorColumn,
    DataEditorResult,
  } from "@updog/data-editor-wc";
  import Importer from "./components/Importer.svelte";

  const columns: DataEditorColumn[] = [
    { id: "firstName", title: "First Name" },
    { id: "lastName", title: "Last Name" },
    { id: "email", title: "Email" },
  ];

  function onComplete(result: DataEditorResult) {
    console.log(result);
  }
</script>

<Importer
  apiKey="YOUR_API_KEY"
  {columns}
  primaryKey="email"
  oncomplete={onComplete}
/>
