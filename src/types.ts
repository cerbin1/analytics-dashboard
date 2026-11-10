export type Customer = { id:string; name:string; email:string; company:string; regionId:string; createdAt:string; segment:'new'|'returning'|'vip' };
export type Product = { id:string; name:string; categoryId:string; unitPriceCents:number };
export type Transaction = { id:string; date:string; customerId:string; productId:string; categoryId:string; regionId:string; description:string; amountCents:number; paymentMethod:'card'|'bank_transfer'|'cash'|'wallet'; status:'completed'|'pending'|'refunded'|'failed' };
export type Category = { id:string; name:string; color:string };
export type Region = { id:string; name:string; countryCode:string };
export type Period = { start:string; end:string; preset:string };
