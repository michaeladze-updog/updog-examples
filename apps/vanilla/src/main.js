import "@updog/data-editor-wc";
import "@updog/data-editor-wc/styles.css";

const editor = document.getElementById("editor");

editor.configure({
  apiKey: "YOUR_API_KEY",
  columns: [
    { id: "firstName", title: "First Name" },
    { id: "lastName", title: "Last Name" },
    { id: "email", title: "Email" },
  ],
  primaryKey: "email",
  onComplete: (result) => {
    console.log(result);
    editor.hide();
  },
});

editor.addEventListener("close", () => editor.hide());

document
  .getElementById("open-btn")
  .addEventListener("click", () => editor.show());
