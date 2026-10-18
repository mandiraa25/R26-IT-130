const SI = { Cat:"පූසා", Ball:"බෝලය", Sun:"ඉර", Shoe:"සපත්තුව", Apple:"ඇපල්", Car:"කාර් රථය", Book:"පොත", Bird:"කුරුල්ලා", Moon:"හඳ", Bear:"වලහා", Dog:"බල්ලා", Star:"තරුව", Orange:"දොඩම්", Bus:"බස් රථය", Flower:"මල", Spoon:"හැන්ද", Duck:"තාරාවා", Key:"යතුර", Grapes:"මිදි", Cloud:"වලාකුළ", Sock:"මේස්", Banana:"කෙසෙල්", Rabbit:"හාවා", Pencil:"පැන්සල", Bicycle:"බයිසිකලය", Fish:"මාළුවා", Hat:"තොප්පිය", Strawberry:"ස්ට්‍රෝබෙරි", Frog:"ගෙම්බා", Tree:"ගස", Cup:"කෝප්පය", Balloon:"බැලුනය", Glove:"අත්ආවරණය", Airplane:"ගුවන් යානය", Crown:"ඔටුන්න", Bag:"බෑගය", House:"ගෙදර", Turtle:"ඉබ්බා", Mushroom:"බිම්මල්", Butterfly:"සමනලයා", Pen:"පෑන", Tortoise:"කැස්බෑවා", Elephant:"අලියා", School:"පාසල", YoYo:"යෝ-යෝ", Bike:"බයිසිකලය" };

// One PNG per picture, organised like the Pattern images:
//   /images/workingMemory/pictures/grade{2,3,4}/level{1..4}/wm-picture-g{grade}-l{level}-<name>.png
// (unique names, so a file is still identifiable outside its folder)
// Each folder holds exactly the pictures that grade/level's questions use
// (checked by tests/unit/workingMemoryAssets.test.js).
const PICTURES_ROOT = "/images/workingMemory/pictures";
export const pictureImageSrc = (grade, level, name) => {
  const levelNumber = String(level).replace("level", "");
  return `${PICTURES_ROOT}/grade${grade}/level${levelNumber}/wm-picture-g${grade}-l${levelNumber}-${String(name).toLowerCase()}.png`;
};

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
  const toPictureItem = (value) => ({
    id: value,
    image: pictureImageSrc(grade, level, value),
    alt: translate(value),
  });
  const items = row.filter((value) => value !== "|").map(toPictureItem);
  const correctCount = split < 0 ? row.length : split;
  const correct = items.slice(0, correctCount);
  const distractors = items.slice(correctCount);
  return { id: `g${grade}_${level}_g2_${index + 1}`, type: "drag", instruction: language === "si" ? "කාඩ්පත්වල අනුපිළිවෙල මතක තබා ගන්න." : "Remember the order of the cards.", showItems: correct, dragPool: [...correct, ...distractors], correct };
})]))]));

export const PICTURE_MEMORY_QUESTIONS = { en: createBank("en"), si: createBank("si") };
