var builder = require('library.build');

var roleHarvester = {

    

    /** @param {Creep} creep **/
    run: function(creep) {

        var gotoSource = function(source){
            
            if (!source) return false;
            var harv = creep.harvest(source);
            if( harv == ERR_NOT_IN_RANGE) {
                var check = creep.moveTo(source);
                if (check == ERR_NO_PATH){
                    return false;
                }
            }
            return true;
        }
        
	    if(creep.carry.energy < creep.carryCapacity) {
	        //go to cached source, if exists
	        if (! gotoSource(Game.getObjectById(creep.memory.source))) {
                var sources = creep.room.find(FIND_SOURCES);
                for (var s in sources){
                    var src = gotoSource(sources[s]);
                    creep.say(src)
                    if (src){
                        creep.memory.source = sources[s].id;
                        break;
                    }
                }
	        }
        }
        else {
            var loaded = 1
            /* Find close depository */
            var depositTargets = creep.pos.findInRange(FIND_STRUCTURES,2, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
                    });
            if (depositTargets.length > 0){
                creep.room.memory.einputs[depositTargets[0].id] = true;
                var check = creep.transfer(depositTargets[0],RESOURCE_ENERGY)
                if (check == 0){ loaded = 0; }
            }else{
                if (creep.memory.source){
                    builder.builder.setupSource(Game.getObjectById(creep.memory.source));
                }
            }
            if (loaded){
                var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                                structure.energy < structure.energyCapacity;
                        }
                });
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
            }
        }
	}
};

module.exports = roleHarvester;
