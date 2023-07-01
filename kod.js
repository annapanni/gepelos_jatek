let gameRunning = false
let wordTimeouts = []
let newWordNum = 0
let lastLetter = ""
const globalVars = {
  score: 0,
  errors: 0,
  finished:0
}
const displays = {
  score: {
    label: "pontszám: ",
    obj: document.getElementById("scoreBox")},
  errors: {
    label: "hibák: ",
    obj: document.getElementById("errorsBox")},
  finished: {
    label: "felrobbant: ",
    obj: document.getElementById("finishedBox")}
}
let feladatok
let currentWords = []
let activeWordIndex
let rockets = []

//functions---------------------------------------------------------------------
Array.prototype.randomE = function () {
  return this[Math.floor((Math.random()*this.length))]
}

function changeVar(name, v, spec){
  s = {fix: false, disp: true, ...spec}
  if (s.fix) globalVars[name]=v
  else globalVars[name]+=v
  if (s.disp)
    displays[name].obj.innerText = displays[name].label + globalVars[name]
}

function randomLettString (minl, maxl, charlist){
  let s = ""
  for (let i=0; i<minl+Math.random()*(maxl-minl);i++){
    s += charlist.randomE()
  }
  return s
}

function newWord() {
  const nw = feladatok.randomE()
  currentWords.push({
    done: "",
    toType: nw,
    x: Math.random()*(canvas.width-ctx.measureText(nw).width),
    y: 0,
    removed: false
  })
  newWordNum += 1
}

function findNewActive(l){
  currentWords = currentWords.filter(cw => !cw.removed)
  for (let i=0;i<currentWords.length;i++){
    if (currentWords[i].toType[0]==l) {
      activeWordIndex = i
      staticRocket.goal = currentWords[i]
      break
    }
  }
}

function onKeyPress(e) {
  if (settWindow.style.display != "block"){
    lastLetter = e.key
    if (activeWordIndex==undefined){
      findNewActive(e.key)
      if (activeWordIndex==undefined) {
        changeVar("errors",1)
        missedShotAudio.cloneNode(true).play()
        return
      }
    }
    aw = currentWords[activeWordIndex]
    if (e.key == aw.toType[0]){
      aw.done +=  aw.toType[0]
      aw.toType = aw.toType.substr(1, aw.toType.length)
      shotAudio.cloneNode(true).play()
      if (aw.toType.length == 0){
        activeWordIndex = undefined
        newRocket(aw)
      }
    } else {
      changeVar("errors",1)
      missedShotAudio.cloneNode(true).play()
      aw.toType = aw.done + aw.toType
      aw.done = ""
      activeWordIndex = undefined
      staticRocket.goal = undefined
      rockets = rockets.filter(r => r.goal != aw)
    }
  }
}

function isGameOver(){
  if (newWordNum == settings.wordsPerGame && currentWords.filter(w=> !w.removed).length == 0){
    toggleGame()
  }
}

//settings----------------------------------------------------------------------
const showSettButton = document.getElementById("showSett")
const settCloseButton = document.getElementById("settClose")
const settOKButton = document.getElementById("settOK")
const settCancelButton = document.getElementById("settCancel")
const settWindow = document.getElementById("settings")
const prevLevelButton = document.getElementById("prevLevel")
const nextLevelButton = document.getElementById("nextLevel")

let settings = {
  minlen: 1,
  maxlen: 10,
  speed: 4,
  newWordSpeed: 1500,
  wordsPerGame: 20,
  mode: "categories",
  modeSett: ["nums", "punct", "lett"],
  lettString: true,
  words: true
}
const categories = {
  lett: letters,
  punct: punctuation,
  nums: numbers
}
const levels = {
  level1: "jf",
  level2: "dk",
  level3: "ls",
  level4: "aé",
  level5: "fdsa",
  level6: "jklé",
  level7: "gh",
  level8: "gfdsa",
  level9: "hjklé",
  level10: "asdfghjklé",
  level11: "ru",
  level12: "ei",
  level13: "wo",
  level14: "qp",
  level15: "qwer",
  level16: "uiop",
  level17: "tz",
  level18: "qwert",
  level19: "zuiop",
  level20: "qwertzuiop",
  level21: "vm",
  level22: ",c",
  level23: "x.",
  level24: "y-",
  level25: "yxcv",
  level26: "m,.-",
  level27: "bn",
  level28: "yxcvb",
  level29: "nm,.-",
  level30: "yxcvbnm,.-",
  level31: "qwertzuiopasdfghjkléyxcvbnm,.-",
  level32: "1234",
  level33: "1234789ö",
  level34: "123456789ö",
  level35: "123456789öqwertzuiopasdfghjkléyxcvbnm,.-"
}
//generate level options
const levelSelector = document.querySelector("#levelsDiv select")
const levelnames = Object.keys(levels)
let newOption
for (let i=0;i<levelnames.length;i++){
  newOption = document.createElement("option")
  newOption.value = levelnames[i]
  newOption.innerText = "Lecke " + (i+1)
  levelSelector.appendChild(newOption)
}

//functions
function filterTaskList(){
  switch (settings.mode) {
    case "categories":
      feladatok = settings.modeSett.map(i => categories[i]).flat()
      break;
    case "levels":
      feladatok = levels[settings.modeSett].split("")
      break;
    case "custom":
      feladatok = settings.modeSett.split("")
      break;
    default:
      console.log("Jaj")
  }
  let chars = feladatok.join("")
  if (settings.words){
    feladatok = feladatok.concat(words)
  }
  feladatok = feladatok.filter(w => w.length>=settings.minlen
    && w.length <= settings.maxlen
    && w.split("").every(l=>chars.includes(l)))
  if (settings.lettString){
    const to = Math.max(40, feladatok.length*0.3)
    for (let i=0; i<to; i++){
      feladatok.push(randomLettString(+settings.minlen, +settings.maxlen, chars.split("")))
    }
  }
  if (feladatok.length == 0){
    return false
  } else {
    return true
  }
}

function changeWordSettings (args){
  for (const key in settings){
    if (args.hasOwnProperty(key))
      settings[key] = args[key]
  }
  return filterTaskList()
}

function syncrnosizeSettWindow(){
  const inps = document.querySelectorAll(".settImp")
  const toChange = {}
  inps.forEach(v=> {v.value = settings[v.name]})
  document.querySelectorAll(".settCheck").forEach(item=> {
    item.checked = settings[item.name]
  })
  document.querySelectorAll(".mode").forEach(item => {
    item.checked = false
  })
  document.getElementById(settings.mode+"RB").checked = true
  switch (settings.mode) {
    case "categories":
      settings.modeSett.forEach(item => {document.getElementById(item+"Check").checked = true})
      break;
    case "levels":
       document.querySelector("#levelsDiv select").value = settings.modeSett
      break;
    case "custom":
       document.querySelector("#customDiv input").value = settings.modeSett
      break;
    default:
      console.log("Valami rossz :(")
  }
}
function showSett(){
  syncrnosizeSettWindow()
  settWindow.style.display = "block"
}

function closeSett(){
  settWindow.style.display = "none"
}

function saveSett(){
  const inps = document.querySelectorAll(".settImp")
  const toChange = {}
  inps.forEach(v=> {toChange[v.name] = v.value})
  document.querySelectorAll(".settCheck").forEach(item=> {
    toChange[item.name] = item.checked
  })
  const m = [...document.querySelectorAll(".mode")].filter(i=>i.checked)
  toChange.mode = m[0].value
  switch (toChange.mode) {
    case "categories":
      toChange.modeSett = [];
      [...document.querySelectorAll("#categoriesDiv input")].filter(i=>i.checked)
      .forEach(item=> {
        toChange.modeSett.push(item.name)
      })
      break;
    case "levels":
      toChange.modeSett = document.querySelector("#levelsDiv select").value
      break;
    case "custom":
      toChange.modeSett = document.querySelector("#customDiv input").value
      break;
    default:
      console.log("Nincs opció bejelölve.")
  }
  if (changeWordSettings(toChange)) {
    closeSett()
  } else {
    window.confirm("Ilyen beállításokkal nincsenek szavak")
  }
}

//change selected opacity
function changeModOpsOpacity(){
  const ms = document.querySelectorAll(".mode")
  ms.forEach((item) => {
    if (item.checked){
      document.getElementById(item.value+"Div").classList.remove("disabled")
    } else {
      document.getElementById(item.value+"Div").classList.add("disabled")
    }
  })
}
document.querySelectorAll(".mode").forEach(m => {
  m.addEventListener("change", changeModOpsOpacity)
})

//eventlisteners
showSettButton.addEventListener("click", showSett)
settOKButton.addEventListener("click", saveSett)
settCloseButton.addEventListener("click", closeSett)
settCancelButton.addEventListener("click", closeSett)

//change levels
function changeLevel(v, fix=false){
  if (fix) levelSelector.value = levelnames[v]
  else levelSelector.value = levelnames[levelnames.indexOf(levelSelector.value) + v]
  disableChangeLevelButtons()
}
function disableChangeLevelButtons(){
  if (levelSelector.value == "level1") prevLevelButton.classList.add("disabled")
  else prevLevelButton.classList.remove("disabled")
  if (levelSelector.value == "level"+levelnames.length) nextLevelButton.classList.add("disabled")
  else nextLevelButton.classList.remove("disabled")
}
prevLevelButton.addEventListener("click", (e)=>{
  if (![...e.target.classList].includes("disabled")) changeLevel(-1)
})
nextLevelButton.addEventListener("click", (e)=>{
  if (![...e.target.classList].includes("disabled")) changeLevel(1)
})
levelSelector.addEventListener("change", disableChangeLevelButtons)

//initialize settings
changeLevel(0, fix=true)
syncrnosizeSettWindow()
filterTaskList()
changeModOpsOpacity()

//audios------------------------------------------------------------------------
const rocketLaunchAudio = new Audio("sounds/rocket.mp3")
const largeExplosionAudio = new Audio("sounds/large_explosion.mp3")
const shortExplosionAudio = new Audio("sounds/short_explosion.mp3")
const shotAudio = new Audio("sounds/shot_quiet.mp3")
const missedShotAudio = new Audio("sounds/empty_shot.mp3")

//canvas------------------------------------------------------------------------
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

//paramters
const stationWidth = 150
const stationHeight = 100
const rocketWidth = 125
let rocketHeight = 25
const explWidthMultiplier = 80
const fallingFont = "35px NunitoMedium"
const stationFont = "60px NunitoMedium"
//creating rocket
const rocketImg = new Image()
rocketImg.src = "images/raketa.png"
rocketImg.onload = () => rocketHeight = rocketWidth * rocketImg.naturalHeight/rocketImg.naturalWidth
function newRocket(goal){
  rocketLaunchAudio.cloneNode(true).play()
  rockets.push({
    x: canvas.width/2,
    y: canvas.height - stationHeight,
    r: 0,
    goal: goal
  })
}
const staticRocket = {
  x: canvas.width/2,
  y: canvas.height - stationHeight,
  r: 1.5*Math.PI,
  goal: undefined
}
function rocketHit(ro){
  shortExplosionAudio.cloneNode(true).play()
  const aw = ro.goal
  changeVar("score", aw.done.length)
  aw.removed = true
  if (staticRocket.goal==aw) staticRocket.goal = undefined
  rockets = rockets.filter(r=> r != ro)
  ctx.font = fallingFont
  const awWidth = ctx.measureText(aw.done).width
  const explWidth = Math.pow(aw.done.length, 1/2)*explWidthMultiplier
  newExplosion(aw.x + (awWidth-explWidth)/2, ["center", aw.y], explWidth, "circular")
}

//creating clouds
let newImg
let cloudImgs = []
for (let i=1; i<=4;i++){
  newImg = new Image()
  newImg.src = `images/felho${i}.png`
  newImg.style.opacity = 0.2
  cloudImgs.push(newImg)
}
let clouds = []
function newCloud (starter=false){
  const im = cloudImgs.randomE()
  const h = 50 + Math.random()*canvas.width*0.02
  const left = Math.random() < 0.5
  clouds.push({
    src: im,
    width: h*im.naturalWidth/im.naturalHeight,
    height: h,
    x: (starter ? Math.random()*canvas.width : (left? 0 - h*im.naturalWidth/im.naturalHeight :canvas.width)),
    y: Math.pow(Math.random(),4)*canvas.height*0.95,
    speed: 0.05 + Math.random() * (left? 0.7:-0.7),
    opacity: 0.6 + Math.random()*0.4
  })
}
cloudImgs[cloudImgs.length-1].onload = () => {for (let i=0; i<20; i++) newCloud(starter=true)}

//creating explosions
let explImgs = {
  mushroom: [],
  circular: []
}
for (let type in explImgs){
  for (let i=1; i<=8;i++){
    newImg = new Image()
    newImg.src = `images/${type}${i}.png`
    explImgs[type].push(newImg)
  }
  for (let i=1; i<=4;i++) explImgs[type].push(newImg)
}
let explosions = []
function newExplosion(x,y,w,t){
  const h = w * explImgs[t][0].naturalHeight/explImgs[t][0].naturalWidth
  if (y=="bottom")
    y = canvas.height - h
  else if (y[0] == "center")
    y = y[1] - h/2
  else y = y
  explosions.push({
    type: t,
    srcIndex: 0,
    x:x,
    y: y,
    width: w,
    height: h,
    back: false
  })
}

//functions
function advancedDrawImage (img, x, y, w, h, spec){
  s = {r:0, a:1, ...spec}
  ctx.globalAlpha = s.a
  ctx.setTransform(1, 0, 0, 1, x, y)
  ctx.rotate(s.r)
  ctx.drawImage(img, -w/2, -h/2, w, h)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
}

function moving(){
  ctx.font = fallingFont
  //move words
  currentWords.forEach(cw => {
    cw.y += settings.speed/2
    if (cw.y > canvas.height && !cw.removed){
      cw.removed = true
      changeVar("finished", 1)
      //generate explosion
      const missedWord = cw.done + cw.toType
      const wordWidth = ctx.measureText(missedWord).width
      const explWidth = Math.pow(missedWord.length, 1/3)*explWidthMultiplier
      newExplosion(cw.x + (wordWidth-explWidth)/2, "bottom", explWidth, "mushroom")
      largeExplosionAudio.cloneNode(true).play()
      isGameOver()
    }
  })
  //move rockets
  let goalRotation = 1.5*Math.PI
  if (staticRocket.goal){
    dx = (staticRocket.goal.x + ctx.measureText(staticRocket.goal.done + staticRocket.goal.toType).width/2) - staticRocket.x
    dy = staticRocket.goal.y- staticRocket.y
    dist =  Math.sqrt(dx*dx + dy*dy)
    goalRotation = Math.asin(dy/dist)
    if (dx < 0) goalRotation =  Math.PI - goalRotation
    if (goalRotation<0) goalRotation =  2*Math.PI + goalRotation
  }
  staticRocket.r = staticRocket.r + (goalRotation-staticRocket.r)*0.5
  rockets.forEach(function (ro) {
    dx = (ro.goal.x + ctx.measureText(ro.goal.done + ro.goal.toType).width/2) - ro.x
    dy = ro.goal.y - ro.y
    dist =  Math.sqrt(dx*dx + dy*dy)
    if (dist<20){
      rocketHit(ro)
      isGameOver()
      return
    }
    ro.r =  Math.asin(dy/dist)
    if (dx < 0){
      ro.r =  Math.PI - ro.r
    }
    ro.x += Math.cos(ro.r)*20
    ro.y += Math.sin(ro.r)*20
  })
  //move clouds
  if (Math.random()<0.005){//chance of a new cloud appearing
    newCloud()
  }
  clouds.forEach(c => {
    c.x += c.speed
  })
  //move explosions
  explosions.forEach(e => {
    e.srcIndex += (e.back? -2: 1)
    if (e.srcIndex==(explImgs[e.type].length-1)) e.back = true
  })
  explosions = explosions.filter(e=>e.srcIndex>0)
}

function draw() {
  ctx.clearRect(0,0, canvas.width, canvas.height)
  //draw clouds
  clouds.forEach(c => {
    advancedDrawImage(c.src, c.x, c.y, c.width, c.height, {a: c.opacity})
  })
  //draw rockets
  advancedDrawImage(rocketImg, staticRocket.x, staticRocket.y, rocketWidth, rocketHeight, {r: staticRocket.r})
  rockets.forEach(ro => {
    advancedDrawImage(rocketImg, ro.x, ro.y, rocketWidth, rocketHeight, {r: ro.r})
  })
  //draw rocket station
  ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("--delftBlue")
  ctx.fillRect(canvas.width/2-stationWidth/2, canvas.height-stationHeight, stationWidth, stationHeight)
  ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("--alabaster")
  //draw lastletter
  ctx.font = stationFont
  const metrics =  ctx.measureText(lastLetter)
  const llx = canvas.width/2 - metrics.width/2
  const lly = canvas.height - (metrics.actualBoundingBoxDescent)-25
  ctx.fillText(lastLetter, llx, lly)
  //draw words
  ctx.font = fallingFont
  currentWords.filter(cw => !cw.removed).forEach(cw => {
    ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("--delftBlue")
    ctx.fillText(cw.done, cw.x, cw.y)
    ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("--folly")
    ctx.fillText(cw.toType, cw.x + ctx.measureText(cw.done).width, cw.y)
  })
  //draw explsoions
  explosions.forEach(expl => {
    ctx.drawImage(explImgs[expl.type][expl.srcIndex], expl.x, expl.y, expl.width, expl.height)
  })
}

setInterval(moving, 30)
setInterval(draw, 30)

//start game--------------------------------------------------------------------
const newGameButton = document.getElementById("newGame")
function initialize(){
  changeVar("errors", 0, {fix: true})
  changeVar("score", 0, {fix: true})
  changeVar("finished", 0, {fix:true})
  currentWords = []
  lastLetter = ""
  activeWordIndex = undefined
  staticRocket.goal = undefined
  staticRocket.r = 1.5*Math.PI
  wordTimeouts = []
  newWordNum = 0
}
function toggleGame() {
  if (gameRunning){
    for (let i=0; i<wordTimeouts.length; i++){
      clearTimeout(wordTimeouts[i])
    }
    newWordNum = 0
    currentWords = []
    rockets = []
    gameRunning = false
    newGameButton.textContent = "Új játék"
  } else {
    gameRunning = true
    newGameButton.textContent = "Befejezés"
    initialize()
    let time = 0
    for (let i=0; i<settings.wordsPerGame; i++){
      wordTimeouts.push(setTimeout(newWord, time))
      time += +settings.newWordSpeed + Math.random()*2500
    }
  }
}

newGameButton.addEventListener("click", toggleGame)
document.addEventListener("keypress", onKeyPress)

initialize()
