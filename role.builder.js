var util = require('library.utility');

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
	            //inherit room target if it exists
	            if (creep.room.memory.build_target){
	                creep.memory.target = creep.room.memory.build_target;
	            }else{
	                //find a new target, share with room
	                var targets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
	                if (targets){
	                    creep.memory.target = targets.id;
	                    creep.room.memory.build_target = targets.id;
	                }
	            }
            
	        }
	        if(creep.memory.target) {
	            var build = creep.build(Game.constructionSites[creep.memory.target])
	            switch (build){
	                case ERR_NOT_IN_RANGE:
	                    util.creepMove(creep,Game.constructionSites[creep.memory.target]);
	                    break;
	                case ERR_INVALID_TARGET:
	                    creep.memory.target = null;
	                    creep.room.memory.build_target = null;
	                    return 1;
	                case 0:
	                    //worked fine
	                    break
	                default:
	                    console.log('unusual build error returned: ' +build);
	            }                
            }else{
                //no target, apparently.  Return and try a different job
                return 0;
            }
	    }
	    else {
	        //if we aren't building, we must be fetching energy
	        util.fetchEnergy(creep);	        
	    }
	    return 1;
	}
};

module.exports = roleBuilder;
