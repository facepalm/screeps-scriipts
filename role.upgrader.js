var util = require('library.utility');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.workingg = true;
	        creep.say('upgrading');
	    }

	    if(creep.memory.working) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            //if we aren't upgrading, we must be fetching energy
	        if (!creep.memory.esource){                
	            creep.memory.esource = util.findClosestEnergy(creep,creep.carryCapacity);             
	        }
	        if (creep.memory.esource){
	            var obj = Game.getObjectById(creep.memory.esource);
	            if (creep.pos.getRangeTo(obj) <= 1){
	                if (obj.amount){
	                    creep.pickup(obj);
	                }else{
	                    creep.withdraw(obj,RESOURCE_ENERGY,creep.carryCapacity);
	                }
	                creep.memory.esource = undefined;
	            }else{
	                var moved = creep.moveTo(obj);	                
	            }
	        }
        }
	}
};

module.exports = roleUpgrader;
