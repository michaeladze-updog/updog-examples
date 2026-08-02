<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue";
import type { UpdogEditorElement } from "@updog/data-editor-wc";

const columns = [
  { id: "firstName", title: "First Name" },
  { id: "lastName", title: "Last Name" },
  { id: "email", title: "Email" },
];

const ready = ref(false);
const editorRef = useTemplateRef<UpdogEditorElement>("editor");

let setupPromise: Promise<void> | null = null;

function setupEditor() {
  if (!setupPromise) {
    setupPromise = (async () => {
      await import("@updog/data-editor-wc");
      await import("@updog/data-editor-wc/styles.css");
      ready.value = true;

      await nextTick();
      await customElements.whenDefined("updog-editor");

      const el = editorRef.value;
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
  editorRef.value?.show();
}
</script>

<template>
  <button type="button" @click="open">Open Importer</button>
  <ClientOnly>
    <updog-editor v-if="ready" ref="editor" />
  </ClientOnly>
</template>
