import{r as d,j as e,e as J,u as X}from"./index-6aA6dyFE.js";import{B as c}from"./badge-CfmkhHEF.js";import{C as p,a as v,b as Z,c as b,d as D}from"./card-D82gWwWe.js";import{T as E,a as A,b as N,c as n,d as R,e as l}from"./table-mxuaZ4eI.js";import{B as ee}from"./BackButton-D2BGtmR6.js";import{u as F,E as se}from"./ErrorMessage-_Plnaq0I.js";import{L as te}from"./LoadingSpinner-CYOjQjyJ.js";import{B as z}from"./button-BO4Uzq7b.js";import{S as I}from"./slider-CBRri-tF.js";import{D as ae,a as re,b as ie,d as ne,e as B,c as O}from"./dropdown-menu-CVhiNEDr.js";import{o as le,G as ce,q as de,s as oe,E as me,F as xe,c as he,e as V,g as H,b as ge,_ as je,h as fe,V as ue,I as pe}from"./index-DilegaoD.js";import{c as be}from"./utils-CPYLdFy8.js";import{S as q,C as Ne,a as ve,b as we}from"./collapsible-DvzmRBw5.js";import{l as a}from"./lodash-mfWsVd8W.js";import{h as ke}from"./student-BwZclQbM.js";import{g as ye}from"./listening-D1YEvc-0.js";import{p as L}from"./index-DnFERFOE.js";import"./index-BdrbzQWw.js";import"./createLucideIcon-DK-NVXMm.js";import"./index-1uuVVs-j.js";import"./index-BpU9b7Lp.js";import"./index-8r15THsD.js";import"./index-D9Nka9v-.js";import"./index-CqPjhSji.js";import"./index-B2qWlRgv.js";import"./index-BE-R6G9f.js";import"./index-cRCgce0j.js";import"./index-BhNuCDG_.js";import"./index-DxoO4d3W.js";import"./chevron-right-B-bmV6us.js";const Q=({src:f,title:h,onDownload:i,className:u})=>{const o=d.useRef(null),[s,w]=d.useState(!1),[k,y]=d.useState(0),[t,g]=d.useState(0),[m,_]=d.useState(1),[j,T]=d.useState(!1),[C,Y]=d.useState(1);d.useEffect(()=>{const r=o.current;if(!r)return;const x=()=>y(r.currentTime),S=()=>g(r.duration),P=()=>w(!1);return r.addEventListener("timeupdate",x),r.addEventListener("loadedmetadata",S),r.addEventListener("ended",P),()=>{r.removeEventListener("timeupdate",x),r.removeEventListener("loadedmetadata",S),r.removeEventListener("ended",P)}},[]),d.useEffect(()=>{o.current&&(o.current.volume=j?0:m)},[m,j]),d.useEffect(()=>{o.current&&(o.current.playbackRate=C)},[C]);const $=()=>{const r=o.current;r&&(s?r.pause():r.play(),w(!s))},G=r=>{const x=o.current;x&&(x.currentTime=r[0])},K=r=>{const x=r[0];_(x),T(x===0)},W=()=>{T(!j)},M=r=>{if(!isFinite(r))return"0:00";const x=Math.floor(r/60),S=Math.floor(r%60);return`${x}:${S.toString().padStart(2,"0")}`},U=()=>{if(i)i();else{const r=document.createElement("a");r.href=f,r.download=h||"audio.mp3",document.body.appendChild(r),r.click(),document.body.removeChild(r)}};return e.jsxs("div",{className:be("flex items-center gap-3 w-full",u),children:[e.jsx("audio",{ref:o,src:f,preload:"metadata"}),e.jsx(z,{onClick:$,size:"sm",className:"h-10 w-10 rounded-full p-0 bg-blue-600 hover:bg-blue-700",children:s?e.jsx(le,{className:"h-5 w-5 text-white"}):e.jsx(ce,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{className:"text-sm text-gray-700 min-w-[100px]",children:[M(k)," / ",M(t)]}),e.jsx("div",{className:"flex-1",children:e.jsx(I,{value:[k],max:t||100,step:.1,onValueChange:G,className:"w-full"})}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(z,{onClick:W,variant:"ghost",size:"sm",className:"h-8 w-8 p-0",children:j||m===0?e.jsx(de,{className:"h-5 w-5"}):e.jsx(oe,{className:"h-5 w-5"})}),e.jsx(I,{value:[j?0:m],max:1,step:.01,onValueChange:K,className:"w-20"})]}),e.jsxs(ae,{children:[e.jsx(re,{asChild:!0,children:e.jsx(z,{variant:"ghost",size:"sm",className:"h-8 w-8 p-0",children:e.jsx(me,{className:"h-5 w-5"})})}),e.jsxs(ie,{align:"end",className:"w-40",children:[e.jsx(ne,{children:"Playback Speed"}),e.jsx(B,{}),[.5,1,1.5,2].map(r=>e.jsxs(O,{onClick:()=>Y(r),className:C===r?"bg-accent":"",children:[r,"x ",C===r&&"✓"]},r)),e.jsx(B,{}),e.jsxs(O,{onClick:U,children:[e.jsx(xe,{className:"mr-2 h-4 w-4"}),"Download"]})]})]})]})},_e=({feedback:f})=>{const[h,i]=d.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(q,{className:"my-4"}),e.jsxs(Ne,{open:h,onOpenChange:i,children:[e.jsxs(ve,{className:"flex items-center justify-between w-full p-3 hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"text-base font-semibold text-foreground",children:"Feedback"}),e.jsx(c,{variant:"outline",className:"text-xs",children:"Click to expand"})]}),h?e.jsx(ue,{className:"h-5 w-5 text-primary"}):e.jsx(pe,{className:"h-5 w-5 text-primary"})]}),e.jsx(we,{className:"mt-3",children:e.jsxs("div",{className:"p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 rounded-xl border border-blue-200/50 dark:border-blue-800/30 shadow-sm",children:[e.jsx("style",{children:`
              .feedback-content {
                color: inherit;
              }
              .feedback-content h1 { 
                font-size: 1.75rem; 
                font-weight: 700; 
                margin: 1.5rem 0 1rem 0; 
                color: #1e40af;
                line-height: 1.3;
              }
              .feedback-content h1:first-child {
                margin-top: 0;
              }
              .feedback-content h2 { 
                font-size: 1.5rem; 
                font-weight: 600; 
                margin: 1.25rem 0 0.75rem 0; 
                color: #2563eb;
                line-height: 1.4;
              }
              .feedback-content h3 { 
                font-size: 1.25rem; 
                font-weight: 600; 
                margin: 1rem 0 0.5rem 0; 
                color: #3b82f6;
                line-height: 1.4;
              }
              .feedback-content p { 
                margin: 0.75rem 0; 
                line-height: 1.7; 
                color: #374151;
                font-size: 0.95rem;
              }
              .feedback-content ul { 
                margin: 0.75rem 0; 
                padding-left: 1.75rem; 
                list-style-type: disc;
              }
              .feedback-content li { 
                margin: 0.5rem 0; 
                line-height: 1.6;
                color: #4b5563;
              }
              .feedback-content li p {
                margin: 0.25rem 0;
              }
              .feedback-content hr { 
                margin: 1.5rem 0; 
                border: none; 
                border-top: 2px solid #e5e7eb; 
                opacity: 0.5;
              }
              .feedback-content strong { 
                font-weight: 600; 
                color: #1f2937;
              }
              .feedback-content em { 
                font-style: italic; 
                color: #6b7280;
              }
              .feedback-content br {
                display: block;
                margin: 0.5rem 0;
              }
            `}),e.jsx("div",{className:"feedback-content text-base leading-relaxed",children:L(f||"")})]})})]})]})},ts=()=>{const{id:f,test_type:h,skill:i,obj_id:u}=J(),o=X(),{data:s,isLoading:w,isError:k}=F({queryKey:["student-result",f,i,h,u],queryFn:()=>ke(f,h,i,u)}),{data:y}=F({queryKey:["listening-material",u],queryFn:()=>ye(u||""),enabled:i==="listening"&&!!u});return w?e.jsx(te,{}):k?e.jsx(se,{title:"Failed to Load page",message:"An error occurred while loading the page. Please try again later."}):e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("div",{className:"text-xl font-semibold",children:a.get(s,"student.full_name")}),e.jsx("div",{className:"flex gap-2",children:e.jsx(ee,{label:"Back"})})]}),e.jsxs(p,{className:"w-full",children:[e.jsx(v,{className:"flex flex-row items-center gap-4",children:e.jsx(Z,{children:a.get(s,"student.full_name")})}),e.jsxs(b,{className:"flex flex-col gap-2",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx("div",{className:"text-sm text-primary font-extrabold",children:"Group:"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:e.jsx(c,{onClick:()=>o("/teacher/groups/1"),className:"cursor-pointer",variant:"default",children:a.get(s,"student.group.name")})})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("div",{className:"text-sm text-primary font-extrabold",children:"Phone number:"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:a.get(s,"student.phone")})]})]})]}),i=="reading"&&e.jsxs(p,{className:"w-full shadow-lg",children:[e.jsxs(v,{className:"flex items-center space-x-2",children:[e.jsx(he,{className:"w-12 h-12"}),e.jsx("h1",{className:"text-center text-lg font-extrabold tracking-tight text-balance",children:"IELTS Academic Reading - Results"})]}),e.jsxs(b,{className:"space-y-8",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Test title:"}),e.jsx("div",{children:a.get(s,"test_title")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Material title:"}),e.jsx("div",{children:a.get(s,"material_title")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Test type:"}),e.jsx("div",{children:a.get(s,"test_type")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Total Questions:"}),e.jsx("div",{children:a.get(s,"statistics.total_questions")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Correct answers:"}),e.jsx("div",{className:"text-green-500",children:a.get(s,"statistics.correct_answers")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Incorrect answers:"}),e.jsx("div",{className:"text-destructive",children:a.get(s,"statistics.incorrect_answers")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Percentage correct:"}),e.jsxs("div",{children:[a.get(s,"statistics.score_percentage")," %"]})]}),h==="mock"&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Overal:"}),e.jsx(c,{variant:"default",children:a.get(s,"statistics.overall")})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("h2",{className:"text-md font-semibold",children:"Answer Review"}),e.jsx("div",{className:"",children:e.jsxs(E,{className:"w-full",children:[e.jsx(A,{children:e.jsxs(N,{children:[e.jsx(n,{children:"Question"}),e.jsx(n,{children:"Your Answer"}),e.jsx(n,{children:"True Answer"}),e.jsx(n,{children:"Status"})]})}),e.jsx(R,{children:a.get(s,"answers",[]).map(t=>e.jsxs(N,{children:[e.jsx(l,{children:t.question_number}),e.jsx(l,{children:t.answer||e.jsx(c,{className:"bg-orange-500",children:"Not answered"})}),e.jsx(l,{children:t.correct_answer}),e.jsx(l,{children:t.is_true?e.jsx(V,{className:"text-green-500"}):e.jsx(H,{className:"text-destructive"})})]},t.id))})]})})]})]}),e.jsx(D,{children:e.jsx("div",{className:"flex items-center justify-between w-full"})})]}),i=="listening"&&e.jsxs(p,{className:"w-full shadow-lg",children:[e.jsxs(v,{className:"flex items-center space-x-2",children:[e.jsx(ge,{className:"w-12 h-12"}),e.jsx("h1",{className:"text-center text-lg font-extrabold tracking-tight text-balance",children:"IELTS Academic Listening - Results"})]}),e.jsxs(b,{className:"space-y-8",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Test title:"}),e.jsx("div",{children:a.get(s,"test_title")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Material title:"}),e.jsx("div",{children:a.get(s,"material_title")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Test type:"}),e.jsx("div",{children:a.get(s,"test_type")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Total Questions:"}),e.jsx("div",{children:a.get(s,"statistics.total_questions")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Correct answers:"}),e.jsx("div",{className:"text-green-500",children:a.get(s,"statistics.correct_answers")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Incorrect answers:"}),e.jsx("div",{className:"text-destructive",children:a.get(s,"statistics.incorrect_answers")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Percentage correct:"}),e.jsxs("div",{children:[a.get(s,"statistics.score_percentage")," %"]})]}),h==="mock"&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Overal:"}),e.jsx(c,{variant:"default",children:a.get(s,"statistics.overall")})]})]}),i==="listening"&&y&&e.jsxs("div",{className:"space-y-3",children:[e.jsx("h2",{className:"text-md font-semibold",children:"Audio"}),e.jsx("div",{className:"space-y-4",children:a.get(y,"listening_parts",[]).sort((t,g)=>(t.listening_section||0)-(g.listening_section||0)).map((t,g)=>{const m=Array.isArray(t.audio)?t.audio[0]:t.audio;return m?e.jsx("div",{className:"w-full",children:e.jsx(Q,{src:m,title:t.title||`Section ${t.listening_section||g+1}`})},t.id||g):null})})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("h2",{className:"text-md font-semibold",children:"Answer Review"}),e.jsx("div",{className:"",children:e.jsxs(E,{className:"w-full",children:[e.jsx(A,{children:e.jsxs(N,{children:[e.jsx(n,{children:"Question"}),e.jsx(n,{children:"Your Answer"}),e.jsx(n,{children:"True Answer"}),e.jsx(n,{children:"Status"})]})}),e.jsx(R,{children:a.get(s,"answers",[]).map(t=>e.jsxs(N,{children:[e.jsx(l,{children:t.question_number}),e.jsx(l,{children:t.answer||e.jsx(c,{className:"bg-orange-500",children:"Not answered"})}),e.jsx(l,{children:t.correct_answer}),e.jsx(l,{children:t.is_true?e.jsx(V,{className:"text-green-500"}):e.jsx(H,{className:"text-destructive"})})]},t.id))})]})})]})]}),e.jsx(D,{children:e.jsx("div",{className:"flex items-center justify-between w-full"})})]}),i=="writing"&&e.jsxs(p,{className:"w-full shadow-lg",children:[e.jsxs(v,{className:"flex items-center space-x-2",children:[e.jsx(je,{className:"w-12 h-12"}),e.jsx("h1",{className:"text-center text-lg font-extrabold tracking-tight text-balance",children:"IELTS Academic Writing - Results"})]}),e.jsxs(b,{className:"space-y-8",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Test title:"}),e.jsx("div",{children:a.get(s,"test_title")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Material title:"}),e.jsx("div",{children:a.get(s,"material_title")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Test type:"}),e.jsx("div",{children:a.get(s,"test_type")})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("strong",{children:"Overal:"}),e.jsx(c,{variant:"default",children:a.get(s,"statistics.average_score")})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("h2",{className:"text-md font-semibold",children:"Answer Review"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(E,{className:"w-full min-w-[1000px]",children:[e.jsx(A,{children:e.jsxs(N,{children:[e.jsx(n,{children:"Task"}),e.jsx(n,{children:"Your Answer"}),e.jsx(n,{children:"Word count"}),e.jsx(n,{children:"Score"}),e.jsx(n,{className:"min-w-[600px]",children:"Feedback"})]})}),e.jsx(R,{children:a.get(s,"answers",[]).map(t=>e.jsxs(N,{children:[e.jsx(l,{children:t.task_number}),e.jsx(l,{children:t.answer||e.jsx(c,{className:"bg-orange-500",children:"Not answered"})}),e.jsx(l,{children:t.word_count}),e.jsx(l,{children:e.jsx(c,{variant:"default",children:t.score})}),e.jsx(l,{className:"min-w-[600px] max-w-none",children:t.feedback?e.jsxs("div",{className:"p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 rounded-lg border border-blue-200/50 dark:border-blue-800/30 w-full",children:[e.jsx("style",{children:`
                                .feedback-content {
                                  color: inherit;
                                }
                                .feedback-content h1 { 
                                  font-size: 1.5rem; 
                                  font-weight: 700; 
                                  margin: 1.25rem 0 0.75rem 0; 
                                  color: #1e40af;
                                  line-height: 1.3;
                                }
                                .feedback-content h1:first-child {
                                  margin-top: 0;
                                }
                                .feedback-content h2 { 
                                  font-size: 1.25rem; 
                                  font-weight: 600; 
                                  margin: 1rem 0 0.5rem 0; 
                                  color: #2563eb;
                                  line-height: 1.4;
                                }
                                .feedback-content h3 { 
                                  font-size: 1.125rem; 
                                  font-weight: 600; 
                                  margin: 0.875rem 0 0.5rem 0; 
                                  color: #3b82f6;
                                  line-height: 1.4;
                                }
                                .feedback-content p { 
                                  margin: 0.625rem 0; 
                                  line-height: 1.65; 
                                  color: #374151;
                                  font-size: 0.9rem;
                                }
                                .feedback-content ul { 
                                  margin: 0.625rem 0; 
                                  padding-left: 1.5rem; 
                                  list-style-type: disc;
                                }
                                .feedback-content li { 
                                  margin: 0.375rem 0; 
                                  line-height: 1.6;
                                  color: #4b5563;
                                }
                                .feedback-content li p {
                                  margin: 0.25rem 0;
                                }
                                .feedback-content hr { 
                                  margin: 1.25rem 0; 
                                  border: none; 
                                  border-top: 2px solid #e5e7eb; 
                                  opacity: 0.5;
                                }
                                .feedback-content strong { 
                                  font-weight: 600; 
                                  color: #1f2937;
                                }
                                .feedback-content em { 
                                  font-style: italic; 
                                  color: #6b7280;
                                }
                                .feedback-content br {
                                  display: block;
                                  margin: 0.375rem 0;
                                }
                              `}),e.jsx("div",{className:"feedback-content text-sm leading-relaxed",children:L(t.feedback||"")})]}):e.jsx("span",{className:"text-muted-foreground",children:"—"})})]},t.id))})]})})]})]})]}),i=="speaking"&&e.jsxs(p,{className:"w-full shadow-lg",children:[e.jsxs(v,{className:"flex flex-col gap-4 pb-6",children:[e.jsxs("div",{className:"flex items-center justify-center gap-3",children:[e.jsx(fe,{className:"w-10 h-10 text-primary"}),e.jsx("h1",{className:"text-2xl font-bold",children:"IELTS Academic Speaking - Results"})]}),e.jsx(q,{}),e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-4 pt-2",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("div",{className:"text-sm text-muted-foreground font-medium",children:"Test title"}),e.jsx("div",{className:"text-sm font-semibold",children:a.get(s,"test_title")||"—"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("div",{className:"text-sm text-muted-foreground font-medium",children:"Material title"}),e.jsx("div",{className:"text-sm font-semibold",children:a.get(s,"material_title")||"—"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("div",{className:"text-sm text-muted-foreground font-medium",children:"Score"}),e.jsx(c,{variant:"default",className:"w-fit text-base px-3 py-1",children:a.get(s,"statistics.average_score")||"—"})]})]})]}),e.jsxs(b,{className:"space-y-6",children:[e.jsx("style",{children:`
              .speaking-questions * {
                font-size: 16px !important;
              }
              .speaking-questions p,
              .speaking-questions span,
              .speaking-questions div,
              .speaking-questions strong,
              .speaking-questions ul,
              .speaking-questions li {
                font-size: 16px !important;
              }
            `}),a.get(s,"feedback")&&e.jsxs("div",{className:"space-y-4 w-full",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"text-lg font-bold text-foreground",children:"Feedback"}),e.jsx("div",{className:"h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"})]}),e.jsxs("div",{className:"p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 rounded-xl border border-blue-200/50 dark:border-blue-800/30 shadow-sm w-full",children:[e.jsx("style",{children:`
                    .feedback-content {
                      color: inherit;
                    }
                    .feedback-content h1 { 
                      font-size: 1.75rem; 
                      font-weight: 700; 
                      margin: 1.5rem 0 1rem 0; 
                      color: #1e40af;
                      line-height: 1.3;
                    }
                    .feedback-content h1:first-child {
                      margin-top: 0;
                    }
                    .feedback-content h2 { 
                      font-size: 1.5rem; 
                      font-weight: 600; 
                      margin: 1.25rem 0 0.75rem 0; 
                      color: #2563eb;
                      line-height: 1.4;
                    }
                    .feedback-content h3 { 
                      font-size: 1.25rem; 
                      font-weight: 600; 
                      margin: 1rem 0 0.5rem 0; 
                      color: #3b82f6;
                      line-height: 1.4;
                    }
                    .feedback-content p { 
                      margin: 0.75rem 0; 
                      line-height: 1.7; 
                      color: #374151;
                      font-size: 0.95rem;
                    }
                    .feedback-content ul { 
                      margin: 0.75rem 0; 
                      padding-left: 1.75rem; 
                      list-style-type: disc;
                    }
                    .feedback-content li { 
                      margin: 0.5rem 0; 
                      line-height: 1.6;
                      color: #4b5563;
                    }
                    .feedback-content li p {
                      margin: 0.25rem 0;
                    }
                    .feedback-content hr { 
                      margin: 1.5rem 0; 
                      border: none; 
                      border-top: 2px solid #e5e7eb; 
                      opacity: 0.5;
                    }
                    .feedback-content strong { 
                      font-weight: 600; 
                      color: #1f2937;
                    }
                    .feedback-content em { 
                      font-style: italic; 
                      color: #6b7280;
                    }
                    .feedback-content br {
                      display: block;
                      margin: 0.5rem 0;
                    }
                  `}),e.jsx("div",{className:"feedback-content text-base leading-relaxed",children:L(a.get(s,"feedback")||"")})]})]}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-lg font-semibold mb-4",children:"Answer Review"}),e.jsxs("div",{className:"space-y-6",children:[a.get(s,"answers",[])?.map((t,g)=>e.jsx(p,{className:"border-2",children:e.jsxs(b,{className:"p-6 space-y-6",children:[e.jsx("div",{className:"space-y-4",children:t?.questions?.map((m,_)=>e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs(c,{variant:"secondary",className:"text-sm font-bold px-3 py-1",children:["Part ",m?.speaking_part]})}),e.jsx("div",{className:"space-y-1.5 pl-4 border-l-2 border-primary/20",children:m?.question?.map((j,T)=>e.jsx("div",{className:"space-y-0.5",children:e.jsxs("div",{className:"flex gap-1.5 items-start",children:[e.jsxs("span",{className:"font-semibold text-primary min-w-[18px] text-[16px] leading-tight",children:[j?.question_number,"."]}),e.jsx("div",{className:"speaking-questions prose max-w-none text-[16px] leading-relaxed [&_p]:mb-0.5 [&_p]:leading-relaxed",dangerouslySetInnerHTML:{__html:j?.question}})]})},T))}),_<(t?.questions?.length||0)-1&&e.jsx(q,{className:"my-4"})]},_))}),e.jsx(q,{}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"text-sm font-semibold text-muted-foreground",children:"Your Answer"}),e.jsx("div",{children:t.record?e.jsx(Q,{src:t.record,title:"Your recorded answer"}):e.jsx("div",{className:"flex items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/50",children:e.jsx(c,{variant:"outline",className:"bg-orange-50 border-orange-300 text-orange-700",children:"Not answered"})})})]}),t.feedback&&e.jsx(_e,{feedback:t.feedback})]})},t.id||g)),(!a.get(s,"answers",[])||a.get(s,"answers",[]).length===0)&&e.jsx("div",{className:"text-center py-12 text-muted-foreground",children:"No answers available"})]})]})]})]})]})};export{ts as default};
