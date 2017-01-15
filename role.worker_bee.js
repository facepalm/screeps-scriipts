/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.worker_bee');
 * mod.thing == 'a thing'; // true
 */

var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');

var roleBee = {
    
    

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var UNASSIGNED = 0;
        var BUILD = 10;
        var UPGRADE = 20;
        var REPAIR = 30;
        
        if (!creep.memory.subrole){creep.memory.subrole = UNASSIGNED;}
        
        //worker bees try to balance between repair and building, acc'd to room requirements
        if (creep.memory.subrole == UNASSIGNED){
            if (creep.room.memory.repair_level > creep.room.memory.build_level){
                creep.memory.subrole = REPAIR;
            } else {
                creep.memory.subrole = BUILD;
            }
        }
        
        if (creep.memory.subrole == REPAIR){
            var status = roleRepairer.run(creep);
            if (status == 0) {
                creep.memory.subrole = BUILD;
            }
        }
        
        if (creep.memory.subrole == BUILD){
            var status = roleBuilder.run(creep);
            if (status == 0) {
                creep.memory.subrole = UPGRADE;
            }
        }
        
        if (creep.memory.subrole == UPGRADE){
            var status = roleUpgrader.run(creep);
            if (status == 0) {
                creep.memory.subrole = UNASSIGNED;
            }
        }
        
        if (Game.time % 10 == 0 && Math.random() < 0.1 ){
            creep.memory.subrole = UNASSIGNED;
        }
        
        
        /*

        if (dediUpgraders == 0){
            roleUpgrader.run(creep);
            dediUpgraders += 1;
            continue;
        }
        
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(targets.length > 2*dediBuilders){
            roleBuilder.run(creep);
            dediBuilders += 1;
            continue;
        }
        roleHarvester.run(creep);
        */


        
	}
};

module.exports = roleBee;
