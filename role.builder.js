var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('fetch nrg');
	    }
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('building');
	    }

	    if(creep.memory.working) {
	        if (!creep.memory.target || !Game.constructionSites[creep.memory.target]){
	            //find a new target
	            var targets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
	            creep.memory.target = targets.id;
            
	        }
	        if(creep.memory.target) {
                if(creep.build(Game.constructionSites[creep.memory.target]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.constructionSites[creep.memory.target]);
                }
            }else{
                //no target, apparently.  Return and try a different job
                return 0;
            }
	    }
	    else {
	        //if we aren't building, we must be fetching energy
	        
	        for (var s in creep.room.memory.estorage){
	            var obj = Game.getObjectById(s);
	            var withd = creep.withdraw(obj,RESOURCE_ENERGY,50);
	            if (withd == ERR_NOT_IN_RANGE) {
                    creep.moveTo(obj);
                }
	        }
	    }
	    return 1;
	}
};

module.exports = roleBuilder;
