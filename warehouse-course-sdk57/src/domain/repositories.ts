import {OperationInput,OperationKind,InventoryTransaction} from './operations';
import {CategoryRow,TypeRow,WarehouseRow,ProductRow,StockRow,OperationRow} from './models';
export interface InventoryRepository extends InventoryTransaction {
 transaction<T>(work:(tx:InventoryTransaction)=>Promise<T>):Promise<T>;
 listCategories():Promise<CategoryRow[]>;addCategory(name:string):Promise<number>;renameCategory(id:number,name:string):Promise<void>;
 listTypes():Promise<TypeRow[]>;addType(name:string):Promise<number>;renameType(id:number,name:string):Promise<void>;
 listWarehouses(includeArchived?:boolean):Promise<WarehouseRow[]>;saveWarehouse(value:{id?:number;name:string;description:string}):Promise<number>;archiveWarehouse(id:number):Promise<void>;
 listProducts():Promise<ProductRow[]>;getProductRow(id:number):Promise<ProductRow|null>;saveProduct(value:{id?:number;name:string;categoryId:number;equipmentTypeId:number|null;sku:string;serialNumber:string|null;unit:string;unitPriceCents:number;minimumQuantity:number;comment:string}):Promise<number>;archiveProduct(id:number):Promise<void>;
 listStock():Promise<StockRow[]>;listOperations(from?:string,to?:string,kind?:OperationKind):Promise<OperationRow[]>;
}
