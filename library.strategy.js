/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('library.utility');
 * mod.thing == 'a thing'; // true
 */



var util = require('library.utility');
var builder = require('library.build');
var flag_lib = require('library.flag');
    
if (!Memory.plan){
    Memory.plan = {room:{}};
}
    
var initRoom = function(room){
    if (!room.memory.initialized){ //TODO eventually handle reinitializations
        room.memory.initialized = true;
        Memory.plan.room[room.name] = {};            
        Memory.plan.room[room.name].spot_build = builder.countPlanningFlags(room);    
        Memory.plan.room[room.name].spot_mine = room.find(FIND_SOURCES).length;
        
        Memory.plan.room[room.name].role = 'PRIMARY_BASE';
        Memory.plan.room[room.name].need_cans = false;
        Memory.plan.room[room.name].build_walls = false;
    }
}

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

      
    
    
    //strat.plantFlags = plantFlags;
      



    

    
    
