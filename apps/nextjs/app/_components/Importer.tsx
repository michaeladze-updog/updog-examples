"use client";

import { useState } from "react";
import { DataEditor } from "@updog/data-editor";
import "@updog/data-editor/styles.css";

type Row = { firstName: string; lastName: string; email: string };

const columns = [
  { id: "firstName", title: "First Name" },
  { id: "lastName", title: "Last Name" },
  { id: "email", title: "Email" },
];

export default function Importer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open Importer
      </button>
      <DataEditor<Row>
        apiKey="YOUR_API_KEY"
        open={open}
        onClose={() => setOpen(false)}
        columns={columns}
        primaryKey="email"
        onComplete={(result) => {
          console.log(result);
          setOpen(false);
        }}
      />
    </>
  );
}
