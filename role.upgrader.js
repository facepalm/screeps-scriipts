var util = require('library.utility');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('fetch nrg');
	    }
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('upgrading');
	    }

	    if(creep.memory.working) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                util.creepMove(creep,creep.room.controller);
            }
        }
        else {
            //if we aren't upgrading, we must be fetching energy
	        util.fetchEnergy(creep);
        }
	}
};

module.exports = roleUpgrader;
