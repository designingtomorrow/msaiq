"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{fontFamily:"system-ui",maxWidth:720,margin:"10vh auto"}}>
        <h1 style={{fontSize:24,marginBottom:8}}>Something went wrong</h1>
        <pre style={{whiteSpace:"pre-wrap",background:"#f6f6f6",padding:12,borderRadius:8}}>
{String(error?.message || error)}
        </pre>
        <button onClick={() => reset()} style={{marginTop:12,padding:"8px 12px"}}>Try again</button>
      </body>
    </html>
  );
}