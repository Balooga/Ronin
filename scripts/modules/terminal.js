function Terminal(rune)
{
  Module.call(this,">");

  this.element = null;
  this.input_element = document.createElement("input");
  this.hint_element = document.createElement("hint");
  this.logs_element = document.createElement("logs");
  this.menu_element = document.createElement("menu");

  this.history = [];
  this.locks = [];

  this.add_method(new Method("save",["text"]));
  this.add_method(new Method("load",["path"]));
  this.add_method(new Method("display",["mini/hide/full"]));

  this.load = function readTextFile(params, preview = false)
  {
    if(preview){ return; }

    this.locks = [];
    
    var file = "presets/"+params.content+'?'+new Date().getTime();
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                ronin.terminal.query(allText);                
            }
        }
    }
    rawFile.send(null);
  }

  this.display = function(params,preview = false)
  {
    if(preview){ return; }
    this.element.setAttribute("class",params.content);
  }

  // Module
  this.install = function(cmd)
  {
    this.element.appendChild(this.input_element);
    this.element.appendChild(this.hint_element);
    this.element.appendChild(this.logs_element);
    this.element.appendChild(this.menu_element);

    this.hint_element.innerHTML = "_";

    this.update_log();
  }

  this.active = function(cmd)
  {
  }

  this.cmd = function()
  {
    var content = this.input_element.value.trim();
    var key = content[0];
    var cmd = new Command(content.substring(1).trim().split(" "));
    return cmd;
  }

  // Locks
  
  this.lock = function(key)
  {
    console.log("Added lock: ",key);
    this.locks.push(key);
    this.element.setAttribute("class","locked");
  }

  this.unlock = function(key)
  {
    console.log("Removed lock: ",key);
    this.locks.splice(this.locks.indexOf(key), 1);

    if(this.locks.length < 1){
      this.element.setAttribute("class","unlocked");
    }
  }

  // Queue

  this.queue = [];
  
  this.query = function(input_str)
  {
    if(input_str.trim() == ""){ return; }
    if(this.locks.length > 0){ console.warn("Trying: "+input_str+", Locked: ",this.locks); return; }

    this.lock("query");
    this.input_element.value = "";

    if(input_str.indexOf(";") > 0){
      var parts = input_str.replace("\n","").split(";");
      for(id in parts){
        parts[id] = parts[id].replace("\n","").trim();
      }
      this.queue = parts;
    }
    else{
      this.queue = [];
      this.queue.push(input_str)
    }
    this.run();
  }

  this.run = function()
  {
    if(!ronin.terminal.queue[0]){ this.unlock("query"); return; }

    var entry = ronin.terminal.queue.shift();
    console.info(entry);
    active(entry);
    // ronin.terminal.queue.shift();

    setTimeout(function(){ ronin.terminal.run(); }, 100);
  }

  function active(content)
  {
    ronin.terminal.log(new Log(ronin.terminal,content,"input"));

    if(content.indexOf(".") > -1){
      var module_name = content.split(" ")[0].split(".")[0]
    }
    else if(content.indexOf(":") > -1){
      var module_name = content.split(" ")[0].split(":")[0]
    }
    else{
      var module_name = content.split(" ")[0];
    }

    var method_name = content.indexOf(".") > -1 ? content.split(" ")[0].split(".")[1] : "default";
    var setting_name = content.indexOf(":") > -1 ? content.split(" ")[0].split(":")[1] : null;

    var parameters = content.split(" "); parameters.shift();
    var parameters = new Command(parameters);

    if(ronin[module_name] && ronin[module_name][method_name]){
      ronin[module_name][method_name](parameters);
    }
    else if(ronin[module_name] && ronin[module_name].settings[setting_name]){
      ronin[module_name].update_setting(setting_name,parameters);
    }
    else if(ronin["render"].collection[method_name]){
      ronin["render"].collection[method_name].render(parameters);
    }
    else if(ronin[module_name]){
      ronin.terminal.log(new Log(ronin.terminal,"Unknown method: "+method_name));
    }
    else if(module_name == "render"){
      ronin.terminal.log(new Log(ronin.terminal,"Unknown filter: "+method_name));
    }
    else{
      ronin.terminal.log(new Log(ronin.terminal,"Unknown module: "+module_name));
    }
  }
  
  this.module_name = null;
  this.method_name = null;
  this.method_params = null;

  this.passive = function()
  {
    var content = this.input_element.value;
    var parts = content.split(" ");
    var key = parts.shift();

    this.module_name   = key.split(".")[0];
    this.method_name   = key.indexOf(".") > -1 ? key.split(".")[1] : null;
    this.method_params = new Command(parts);

    if(ronin[this.module_name]){
      ronin.cursor.set_mode(ronin[this.module_name]);
      if(ronin[this.module_name][this.method_name]){
        ronin[this.module_name][this.method_name](this.method_params,true);
      }
    }
    else{
      ronin.cursor.set_mode(ronin.brush);
    }

    this.hint(content);
  }

  // Hint

  this.update_hint = function(content = this.input_element.value)
  {
    var module_name = content.indexOf(".") > -1 ? content.split(" ")[0].split(".")[0] : content.split(" ")[0];

    if(ronin[module_name]){
      this.hint_element.innerHTML = this.pad(content)+ronin[module_name].hint(content.replace(module_name+".",""));
    }
    else{
      this.hint_element.innerHTML = this.pad(content)+ronin["default"].hint(content);
    }
  }

  this.update_menu = function()
  {
    this.menu_element.innerHTML = ronin.terminal.history.length;
  }

  this.key_escape = function()
  {
    this.input_element.value = "";
  }

  this.key_arrow_up = function()
  { 
    this.history_index -= 1;

    if(this.history_index < 0){ this.history_index = 0; }
    
    ronin.terminal.input_element.value = "> "+ronin.terminal.history[this.history_index];
  }

  this.key_arrow_down = function()
  { 
    this.history_index += 1;

    if(this.history_index >= this.history.length){ this.history_index = this.history.length-1; }

    ronin.terminal.input_element.value = "> "+ronin.terminal.history[this.history_index];
  }

  this.pad = function(input)
  {
    var s = "";
    for (i = 0; i < input.length+1; i++){
      s += "_";
    }
    return "<span style='color:#000'>"+s+"</span>";
  }

  //

  this.logs = [];

  this.log = function(log)
  {
    this.logs.push(log);
  }

  this.update_log = function()
  {
    if(ronin.terminal.logs[0]){
      ronin.terminal.logs_element.appendChild(ronin.terminal.logs[0].element);
      ronin.terminal.logs.shift();
    }

    setTimeout(function(){ ronin.terminal.update_log(); }, 200);
  }
}

// Log

function Log(host,message,type = "default")
{
  this.host = host;
  this.message = message;
  this.type = type;
  this.element = document.createElement("log");
  this.element.setAttribute("class",type);
  this.element.innerHTML = "<span class='rune'>"+(host.rune ? host.rune : ">")+"</span> "+message;
  console.log(this.host.constructor.name,this.message)
}