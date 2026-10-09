window.COMPANION_DATA={
  version:"v2-furnace-source-audit-2026-10-09",
  furnace:[],
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

// Table complète auditée le 09/10/2026 (WhiteoutData + H5Joy). Les ressources sont en millions et le temps en jours.
const furnaceLevel=(id,food,wood,coal,iron,time,fc=0,rfc=0)=>({id,fc,rfc,food,wood,coal,iron,time});
const normalFurnace=[
  furnaceLevel('Niv. 1',0,0,0,0,0),furnaceLevel('Niv. 2',0,.00018,0,0,6/86400),furnaceLevel('Niv. 3',0,.000805,0,0,1/1440),furnaceLevel('Niv. 4',0,.0018,.00036,0,3/1440),furnaceLevel('Niv. 5',0,.0076,.0015,0,10/1440),
  furnaceLevel('Niv. 6',0,.019,.0038,.00096,.5/24),furnaceLevel('Niv. 7',0,.069,.013,.0034,1/24),furnaceLevel('Niv. 8',0,.12,.025,.0063,2.5/24),furnaceLevel('Niv. 9',0,.26,.052,.013,4.5/24),furnaceLevel('Niv. 10',0,.46,.092,.023,6/24),
  furnaceLevel('Niv. 11',1.3,1.3,.26,.065,7.5/24),furnaceLevel('Niv. 12',1.6,1.6,.33,.084,9/24),furnaceLevel('Niv. 13',2.3,2.3,.47,.11,11/24),furnaceLevel('Niv. 14',3.1,3.1,.63,.15,14/24),furnaceLevel('Niv. 15',4.6,4.6,.93,.23,18/24),
  furnaceLevel('Niv. 16',5.9,5.9,1.1,.29,1+6/24+28/1440),furnaceLevel('Niv. 17',9.3,9.3,1.8,.48,1+12/24+34/1440),furnaceLevel('Niv. 18',12,12,2.5,.62,1+19/24+53/1440),furnaceLevel('Niv. 19',15,15,3.1,.78,2+17/24+50/1440),furnaceLevel('Niv. 20',21,21,4.3,1,3+10/24+18/1440),
  furnaceLevel('Niv. 21',27,27,5.4,1.3,4+10/24+59/1440),furnaceLevel('Niv. 22',36,36,7.2,1.8,6+16/24+29/1440),furnaceLevel('Niv. 23',44,44,8.9,2.2,9+8/24+40/1440),furnaceLevel('Niv. 24',60,60,12,3,13+2/24+33/1440),furnaceLevel('Niv. 25',81,81,16,4,18+8/24+22/1440),
  furnaceLevel('Niv. 26',100,100,21,5.2,21+2/24+26/1440),furnaceLevel('Niv. 27',140,140,24,7.4,25+7/24+43/1440),furnaceLevel('Niv. 28',190,190,39,9.9,29+2/24+52/1440),furnaceLevel('Niv. 29',240,240,49,12,33+11/24+42/1440),furnaceLevel('Niv. 30',300,300,60,15,40+4/24+27/1440)
];
const repeatFurnaceLevels=(ids,values)=>ids.map(id=>furnaceLevel(id,...values));
const fireCrystalFurnace=[
  ...repeatFurnaceLevels(['30-1','30-2','30-3','30-4','FC1'],[67,67,13,3.3,7,132,0]),
  ...repeatFurnaceLevels(['FC1-1','FC1-2','FC1-3','FC1-4','FC2'],[72,72,14,3.6,9,158,0]),
  ...repeatFurnaceLevels(['FC2-1','FC2-2','FC2-3','FC2-4','FC3'],[79,79,15,3.9,11,238,0]),
  ...repeatFurnaceLevels(['FC3-1','FC3-2','FC3-3','FC3-4','FC4'],[82,82,16,4.1,12,280,0]),
  ...repeatFurnaceLevels(['FC4-1','FC4-2','FC4-3','FC4-4','FC5'],[84,84,16,4.2,14,335,0]),
  ...repeatFurnaceLevels(['FC5-1','FC5-2','FC5-3','FC5-4'],[96,96,19,4.8,15,200,10]),furnaceLevel('FC6',96,96,19,4.8,15,100,20),
  ...repeatFurnaceLevels(['FC6-1','FC6-2','FC6-3','FC6-4'],[100,100,21,5.4,18,240,15]),furnaceLevel('FC7',100,100,21,5.4,18,120,30),
  ...repeatFurnaceLevels(['FC7-1','FC7-2','FC7-3','FC7-4'],[130,130,26,6.6,20,240,20]),furnaceLevel('FC8',130,130,26,6.6,20,120,40),
  ...repeatFurnaceLevels(['FC8-1','FC8-2','FC8-3','FC8-4'],[140,140,29,7.2,13,280,30]),furnaceLevel('FC9',140,140,29,7.2,13,140,60),
  ...repeatFurnaceLevels(['FC9-1','FC9-2','FC9-3','FC9-4'],[160,160,33,8.4,20,350,70]),furnaceLevel('FC10',160,160,33,8.4,20,175,140)
];
window.COMPANION_DATA.furnace=[...normalFurnace,...fireCrystalFurnace];

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
