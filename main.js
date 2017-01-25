

var controllerRoom = require('controller.room');
var spawnController = require('controller.spawn');


module.exports.loop = function () {
    
    
    for(var name in Game.rooms) {
        var _room = Game.rooms[name];
        controllerRoom.run(_room);
    }


    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for (var name in Game.spawns){
        spawnController.run(Game.spawns[name]);
    }

}
