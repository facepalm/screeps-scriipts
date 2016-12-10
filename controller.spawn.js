/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('controller.spawn');
 * mod.thing == 'a thing'; // true
 */



var util = require('library.utility');
var strat = require('library.strategy');

var spawnController = {

    run: function(spawn) {
        
        //console.log('parts test:',util.util.partsList('Harvester',550));
        
        //check if we have energy to spawn something
        if (spawn.room.energyAvailable >= spawn.room.energyCapacityAvailable * 1.0){
            //okay, we're gonna spawn something.  Calculate ratios of need vs availabilty
            var rmcreeps = spawn.room.find(FIND_MY_CREEPS);
            
            var worker_need = spawn.room.memory.repair_level + spawn.room.memory.build_level + 1000;
            var workers = _.filter(rmcreeps, (creep) => creep.memory.role == 'worker_bee');
            var worker_availability = workers.reduce(function(a, b) {
                                          return a + b.hitsMax;
                                        }, 0);
            console.log('worker availability',worker_availability);
            var ratio = {};
            ratio['worker_bee'] = (worker_need - worker_availability) / (worker_need + worker_availability + 1);
            
            var flag_hv = strat.findFlag(spawn.room,'MINING');
            var harvesters = _.filter(rmcreeps, (creep) => creep.memory.role == 'harvester');
            var harvester_availability = harvesters.reduce(function(a, b) {
                                          return a + b.hitsMax;
                                        }, 0);
        
            if (flag_hv){
                ratio['harvester'] = (spawn.room.memory.mining_flags - harvesters.length) / (spawn.room.memory.mining_flags + harvesters.length);
            }else{
                //no mining spots in this room
                ratio['harvester'] = -1;
            }
            
            var haulers = _.filter(rmcreeps, (creep) => creep.memory.role == 'hauler');
            var hauler_availability = haulers.reduce(function(a, b) {
                                          return a + b.hitsMax;
                                        }, 0);
        
            ratio['hauler'] = (spawn.room.memory.hauler_level - hauler_availability) / (spawn.room.memory.hauler_level + hauler_availability + 1);
            
            //TODO: military
            console.log(ratio['harvester'])
            
            var role = 'none'; var role_v = -1;
            for (var r in ratio){
                if (ratio[r] >= role_v){
                    role = r;
                    role_v = ratio[r];
                }
            }
            
            //var role 
            var role_n = role;
            var parts= util.util.partsList(role, spawn.room.energyAvailable)

            var newName = spawn.createCreep(parts, undefined, {role: role_n});
            console.log('Spawning new '+role_n+': ' + newName+' with priority '+role_v+ 'and body '+parts);
        
            
        }
        
    
        
        
    }
};

module.exports = spawnController;
