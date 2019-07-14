function Commander (ronin) {
  this.el = document.createElement('div')
  this.el.id = 'commander'
  this._input = document.createElement('textarea')
  this._status = document.createElement('div')
  this._status.id = 'status'

  this.install = function (host) {
    this.el.appendChild(this._input)
    this.el.appendChild(this._status)
    host.appendChild(this.el)

    this._input.addEventListener('input', this.onInput)
  }

  this.start = function () {
    this._status.textContent = 'Idle. (zoom 100%)'
    this._input.focus()
    this.run()
    this.hide()
  }

  this.run = function (txt = this._input.value) {
    if (txt.indexOf('$') > -1) { ronin.log('Present: $'); return }
    console.log('========')
    ronin.surface.maximize()
    const inter = new Lisp(txt, ronin.library)
    inter.toPixels()
  }

  this.load = function (txt) {
    this._input.value = txt
    this.run()
  }

  this.setStatus = function (msg) {
    this._status.textContent = `${msg}`
  }

  this.update = function () {

  }

  this.onInput = function () {

  }

  this.getQuery = function () {

  }

  // Mouse

  this.mouseRect = { x: 0, y: 0, w: 0, h: 0, a: { x: 0, y: 0 }, b: { x: 0, y: 0 } }
  this.mouseDown = false

  this.onMouseDown = (e) => {
    this.mouseDown = true
    this.mouseRect.x = e.offsetX
    this.mouseRect.y = e.offsetY
    this.mouseRect.a.x = e.offsetX
    this.mouseRect.a.y = e.offsetY
    this._status.textContent = `${this.mouseRect.x},${this.mouseRect.y} ${this.mouseRect.w},${this.mouseRect.h}`
    this.capture()
    this.show()
  }

  this.onMouseMove = (e) => {
    if (this.mouseDown === true) {
      this.mouseRect.w = e.offsetX - this.mouseRect.x
      this.mouseRect.h = e.offsetY - this.mouseRect.y
      this.mouseRect.b.x = e.offsetX
      this.mouseRect.b.y = e.offsetY
      this._status.textContent = `${this.mouseRect.x},${this.mouseRect.y} ${this.mouseRect.w},${this.mouseRect.h}`
      this.commit()
    }
  }

  this.onMouseUp = (e) => {
    this.mouseDown = false
    this.mouseRect.w = e.offsetX - this.mouseRect.x
    this.mouseRect.h = e.offsetY - this.mouseRect.y
    this.mouseRect.b.x = e.offsetX
    this.mouseRect.b.y = e.offsetY
    this._status.textContent = `${this.mouseRect.x},${this.mouseRect.y} ${this.mouseRect.w},${this.mouseRect.h}`
    this.commit()
    this._input.focus()
  }

  // Injection

  this.cache = ''

  this.capture = function () {
    this.cache = this._input.value
  }

  this.injectPath = function (path) {
    this._input.value = this._input.value.replace('($path)', `(path "${path}")`)
  }

  this.commit = function () {
    let value = this.cache

    if (value.indexOf('$') < 0) {
      return
    }

    const next = value.split('$')[1]

    if (next.substr(0, 4) === 'pos)') {
      value = value.replace('($pos)', `(pos ${this.mouseRect.x} ${this.mouseRect.y})`)
    }

    if (next.substr(0, 5) === 'rect)') {
      value = value.replace('($rect)', `(rect ${this.mouseRect.x} ${this.mouseRect.y} ${this.mouseRect.w} ${this.mouseRect.h})`)
    }

    if (next.substr(0, 5) === 'line)') {
      value = value.replace('($line)', `(line (pos ${this.mouseRect.a.x} ${this.mouseRect.a.y}) (pos ${this.mouseRect.b.x} ${this.mouseRect.b.y}))`)
    }

    this._input.value = value
  }

  // Display

  this.show = function () {
    if (this.el.className !== '') {
      this.el.className = ''
    }
  }

  this.hide = function () {
    if (this.el.className !== 'hidden') {
      this.el.className = 'hidden'
    }
  }

  this.toggle = function () {
    if (this.el.className === 'hidden') {
      this.show()
    } else {
      this.hide()
    }
  }
}