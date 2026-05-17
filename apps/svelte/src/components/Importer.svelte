<script lang="ts">
  import "@updog/data-editor-wc";
  import "@updog/data-editor-wc/styles.css";
  import type { UpdogEditorElement } from "@updog/data-editor-wc";

  type Column = { id: string; title: string };

  let {
    apiKey,
    columns,
    primaryKey,
    oncomplete,
  }: {
    apiKey: string;
    columns: Column[];
    primaryKey: string;
    oncomplete?: (result: unknown) => void;
  } = $props();

  let editorEl: UpdogEditorElement | undefined = $state();

  $effect(() => {
    if (!editorEl) return;
    const el = editorEl;
    el.configure({
      apiKey,
      columns,
      primaryKey,
      onComplete: (result) => {
        oncomplete?.(result);
        el.hide();
      },
    });
    const onClose = () => el.hide();
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  });

  function open() {
    editorEl?.show();
  }
</script>

<button type="button" onclick={open}>Open Importer</button>
<updog-editor bind:this={editorEl}></updog-editor>
