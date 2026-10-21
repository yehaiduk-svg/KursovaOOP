import test from 'node:test';import assert from 'node:assert/strict';
import {ReceiptOperation,IssueOperation,TransferOperation,InventoryTransaction,OperationInput} from './operations';
import {DomainError} from './errors';
class MemoryTx implements InventoryTransaction{
 products=new Map<number,{id:number;serialNumber:string|null}>();balances=new Map<string,number>();journal:any[]=[];
 key(p:number,w:number){return `${p}:${w}`}
 async getProduct(id:number){return this.products.get(id)||null}async getStock(p:number,w:number){return this.balances.get(this.key(p,w))||0}async getTotalStock(p:number){return [...this.balances].filter(([k])=>k.startsWith(`${p}:`)).reduce((a,[,v])=>a+v,0)}
 async changeStock(p:number,w:number,d:number){const n=await this.getStock(p,w)+d;if(n<0)throw new DomainError('negative balance');this.balances.set(this.key(p,w),n)}async insertOperation(x:any){this.journal.push(x)}
}
const input=(overrides:Partial<OperationInput>={}):OperationInput=>({productId:1,quantity:3,date:'2026-10-13',sourceWarehouseId:1,destinationWarehouseId:null,responsiblePerson:'Тест',comment:'',...overrides});
function setup(serialNumber:string|null=null){const tx=new MemoryTx();tx.products.set(1,{id:1,serialNumber});return tx}
test('receipt increases balance',async()=>{const tx=setup();await new ReceiptOperation(input({sourceWarehouseId:null,destinationWarehouseId:1})).execute(tx);assert.equal(await tx.getStock(1,1),3);assert.equal(tx.journal.length,1)});
test('issue decreases balance',async()=>{const tx=setup();await tx.changeStock(1,1,5);await new IssueOperation(input({quantity:2})).execute(tx);assert.equal(await tx.getStock(1,1),3)});
test('issue over available stock is rejected without partial journal/balance changes',async()=>{const tx=setup();await tx.changeStock(1,1,2);await assert.rejects(()=>new IssueOperation(input({quantity:3})).execute(tx),/Недостатній залишок/);assert.equal(await tx.getStock(1,1),2);assert.equal(tx.journal.length,0)});
test('transfer preserves total stock and changes warehouse balances',async()=>{const tx=setup();await tx.changeStock(1,1,4);const before=await tx.getTotalStock(1);await new TransferOperation(input({quantity:2,destinationWarehouseId:2})).execute(tx);assert.equal(await tx.getTotalStock(1),before);assert.equal(await tx.getStock(1,1),2);assert.equal(await tx.getStock(1,2),2)});
test('zero, negative and fractional quantity rejected',()=>{for(const quantity of [0,-1,1.5])assert.throws(()=>new ReceiptOperation(input({quantity})),DomainError)});
test('serialized unit cannot exist at two warehouses',async()=>{const tx=setup('SN-1');await tx.changeStock(1,1,1);await assert.rejects(()=>new ReceiptOperation(input({quantity:1,destinationWarehouseId:2})).execute(tx),/Серійна одиниця вже є/);await new TransferOperation(input({quantity:1,destinationWarehouseId:2})).execute(tx);assert.equal(await tx.getTotalStock(1),1);assert.equal(await tx.getStock(1,1),0);assert.equal(await tx.getStock(1,2),1)});

test('operation insert error is rolled back by transaction boundary',async()=>{
 const tx=setup();await tx.changeStock(1,1,1);const original=new Map(tx.balances);
 const repository={transaction:async(work:(t:InventoryTransaction)=>Promise<unknown>)=>{const before=new Map(tx.balances),journal=tx.journal.slice();try{return await work(tx)}catch(e){tx.balances=before;tx.journal=journal;throw e}}};
 const failInsert=Object.assign(Object.create(tx),{insertOperation:async()=>{throw new Error('disk full')}}) as InventoryTransaction;
 await assert.rejects(()=>repository.transaction(()=>new TransferOperation(input({quantity:1,destinationWarehouseId:2})).execute(failInsert)),/disk full/);
 assert.deepEqual(tx.balances,original);assert.equal(tx.journal.length,0);
});
