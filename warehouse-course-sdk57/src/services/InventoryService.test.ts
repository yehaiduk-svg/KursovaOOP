import test from 'node:test';
import assert from 'node:assert/strict';
import {InventoryRepository} from '../domain/repositories';
import {StockRow} from '../domain/models';
import {InventoryService} from './InventoryService';

const row=(quantity:number,minimumQuantity:number):StockRow=>({
 productId:1,warehouseId:1,quantity,productName:'Тестовий товар',sku:'TEST-1',serialNumber:null,
 unit:'шт',priceCents:10000,minimumQuantity,warehouseName:'Тестовий склад',categoryName:'Тест',
 equipmentTypeName:null,comment:''
});

function serviceWithStock(stock:StockRow[]){
 const repository={listStock:async()=>stock} as unknown as InventoryRepository;
 return new InventoryService(repository);
}

test('zero stock with zero minimum is not reported as low stock',async()=>{
 const [reportRow]=await serviceWithStock([row(0,0)]).report();
 assert.equal(reportRow.lowStock,false);
});

test('stock below a positive minimum is reported as low stock',async()=>{
 const [reportRow]=await serviceWithStock([row(0,2)]).report();
 assert.equal(reportRow.lowStock,true);
});
