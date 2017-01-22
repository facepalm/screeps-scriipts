

var util = require('library.utility');
//var build = require('library.build');

var plantFlag = function(pos,name,color,secolor){
    //check that there's not already a flag here
    var locflags = pos.findInRange(FIND_FLAGS,0);
    if (!locflags.length){
        return pos.createFlag(name,color,secolor); //TODO check for flag planting errors
    }
    return undefined;
};module.exports.plantFlag = plantFlag;

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
                    var flagname = plantFlag(room.getPositionAt(currx,curry),undefined,COLOR_YELLOW,COLOR_YELLOW);
                    if (flagname){ Game.flags[flagname].memory.source = sources[s].id;}
                    
                    break;
                }else{
                    currvalid=true;
                }
            }
            currx = obj['x'];
            curry = obj['y'];
            
            
            
            if (obj['type'] == 'terrain' && (obj['terrain'] == 'wall')){
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
                start_flag = plantFlag(room.getPositionAt(x-2,y+2),undefined,COLOR_GREY,COLOR_RED);                
            }
        }else{
            //wall
            if(start_flag){
                var end_flag = plantFlag(room.getPositionAt(x+1,y+2),undefined,COLOR_GREY,COLOR_BLUE);  
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
                start_flag = plantFlag(room.getPositionAt(x-2,y-2),undefined,COLOR_GREY,COLOR_RED);                
            }
        }else{
            //wall
            if(start_flag){
                var end_flag = plantFlag(room.getPositionAt(x-2,y+1),undefined,COLOR_GREY,COLOR_BLUE);  
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
                start_flag = plantFlag(room.getPositionAt(x+2,y-2),undefined,COLOR_GREY,COLOR_RED);                
            }
        }else{
            //wall
            if(start_flag){
                var end_flag = plantFlag(room.getPositionAt(x-1,y-2),undefined,COLOR_GREY,COLOR_BLUE);  
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
                start_flag = plantFlag(room.getPositionAt(x+2,y+2),undefined,COLOR_GREY,COLOR_RED);                
            }
        }else{
            //wall
            if(start_flag){
                var end_flag = plantFlag(room.getPositionAt(x+2,y-1),undefined,COLOR_GREY,COLOR_BLUE);  
                Game.flags[start_flag].memory.end = end_flag;
                Game.flags[end_flag].memory.start = start_flag;
                start_flag = undefined;
            }
        }
    }
    
    //tower sites
    
    return true;  
}; 
module.exports.plantFlags = plantFlags;

var currentFlagFilter = '';
var flagFilter = function(flag){
    if (!flag){ //TODO return false if not a flag
        return false;
    }
    if (!currentFlagFilter){ //no filter
        return true;
    }
    if (currentFlagFilter == 'FREE MINING' && flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_YELLOW 
                    && (!flag.memory.creep || !Game.creeps[flag.memory.creep])){
        //EMPTY mining flag - right color, doesn't have a valid creep in memory
        return true;    
    }
    if (currentFlagFilter == 'ANY MINING' && flag.color == COLOR_YELLOW){
        return true;
    }
    if (currentFlagFilter == 'ANY BUILD' && flag.color == COLOR_GREY){
        return true;
    }
    if (currentFlagFilter == 'ANY BUILDSPOT' && flag.color == COLOR_GREY && (flag.secondaryColor == COLOR_GREY || flag.secondaryColor == COLOR_CYAN)){
        return true;
    }
    if (currentFlagFilter == 'BUILDSPOT_INACTIVE' && flag.color == COLOR_GREY && flag.secondaryColor == COLOR_GREY){
        return true;
    }
    if (currentFlagFilter == 'BUILDSPOT_ACTIVE' && flag.color == COLOR_GREY && flag.secondaryColor == COLOR_CYAN){
        return true;
    }
};

var findFlag = function(room,flagType){
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
    return undefined;
};
module.exports.findFlag = findFlag;

var findFlagsNear = function(pos,range,flagType){
    if (!range){ range = 0; }
    var locflags = pos.findInRange(FIND_FLAGS,range);
    if (!flagType || locflags.length == 0){
        return locflags;
    }
    currentFlagFilter = flagType;
    return locflags.filter(flagFilter);        
};
module.exports.findFlagsNear = findFlagsNear;


var findAllFlags = function(room,flagType){
    //locates and returns all flags of the specified type
    var flags = room.find(FIND_FLAGS);
    currentFlagFilter = flagType;
    return flags.filter(flagFilter);            
};
module.exports.findAllFlags = findAllFlags;

