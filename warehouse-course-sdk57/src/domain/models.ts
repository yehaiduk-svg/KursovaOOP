export interface CategoryRow{id:number;name:string}
export interface TypeRow{id:number;name:string}
export interface WarehouseRow{id:number;name:string;description:string;archived:number}
export interface ProductRow{id:number;name:string;categoryId:number;categoryName:string;equipmentTypeId:number|null;equipmentTypeName:string|null;sku:string;serialNumber:string|null;unit:string;unitPriceCents:number;minimumQuantity:number;comment:string;archived:number}
export interface StockRow{productId:number;warehouseId:number;quantity:number;productName:string;sku:string;serialNumber:string|null;unit:string;priceCents:number;minimumQuantity:number;warehouseName:string;categoryName:string;equipmentTypeName:string|null;comment:string}
export interface OperationRow{id:number;kind:'receipt'|'issue'|'transfer';productId:number;productName:string;sku:string;serialNumber:string|null;quantity:number;date:string;sourceWarehouseId:number|null;sourceWarehouseName:string|null;destinationWarehouseId:number|null;destinationWarehouseName:string|null;responsiblePerson:string;comment:string}
export interface ReportRow extends StockRow{lineValueCents:number;lowStock:boolean}
