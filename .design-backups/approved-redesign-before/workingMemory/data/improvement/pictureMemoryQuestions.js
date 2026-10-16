const SI = { Cat:"පූසා", Ball:"බෝලය", Sun:"ඉර", Shoe:"සපත්තුව", Apple:"ඇපල්", Car:"කාර් රථය", Book:"පොත", Bird:"කුරුල්ලා", Moon:"හඳ", Bear:"වලහා", Dog:"බල්ලා", Star:"තරුව", Orange:"දොඩම්", Bus:"බස් රථය", Flower:"මල", Spoon:"හැන්ද", Duck:"තාරාවා", Key:"යතුර", Grapes:"මිදි", Cloud:"වලාකුළ", Sock:"මේස්", Banana:"කෙසෙල්", Rabbit:"හාවා", Pencil:"පැන්සල", Bicycle:"බයිසිකලය", Fish:"මාළුවා", Hat:"තොප්පිය", Strawberry:"ස්ට්‍රෝබෙරි", Frog:"ගෙම්බා", Tree:"ගස", Cup:"කෝප්පය", Balloon:"බැලුනය", Glove:"අත්ආවරණය", Airplane:"ගුවන් යානය", Crown:"ඔටුන්න", Bag:"බෑගය", House:"ගෙදර", Turtle:"ඉබ්බා", Mushroom:"බිම්මල්", Butterfly:"සමනලයා", Pen:"පෑන", Tortoise:"කැස්බෑවා", Elephant:"අලියා", School:"පාසල", YoYo:"යෝ-යෝ", Bike:"බයිසිකලය" };

const PICTURE_ASSETS = {
  Cat: "/images/workingMemory/identify/cat.png",
  Ball: "/images/workingMemory/identify/ball.png",
  Sun: "/images/workingMemory/identify/sun.png",
  Book: "/images/workingMemory/identify/book.png",
  Bird: "/images/workingMemory/identify/bird.png",
  Dog: "/images/workingMemory/identify/dog.png",
  Flower: "/images/phonologicalAwareness/flower.png",
  Fish: "/images/workingMemory/identify/fish.png",
  Tree: "/images/workingMemory/identify/tree.png",
  Cup: "/images/workingMemory/identify/cup.png",
  House: "/images/workingMemory/identify/house.png",
  Shoe: 0,
  Apple: 1,
  Car: 2,
  Moon: 3,
  Bear: 4,
  Star: 5,
  Orange: 6,
  Bus: 7,
  Spoon: 8,
  Duck: 9,
  Key: 10,
  Grapes: 11,
  Cloud: 12,
  Sock: 13,
  Banana: 14,
  Rabbit: 15,
  Pencil: 16,
  Bicycle: 17,
  Bike: 17,
  Hat: 18,
  Strawberry: 19,
  Frog: 20,
  Balloon: 21,
  Glove: 22,
  Airplane: 23,
  Crown: 24,
  Bag: 25,
  Turtle: 26,
  Mushroom: 27,
  Butterfly: 28,
  Pen: 29,
  Tortoise: 30,
  Elephant: 31,
  School: 32,
  YoYo: 33,
};

const SPRITE_SHEET = "/images/workingMemory/improve/cards/picture-memory-sprites.png";
const GRADE_3_WORDS_PATH = "/images/workingMemory/improve/cards/grade3/words";

const BANK = {
  "2": {
    level1: [["Cat","Ball"],["Sun","Shoe"],["Apple","Car"],["Book","Bird"],["Moon","Bear"]],
    level2: [["Dog","Star","Orange"],["Bus","Flower","Spoon"],["Duck","Key","Grapes"],["Cloud","Sock","Banana"],["Rabbit","Pencil","Bicycle"]],
    level3: [["Fish","Hat","Strawberry","|","Frog"],["Tree","Cup","Balloon","|","Flower"],["Bear","Book","Grapes","|","Rabbit"],["Glove","Star","Bird","|","Shoe"],["Airplane","Apple","Spoon","|","Car"]],
    level4: [["Cat","Ball","Moon","Orange","|","Dog","Grapes"],["Bus","Tree","Hat","Spoon","|","Bike","Sock"],["Book","Bird","Cup","Strawberry","|","Pencil","Duck"],["Banana","Key","Flower","Rabbit","|","Grapes","Frog"],["Star","Car","Bear","Cloud","|","Moon","YoYo"]]
  },
  "3": {
    level1: [["Strawberry","Apple","Balloon"],["House","Tree","Grapes"],["Key","Car","Book"],["Turtle","Mushroom","Apple"],["Flower","Duck","Star"]],
    level2: [["Crown","Apple","Flower","Car"],["Book","Pencil","Bag","Frog"],["House","Sun","Bird","Grapes"],["Turtle","Key","Orange","Book"],["Duck","Flower","Car","Star"]],
    level3: [["Rabbit","Banana","Book","Star","|","Flower"],["House","Tree","Sun","Bird","|","Car"],["Car","Key","Apple","Flower","|","Bag"],["Pencil","Book","Bag","Star","|","Pen"],["Turtle","Spoon","Apple","Duck","|","Tortoise"]],
    level4: [["Rabbit","Banana","Bag","Flower","Star","|","Butterfly","Apple"],["House","Tree","Bird","Sun","Orange","|","Bag","Car"],["Car","Key","Pencil","Book","Duck","|","Pen","Bag"],["Rabbit","Banana","Bag","Flower","Star","|","Butterfly","Apple"],["Turtle","Spoon","Apple","Duck","Bird","|","Tortoise","Frog"]]
  },
  "4": {
    level1: [["Elephant","Book","Rabbit"],["School","Apple","Bird"],["Spoon","Banana","Flower"],["House","Car","Star"],["Turtle","Key","Duck"]],
    level2: [["Elephant","Banana","Bag","Flower"],["School","Book","Pencil","Rabbit"],["Spoon","Car","Fish","Key"],["House","Bird","Orange","Turtle"],["Rabbit","Flower","Bag","Duck"]],
    level3: [["Elephant","Apple","Book","Star","|","Pencil"],["School","Banana","Car","Flower","|","Rabbit"],["Spoon","Fish","House","Key","|","Bird"],["Pencil","Elephant","Bag","Star","|","Pen"],["Turtle","School","Apple","Flower","|","Tortoise"]],
    level4: [["Elephant","Banana","Spoon","Bird","Car","|","Frog","Duck"],["School","Book","Rabbit","Flower","Orange","|","Duck","Bag"],["Spoon","Car","Apple","Turtle","Fish","|","House","Bird"],["Pencil","Book","Bag","Rabbit","Star","|","Pen","Flower"],["Turtle","Elephant","Spoon","Duck","Bird","|","Tortoise","Frog"]]
  }
};

const createBank = (language) => Object.fromEntries(Object.entries(BANK).map(([grade, levels]) => [grade, Object.fromEntries(Object.entries(levels).map(([level, rows]) => [level, rows.map((row, index) => {
  const split = row.indexOf("|");
  const translate = (value) => language === "si" ? SI[value] || value : value;
  const toPictureItem = (value, itemIndex) => {
    const asset = PICTURE_ASSETS[value];
    const grade3Image = grade === "3"
      ? `${GRADE_3_WORDS_PATH}/g3_l${level.replace("level", "")}_words_q${index + 1}_${value.toLowerCase()}_i${itemIndex + 1}.png`
      : null;
    return {
      id: value,
      image: grade3Image || (typeof asset === "string" ? asset : SPRITE_SHEET),
      spriteIndex: grade3Image ? null : (typeof asset === "number" ? asset : null),
      alt: translate(value),
    };
  };
  const items = row.filter((value) => value !== "|").map(toPictureItem);
  const correctCount = split < 0 ? row.length : split;
  const correct = items.slice(0, correctCount);
  const distractors = items.slice(correctCount);
  return { id: `g${grade}_${level}_g2_${index + 1}`, type: "drag", instruction: language === "si" ? "කාඩ්පත්වල අනුපිළිවෙල මතක තබා ගන්න." : "Remember the order of the cards.", showItems: correct, dragPool: [...correct, ...distractors], correct };
})]))]));

export const PICTURE_MEMORY_QUESTIONS = { en: createBank("en"), si: createBank("si") };
