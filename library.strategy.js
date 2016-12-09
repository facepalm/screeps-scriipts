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
        
        var objlist = room.lookAtArea(s.pos.y-1, s.pos.x-1, s.pos.y+1, s.pos.x+1, asArray=true);
        var currx = 0;
        var curry = 0;
        var currvalid = false;
        for (var obj in objlist){
            if (obj['x'] != currx || obj['y'] != curry){
                if (currvalid){
                    //we had a valid point
                    room.createFlag(currx,curry,color=COLOR_YELLOW,secondaryColor=COLOR_YELLOW);
                    break;
                }else{
                    currvalid=true;
                }
            }
            currx = obj['x'];
            curry = obj['y'];
            
            if (obj['type'] == 'terrain' and obj['terrain'] != 'normal'){
                //WILL NOT MINE FROM SWAMP.  This may not be a bad thing
                currvalid = false;
            }else if (obj['type'] == 'structure'){
                //no building on buildings, the can needs to go here
                curr valid = false;
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
    
