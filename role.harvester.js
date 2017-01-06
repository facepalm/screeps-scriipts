var flag_lib = require('library.flag');
var util = require('library.utility');

var roleHarvester = {

    

    /** @param {Creep} creep **/
    run: function(creep) {

        if (!creep.memory.flag){        
            var flag_nm = flag_lib.findFlag(creep.room,'MINING');
            if (flag_nm){
                creep.memory.flag = flag_nm;
                Game.flags[flag_nm].memory.creep = creep.name;
            }
        
        }
        
        if (creep.memory.flag){
            var flag = Game.flags[creep.memory.flag];
            if (creep.pos.inRangeTo(flag.pos, 0)){
                var harv = creep.harvest(Game.getObjectById(flag.memory.source));
                if( harv == ERR_NOT_IN_RANGE) {
                    console.log('Something very weird is happening with harvester '+creep.name+' '+harv);
                }
                
                //check for can
                if (Game.time % 250 == 25 && creep.room.memory.need_cans){
                    var cons = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                    var strc = creep.pos.findInRange(FIND_STRUCTURES, 0, {
                        filter: { structureType: STRUCTURE_CONTAINER }
                        });
                    
                    if (!cons.length && !strc.length){
                        creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                    }
                    
                    if (strc.length){
                        creep.room.memory.einputs[strc[0].id] = true;
                    }
                }
            }else{
                util.creepMove(creep,flag);
            }
            
            
        }
	}
};

module.exports = roleHarvester;
