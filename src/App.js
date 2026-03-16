/* eslint-disable */
import { useState, useCallback, useMemo } from "react";

// ─── TOKENS ───────────────────────────────────────────────────
const C = {
  bg:"#07111f", surf:"#0c1a2e", card:"#101f36", border:"#1a2f4a",
  teal:"#00c2cc", tealDim:"#006b72", tealFaint:"#00c2cc15",
  gold:"#f5a623", goldFaint:"#f5a62312",
  green:"#00d68f", greenFaint:"#00d68f12",
  red:"#ff4d6d", redFaint:"#ff4d6d12",
  blue:"#4d9fff", blueFaint:"#4d9fff12",
  purple:"#a78bfa", purpleFaint:"#a78bfa12",
  white:"#eef4ff", muted:"#5a7a9e", faint:"#1e3050",
};

// ─── PROCEDURE DEFINITIONS ────────────────────────────────────
const PROCEDURES = [
  {
    id:"ultramist", label:"UltraMist", emoji:"🌊",
    cpt:"97610", color:C.teal, faint:C.tealFaint,
    defaultAllowed:466.58, defaultCollRate:80,
    verified:true,
    fields:[
      {key:"allowed",label:"Allowed per session",hint:"✅ 2026 CMS $466.58 verified",default:466.58,step:5},
      {key:"consumable",label:"Consumable cost",hint:"transducer + saline",default:18,step:1},
      {key:"txMins",label:"Treatment time (min)",hint:"avg per patient",default:28,step:1,notMoney:true},
    ],
    calc:(f,coll)=>{
      const net = f.allowed*(coll/100);
      const margin = net - f.consumable;
      return {net, margin, costPerTx: f.consumable, txMins: f.txMins};
    }
  },
  {
    id:"prp", label:"PRP (G0465)", emoji:"💉",
    cpt:"G0465", color:C.red, faint:C.redFaint,
    defaultAllowed:1245.09, defaultCollRate:80,
    verified:true,
    fields:[
      {key:"allowed",label:"Allowed per visit",hint:"✅ 2026 CMS $1,245.09 verified",default:1245.09,step:10},
      {key:"consumable",label:"Consumable cost",hint:"centrifuge kit + supplies",default:45,step:5},
      {key:"txMins",label:"Procedure time (min)",hint:"incl. draw + centrifuge",default:45,step:1,notMoney:true},
    ],
    calc:(f,coll)=>{
      const net = f.allowed*(coll/100);
      const margin = net - f.consumable;
      return {net, margin, costPerTx: f.consumable, txMins: f.txMins};
    }
  },
  {
    id:"skinsubXT", label:"PuraPly XT", emoji:"🩹",
    cpt:"Q4206", color:C.green, faint:C.greenFaint,
    verified:true,
    defaultAllowed:127.14, defaultCollRate:80,
    fields:[
      {key:"ratePerCm",label:"Rate per cm²",hint:"✅ 2026 CMS flat rate — all skin subs",default:127.14,step:0.01},
      {key:"avgWoundCm",label:"Avg wound area (cm²)",hint:"L×W only",default:20,step:1,notMoney:true},
      {key:"graftCost",label:"Graft acquisition cost",hint:"⚠️ Key margin driver at $127/cm²",default:780,step:50},
      {key:"txMins",label:"Application time (min)",default:25,step:1,notMoney:true},
    ],
    calc:(f,coll)=>{
      const gross = f.ratePerCm * f.avgWoundCm;
      const net = gross*(coll/100);
      const margin = net - f.graftCost;
      return {net, gross, margin, costPerTx: f.graftCost, txMins: f.txMins, perCm: true, cm: f.avgWoundCm};
    }
  },
  {
    id:"skinsubNS", label:"NuShield", emoji:"🧬",
    cpt:"Q4131", color:C.purple, faint:C.purpleFaint,
    verified:true,
    defaultAllowed:127.14, defaultCollRate:80,
    fields:[
      {key:"ratePerCm",label:"Rate per cm²",hint:"✅ 2026 CMS flat rate — all skin subs",default:127.14,step:0.01},
      {key:"avgWoundCm",label:"Avg wound area (cm²)",hint:"L×W only",default:20,step:1,notMoney:true},
      {key:"graftCost",label:"Graft acquisition cost",hint:"⚠️ Key margin driver at $127/cm²",default:900,step:50},
      {key:"txMins",label:"Application time (min)",default:25,step:1,notMoney:true},
    ],
    calc:(f,coll)=>{
      const gross = f.ratePerCm * f.avgWoundCm;
      const net = gross*(coll/100);
      const margin = net - f.graftCost;
      return {net, gross, margin, costPerTx: f.graftCost, txMins: f.txMins, perCm: true, cm: f.avgWoundCm};
    }
  },
  {
    id:"abi", label:"ABI / SmartABI", emoji:"🫀",
    cpt:"93922", color:C.blue, faint:C.blueFaint,
    defaultAllowed:96.87, defaultCollRate:80,
    verified:true,
    fields:[
      {key:"allowed",label:"Allowed per study",hint:"✅ 2026 CMS $96.87 global verified",default:96.87,step:5},
      {key:"consumable",label:"Consumable cost",hint:"leads, probe cover",default:8,step:1},
      {key:"txMins",label:"Study time (min)",default:20,step:1,notMoney:true},
    ],
    calc:(f,coll)=>{
      const net = f.allowed*(coll/100);
      const margin = net - f.consumable;
      return {net, margin, costPerTx: f.consumable, txMins: f.txMins};
    }
  },
  {
    id:"debride", label:"Sharp Debridement", emoji:"🔪",
    cpt:"97597/98", color:C.gold, faint:C.goldFaint,
    defaultAllowed:116.40, defaultCollRate:80,
    verified:true,
    fields:[
      {key:"allowed",label:"Allowed first 20 cm²",hint:"✅ 2026 CMS $116.40 verified",default:116.40,step:5},
      {key:"addlAllowed",label:"Add'l per 20 cm²",hint:"✅ 2026 CMS $54.11",default:54.11,step:5},
      {key:"avgAddlUnits",label:"Avg add'l units billed",hint:"0 if most wounds < 20cm²",default:1,step:1,notMoney:true},
      {key:"consumable",label:"Consumable cost",hint:"scalpel, curette, dressing",default:12,step:1},
      {key:"txMins",label:"Procedure time (min)",default:20,step:1,notMoney:true},
    ],
    calc:(f,coll)=>{
      const gross = f.allowed + (f.addlAllowed * f.avgAddlUnits);
      const net = gross*(coll/100);
      const margin = net - f.consumable;
      return {net, gross, margin, costPerTx: f.consumable, txMins: f.txMins};
    }
  },
  {
    id:"lymph", label:"Lymphedema / LymphaScanner", emoji:"🧲",
    cpt:"93702", color:"#e879f9", faint:"#e879f912",
    defaultAllowed:156.16, defaultCollRate:80,
    verified:true,
    fields:[
      {key:"allowed",label:"Allowed per scan",hint:"✅ 2026 CMS $156.16 verified",default:156.16,step:5},
      {key:"consumable",label:"Consumable cost",hint:"minimal",default:4,step:1},
      {key:"txMins",label:"Scan time (min)",default:15,step:1,notMoney:true},
    ],
    calc:(f,coll)=>{
      const net = f.allowed*(coll/100);
      const margin = net - f.consumable;
      return {net, margin, costPerTx: f.consumable, txMins: f.txMins};
    }
  },
  {
    id:"moleculight", label:"MolecuLight", emoji:"🔬",
    cpt:"0598T", color:"#fb923c", faint:"#fb923c12",
    defaultAllowed:175, defaultCollRate:80,
    fields:[
      {key:"allowed",label:"Allowed per session",hint:"⚠️ Est. Novitas JL ~$175 — verify",default:175,step:5},
      {key:"addlSites",label:"Add'l sites (0599T)",hint:"×$119 each — add-on",default:0,step:1,notMoney:true},
      {key:"consumable",label:"Consumable cost",hint:"DarkDrape per use",default:12,step:1},
      {key:"txMins",label:"Imaging time (min)",hint:"~5 min bedside",default:8,step:1,notMoney:true},
    ],
    calc:(f,coll)=>{
      const gross=f.allowed+(f.addlSites*119);
      const net=gross*(coll/100);
      return {net, gross, margin:net-f.consumable, costPerTx:f.consumable, txMins:f.txMins};
    }
  },
  {
    id:"telehealth",, label:"Telehealth Wound Consult", emoji:"💻",
    cpt:"99213-99214", color:"#34d399", faint:"#34d39912",
    defaultAllowed:70, defaultCollRate:80,
    fields:[
      {key:"allowed",label:"Allowed per visit",hint:"99214=$135.60 / 99213=$92 non-fac",default:70,step:5},
      {key:"consumable",label:"Cost per visit",hint:"platform, overhead",default:5,step:1},
      {key:"txMins",label:"Visit time (min)",default:15,step:1,notMoney:true},
    ],
    calc:(f,coll)=>{
      const net = f.allowed*(coll/100);
      const margin = net - f.consumable;
      return {net, margin, costPerTx: f.consumable, txMins: f.txMins};
    }
  },
];

// ─── HELPERS ─────────────────────────────────────────────────
const f$ = (v,dec=2) => {
  if(v===undefined||v===null||isNaN(v)||!isFinite(v)) return "—";
  const a=Math.abs(v), s=v<0?"−":"";
  return s+"$"+a.toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec});
};
const fN = (v,dec=1) => (isNaN(v)||!isFinite(v))?"—":v.toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec});

const glowFor = (color) => `0 0 24px ${color}33, 0 4px 20px rgba(0,0,0,0.5)`;

// ─── GLOBAL CSS ──────────────────────────────────────────────
const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.white};min-height:100vh}
input[type=number],input[type=text],select{
  background:${C.surf};border:1.5px solid ${C.border};color:${C.white};
  border-radius:8px;padding:9px 12px;font-family:'DM Mono',monospace;font-size:13px;
  width:100%;outline:none;transition:border-color .15s,box-shadow .15s;
}
input:focus,select:focus{border-color:${C.teal};box-shadow:0 0 0 3px ${C.teal}22}
select option{background:${C.surf}}
input[type=range]{-webkit-appearance:none;width:100%;height:5px;border-radius:3px;background:${C.border};outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${C.teal};cursor:pointer;box-shadow:0 0 8px ${C.teal}66}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes glow{0%,100%{opacity:1}50%{opacity:.75}}
.fu{animation:fadeUp .35s ease both}
.fu1{animation:fadeUp .35s .05s ease both}
.fu2{animation:fadeUp .35s .1s ease both}
.fu3{animation:fadeUp .35s .15s ease both}
.fu4{animation:fadeUp .35s .2s ease both}
`;

// ─── MINI COMPONENTS ─────────────────────────────────────────
const NumIn = ({value,onChange,step=1,min=0,placeholder=""})=>(
  <input type="number" value={value} min={min} step={step} placeholder={placeholder}
    onChange={e=>onChange(parseFloat(e.target.value)||0)}/>
);

const Label = ({children,hint,derived,color})=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
    <span style={{fontSize:11,fontWeight:600,color:derived?(color||C.teal):C.muted,letterSpacing:"0.04em"}}>
      {derived&&<span style={{marginRight:3,fontSize:9}}>▶</span>}{children}
    </span>
    {hint&&<span style={{fontSize:10,color:C.muted,fontStyle:"italic"}}>{hint}</span>}
  </div>
);

const Derived = ({value,color})=>(
  <div style={{background:`${color||C.teal}15`,border:`1px solid ${color||C.teal}44`,borderRadius:7,
    padding:"8px 12px",fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:500,color:color||C.teal}}>
    {value}
  </div>
);

const PillTag = ({text,color})=>(
  <span style={{background:`${color}20`,border:`1px solid ${color}55`,color,
    borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:700,letterSpacing:"0.05em"}}>
    {text}
  </span>
);

const StatLine = ({label,value,color,bold,border:brd})=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
    padding:bold?"10px 0":"7px 0",borderBottom:brd?`1px solid ${C.border}`:"none"}}>
    <span style={{fontSize:bold?13:12,color:bold?C.white:C.muted,fontWeight:bold?600:400}}>{label}</span>
    <span style={{fontFamily:"'DM Mono',monospace",fontWeight:bold?700:500,fontSize:bold?14:12,color:color||C.white}}>{value}</span>
  </div>
);

// ─── PROCEDURE CARD ──────────────────────────────────────────
function ProcCard({proc, collRate, routeHrs, clinicianRate, count, onCountChange, fields, onFieldChange}){
  const r = proc.calc(fields, collRate);
  const marginColor = r.margin > 200 ? C.green : r.margin > 50 ? C.gold : r.margin < 0 ? C.red : C.white;
  const totalRevToday = r.net * count;
  const totalMarginToday = r.margin * count;
  const txHrs = (r.txMins / 60) * count;

  return (
    <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,
      overflow:"hidden",boxShadow:"0 2px 16px rgba(0,0,0,0.3)"}}>
      {/* Header bar */}
      <div style={{background:`linear-gradient(90deg,${proc.color}22 0%,transparent 100%)`,
        borderBottom:`1px solid ${C.border}`,padding:"14px 18px",
        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>{proc.emoji}</span>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:C.white}}>{proc.label}</div>
            <PillTag text={proc.cpt} color={proc.color}/>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:2}}>Margin / tx</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:marginColor,lineHeight:1}}>
            {f$(r.margin)}
          </div>
        </div>
      </div>

      <div style={{padding:"16px 18px"}}>
        {/* Count picker */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,
          background:C.surf,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.border}`}}>
          <span style={{fontSize:11,fontWeight:600,color:C.muted,flex:1}}>Patients on this route</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>onCountChange(Math.max(0,count-1))} style={{
              width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,
              background:C.card,color:C.white,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
            <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:18,color:proc.color,minWidth:24,textAlign:"center"}}>{count}</span>
            <button onClick={()=>onCountChange(count+1)} style={{
              width:28,height:28,borderRadius:6,border:`1px solid ${proc.color}55`,
              background:`${proc.color}15`,color:proc.color,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          </div>
        </div>

        {/* Input fields */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          {proc.fields.map(fld=>(
            <div key={fld.key}>
              <Label hint={fld.hint}>{fld.label}</Label>
              <NumIn value={fields[fld.key]??fld.default} onChange={v=>onFieldChange(fld.key,v)} step={fld.step||1}/>
            </div>
          ))}
        </div>

        {/* P&L */}
        <div style={{background:C.surf,borderRadius:8,border:`1px solid ${C.border}`,padding:"10px 14px"}}>
          <StatLine label="Net reimbursement / tx" value={f$(r.net)} color={proc.color} border/>
          {r.perCm && <StatLine label={`Wound area (${fN(r.cm,0)} cm²)`} value={f$(r.gross)} color={C.muted} border/>}
          <StatLine label="Cost / tx" value={`(${f$(r.costPerTx)})`} color={C.muted} border/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8}}>
            <span style={{fontSize:12,fontWeight:700,color:C.white}}>Net margin / tx</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:15,color:marginColor}}>{f$(r.margin)}</span>
          </div>
        </div>

        {/* Today totals — only if count > 0 */}
        {count > 0 && (
          <div style={{marginTop:10,padding:"10px 14px",
            background:`${proc.color}10`,borderRadius:8,border:`1px solid ${proc.color}33`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
              {[
                {l:"Revenue today",v:f$(totalRevToday),c:proc.color},
                {l:"Margin today",v:f$(totalMarginToday),c:marginColor},
                {l:"Tx time",v:fN(txHrs)+"h",c:C.muted},
              ].map(s=>(
                <div key={s.l}>
                  <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{s.l}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:13,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROUTE SUMMARY ───────────────────────────────────────────
function RouteSummary({procedures, counts, fieldMap, routeState, setRouteState}){
  const {collRate, routeHrs, clinicianRate, vehicleMode, vehiclePerHr, vehiclePerMile, miles} = routeState;

  const totals = useMemo(()=>{
    let totalRev=0, totalMargin=0, totalCost=0, totalTxMins=0, totalPx=0;
    procedures.forEach(proc=>{
      const cnt = counts[proc.id]||0;
      if(cnt===0) return;
      const f = fieldMap[proc.id]||{};
      const merged = {};
      proc.fields.forEach(fld=>{ merged[fld.key]=f[fld.key]??fld.default; });
      const r = proc.calc(merged, collRate);
      totalRev += r.net * cnt;
      totalMargin += r.margin * cnt;
      totalCost += r.costPerTx * cnt;
      totalTxMins += (r.txMins||0) * cnt;
      totalPx += cnt;
    });
    const clinicianCost = clinicianRate * routeHrs;
    const vehicleCost = vehicleMode==="hour" ? vehiclePerHr*routeHrs : vehiclePerMile*miles;
    const totalProfit = totalMargin - clinicianCost - vehicleCost;
    const profitPerHr = routeHrs>0 ? totalProfit/routeHrs : 0;
    const profitPerPx = totalPx>0 ? totalProfit/totalPx : 0;
    const revenuePerHr = routeHrs>0 ? totalRev/routeHrs : 0;
    return {totalRev,totalMargin,totalCost,totalTxMins,totalPx,clinicianCost,vehicleCost,totalProfit,profitPerHr,profitPerPx,revenuePerHr};
  },[procedures,counts,fieldMap,routeState]);

  const profitColor = totals.profitPerHr>=300?C.green:totals.profitPerHr>=150?C.gold:totals.profitPerHr<0?C.red:C.white;

  const rs = (k,v) => setRouteState(p=>({...p,[k]:v}));

  return (
    <div style={{position:"sticky",top:0,zIndex:40}}>
      {/* Sticky top bar */}
      <div style={{background:`${C.surf}ee`,backdropFilter:"blur(12px)",
        borderBottom:`1px solid ${C.border}`,padding:"14px 20px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:9,background:`${C.teal}20`,border:`1px solid ${C.teal}44`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🩺</div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:C.white,letterSpacing:"-0.01em"}}>WoundWorx Procedure ROI</div>
                <div style={{fontSize:10,color:C.muted}}>Joanna King, DNP, FNP-BC, CWCN-AP, CLWT · NPI 1700394990</div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:16,alignItems:"flex-end"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:1}}>Patients</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:17,color:C.teal}}>{totals.totalPx}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:1}}>Total Revenue</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:17,color:C.white}}>{f$(totals.totalRev)}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:1}}>Profit/Hr</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:profitColor,lineHeight:1}}>{f$(totals.profitPerHr)}<span style={{fontSize:11,fontWeight:400,color:C.muted}}>/hr</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Route config strip */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"12px 20px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-end"}}>
          {[
            {label:"Route hrs",key:"routeHrs",step:0.5,min:0.5},
            {label:"Clinician $/hr",key:"clinicianRate",step:5},
          ].map(({label,key,step,min=0})=>(
            <div key={key} style={{minWidth:120,flex:"1 1 100px"}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600}}>{label}</div>
              <NumIn value={routeState[key]} onChange={v=>rs(key,v)} step={step} min={min}/>
            </div>
          ))}
          <div style={{minWidth:110,flex:"1 1 100px"}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600}}>Vehicle</div>
            <select value={routeState.vehicleMode} onChange={e=>rs("vehicleMode",e.target.value)}>
              <option value="hour">$/hr</option>
              <option value="mile">$/mi</option>
            </select>
          </div>
          {routeState.vehicleMode==="hour"
            ? <div style={{minWidth:100,flex:"1 1 80px"}}><div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600}}>$/hr</div><NumIn value={routeState.vehiclePerHr} onChange={v=>rs("vehiclePerHr",v)} step={0.5}/></div>
            : <>
                <div style={{minWidth:100,flex:"1 1 80px"}}><div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600}}>$/mile</div><NumIn value={routeState.vehiclePerMile} onChange={v=>rs("vehiclePerMile",v)} step={0.01}/></div>
                <div style={{minWidth:100,flex:"1 1 80px"}}><div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600}}>Miles</div><NumIn value={routeState.miles} onChange={v=>rs("miles",v)} step={1}/></div>
              </>
          }
          <div style={{minWidth:160,flex:"1 1 140px"}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600}}>Collection rate</div>
            <div style={{display:"flex",gap:6}}>
              {[{l:"80% (no sec)",v:80},{l:"92% (w/sec)",v:92},{l:"Custom",v:"custom"}].map(opt=>(
                <button key={opt.v} onClick={()=>{
                  if(opt.v==="custom") return;
                  rs("collRate",opt.v);
                }} style={{
                  flex:1,padding:"8px 4px",borderRadius:6,border:`1.5px solid`,fontSize:10,fontWeight:700,cursor:"pointer",
                  borderColor:routeState.collRate===opt.v?C.teal:C.border,
                  background:routeState.collRate===opt.v?`${C.teal}18`:C.surf,
                  color:routeState.collRate===opt.v?C.teal:C.muted,
                }}>{opt.l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RESULTS PANEL ───────────────────────────────────────────
function ResultsPanel({procedures, counts, fieldMap, routeState}){
  const {collRate, routeHrs, clinicianRate, vehicleMode, vehiclePerHr, vehiclePerMile, miles} = routeState;

  const rows = procedures.map(proc=>{
    const cnt = counts[proc.id]||0;
    const f = fieldMap[proc.id]||{};
    const merged = {};
    proc.fields.forEach(fld=>{ merged[fld.key]=f[fld.key]??fld.default; });
    const r = proc.calc(merged, collRate);
    return {...r, proc, cnt, totalRev: r.net*cnt, totalMargin: r.margin*cnt};
  }).filter(r=>r.cnt>0);

  const totalRev = rows.reduce((a,r)=>a+r.totalRev,0);
  const totalMargin = rows.reduce((a,r)=>a+r.totalMargin,0);
  const totalPx = rows.reduce((a,r)=>a+r.cnt,0);
  const clinicianCost = clinicianRate * routeHrs;
  const vehicleCost = vehicleMode==="hour" ? vehiclePerHr*routeHrs : vehiclePerMile*miles;
  const totalProfit = totalMargin - clinicianCost - vehicleCost;
  const profitPerHr = routeHrs>0 ? totalProfit/routeHrs : 0;
  const profitColor = profitPerHr>=300?C.green:profitPerHr>=150?C.gold:profitPerHr<0?C.red:C.white;

  if(totalPx===0) return (
    <div style={{background:C.card,borderRadius:14,border:`1px dashed ${C.border}`,padding:"40px 20px",textAlign:"center",color:C.muted}}>
      <div style={{fontSize:32,marginBottom:12}}>👆</div>
      <div style={{fontWeight:600,marginBottom:4}}>Add patients to any procedure card above</div>
      <div style={{fontSize:12}}>Results will appear here</div>
    </div>
  );

  return (
    <div style={{background:`linear-gradient(135deg,#0c1d35 0%,#091525 100%)`,
      borderRadius:16,border:`1px solid ${C.teal}44`,padding:"24px 28px",
      boxShadow:glowFor(C.teal)}}>
      {/* Big number */}
      <div style={{textAlign:"center",paddingBottom:20,borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Route Profit per Hour</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:56,lineHeight:1,color:profitColor,
          textShadow:profitColor===C.green?`0 0 40px ${C.green}55`:"none",letterSpacing:"-0.03em"}}>
          {profitPerHr<0?"−":""}{f$(Math.abs(profitPerHr))}<span style={{fontSize:20,fontWeight:400,color:C.muted}}>/hr</span>
        </div>
        <div style={{fontSize:12,color:C.muted,marginTop:6}}>{totalPx} patients · {fN(routeHrs)} hrs route time</div>
      </div>

      {/* Procedure breakdown */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Procedure Breakdown</div>
        {rows.map(row=>(
          <div key={row.proc.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:14}}>{row.proc.emoji}</span>
            <span style={{fontSize:12,color:C.white,flex:1,fontWeight:500}}>{row.proc.label}</span>
            <PillTag text={`×${row.cnt}`} color={row.proc.color}/>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.muted,minWidth:70,textAlign:"right"}}>{f$(row.totalRev)}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color:row.totalMargin>=0?C.green:C.red,minWidth:80,textAlign:"right"}}>{f$(row.totalMargin)}</span>
          </div>
        ))}
      </div>

      {/* Cost stack */}
      <div style={{background:`${C.bg}88`,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
        <StatLine label="Total gross margin (all procedures)" value={f$(totalMargin)} color={C.teal} bold border/>
        <StatLine label="Clinician labor" value={`(${f$(clinicianCost)})`} color={C.muted} border/>
        <StatLine label="Vehicle cost" value={`(${f$(vehicleCost)})`} color={C.muted} border/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15}}>Total Route Profit</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:20,color:profitColor}}>{f$(totalProfit)}</span>
        </div>
      </div>

      {/* Secondary stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[
          {l:"Revenue/hr",v:f$(routeHrs>0?totalRev/routeHrs:0),c:C.blue},
          {l:"Margin/patient",v:f$(totalPx>0?totalMargin/totalPx:0),c:C.gold},
          {l:"Total revenue",v:f$(totalRev),c:C.teal},
        ].map(s=>(
          <div key={s.l} style={{background:`${C.surf}`,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`,textAlign:"center"}}>
            <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{s.l}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:14,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MONTHLY GOAL PLANNER ────────────────────────────────────
function GoalPlanner({procedures, counts, fieldMap, routeState}){
  const [monthlyGoal, setMonthlyGoal] = useState(150000);
  const [routeDays, setRouteDays] = useState(20);

  const {collRate, routeHrs, clinicianRate, vehicleMode, vehiclePerHr, vehiclePerMile, miles} = routeState;

  const perRouteProfit = useMemo(()=>{
    let totalMargin=0;
    procedures.forEach(proc=>{
      const cnt=counts[proc.id]||0; if(!cnt) return;
      const f=fieldMap[proc.id]||{};
      const merged={};
      proc.fields.forEach(fld=>{merged[fld.key]=f[fld.key]??fld.default;});
      const r=proc.calc(merged,collRate);
      totalMargin+=r.margin*cnt;
    });
    const clinicianCost=clinicianRate*routeHrs;
    const vehicleCost=vehicleMode==="hour"?vehiclePerHr*routeHrs:vehiclePerMile*miles;
    return totalMargin-clinicianCost-vehicleCost;
  },[procedures,counts,fieldMap,routeState]);

  const monthlyProfit = perRouteProfit * routeDays;
  const pct = monthlyGoal>0 ? Math.min(100,Math.round((monthlyProfit/monthlyGoal)*100)) : 0;
  const goalColor = pct>=100?C.green:pct>=80?C.gold:C.red;
  const routesNeeded = perRouteProfit>0 ? Math.ceil(monthlyGoal/perRouteProfit) : "∞";

  return (
    <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"20px 22px"}}>
      <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:16}}>📅 Monthly Goal Planner</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
        <div>
          <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:600}}>Monthly profit goal ($)</div>
          <NumIn value={monthlyGoal} onChange={setMonthlyGoal} step={5000}/>
        </div>
        <div>
          <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:600}}>Route days/month</div>
          <NumIn value={routeDays} onChange={setRouteDays} step={1} min={1}/>
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11}}>
          <span style={{color:C.muted}}>Projected monthly profit at current load</span>
          <span style={{color:goalColor,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{pct}%</span>
        </div>
        <div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:goalColor,borderRadius:4,transition:"width .4s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:11}}>
          <span style={{fontFamily:"'DM Mono',monospace",color:goalColor,fontWeight:700}}>{f$(monthlyProfit)}/mo</span>
          <span style={{color:C.muted}}>goal: {f$(monthlyGoal)}</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{background:C.surf,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Per route profit</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:15,color:C.gold}}>{f$(perRouteProfit)}</div>
        </div>
        <div style={{background:C.surf,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Routes needed for goal</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:15,color:pct>=100?C.green:C.red}}>{routesNeeded}</div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function App(){
  const [counts, setCounts] = useState(() => Object.fromEntries(PROCEDURES.map(p=>[p.id,0])));
  const [fieldMap, setFieldMap] = useState(() => Object.fromEntries(PROCEDURES.map(p=>[p.id,Object.fromEntries(p.fields.map(f=>[f.key,f.default]))])));
  const [routeState, setRouteState] = useState({
    collRate:80, routeHrs:4, clinicianRate:65,
    vehicleMode:"hour", vehiclePerHr:12, vehiclePerMile:0.67, miles:50,
  });
  const [activeTab, setActiveTab] = useState("procedures");

  const setCount = useCallback((id,v)=>setCounts(p=>({...p,[id]:Math.max(0,v)})),[]);
  const setField = useCallback((id,key,v)=>setFieldMap(p=>({...p,[id]:{...p[id],[key]:v}})),[]);

  const tabs = [
    {id:"procedures",label:"Procedures",emoji:"⚕️"},
    {id:"results",label:"Results Summary",emoji:"📊"},
    {id:"planner",label:"Goal Planner",emoji:"🎯"},
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:C.bg}}>
        <RouteSummary procedures={PROCEDURES} counts={counts} fieldMap={fieldMap} routeState={routeState} setRouteState={setRouteState}/>

        {/* Tab nav */}
        <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"0 20px"}}>
          <div style={{maxWidth:1200,margin:"0 auto",display:"flex",gap:4}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                padding:"12px 18px",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
                background:"transparent",borderBottom:`2px solid`,
                borderBottomColor:activeTab===t.id?C.teal:"transparent",
                color:activeTab===t.id?C.teal:C.muted,
                transition:"all .15s",display:"flex",alignItems:"center",gap:6,
              }}><span>{t.emoji}</span>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 20px 60px"}}>

          {/* ── PROCEDURES TAB ── */}
          {activeTab==="procedures" && (
            <div>
              <div style={{marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:12,color:C.muted}}>Use <span style={{color:C.teal,fontWeight:700}}>+/−</span> on each card to add patients to the route. All calculations update live.</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setCounts(Object.fromEntries(PROCEDURES.map(p=>[p.id,0])))} style={{
                    padding:"7px 14px",borderRadius:7,border:`1px solid ${C.border}`,
                    background:C.card,color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Reset all</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
                {PROCEDURES.map((proc,i)=>(
                  <div key={proc.id} className={`fu${Math.min(i,4)}`}>
                    <ProcCard
                      proc={proc}
                      collRate={routeState.collRate}
                      routeHrs={routeState.routeHrs}
                      clinicianRate={routeState.clinicianRate}
                      count={counts[proc.id]||0}
                      onCountChange={v=>setCount(proc.id,v)}
                      fields={fieldMap[proc.id]||{}}
                      onFieldChange={(key,v)=>setField(proc.id,key,v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RESULTS TAB ── */}
          {activeTab==="results" && (
            <div className="fu" style={{maxWidth:680,margin:"0 auto"}}>
              <ResultsPanel procedures={PROCEDURES} counts={counts} fieldMap={fieldMap} routeState={routeState}/>
            </div>
          )}

          {/* ── GOAL PLANNER TAB ── */}
          {activeTab==="planner" && (
            <div className="fu" style={{maxWidth:680,margin:"0 auto",display:"flex",flexDirection:"column",gap:16}}>
              <GoalPlanner procedures={PROCEDURES} counts={counts} fieldMap={fieldMap} routeState={routeState}/>
              <ResultsPanel procedures={PROCEDURES} counts={counts} fieldMap={fieldMap} routeState={routeState}/>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",padding:"20px",borderTop:`1px solid ${C.border}`,color:C.muted,fontSize:11}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:C.teal}}>WoundWorx LLC</span>
          {" · "}Joanna King, DNP, FNP-BC, CWCN-AP, CLWT{" · "}NPI 1700394990{" · "}MD · DC · VA
          <br/><span style={{fontSize:10,marginTop:4,display:"block"}}>For Tana Cederstrom & Abby Kupka · Internal Use Only · No PHI</span>
        </div>
      </div>
    </>
  );
}
