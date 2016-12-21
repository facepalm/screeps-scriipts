/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('library.utility');
 * mod.thing == 'a thing'; // true
 */



var util = require('library.utility');
var build = require('library.build');
var flag = require('library.flag');
    
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
    //simple wall: just two flags denoting a straight wall to cover an entrance.
    var x = 0;
    var y = 0;
    var start_flag = undefined;    
    for (x=0;x<50;x++){
        var terrain = util.terrainAt(x,y,room);
        if (terrain == 'plain'){
            if (!start_flag){
                start_flag = room.createFlag(x-1,y+1,undefined,COLOR_GREY,COLOR_RED);                
            }
        }else{
            //wall
            if(start_flag){
                var end_flag = room.createFlag(x,y+1,undefined,COLOR_GREY,COLOR_BLUE);  
                Game.flags[start_flag].memory.end = end_flag;
                Game.flags[end_flag].memory.start = start_flag;
                start_flag = undefined;
            }
        }
    }
    x=49;
    for (y=0;y<50;y++){
        var terrain = util.terrainAt(x,y,room);
        if (terrain == 'plain'){
            if (!start_flag){
                start_flag = room.createFlag(x-1,y-1,undefined,COLOR_GREY,COLOR_RED);                
            }
        }else{
            //wall
            if(start_flag){
                var end_flag = room.createFlag(x-1,y,undefined,COLOR_GREY,COLOR_BLUE);  
                Game.flags[start_flag].memory.end = end_flag;
                Game.flags[end_flag].memory.start = start_flag;
                start_flag = undefined;
            }
        }
    }
    y=49;
    for (x=49;x>=0;x--){
        var terrain = util.terrainAt(x,y,room);
        if (terrain == 'plain'){
            if (!start_flag){
                start_flag = room.createFlag(x+1,y-1,undefined,COLOR_GREY,COLOR_RED);                
            }
        }else{
            //wall
            if(start_flag){
                var end_flag = room.createFlag(x,y-1,undefined,COLOR_GREY,COLOR_BLUE);  
                Game.flags[start_flag].memory.end = end_flag;
                Game.flags[end_flag].memory.start = start_flag;
                start_flag = undefined;
            }
        }
    }
    x=0;
    for (y=49;y>=0;y--){
        var terrain = util.terrainAt(x,y,room);
        if (terrain == 'plain'){
            if (!start_flag){
                start_flag = room.createFlag(x+1,y+1,undefined,COLOR_GREY,COLOR_RED);                
            }
        }else{
            //wall
            if(start_flag){
                var end_flag = room.createFlag(x+1,y,undefined,COLOR_GREY,COLOR_BLUE);  
                Game.flags[start_flag].memory.end = end_flag;
                Game.flags[end_flag].memory.start = start_flag;
                start_flag = undefined;
            }
        }
    }
    
    //tower sites
    
    return true;  
};

/*var findFlag = function(room,flagType){
    //locates and returns a flag of the specified type
    if (flagType == 'MINING'){
        //return EMPTY miner flag
        var flags = room.find(FIND_FLAGS);
        room.memory.mining_flags = flags.length;
        for (var f in flags){
            var flag = flags[f];
            if (flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_YELLOW 
                    && (!flag.memory.creep || !Game.creeps[flag.memory.creep])){
                return flag.name      
            }
        }
    }
    if (flagType == 'BUILDSPOT'){
        
    }
    return undefined;
};
module.exports.findFlag = findFlag;
*/

    
var test = function () {};    
    
    
    //strat.plantFlags = plantFlags;
      
module.exports.plantFlags = plantFlags;
module.exports.test = test;

    
var dropPlanningFlags = function(room){
    var x = 0;
    var y = 0;
    for (x=4;x<=44;x+=5){
        for (y=4;y<=44;y+=5){
            if (build.checkBuildable(room,x,y,2,2)){
                var flagname = room.createFlag(x,y,undefined,COLOR_GREY,COLOR_GREY);    
            }
        }
    }
    
    
    
}
module.exports.dropPlanningFlags = dropPlanningFlags;
    
    
