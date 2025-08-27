"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function LoginInner() {
  const [code, setCode] = useState("");
  const sp = useSearchParams();
  const error = sp.get("error");

  return (
    <form method="POST" action="/api/login"
      style={{maxWidth:420,margin:"10vh auto",fontFamily:"system-ui"}}>
      <h1 style={{fontSize:28,marginBottom:8,letterSpacing:-0.5}}>msaiq</h1>
      <p style={{opacity:.7,marginBottom:16}}>Enter access code to continue.</p>
      {error && (
        <div style={{background:"#fee2e2",border:"1px solid #fecaca",color:"#991b1b",
          padding:10,borderRadius:8,fontSize:14,marginBottom:12}}>
          Incorrect code. Try again.
        </div>
      )}
      <input
        name="code"
        value={code}
        onChange={(e)=>setCode(e.target.value)}
        placeholder="••••••"
        autoFocus
        style={{width:"100%",padding:12,border:"1px solid #ddd",borderRadius:8,marginBottom:10}}
      />
      <button type="submit"
        style={{marginTop:6,padding:"10px 14px",borderRadius:8,background:"#000",color:"#fff"}}>
        Continue
      </button>
    </form>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div style={{maxWidth:420,margin:"10vh auto",fontFamily:"system-ui"}}>Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}