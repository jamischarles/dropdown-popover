
//TODO: To make this global you have to bring out two things:
/*
  - genericise dom names
  - genericise via config obj

*/


//UI requirements:
/*
  - trigger click opens/closes dd menu
  - esc closes menu
  - clicking outside of menu closes menu
  - clicking inside dd doesn't close it
*/
 
/*
 * Module dependencies
 * 
 */ 
var events = require("event");
var trav = require('traversty');

//CONSTANTS
var DD_TRIGGER_QUERY = ".utility-trigger";
var DD_TARGET_QUERY = ".utility-menu";

module.exports = function(cfg){
  //if no cfg object passed in, make blank obj.
  cfg = cfg || {};

  DD_TRIGGER_QUERY = cfg.dd_trigger || DD_TRIGGER_QUERY;
  DD_TARGET_QUERY = cfg.dd_target || DD_TRIGGER_QUERY;


  // var zest = require("header-footer/deps/zest");
 
  //only one menu will be visible at a time. Node.
  var _visible_menu; 
 
  //Q: ask Nic about these... Are these clean enough?
  //on every utility trigger, hit the sibling 'utility-menu' 
 
  var dd_triggers = trav(DD_TRIGGER_QUERY);
  var dd_menus = trav(DD_TARGET_QUERY); //needed to stop evt bubbling
 
  // Q: what about just using evt delegation? Can we d`o that easily natively?
 
  //add Click Listeners
  dd_triggers.each(function(el){
    events.bind(el, 'click', toggleMenu);
  })
 
  //add listener to ignore click on the dropdown menus
  dd_menus.each(function(el){
    events.bind(el, 'click', function(e){
      e.stopPropagation();
    });
  })
 
  //add universal hide on the body
  events.bind(document.body, 'click', function(e){
    hideMenu(_visible_menu);
  });
 
  //add escape keystroke to close menu
  events.bind(document, 'keyup', function(e){
    if (e.keyCode == 27) {
      hideMenu(_visible_menu);
    }
 
  });
 
   
 
  function toggleMenu(e){
    e.stopPropagation();
    var trigger = e.target;
     
    trav(trigger).siblings(".utility-menu").each(function(el){
      //if visible, hide, else show
      if (el.className.match("visible")){
        hideMenu(el);
      }else {
        showMenu(el);
      }
       
    });
  }
 
  function showMenu(el){
    hideMenu(_visible_menu);
    el.className += " visible"; //TODO: consider adding a component for class toggling
    _visible_menu = el;
  }
 
  function hideMenu(el){
    if (!el) { return};
    el.className = el.className.replace("visible", ""); //remove className
  }
}



 
 
 

 

 
