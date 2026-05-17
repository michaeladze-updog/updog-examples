<script setup lang="ts">
import { useTemplateRef, watchEffect } from "vue";
import "@updog/data-editor-wc";
import "@updog/data-editor-wc/styles.css";
import type { UpdogEditorElement } from "@updog/data-editor-wc";

type Column = { id: string; title: string };

const props = defineProps<{
  apiKey: string;
  columns: Column[];
  primaryKey: string;
}>();

const emit = defineEmits<{
  complete: [result: unknown];
}>();

const editorRef = useTemplateRef<UpdogEditorElement>("editor");

watchEffect((onCleanup) => {
  const el = editorRef.value;
  if (!el) return;
  el.configure({
    apiKey: props.apiKey,
    columns: props.columns,
    primaryKey: props.primaryKey,
    onComplete: (result) => {
      emit("complete", result);
      el.hide();
    },
  });
  const onClose = () => el.hide();
  el.addEventListener("close", onClose);
  onCleanup(() => el.removeEventListener("close", onClose));
});

function open() {
  editorRef.value?.show();
}
</script>

<template>
  <button type="button" @click="open">Open Importer</button>
  <updog-editor ref="editor" />
</template>
