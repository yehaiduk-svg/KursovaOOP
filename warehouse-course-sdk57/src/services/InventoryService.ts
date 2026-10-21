import {InventoryRepository} from '../domain/repositories';
import {ReceiptOperation,IssueOperation,TransferOperation,OperationInput,OperationKind} from '../domain/operations';
import {Product,ProductInput,Warehouse,assertUniqueDictionary} from '../domain/entities';
import {DomainError,required} from '../domain/errors';
import {ReportRow} from '../domain/models';
export class InventoryService {
 constructor(private readonly repo:InventoryRepository){}
 get repository(){return this.repo}
 async execute(kind:OperationKind,input:OperationInput){const Operation=kind==='receipt'?ReceiptOperation:kind==='issue'?IssueOperation:TransferOperation;const operation=new Operation(input);await this.repo.transaction(tx=>operation.execute(tx))}
 async report():Promise<ReportRow[]>{const stock=await this.repo.listStock();return stock.map(row=>({...row,lineValueCents:row.quantity*row.priceCents,lowStock:row.minimumQuantity>0&&row.quantity<row.minimumQuantity}))}
 async saveProduct(id:number|undefined,input:ProductInput){const existing=id?await this.repo.getProductRow(id):null;const p=new Product(id??0,input,existing?.archived===1);if(id&&existing===null)throw new DomainError('Товар не знайдено.');return this.repo.saveProduct({...p.details,id})}
 async archiveProduct(id:number){const history=await this.repo.listOperations();if(history.some(x=>x.productId===id))return this.repo.archiveProduct(id);const report=await this.report();if(report.some(x=>x.productId===id&&x.quantity>0))throw new DomainError('Товар із залишком не можна архівувати.');return this.repo.archiveProduct(id)}
 async saveWarehouse(input:{id?:number;name:string;description:string}){const row=input.id?(await this.repo.listWarehouses(true)).find(w=>w.id===input.id):null;const entity=new Warehouse(input.id??0,input.name,input.description,row?.archived===1);return this.repo.saveWarehouse({...input,name:entity.name,description:entity.description})}
 async addCategory(name:string){const values=await this.repo.listCategories();assertUniqueDictionary(values.map(x=>x.name),name,'Категорія');return this.repo.addCategory(name)}
 async addType(name:string){const values=await this.repo.listTypes();assertUniqueDictionary(values.map(x=>x.name),name,'Тип обладнання');return this.repo.addType(name)}
}
