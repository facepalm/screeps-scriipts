var strat = require('library.strat');

var roleHarvester = {

    

    /** @param {Creep} creep **/
    run: function(creep) {

        if (!creep.memory.flag){
            var flag_id = strat.findFlag(creep.room,'MINING');
            if (flag_id){
                creep.memory.flag = flag_id;
                flag.memory.creep = creep.id;
            }
        
        }
        
        if (creep.memory.flag){
            var flag = Game.getObjectById(creep.memory.flag);
            if (creep.pos.inRangeTo(flag.pos, 0)){
                var harv = creep.harvest(Game.getObjectById(flag.memory.source));
                if( harv == ERR_NOT_IN_RANGE) {
                    console.log('Something very weird is happening with harvester '+creep.name);
                }
                
                //check for can
                if (Game.time % 250 == 25){
                    var cons = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                    var strc = creep.pos.findInRange(FIND_MY_STRUCTURES, 0, {
                        filter: { structureType: STRUCTURE_CONTAINER }
                        });
                    
                    if (!cons.length && !strc.length){
                        creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                    }
                }
            }else{
                creep.moveTo(flag);
            }
            
            
        }
        /*
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
        }*/

	}
};

module.exports = roleHarvester;
