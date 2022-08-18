const expect = chai.expect;
const should = chai.should();
// Mock up of the firebase object of a character
const sheetState = {character_name:'Test Character'};
const listeners = {};
let sheetHTML;
//Mock up of the fieldset displays on a sheet for ordering
const resetSheetState = function(){
  Object
    .keys(sheetState)
    .forEach(key => {
      if(key !== 'character_name'){
        delete sheetState[key];
      }
    });
};
const repeatingRows = {
  //Format:
  //repeating_sectionname:['id','id','id']
};

/**
 * Mock up of the on sheetworker
 * @param {string} watch - The watch string
 * @param {function} callback - passes the event object as an argument
 */
const on = (watch,callback) => {
  watch
    .split(/\s+/)
    .forEach( w => 
      listeners[w] = [ 
        ...(listeners[w]||[]),
        callback
      ]
    );
};

/**
 * Resets the listener array when code is reloaded
 */
const resetListeners = function(){
  Object.keys(listeners).forEach(key => delete listeners[key]);
};

/**
 * Mock up of Roll20's getAttrs function
 * @param {array} arr - Array of attribute names
 * @param {function} callback - Callback function that receives the object containing attribute name keyed attribute values. Passes the found attributes object as an argument.
 */
const getAttrs = (arr,callback)=>{
  const gotValues = arr.reduce((memo,key)=>{
    memo[key] = sheetState[key] || '';
    return memo;
  },{});
  callback(gotValues);
};

/**
 * Mock up of the Roll20 setAttrs function.
 * @param {object} setObj - Object containing the attributes and their new values
 * @param {object} options - Options object as per Roll20 wiki
 * @param {function} callback Callback for the setAttrs operation. Accepts no arguments.
 */
const setAttrs = (setObj,options,callback) => {
  const prevValues = Object.entries(setObj).reduce((memo,[key,value]) => {
    memo[key] = sheetState[key];
    sheetState[key] = value;
    return memo;
  },{});
  if(!options?.silent){
    Object.entries(prevValues).forEach(([key,value]) => {
      trigger({sourceAttribute:key,previousValue:value,newValue:sheetState[key],triggerName:key});
    });
  }
  if(callback){
    callback();
  }
};

/**
 * Mockup of the Roll20 getSectionIDs sheetworker
 * @param {string} sectionName - Name of the section, without the repeating_ prefix
 * @param {function} callback - Callback function, passed the array of rowIDs as an argument.
 */
const getSectionIDs = (sectionName,callback) => {
  const rowIDs = Object.keys(sheetState)
    .map(attrName => {
      if(/^repeating_/.test(attrName)){
        return attrName.replace(/^repeating_.+?_(.+?)_.+/,'$1');
      }
      return undefined;
    })
    .filter(id => id);
  callback(rowIDs);
};

/**
 * Mock up of the Roll20 generateRowID function
 * @returns {string} - The created roll20 ID
 */
const generateRowID = () => {
  var a = 0,
    b = [];
  return () => {
    var c = (new Date).getTime() + 0,
      d = c === a;
    a = c;
    for (var e = Array(8), f = 7; 0 <= f; f--) e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64), c = Math.floor(c / 64);
    c = e.join("");
    if (d) {
      for (f = 11; 0 <= f && 63 === b[f]; f--) b[f] = 0;
      b[f]++;
    }
    else
      for (f = 0; 12 > f; f++) b[f] = Math.floor(64 * Math.random());
    for (f = 0; 12 > f; f++) c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
    return c.replace(/_/g, 'Z');
  };
};

/**
 * Extracts the section (e.g. `repeating_equipment`), rowID (e.g `-;lkj098J:LKj`), and field name (e.g. `bulk`) from a repeating attribute name.
 * @param {string} string - The string to parse
 * @returns {array} - Array of matches. Index 0: the section name, e.g. repeating_equipment | Index 1:the row ID | index 2: The name of the attribute
 * @returns {string[]}
 * @example
 * //Extract info from a full repeating name
 * const [section,rowID,attrName] = parseRepeatName('repeating_equipment_-8908asdflkjZlkj23_name');
 * console.log(section);// => "repeating_equipment"
 * console.log(rowID);// => "-8908asdflkjZlkj23"
 * console.log(attrName);// => "name"
 * 
 * //Extract info from just a row name
 * const [section,rowID,attrName] = parseRepeatName('repeating_equipment_-8908asdflkjZlkj23');
 * console.log(section);// => "repeating_equipment"
 * console.log(rowID);// => "-8908asdflkjZlkj23"
 * console.log(attrName);// => undefined
 */
const parseRepeatName = function(string){
  let match = string.match(/(repeating_[^_]+)_([^_]+)(?:_(.+))?/);
  match.shift();
  return match;
};

/**
 * Mock up of the Roll20 removeRepeatingRow function
 * @param {string} row - The row info; essentially the repeating_sectionname_-uaspdoiu234lkj
 */
const removeRepeatingRow = (row) => {
  const [section,id,attrName] = parseRepeatName(row);
  if(section && id && !attrName){
    repeatingRows[section].splice(repeatingRows.indexOf(id));
  }
};

/**
 * Mock up of the Roll20 setSectionOrder sheetworker
 */
const setSectionOrder = () => {
  //Empty deliberately. No effect in testing
}

/**
 * Mock up of the Roll20 getTranslationByKey sheetworker that gets values of the key in the base translation json
 * @param {string} key - translation for key
 * @returns {string|boolean}
 */
const getTranslationByKey = (key) => {
  return translation.hasOwnProperty(key) ?
    translation[key] :
    false;
};

/**
 * Mock up of the setDefaultToken sheetworker
 */
const setDefaultToken = () => {
  //Does nothing in mockup
}

/**
 * Mock up of the startRoll sheetworker. Needs to be written
 */
const startRoll = ()=>{
  
};

/**
 * Mock up of the finishRoll sheetworker. Needs to be written
 */
const finishRoll = () => {
  
};

//
// Helper Functions for the mock Roll20 Functions
//

/**
 * Function to convert a specific attribute name to the generic cascade attribute name.
 * @param {string} key - Attribute name
 * @returns {string}
 */
const getCascRef = (key) => {
  return key.replace(/(repeating_.+?_).+?(_.+)/,'$1\$X$2');
};

/**
 * Function to pseudo trigger sheetworker listeners
 * @param {object} event The event object that the callback expects
 * @param {string} event.sourceAttribute - Name of the affected Attribute
 * @param {string|number} event.newValue - The new value of the attribute (omitted for removals and clicks)
 * @param {string|number} event.previousValue - The previous value of the attribute (omitted for removals and clicks)
 * @param {string} event.triggerName - The complete trigger name of the event. If it is a click or removal, it will have `clicked:` or `remove:` prepended to it
 * @param {object} event.removedInfo - object containing all the attributes that were in the repeating row that was removed. Omitted on clicks/changes
 * @param {string} event.sourceType - A description of who initiated the event. `Sheetworker`, `Player`, or `API`
 */
const trigger = function(orig_event){
  const event = {...orig_event};
  event.sourceAttribute = event.sourceAttribute ||
    event.triggerName.replace(/^.+:/,'');
  const [action = 'change',section,attr] = event.triggerName
    .match(/^(?:(clicked|removed|sheet|change):)?(?:(repeating_[^_]+)_[^_]+_?)?(.*?)$/)
    .slice(1);
  if(event.sourceAttribute && event.hasOwnProperty('newValue')){
    sheetState[event.sourceAttribute] = event.newValue;
  }
  const matchListeners = [
    ...(listeners[`${action}:${attr}`]||[]),
    ...(listeners[`${action}:${section}`]||[]),
    ...(listeners[`${action}:${section}:${attr}`]||[])
  ]
  matchListeners.forEach(f=>f(event));
};