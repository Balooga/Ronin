function Library (ronin) {
  this.clear = (rect = this.select_all()) => {
  }

  // IO

  this.open = (path, w = 1, h = 1) => {
    ronin.surface.open(path, { w, h })
    return path
  }

  this.save = function (path, type = 'jpg') {
    console.log('save', path)
    // TODO: Save file
    return path
  }

  this.draw = (path, rect) => {
    ronin.surface.draw(path, rect)
    return rect
  }

  this.exit = () => {
    // TODO: Closes Ronin
  }

  // Rects

  this.pos = (x, y, t = 'pos') => {
    return { x, y }
  }

  this.size = (w, h, t = 'size') => {
    return { w, h }
  }

  this.rect = (x, y, w, h, t = 'rect') => {
    return { x, y, w, h, t }
  }

  this.line = (a, b, t = 'line') => {
    return { a, b, t }
  }

  this.frame = () => {
    return ronin.surface.getFrame()
  }

  this.center = () => {
    const rect = this.frame()
    return this.pos(rect.w / 2, rect.h / 2)
  }

  this.path = (path) => {
    return path
  }

  this.scale = (rect, w, h) => {
    return { x: rect.x, y: rect.y, w: rect.w * w, h: rect.h * h }
  }

  // Copy/Paste

  this.clone = (a, b) => {
    ronin.surface.clone(a, b)
    return [a, b]
  }

  this.stroke = (shape = this.frame(), thickness, color) => {
    ronin.surface.stroke(shape, thickness, color)
    return shape
  }

  this.fill = (rect = this.frame(), color) => {
    ronin.surface.fill(rect, color)
    return rect
  }

  this.clear = (rect = this.frame()) => {
    ronin.surface.clear(rect)
    return rect
  }

  this.echo = function (any) {
    console.log(any)
    return any
  }

  //

  this.of = function (h, k) {
    return h[k]
  }
}
