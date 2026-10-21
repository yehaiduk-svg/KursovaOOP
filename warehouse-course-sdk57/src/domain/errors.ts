export class DomainError extends Error { constructor(message:string){super(message);this.name='DomainError'} }
export const required=(value:string,label:string,max=200)=>{const v=value.trim().replace(/\s+/g,' ');if(!v)throw new DomainError(`${label}: обов’язкове поле.`);if(v.length>max)throw new DomainError(`${label}: максимум ${max} символів.`);return v};
export const positive=(n:number,label='Кількість')=>{if(!Number.isSafeInteger(n)||n<=0)throw new DomainError(`${label} має бути додатним цілим числом.`);return n};
export const normalizeDictionary=(v:string)=>required(v,'Назва').toLocaleLowerCase('uk-UA');
