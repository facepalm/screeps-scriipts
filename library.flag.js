



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


var findAllFlags = function(room,flagType){
    //locates and returns all flags of the specified type
    var flags = room.find(FIND_FLAGS);
    var out = [];
    for (var f in flags){
        var flag = flags[f];
        if (flagType == 'MINING' && flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_YELLOW){
            out.push(flag);
        }
        if (flagType == 'BUILDSPOT_INACTIVE' && flag.color == COLOR_GREY && flag.secondaryColor == COLOR_GREY){
            out.push(flag);
        }
        if (flagType == 'BUILDSPOT_ACTIVE' && flag.color == COLOR_GREY && flag.secondaryColor == COLOR_CYAN){
            out.push(flag);
        }
        
    }
    return out;
};
module.exports.findAllFlags = findAllFlags;

