/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.repairer');
 * mod.thing == 'a thing'; // true
 */

var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('repairing');
	    }

	    if(creep.memory.working) {
	        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(targets.length) {
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
	    }
	    else {
	        //if we aren't repairing, we must be fetching energy
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

module.exports = roleRepairer;
