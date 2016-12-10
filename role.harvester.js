var strat = require('library.strategy');

var roleHarvester = {

    

    /** @param {Creep} creep **/
    run: function(creep) {

        if (!creep.memory.flag){
            var flag_nm = strat.findFlag(creep.room,'MINING');
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
                    console.log('Something very weird is happening with harvester '+creep.name);
                }
                
                //check for can
                if (Game.time % 250 == 25){
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
