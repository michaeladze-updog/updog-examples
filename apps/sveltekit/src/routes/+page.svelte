<script lang="ts">
  import { tick } from "svelte";
  import type { UpdogEditorElement } from "@updog/data-editor-wc";

  const columns = [
    { id: "firstName", title: "First Name" },
    { id: "lastName", title: "Last Name" },
    { id: "email", title: "Email" },
  ];

  let ready = $state(false);
  let editorEl: UpdogEditorElement | undefined = $state();

  let setupPromise: Promise<void> | null = null;

  function setupEditor() {
    if (!setupPromise) {
      setupPromise = (async () => {
        await import("@updog/data-editor-wc");
        await import("@updog/data-editor-wc/styles.css");
        ready = true;

        await tick();
        await customElements.whenDefined("updog-editor");

        const el = editorEl;
        if (!el) return;

        el.configure({
          apiKey: "YOUR_API_KEY",
          columns,
          primaryKey: "email",
          onComplete: (result) => {
            console.log(result);
            el.hide();
          },
        });

        el.addEventListener("close", () => el.hide());
      })();
    }

    return setupPromise;
  }

  async function open() {
    await setupEditor();
    editorEl?.show();
  }
</script>

<button type="button" onclick={open}>Open Importer</button>
{#if ready}
  <updog-editor bind:this={editorEl}></updog-editor>
{/if}
