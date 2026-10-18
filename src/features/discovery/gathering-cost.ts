export type GatheringCostChoice = 'free' | 'own' | 'paid' | 'split' | 'potluck' | 'custom';
export const COST_CHOICES: Array<{id:GatheringCostChoice; label:string}> = [
  {id:'free',label:'Free'}, {id:'own',label:'Buy your own'}, {id:'paid',label:'Per person'},
  {id:'split',label:'Split costs'}, {id:'potluck',label:'Potluck'}, {id:'custom',label:'Other'},
];
export const POTLUCK_CHOICES = ['Bring a dish', 'Bring snacks', 'Bring drinks', 'Bring dessert'];
export function changeAmount(cents:number, direction:number) {
  return Math.max(0,Math.min(100000,Math.round(cents)+Math.sign(direction)*100));
}
export function parseEuroAmount(value:string):number|null {
  const normalized=value.trim().replace(',', '.');
  if (!/^\d{1,4}(\.\d{0,2})?$/.test(normalized)) return null;
  const cents=Math.round(Number(normalized)*100);
  return cents <= 100000 ? cents : null;
}
export function costNotesFor(choice:GatheringCostChoice,cents:number,potluck:string,details:string) {
  const euro=`€${(cents/100).toFixed(cents%100 ? 2 : 0)}`;
  const base = choice==='free' ? 'Free' : choice==='own' ? 'Buy your own food or drink' :
    choice==='paid' ? `${euro} per person` : choice==='split' ? `Split costs — about ${euro} per person` :
    choice==='potluck' ? `Potluck — ${potluck || 'bring something to share'}` : '';
  return [base,details.trim()].filter(Boolean).join('. ');
}
