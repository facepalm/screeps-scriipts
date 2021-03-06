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
var flag_lib = require('library.flag');

var force_spawn_interval = 300; //time for a spawn to fill naturally

var spawnController = {

    run: function(spawn) {
        
        //console.log('parts test:',util.util.partsList('Harvester',550));
        var force = false;
        if (!spawn.room.memory.force_spawn || Game.time > spawn.room.memory.force_spawn){
            console.log('No spawn tests for designated spawn interval. Trying to force something...');
            force = true;
        }
        
        //check if we have energy to spawn something (or are forced to try)
        if (force || Game.time % (spawn.room.energyCapacityAvailable/50*3) == 0 && spawn.room.energyAvailable >= spawn.room.energyCapacityAvailable * 1.0){
            
            spawn.room.memory.force_spawn = Game.time + force_spawn_interval;
            
            //okay, we're gonna spawn something.  Calculate ratios of need vs availabilty
            var rmcreeps = spawn.room.find(FIND_MY_CREEPS);
            var worker_mult = 4;
            
            //worker need is min of how much we have to build, and how much energy we have to build with
            var worker_need = Math.min(spawn.room.memory.repair_level + spawn.room.memory.build_level, 
                                        spawn.room.memory.store_enrgy + spawn.room.memory.dropped_enrgy) + 1;
            var workers = _.filter(rmcreeps, (creep) => creep.memory.role == 'worker_bee');
            var worker_availability = worker_mult * workers.reduce(function(a, b) {
                                          return a + b.hitsMax;
                                        }, 0);
            console.log('worker availability',worker_availability);
            var ratio = {};
            ratio['worker_bee'] = (worker_need - worker_availability) / (worker_need + worker_availability + 1);
            
            var flag_hv = flag_lib.findFlag(spawn.room,'MINING');
            var harvesters = _.filter(rmcreeps, (creep) => creep.memory.role == 'harvester');
            var harvester_availability = harvesters.reduce(function(a, b) {
                                          return a + b.hitsMax;
                                        }, 0);
        
            if (flag_hv){
                ratio['harvester'] = 0.8;//(spawn.room.memory.mining_flags - harvesters.length) / (spawn.room.memory.mining_flags + harvesters.length);
            }else{
                //no mining spots in this room
                if (Game.time < 5){
                    ratio['harvester'] = 1;
                }else{                
                    ratio['harvester'] = -1;
                }
            }
            
            var haulers = _.filter(rmcreeps, (creep) => creep.memory.role == 'hauler');
            var hauler_availability = haulers.reduce(function(a, b) {
                                          return a + b.hitsMax;
                                        }, 0);
        
            ratio['hauler'] = (spawn.room.memory.hauler_level+0.9 - hauler_availability) / (spawn.room.memory.hauler_level + hauler_availability + 1);
            
            //TODO: military
            
            
            var role = 'none'; var role_v = -1;
            for (var r in ratio){
                console.log('Spawn rating:',r, ratio[r])
                if (ratio[r] >= role_v){
                    role = r;
                    role_v = ratio[r];
                }
            }
            
            if (role_v < 0.5){
                if (spawn.room.memory.upgrade_unit){
                    //check if it's broken, delete it if so
                    if(!Game.creeps[spawn.room.memory.upgrade_unit]) {
                        spawn.room.memory.upgrade_unit = null;
                    }
                }
                if (!spawn.room.memory.upgrade_unit){ //not an else, we might have cleared the var above
                    var parts= util.partsList('upgrader', spawn.room.energyAvailable)

                    spawn.room.memory.upgrade_unit = spawn.createCreep(parts, undefined, {role: 'upgrader'});
                    
                    console.log('Spawning new upgrade bug: '+spawn.room.memory.upgrade_unit+'!');
                    role_v = 0;
                }
            
            }
            
            //var role 
            if (role_v > 0){
                var role_n = role;
                var parts= util.partsList(role, spawn.room.energyAvailable)

                var newName = spawn.createCreep(parts, undefined, {role: role_n});
                console.log('Spawning new '+role_n+': ' + newName+' with priority '+role_v+ ' and body '+parts);
            }else{
                console.log('Spawning nothing due to lack of demand');
            }            
            
        }
        
    
        
        
    }
};

module.exports = spawnController;
