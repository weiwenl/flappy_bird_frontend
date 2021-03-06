document.addEventListener('DOMContentLoaded', function() {
  const birdSound = new Audio('bird.mp3')
  const collisionSound = new Audio('collision.mp3')
  const backgroundMusic = document.getElementsByTagName('embed')[0]

  let scoreValue = 0
  let gameEnded = false
  const gameArea = {
    canvas: document.createElement("canvas"),

    start: function(){
      this.canvas.width = 700
      this.canvas.height = 700
      this.canvas.style.backgroundColor = "yellow"
      this.score = 0
      let scoreSpan = document.getElementById('score')
      setInterval(()=>{
        if (gameEnded === false) {
          this.score++
          scoreValue = this.score
        } else {
          this.score = 0
        }
        scoreSpan.innerText = this.score
      }, 100)

      this.context = this.canvas.getContext("2d")
      gameEnded = false
      document.body.insertBefore(this.canvas, document.body.childNodes[0])

    },
    clear : function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

  }

  gameArea.start()

  const scoreIncrement = () =>{
    gameArea.score++
  }

  const Obstacle = function(x, y, width, height, color) {
    this.width = width
    this.height = height
    this.color = color
    this.x = x
    this.y = y
  }

  Obstacle.prototype.renderObs = function(){
    let ctx = gameArea.context
    ctx.clearRect(0, 0, gameArea.canvas.width, gameArea.canvas.height)
    this.x -= 10
    // ctx.beginPath()
    obstArray.forEach(function(obs){
      ctx.fillStyle = obs.color
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
    })
  }

  Obstacle.prototype.moveObs = function() {
    let ctx = gameArea.context
    this.x -= 10
  }

  let obstArray = []

  const generateObstacle = function() {
    if (gameEnded === false) {
      const height = Math.floor(Math.random()*(500-200)) + 100
      const y = Math.floor(Math.random()*(gameArea.canvas.height- 200))
      const x = gameArea.canvas.width
      const width = 50
      const newObs = new Obstacle(x, y, width, height, 'green')
      obstArray.push(newObs)
    }
  }

  const animateObstacles = function() {
    obstArray.forEach(obstacle => {
      obstacle.renderObs()
    })
  }

  let ctx = gameArea.context

  const hero = new Image();
  hero.src = 'imgs/hero.png';
  hero.width = 50
  hero.height = 50
  hero.speedX = 0
  hero.speedY = 2.5
  hero.posX = 100
  hero.posY = 0
  hero.gravity = 0.8
  hero.gravitySpeed = 0

  hero.checkCollision = function(obstacle) {
    //hero
    this.left = this.posX
    this.right = this.posX + this.width
    this.top = this.posY
    this.bottom = this.posY + this.height

    //obstacle
    obstacle.left = obstacle.x
    obstacle.right = obstacle.x + obstacle.width
    obstacle.top = obstacle.y
    obstacle.bottom = obstacle.y + obstacle.height

    //check for collision and end game
    if (this.left < obstacle.right && this.right > obstacle.left && this.top < obstacle.bottom && this.bottom > obstacle.top) {
      collisionSound.play()
      alert(`YOU LOSE! YOUR SCORE IS ${scoreValue}`)
      gameArea.clear()
      obstArray = []
      gameEnded = true
      hero.speedY = 2.5
      hero.posX = 100
      hero.posY = 0

      postScore()

      gameArea.start()
    }
  }

  const postScore = function() {
    let config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({"user_id": 1, "score": `${scoreValue}`}
      )
    }

    fetch('https://flappy-bird-backend.herokuapp.com/api/v1/scores', config).then(r => r.json()).then(listScores)
  }

  const parseScores = function(array) {
    let sortedArray = array.sort(function(a, b){return b.score - a.score})
    return sortedArray.slice(0,10)
  }

  const listScores = function() {
    fetch('https://flappy-bird-backend.herokuapp.com/api/v1/scores').then(r => r.json()).then(array => parseScores(array)).then(array => renderScores(array))
  }

  const makeLi = function(scoreObj) {
    let listItem = document.createElement('li')
    listItem.className = 'score'
    listItem.dataset.id = `${scoreObj.id}`
    listItem.innerText = `${scoreObj.score}`
    return listItem
  }

  const renderScores = function(array) {
    let scoreList = document.getElementById('scores')
    scoreList.innerHTML = ''
    array.forEach(el => {
      scoreList.appendChild(makeLi(el))
    })

  }


  function render() {
    hero.gravitySpeed += hero.gravity;
    hero.speed = hero.speedY + hero.gravitySpeed
    hero.posY += hero.speed
    if (hero.posY < 0) {
      hero.posY = 0
    }
    if (hero.posY > gameArea.canvas.height - hero.height){
      hero.posY = gameArea.canvas.height - hero.height
      hero.speed = 0
    }
    ctx.drawImage(hero, hero.posX, hero.posY)
  }

  function accelerate(n) {
      hero.gravity = n;
  }

  const play = function() {

  setInterval(generateObstacle, 2500)
  setInterval(() => {
    if (gameEnded === false) {
      animateObstacles()
      render()
      obstArray.forEach(obst => {
        hero.checkCollision(obst)
      })
    }}, 50)
  }

  play()

  // event listener for bird (not blue square)
  document.addEventListener('keydown', e => {
    if (e.key === ' ') {
      e.preventDefault()
      hero.gravity = -0.8
      birdSound.play()

      render()
    }
  })

  document.addEventListener('keyup', e => {
    if (e.key === ' ') {
      e.preventDefault()
      hero.gravity = 0.8

      render()
    }
  })

  let body = document.getElementsByTagName('body')[0]
  body.onmousedown = function() {
    hero.gravity = -0.2
    render()
  }
  body.onmouseup = function() {
    hero.gravity = 0.05
    render()
  }

})
