/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('library.utility');
 * mod.thing == 'a thing'; // true
 */




    
var plantFlags = function (room) {
    //given a room to set up, establishes flags denoting locations of future behavior
    
    //spawn position (?)
    
    //source points, one miner per source (inefficient at first, but quickly enough one creep will drain it)
    var sources = room.find(FIND_SOURCES);
    for (var s in sources){
        var spos = sources[s].pos;
        var objlist = room.lookAtArea(spos.y-1, spos.x-1, spos.y+1, spos.x+1, true);
        var currx = 0;
        var curry = 0;
        var currvalid = false;
        
        for (var o in objlist){
            var obj = objlist[o];
            if (obj['x'] != currx || obj['y'] != curry){
                if (currvalid){
                    //we had a valid point
                    console.log(obj['x']+ ' '+currx)
                    var flagname = room.createFlag(currx,curry,undefined,COLOR_YELLOW,COLOR_YELLOW);
                    Game.flags[flagname].memory.source = sources[s].id;
                    
                    break;
                }else{
                    currvalid=true;
                }
            }
            currx = obj['x'];
            curry = obj['y'];
            
            
            
            if (obj['type'] == 'terrain' && obj['terrain'] != 'plain'){
                //WILL NOT MINE FROM SWAMP.  This may not be a bad thing
                currvalid = false;
            }else if (obj['type'] == 'structure' || obj['type'] == 'source'){
                //no building on buildings, the can needs to go here
                currvalid = false;
            }
            
        }
    }
    
    //storage can next to controller
    
    //building site expansions
    
    //walls
    
    //tower sites
    
    return true;  
};

var findFlag = function(room,flagType){
    //locates and returns a flag of the specified type
    if (flagType == 'MINING'){
        //return EMPTY miner flag
        var flags = room.find(FIND_FLAGS);
        for (var f in flags){
            var flag = flags[f];
            if (flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_YELLOW 
                    && (!flag.memory.creep || !Game.creeps[flag.memory.creep])){
                return flag.name      
            }
        }
    }
    return undefined;
};
    
var test = function () {};    
    
    
    //strat.plantFlags = plantFlags;
      
module.exports.plantFlags = plantFlags;
module.exports.findFlag = findFlag;
module.exports.test = test;
    
