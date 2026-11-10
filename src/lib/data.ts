import customersJson from '../data/customers.json'
import transactionsJson from '../data/transactions.json'
import productsJson from '../data/products.json'
import categoriesJson from '../data/categories.json'
import regionsJson from '../data/regions.json'
import trafficJson from '../data/traffic.json'
import type { Category, Customer, Product, Region, Transaction, Period } from '../types'
import { inPeriod, previousPeriod, revenue } from './analytics'

export const customers=customersJson as Customer[]
export const transactions=transactionsJson as Transaction[]
export const products=productsJson as Product[]
export const categories=categoriesJson as Category[]
export const regions=regionsJson as Region[]
export const traffic=trafficJson as {date:string;sessions:number;convertedSessions:number}[]
export const transactionsForPeriod=(period:Period)=>transactions.filter(x=>inPeriod(x.date,period))
export function summarizePeriod(period:Period){
  const current=transactionsForPeriod(period),prior=transactionsForPeriod(previousPeriod(period))
  const currentRevenue=revenue(current),pastRevenue=revenue(prior)
  const trafficRows=traffic.filter(x=>inPeriod(x.date,period))
  const sessions=trafficRows.reduce((sum,x)=>sum+x.sessions,0),converted=trafficRows.reduce((sum,x)=>sum+x.convertedSessions,0)
  const currentCustomers=new Set(current.map(x=>x.customerId)),priorCustomers=new Set(prior.map(x=>x.customerId))
  return {cur:current,prev:prior,currentRevenue,pastRevenue,orders:current.length,customerCount:currentCustomers.size,conversion:sessions?converted/sessions*100:0,trafficRows,revenueChange:change(currentRevenue,pastRevenue),orderChange:change(current.length,prior.length),customerChange:change(currentCustomers.size,priorCustomers.size)}
}
export const change=(current:number,previous:number)=>previous===0?null:(current-previous)/previous*100
export function getRevenueBuckets(period:Period){
  const rows=transactionsForPeriod(period)
  const span=(new Date(`${period.end}T00:00:00Z`).getTime()-new Date(`${period.start}T00:00:00Z`).getTime())/86400000
  const granularity=span>120?'month':'day', map=new Map<string,{key:string;revenue:number;orders:number}>()
  for(const tx of rows){const key=granularity==='month'?tx.date.slice(0,7):tx.date;const bucket=map.get(key)||{key,revenue:0,orders:0};if(tx.status==='completed')bucket.revenue+=tx.amountCents/100;bucket.orders++;map.set(key,bucket)}
  return [...map.values()].sort((a,b)=>a.key.localeCompare(b.key))
}
export function getCategoryTotals(period:Period){const map=new Map<string,number>();transactionsForPeriod(period).filter(x=>x.status==='completed').forEach(x=>map.set(x.categoryId,(map.get(x.categoryId)||0)+x.amountCents));return categories.map(category=>({id:category.id,name:category.name,color:category.color,value:(map.get(category.id)||0)/100})).filter(x=>x.value>0)}
export function getRegionTotals(period:Period){const map=new Map<string,number>();transactionsForPeriod(period).filter(x=>x.status==='completed').forEach(x=>map.set(x.regionId,(map.get(x.regionId)||0)+x.amountCents));return regions.map(region=>({id:region.id,name:region.name,value:(map.get(region.id)||0)/100})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value)}
export function getCustomerGrowth(period:Period){const span=(new Date(`${period.end}T00:00:00Z`).getTime()-new Date(`${period.start}T00:00:00Z`).getTime())/86400000;const monthly=span>90,map=new Map<string,number>();customers.filter(c=>inPeriod(c.createdAt,period)).forEach(c=>{const key=monthly?c.createdAt.slice(0,7):c.createdAt;map.set(key,(map.get(key)||0)+1)});return [...map].sort(([a],[b])=>a.localeCompare(b)).map(([key,count])=>({key,count,monthly}))}
