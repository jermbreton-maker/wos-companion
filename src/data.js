window.COMPANION_DATA={
  version:"v1-review-2026-08-27",
  furnace:[
    {id:"FC5",fc:0,rfc:0,food:0,wood:0,coal:0,iron:0,time:0},{id:"FC5-1",fc:90,rfc:0,food:120,wood:120,coal:24,iron:6,time:10},{id:"FC5-2",fc:90,rfc:0,food:125,wood:125,coal:25,iron:6,time:11},{id:"FC5-3",fc:110,rfc:0,food:130,wood:130,coal:26,iron:7,time:12},{id:"FC5-4",fc:110,rfc:0,food:135,wood:135,coal:27,iron:7,time:13},
    {id:"FC6",fc:140,rfc:0,food:150,wood:150,coal:30,iron:8,time:15},{id:"FC6-1",fc:160,rfc:0,food:160,wood:160,coal:32,iron:8,time:16},{id:"FC6-2",fc:160,rfc:0,food:170,wood:170,coal:34,iron:9,time:17},{id:"FC6-3",fc:180,rfc:0,food:180,wood:180,coal:36,iron:9,time:18},{id:"FC6-4",fc:180,rfc:0,food:190,wood:190,coal:38,iron:10,time:19},
    {id:"FC7",fc:220,rfc:10,food:210,wood:210,coal:42,iron:11,time:22},{id:"FC7-1",fc:240,rfc:12,food:225,wood:225,coal:45,iron:12,time:23},{id:"FC7-2",fc:240,rfc:12,food:240,wood:240,coal:48,iron:12,time:24},{id:"FC7-3",fc:260,rfc:15,food:255,wood:255,coal:51,iron:13,time:26},{id:"FC7-4",fc:260,rfc:15,food:270,wood:270,coal:54,iron:14,time:28},
    {id:"FC8",fc:300,rfc:20,food:300,wood:300,coal:60,iron:15,time:32},{id:"FC8-1",fc:330,rfc:22,food:320,wood:320,coal:64,iron:16,time:34},{id:"FC8-2",fc:330,rfc:22,food:340,wood:340,coal:68,iron:17,time:36},{id:"FC8-3",fc:360,rfc:25,food:360,wood:360,coal:72,iron:18,time:38},{id:"FC8-4",fc:360,rfc:25,food:380,wood:380,coal:76,iron:19,time:40},{id:"FC9",fc:420,rfc:30,food:420,wood:420,coal:84,iron:21,time:45}
  ],
  gearLevels:["Épique","Épique ★","Mythique","Mythique ★","Mythique ★★","Mythique ★★★","P1","P1 ★","P2","P2 ★","P3","P3 ★","P4","P4 ★","P5","P5 ★","P6"],
  gearStepCosts:[
    {alloy:120,polish:40,plans:0,amber:0},{alloy:180,polish:60,plans:0,amber:0},{alloy:260,polish:90,plans:20,amber:0},{alloy:360,polish:130,plans:30,amber:0},{alloy:480,polish:180,plans:45,amber:0},{alloy:620,polish:240,plans:60,amber:0},{alloy:800,polish:320,plans:85,amber:0},{alloy:1000,polish:420,plans:110,amber:0},{alloy:1300,polish:540,plans:145,amber:10},{alloy:1650,polish:690,plans:190,amber:15},{alloy:2100,polish:880,plans:250,amber:20},{alloy:2650,polish:1100,plans:320,amber:25},{alloy:3300,polish:1400,plans:410,amber:35},{alloy:4100,polish:1750,plans:520,amber:45},{alloy:5100,polish:2200,plans:660,amber:60},{alloy:6400,polish:2750,plans:840,amber:80}
  ],
  gears:[{id:"helmet",name:"Casque",troop:"Lancier",icon:"⛑️"},{id:"coat",name:"Veste",troop:"Infanterie",icon:"🥋"},{id:"ring",name:"Bague",troop:"Tireur",icon:"💍"},{id:"watch",name:"Montre",troop:"Lancier",icon:"⌚"},{id:"pants",name:"Pantalon",troop:"Infanterie",icon:"👖"},{id:"cane",name:"Canne",troop:"Tireur",icon:"🦯"}],
  tech:[
    {id:"steel",name:"Métallurgie",max:10,cost:70},{id:"formation",name:"Formation",max:10,cost:85},{id:"arms",name:"Armement",max:10,cost:90},
    {id:"health",name:"Endurance",max:10,cost:120,requires:["steel"]},{id:"lethality",name:"Létalité",max:10,cost:135,requires:["formation"]},{id:"defense",name:"Défense",max:10,cost:125,requires:["arms"]},
    {id:"fire",name:"Légion de feu",max:12,cost:190,requires:["health","lethality","defense"]},{id:"helios",name:"Hélios T11",max:1,cost:900,requires:["fire"]},{id:"glorified",name:"Glorifié T12",max:1,cost:1450,requires:["helios"]}
  ]
};

// Progression pré-FC V1, isolée pour faciliter l'audit et le remplacement des coûts.
const normalFurnace=Array.from({length:30},(_,index)=>{const level=index+1,scale=Math.pow(level,2.18);return{id:`Niv. ${level}`,fc:0,rfc:0,food:Math.round(scale*.72)/10,wood:Math.round(scale*.72)/10,coal:Math.round(scale*.145)/10,iron:Math.round(scale*.036)/10,time:Math.max(0,Math.round(level*level*.015))}});
const earlyFc=[{id:"FC1",fc:132,rfc:0,food:85,wood:85,coal:17,iron:4,time:8},{id:"FC2",fc:158,rfc:0,food:94,wood:94,coal:19,iron:5,time:9},{id:"FC3",fc:238,rfc:0,food:105,wood:105,coal:21,iron:5,time:10},{id:"FC4",fc:335,rfc:0,food:114,wood:114,coal:23,iron:6,time:11}];
const fc10={id:"FC10",fc:600,rfc:60,food:600,wood:600,coal:120,iron:30,time:60};
window.COMPANION_DATA.furnace=[...normalFurnace,...earlyFc,...window.COMPANION_DATA.furnace,fc10];

// Première base de calcul des bâtiments FC. Les valeurs détaillées seront
// auditées et remplacées par le tableau final lors de la passe de vérification.
// Les multiplicateurs sont isolés ici pour ne pas mélanger les coûts chaudière.
const PROVISIONAL_BUILDING_MULTIPLIERS={required:0.5,total:3.5};
window.COMPANION_DATA.furnaceBuildingCosts=window.COMPANION_DATA.furnace.map(level=>{
  const base={food:level.food||0,wood:level.wood||0,coal:level.coal||0,iron:level.iron||0,fc:level.fc||0,rfc:level.rfc||0,time:level.time||0};
  const scale=multiplier=>Object.fromEntries(Object.entries(base).map(([key,value])=>[key,value*multiplier]));
  return {required:scale(PROVISIONAL_BUILDING_MULTIPLIERS.required),total:scale(PROVISIONAL_BUILDING_MULTIPLIERS.total)};
});

// Progression détaillée de l'équipement du Chef.
// Chaque entrée représente un état réellement sélectionnable dans la jauge du jeu.
const chiefGearProgression=[];
const addChiefGearLevel=(label,cost)=>chiefGearProgression.push({label,cost});
[
  ["Épique",{alloy:120,polish:40,plans:0,amber:0}],
  ["Épique ★",{alloy:180,polish:60,plans:0,amber:0}],
  ["Épique ★★",{alloy:220,polish:75,plans:0,amber:0}],
  ["Épique ★★★",{alloy:260,polish:90,plans:0,amber:0}],
  ["Épique T1",{alloy:300,polish:105,plans:10,amber:0}],
  ["Épique T1 ★",{alloy:340,polish:120,plans:12,amber:0}],
  ["Épique T1 ★★",{alloy:380,polish:135,plans:14,amber:0}],
  ["Épique T1 ★★★",{alloy:420,polish:150,plans:16,amber:0}],
  ["Mythique",{alloy:480,polish:180,plans:20,amber:0}],
  ["Mythique ★",{alloy:540,polish:200,plans:25,amber:0}],
  ["Mythique ★★",{alloy:620,polish:240,plans:30,amber:0}],
  ["Mythique ★★★",{alloy:700,polish:275,plans:35,amber:0}],
  ["Mythique T1",{alloy:800,polish:320,plans:45,amber:0}],
  ["Mythique T1 ★",{alloy:900,polish:365,plans:55,amber:0}],
  ["Mythique T1 ★★",{alloy:1000,polish:420,plans:65,amber:0}],
  ["Mythique T1 ★★★",{alloy:1125,polish:475,plans:75,amber:0}],
  ["Mythique T2",{alloy:1300,polish:540,plans:85,amber:0}],
  ["Mythique T2 ★",{alloy:1450,polish:610,plans:95,amber:0}],
  ["Mythique T2 ★★",{alloy:1650,polish:690,plans:110,amber:0}],
  ["Mythique T2 ★★★",{alloy:1850,polish:780,plans:125,amber:0}]
].forEach(([label,cost])=>addChiefGearLevel(label,cost));

const pCosts=[
  [
    [[12500,132,21,2],[12500,132,21,2],[12500,132,21,2],[12500,134,22,4]],
    [[13000,140,22,2],[13000,140,22,2],[13000,140,22,2],[13000,140,24,4]],
    [[13500,147,23,2],[13500,147,23,2],[13500,147,23,2],[13500,149,26,4]],
    [[14000,155,25,2],[14000,155,25,2],[14000,155,25,2],[14000,155,25,4]]
  ],
  [
    [[14750,167,27,3],[14750,167,27,3],[14750,167,27,3],[14750,169,29,6]],
    [[15250,175,28,3],[15250,175,28,3],[15250,175,28,3],[15250,175,31,6]],
    [[15750,182,30,3],[15750,182,30,3],[15750,182,30,3],[15750,184,30,6]],
    [[16250,190,31,3],[16250,190,31,3],[16250,190,31,3],[16250,190,32,6]]
  ],
  [
    [[17000,202,33,5],[17000,202,33,5],[17000,202,33,5],[17000,204,36,5]],
    [[17500,210,35,5],[17500,210,35,5],[17500,210,35,5],[17500,210,35,5]],
    [[18000,217,36,5],[18000,217,36,5],[18000,217,36,5],[18000,219,37,5]],
    [[18500,225,37,5],[18500,225,37,5],[18500,225,37,5],[18500,225,39,5]]
  ],
  [
    [[19250,237,40,6],[19250,237,40,6],[19250,237,40,6],[19250,239,40,7]],
    [[20000,247,41,6],[20000,247,41,6],[20000,247,41,6],[20000,249,42,7]],
    [[20750,257,42,6],[20750,257,42,6],[20750,257,42,6],[20750,259,44,7]],
    [[21500,267,45,6],[21500,267,45,6],[21500,267,45,6],[21500,269,45,7]]
  ],
  [
    Array(5).fill([24000,300,50,8]),Array(5).fill([28000,330,55,8]),
    Array(5).fill([32000,360,60,8]),Array(5).fill([36000,390,65,8])
  ],
  [
    Array(5).fill([44000,450,75,12]),Array(5).fill([48000,480,80,14]),
    Array(5).fill([52000,510,85,14]),Array(5).fill([56000,540,90,16])
  ]
];
pCosts.forEach((rank,rankIndex)=>rank.forEach((star,starIndex)=>star.forEach((values,stepIndex)=>{
  const starLabel=starIndex?` ${"★".repeat(starIndex)}`:"";
  addChiefGearLevel(`P${rankIndex+1}${starLabel} · ${stepIndex+1}/${star.length}`,{
    alloy:values[0],polish:values[1],plans:values[2],amber:values[3]
  });
})));
window.COMPANION_DATA.gearLevels=chiefGearProgression.map(level=>level.label);
window.COMPANION_DATA.gearStepCosts=chiefGearProgression.slice(1).map(level=>level.cost);

// Progression détaillée des talismans. Les coûts publiés par niveau sont
// répartis sur les sous-paliers en conservant exactement le total du niveau.
const charmTotals={
  2:[40,15,0],3:[60,40,0],4:[80,100,0],5:[100,200,0],6:[120,300,0],
  7:[140,400,0],8:[200,400,0],9:[300,400,0],10:[420,420,0],11:[560,420,0],
  12:[580,450,15],13:[580,450,30],14:[600,500,45],15:[600,500,70],16:[650,550,100],
  17:[765,630,135],18:[1300,1130,180]
};
const charmSubsteps=level=>level<=3?1:level<=10?4:level<=16?5:9;
const splitCharmTotal=(total,parts,index)=>Math.floor(total/parts)+(index<total%parts?1:0);
const charmProgression=[{label:"Niv. 1",short:"1",major:1,step:1,steps:1,cost:{guides:0,designs:0,secrets:0}}];
for(let level=2;level<=18;level++){
  const parts=charmSubsteps(level),totals=charmTotals[level];
  for(let step=0;step<parts;step++)charmProgression.push({
    label:parts===1?`Niv. ${level}`:`Niv. ${level} · ${step+1}/${parts}`,
    short:`${level}`,
    major:level,
    step:step+1,
    steps:parts,
    cost:{guides:splitCharmTotal(totals[0],parts,step),designs:splitCharmTotal(totals[1],parts,step),secrets:splitCharmTotal(totals[2],parts,step)}
  });
}
window.COMPANION_DATA.charmLevels=charmProgression;
window.COMPANION_DATA.charmStepCosts=charmProgression.slice(1).map(level=>level.cost);
