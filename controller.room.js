/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('controller.room');
 * mod.thing == 'a thing'; // true
 */

var roleHarvester = require('role.harvester');
var roleBee = require('role.worker_bee');
var roleHauler = require('role.hauler');
var roleUpgrader = require('role.upgrader');

var builder = require('library.build');
var util = require('library.utility');

var strat = require('library.strategy');

var flag_lib = require('library.flag');

var controllerRoom = {

    /** @param {Room} room **/
    run: function(room) {
        
        if (!room.memory.planted){
            builder.dropPlanningFlags(room);
            room.memory.planted = flag_lib.plantFlags(room);
            builder.dropBuilding(room,STRUCTURE_CONTAINER);
            room.memory.strategic_role = 'PRIMARY_BASE';
            room.memory.need_cans = false;
            room.memory.build_walls = false;
            room.memory.build_idle = false;
            
            room.memory.build_queue = [];
        }
        
        /* start a timer to space out probably-expensive update operations */
        if (!room.memory.einputs){ room.memory.einputs = {}; }
        if (!room.memory.estorage){ room.memory.estorage = {}; }
        if (!room.memory.endpoints){ room.memory.endpoints = {}; }
        if (!room.memory.tech_level){ room.memory.tech_level = 0 }
        
        
        //Go over storage dicts, strip dead buildings
        for (var i in room.memory.einputs){
            if (!Game.getObjectById(i)){
                console.log('Deleting from einputs:',i);
                delete room.memory.einputs[i];
            }
        }
        for (var i in room.memory.estorage){
            if (!Game.getObjectById(i)){
                console.log('Deleting from estorage:',i);
                delete room.memory.estorage[i];
            }
        }
        for (var i in room.memory.endpoints){
            if (!Game.getObjectById(i)){
                console.log('Deleting from endpoints:',i);
                delete room.memory.endpoints[i];
            }
        }
        
        if (Game.time % 100 == 0){
            
            /*Re-establish tech levels.  Issue build checks.*/
            var cont_lvl = room.controller.level;
            
            if (room.memory.strategic_role == 'PRIMARY_BASE') {
                //primary bases focus on building up extensions and harvesting ops
                if (room.memory.tech_level == 0){
                    /*
                    * At TL0, goal is to build a spawn
                    * Upgrade reqr: spawn
                    */
                    var targets = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
                    if (targets.length > 0){
                        room.memory.tech_level = 1;
                    }
                }
                if (room.memory.tech_level == 1){
                    /*
                    * At TL1, goal is to occupy source spots
                    * Upgrade reqr: low harvest_level
                    */
                    //var depositTargets = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } });
                    //if (depositTargets.length > 0){
                    if (Game.time > 180 && !flag_lib.findFlag(room,'MINING')){
                        room.memory.tech_level = 2;
                    }
                }
                if (room.memory.tech_level == 2){
                    /*
                    * At TL2, goal is to upgrade controller, build acceptor container next to it.
                    * Upgrade reqr: controller lvl 2
                    */
                    if (room.controller.level > 1){
                        room.memory.tech_level = 3;
                    }
                }
                if (room.memory.tech_level == 3){
                    /*
                    * At TL3, goal is to build extensions, begin to differentiate creeps
                    * Upgrade reqr: 5 extensions
                    */
                    var extensions = room.find(FIND_STRUCTURES, {
                        filter: { structureType: STRUCTURE_EXTENSION }
                    });
                    if (room.controller.level >= 2 && extensions.length >= 5){
                        room.memory.tech_level = 4;
                    }
                }
                if (room.memory.tech_level == 4){
                    /*
                    * At TL4, goal is to upgrade controller again
                    * Upgrade reqr: controller lvl 3
                    * This will take a while, so we'll enable idle/vanity building
                    */
                    room.memory.build_idle = true;
                    if (room.controller.level > 2){
                        room.memory.tech_level = 5;
                        room.memory.build_idle = false;                        
                    }
                    
                }
                if (room.memory.tech_level == 5){
                    /*
                    * At TL5, goal is to build tower
                    * Upgrade reqr: tower
                    */
                    var extensions = room.find(FIND_STRUCTURES, {
                        filter: { structureType: STRUCTURE_TOWER }
                    });
                    if (extensions.length > 0){
                        room.memory.tech_level = 6;
                    }
                    
                }
                if (room.memory.tech_level == 6){
                    /*
                    * At TL6, goal is to build add'l extensions
                    * Upgrade reqr: 10 extensions
                    */
                    var extensions = room.find(FIND_STRUCTURES, {
                        filter: { structureType: STRUCTURE_EXTENSION }
                    });
                    if (extensions.length >= 10){
                        room.memory.tech_level=7;
                    }
                    
                }
                if (room.memory.tech_level == 7){
                    /*
                    * At TL7, goal is to upgrade controller again
                    * Upgrade reqr: controller lvl 4
                    */
                    if (room.controller.level > 3){
                        room.memory.tech_level = 8;
                    }
                    
                }
            }
            //console.log('Current tech level:',room.memory.tech_level);
            
            switch(room.memory.tech_level){
                case 5:
                    //tower
                    var max_twrs = 0;
                    switch(room.controller.level){
                        case 8: max_twrs += 3;                        
                        case 7: max_twrs += 1;
                        case 5: max_twrs += 1;
                        case 3: max_twrs += 1;                        
                    }
                    var twrs = room.find(FIND_STRUCTURES, {
                            filter: function(structure) { return structure.structureType == STRUCTURE_TOWER; }
                         });
                    if (twrs.length < max_twrs){
                        builder.queueBuild(room,null,STRUCTURE_TOWER,true);
                        //builder.dropBuilding(room,STRUCTURE_CONTAINER);
                    }
                case 3:
                    //check for new extensions
                    
                    var extensions = room.find(FIND_STRUCTURES, {
                        filter: function(structure) { return structure.structureType == STRUCTURE_EXTENSION; }
                    });
                    
                    var unbuilt_extensions = room.find(FIND_CONSTRUCTION_SITES, {filter: function(site) {return site.structureType == STRUCTURE_EXTENSION;}});
                    if ((extensions.length + unbuilt_extensions.length) <  Math.max(0,5*(room.controller.level - 1), 10*(room.controller.level - 2)) ){
                        builder.queueBuild(room,null,STRUCTURE_EXTENSION, true);
                    }
                    
                case 2:
                    
                    var cont_cont = room.controller.pos.findInRange(FIND_STRUCTURES,2, {
                        filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
                        });
                    if (cont_cont.length){
                        room.memory.estorage[cont_cont[0].id] = true;
                    }else{
                        //drop new container
                        if (util.util.checkSite(room.controller.pos,2) <= 1){
                            var site = builder.builder.findSite(room,room.controller.pos,1);
                            if (site){
                                builder.queueBuild(room,site,STRUCTURE_CONTAINER,true);
                            }
                            //site.createConstructionSite(STRUCTURE_CONTAINER);
                            //builder.builder.buildSpurRoad(site);
                        }
                    }
                //end cases                
            }
        }
        
        //check for and possibly drop new building sites
        var sites = room.find(FIND_CONSTRUCTION_SITES);
        if (sites.length < 6 && room.memory.build_queue.length > 0){
            //check if first entry is a priority job, or if we're idle building          
            if (!room.memory.build_queue[0].idle || room.build_idle){                
                var newsite = room.memory.build_queue.shift();
                if (!newsite.pos){
                    builder.dropBuilding(room, newsite.struct_type);
                }else{
                    newsite.pos.createConstructionSite(newsite.struct_type);
                }
            }
        }
        
        var hostile_hits = 0;
        var hostiles = room.find(FIND_HOSTILE_CREEPS);
        for (var h in hostiles){
            if (hostiles[h].owner == 'Source Keeper'){
                hostile_hits += hostiles[h].hits;
            }else{
                hostile_hits += hostiles[h].hits / 100;
            }
        }
        room.memory.threat_level = hostile_hits;
        //console.log('Threat level:', hostile_hits);
        
        if (Game.time % 120 == 0){
            //refresh extra energy points
            var xtra_a = room.find(FIND_MY_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_STORAGE })
            for (var a in xtra_a){
                room.memory.estorage[xtra_a[a].id] = true;
            }
            var xtra_a = room.find(FIND_MY_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_TOWER })
            for (var a in xtra_a){
                room.memory.endpoints[xtra_a[a].id] = true;
            }
        }
        
        
        //process energy flow
        room.memory.input_enrgy = 0
        room.memory.store_enrgy = 0
        room.memory.endpt_enrgy = 0
        room.memory.input_space = 0
        room.memory.store_space = 0
        room.memory.endpt_space = 0
        
        for (var d in room.memory.einput){
            var donor = Game.getObjectById(d)
            if (donor.structureType == STRUCTURE_CONTAINER){
                room.memory.input_enrgy += donor.store[RESOURCE_ENERGY];
                room.memory.input_space += donor.storeCapacity - donor.store[RESOURCE_ENERGY];
            }else{
                room.memory.input_enrgy += donor.energy;
                room.memory.input_space += donor.energyCapacity - donor.energy;
            }
        }
        for (var a in room.memory.estorage){
            var accpt = Game.getObjectById(a)
            if (accpt.structureType == STRUCTURE_CONTAINER || accpt.structureType == STRUCTURE_STORAGE){
                room.memory.store_enrgy += accpt.store[RESOURCE_ENERGY];
                room.memory.store_space += accpt.storeCapacity - accpt.store[RESOURCE_ENERGY];
            }else{
                room.memory.store_enrgy += accpt.energy;
                room.memory.store_space += accpt.energyCapacity - accpt.energy;
            }
        }
        for (var a in room.memory.endpoint){
            var accpt = Game.getObjectById(a)
            if (accpt.structureType == STRUCTURE_CONTAINER){
                room.memory.endpt_enrgy += accpt.store[RESOURCE_ENERGY];
                room.memory.endpt_space += accpt.storeCapacity - accpt.store[RESOURCE_ENERGY];
            }else{
                room.memory.endpt_enrgy += accpt.energy;
                room.memory.endpt_space += accpt.energyCapacity - accpt.energy;
            }
        }
        
        var nrg = room.find(FIND_DROPPED_ENERGY);
        var tot_nrg = nrg.reduce(function(a, b) { return a + b.amount; }, 0);
        
        room.memory.dropped_enrgy = tot_nrg;
        room.memory.harvest_level = room.memory.input_space + room.memory.store_space + room.memory.endpt_space;
        room.memory.hauler_level = Math.min(room.memory.input_enrgy + tot_nrg, room.memory.store_space) + Math.min(room.memory.store_enrgy + tot_nrg, room.memory.endpt_space);
        
        //build priority
        room.memory.build_level = 0;
        var bld = room.find(FIND_CONSTRUCTION_SITES)
        for (var b in bld){
            room.memory.build_level += bld[b].progressTotal - bld[b].progress;
        }
        
        room.memory.repair_level=0;
        var targets = room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
        for (var t in targets) {
            room.memory.repair_level += targets[t].hitsMax - targets[t].hits;
        }
        
        /* should be called by harvesters
        *if (!room.memory.sources_run){
            var srcs_built = builder.builder.setupSource(room)
            if (srcs_built){
                room.memory.sources_run = 1500; //check every 1500 ticks
            }else{
                room.memory.sources_run = 4500;
            }
        }else{
            room.memory.sources_run -= 1; 
        }*/
        
        //run creeps
        var room_creeps = room.find(FIND_MY_CREEPS);
        for(var name in room_creeps) {
            var creep = room_creeps[name];
            
            
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            
            if(creep.memory.role == 'worker_bee') {
                roleBee.run(creep);
                
            }
            if (creep.memory.role == 'hauler'){
                roleHauler.run(creep);
            }
            if (creep.memory.role == 'upgrader'){
                roleUpgrader.run(creep);
            }
    	}

	}
};

module.exports = controllerRoom;
