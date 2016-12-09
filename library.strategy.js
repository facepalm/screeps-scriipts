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
                    room.createFlag(currx,curry,undefined,COLOR_YELLOW,COLOR_YELLOW);
                    break;
                }else{
                    currvalid=true;
                }
            }
            currx = obj['x'];
            curry = obj['y'];
            
            
            
            if (obj['type'] == 'terrain' && obj['terrain'] != 'normal'){
                //WILL NOT MINE FROM SWAMP.  This may not be a bad thing
                currvalid = false;
            }else if (obj['type'] == 'structure'){
                //no building on buildings, the can needs to go here
                currvalid = false;
            }
            
        }
    }
    
    //storage can next to controller
    
    //building site expansions
    
    //walls
    
    //tower sites
    
        
    };
    
var test = function () {};    
    
    
    //strat.plantFlags = plantFlags;
      
module.exports.plantFlags = plantFlags;
module.exports.test = test;
    
