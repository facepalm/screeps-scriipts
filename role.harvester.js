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
};

module.exports = roleHarvester;
