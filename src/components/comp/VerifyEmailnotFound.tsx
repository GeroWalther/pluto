"use client";

import { useState } from "react";

export default function VerifyEmailnotFound() {
  const [email, setEmail] = useState("");

  const test = (e: any) => {
    console.log(email);
  };

  return (
    <div>
      <h1>Verify Email</h1>
      <form onSubmit={test}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Verify Email</button>
      </form>
    </div>
  );
}
