import type { Period, Transaction } from '../types'
export const FIXTURE_END='2026-11-10'
const day=(s:string)=>new Date(`${s}T00:00:00Z`)
const iso=(d:Date)=>d.toISOString().slice(0,10)
export function getPeriod(preset:string, custom?:Period):Period {
  const end=day(FIXTURE_END); let start=new Date(end)
  if(preset==='7d') start.setUTCDate(end.getUTCDate()-6)
  else if(preset==='30d') start.setUTCDate(end.getUTCDate()-29)
  else if(preset==='90d') start.setUTCDate(end.getUTCDate()-89)
  else if(preset==='12m') start.setUTCMonth(end.getUTCMonth()-11,1)
  else if(custom) return custom
  return {start:iso(start),end:FIXTURE_END,preset}
}
export function previousPeriod(p:Period):Period {
  const span=Math.round((day(p.end).getTime()-day(p.start).getTime())/86400000)+1
  const end=new Date(day(p.start)); end.setUTCDate(end.getUTCDate()-1)
  const start=new Date(end); start.setUTCDate(start.getUTCDate()-span+1)
  return {start:iso(start),end:iso(end),preset:'previous'}
}
export const inPeriod=(date:string,p:Period)=>date>=p.start&&date<=p.end
export const revenue=(rows:Transaction[])=>rows.filter(x=>x.status==='completed').reduce((a,x)=>a+x.amountCents,0)
export const pct=(now:number,before:number)=>before===0?null:(now-before)/before*100
