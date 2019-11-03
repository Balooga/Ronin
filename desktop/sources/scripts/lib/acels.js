'use strict'

function Acels () {
  this.all = {}

  this.install = (host = window) => {
    host.addEventListener('keydown', this.onKeyDown, false)
    host.addEventListener('keyup', this.onKeyUp, false)
  }

  this.set = (cat, name, accelerator, downfn, upfn) => {
    if (this.all[accelerator]) { console.warn('Acels', `Trying to overwrite ${this.all[accelerator].name}, with ${name}.`) }
    this.all[accelerator] = { cat, name, downfn, upfn, accelerator }
  }

  this.get = (accelerator) => {
    return this.all[accelerator]
  }

  this.sort = () => {
    const h = {}
    for (const item of Object.values(this.all)) {
      if (!h[item.cat]) { h[item.cat] = [] }
      h[item.cat].push(item)
    }
    return h
  }

  this.convert = (event) => {
    const accelerator = event.accelerator.substr(0, 1).toUpperCase() + event.accelerator.substr(1)
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      return `CmdOrCtrl+Shift+${accelerator}`
    }
    if (event.shiftKey) {
      return `Shift+${accelerator}`
    }
    if (event.ctrlKey || event.metaKey) {
      return `CmdOrCtrl+${accelerator}`
    }
    return accelerator
  }

  this.onKeyDown = (e) => {
    const target = this.get(this.convert(e))
    if (!target || !target.downfn) { return }
    target.downfn()
    e.preventDefault()
  }

  this.onKeyUp = (e) => {
    const target = this.get(this.convert(e))
    if (!target || !target.upfn) { return }
    target.upfn()
    e.preventDefault()
  }

  this.toMarkdown = () => {
    const cats = this.sort()
    let text = ''
    for (const cat in cats) {
      text += `\n### ${cat}\n\n`
      for (const item of cats[cat]) {
        text += `- \`${item.accelerator}\`: ${item.info}\n`
      }
    }
    return text.trim()
  }

  this.toString = () => {
    const cats = this.sort()
    let text = ''
    for (const cat in cats) {
      for (const item of cats[cat]) {
        text += `${cat}: ${item.name} | ${item.accelerator}\n`
      }
    }
    return text.trim()
  }

  this.inject = () => {
    const injection = []
    const sorted = this.sort()
    for (const cat of Object.keys(sorted)) {
      const submenu = []
      for (const option of sorted[cat]) {
        if (option.role) {
          submenu.push({ role: option.role })
        } else if (option.type) {
          submenu.push({ type: option.type })
        } else {
          submenu.push({ label: option.name, accelerator: option.accelerator, click: option.downfn })
        }
      }
      injection.push({ label: cat, submenu: submenu })
    }
    require('electron').remote.app.injectMenu(injection)
  }
}
