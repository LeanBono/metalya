'use client';
import {useMemo,useState} from 'react';

type Material={id:string;name:string;category:string;buyPrice:string|number;sellPrice:string|number};
type Row={materialId:string;kg:number};
const money=(n:number)=>n.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0});

export default function Calculator({materials}:{materials:Material[]}){
 const [rows,setRows]=useState<Row[]>([{materialId:materials[0]?.id||'',kg:100}]);
 const [operating,setOperating]=useState(0); const [target,setTarget]=useState(25); const [offer,setOffer]=useState(0); const [saved,setSaved]=useState('');
 const [title,setTitle]=useState('Nuevo lote'); const [location,setLocation]=useState('');
 const data=useMemo(()=>rows.map(r=>{const m=materials.find(x=>x.id===r.materialId);const buy=Number(m?.buyPrice||0),sell=Number(m?.sellPrice||0);return {...r,m,buyTotal:r.kg*buy,sellTotal:r.kg*sell};}),[rows,materials]);
 const sell=data.reduce((s,r)=>s+r.sellTotal,0); const buy=data.reduce((s,r)=>s+r.buyTotal,0); const max=Math.max(0,sell-operating-sell*(target/100));
 const selectedOffer=offer||max; const profit=sell-selectedOffer-operating; const margin=sell?profit/sell*100:0;
 function add(){setRows([...rows,{materialId:materials[0]?.id||'',kg:100}])}
 function update(i:number,k:keyof Row,v:string){setRows(rows.map((r,n)=>n===i?{...r,[k]:k==='kg'?Number(v):v}:r))}
 async function save(){setSaved('Guardando...');const res=await fetch('/api/admin/quotes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,location,items:rows,operatingCost:operating,offer:selectedOffer,targetMarginPct:target})});setSaved(res.ok?'Cotización guardada.':'No se pudo guardar.');}
 return <div className="calcGrid">
  <div className="calcMain">
   <div className="calcTop"><div><label>Nombre del lote<input value={title} onChange={e=>setTitle(e.target.value)} /></label></div><div><label>Ubicación<input value={location} onChange={e=>setLocation(e.target.value)} placeholder="San Justo, Buenos Aires" /></label></div></div>
   <div className="calcTableWrap"><table className="adminTable"><thead><tr><th>Material</th><th>Kg</th><th>Compra/kg</th><th>Venta/kg</th><th>Compra</th><th>Venta</th></tr></thead><tbody>{data.map((r,i)=><tr key={i}><td><select value={r.materialId} onChange={e=>update(i,'materialId',e.target.value)}>{materials.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></td><td><input className="kgInput" type="number" min="0" step="0.01" value={r.kg} onChange={e=>update(i,'kg',e.target.value)} /></td><td>{money(Number(r.m?.buyPrice||0))}</td><td>{money(Number(r.m?.sellPrice||0))}</td><td>{money(r.buyTotal)}</td><td>{money(r.sellTotal)}</td></tr>)}</tbody></table></div>
   <button className="btn ghost" onClick={add}>+ Agregar material</button>
   <div className="calcControls"><label>Costos operativos<input type="number" min="0" value={operating} onChange={e=>setOperating(Number(e.target.value))}/></label><label>Margen objetivo %<input type="number" min="0" max="90" value={target} onChange={e=>setTarget(Number(e.target.value))}/></label><label>Oferta al cliente<input type="number" min="0" value={offer} onChange={e=>setOffer(Number(e.target.value))} placeholder={String(Math.round(max))}/></label></div>
   <div className="calcActions"><button className="btn primary" onClick={save}>Guardar cotización</button>{saved&&<span>{saved}</span>}</div>
  </div>
  <aside className="calcSummary"><span>Resumen del lote</span><div><small>Valor estimado de venta</small><strong>{money(sell)}</strong></div><div><small>Costo de compra según lista</small><strong>{money(buy)}</strong></div><div><small>Oferta máxima recomendada</small><strong>{money(max)}</strong></div><div><small>Oferta usada</small><strong>{money(selectedOffer)}</strong></div><div><small>Ganancia estimada</small><strong>{money(profit)}</strong></div><div><small>Margen sobre venta</small><strong>{margin.toFixed(1)}%</strong></div><p>La oferta máxima mantiene el margen objetivo después de descontar los costos operativos.</p></aside>
 </div>
}
