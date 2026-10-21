import { DomainError, normalizeDictionary, positive, required } from './errors';
export type Id=number;
export class Category {constructor(public readonly id:Id,public name:string){this.rename(name)} rename(v:string){this.name=required(v,'Категорія',80)}}
export class EquipmentType {constructor(public readonly id:Id,public name:string){this.rename(name)} rename(v:string){this.name=required(v,'Тип обладнання',80)}}
export class Warehouse {constructor(public readonly id:Id,public name:string,public description:string='',public archived=false){this.rename(name);this.description=description.trim()}rename(v:string){this.name=required(v,'Назва складу',120)}archive(total:number){if(total!==0)throw new DomainError('Склад можна архівувати лише з нульовими залишками.');this.archived=true}}
export interface ProductInput {name:string;categoryId:number;equipmentTypeId:number|null;sku:string;serialNumber:string|null;unit:string;unitPriceCents:number;minimumQuantity:number;comment:string}
export class Product {
 constructor(public readonly id:number,private value:ProductInput,public archived=false){this.update(value)}
 get details():Readonly<ProductInput>{return {...this.value}}
 update(input:ProductInput){this.value={name:required(input.name,'Назва товару',160),categoryId:positive(input.categoryId,'Категорія'),equipmentTypeId:input.equipmentTypeId?positive(input.equipmentTypeId,'Тип обладнання'):null,sku:required(input.sku,'Артикул',80),serialNumber:input.serialNumber?.trim()||null,unit:required(input.unit,'Одиниця вимірювання',24),unitPriceCents:input.unitPriceCents,minimumQuantity:input.minimumQuantity,comment:input.comment.trim()};if(!Number.isSafeInteger(input.unitPriceCents)||input.unitPriceCents<0)throw new DomainError('Облікова ціна має бути невід’ємною кількістю копійок.');if(!Number.isSafeInteger(input.minimumQuantity)||input.minimumQuantity<0)throw new DomainError('Мінімальний залишок не може бути від’ємним.');if(this.value.serialNumber&&this.value.unit!== 'шт')throw new DomainError('Серійне обладнання обліковується в одиницях «шт».')}
 get serialized(){return Boolean(this.value.serialNumber)}
 archive(){this.archived=true}
}
export function assertUniqueDictionary(values:string[],candidate:string,label:string){const key=normalizeDictionary(candidate);if(values.some(v=>normalizeDictionary(v)===key))throw new DomainError(`${label} з такою назвою вже існує.`)}
