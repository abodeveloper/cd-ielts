const i=n=>{const t=new URLSearchParams;Object.entries(n).forEach(([o,r])=>{r!==void 0&&r!==""&&t.append(o,r.toString())});const e=t.toString();return e?`&${e}`:""};export{i as b};
