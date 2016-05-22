'use strict';

	var err = j2Ds.getErrorManager(),
		scene = j2Ds.getSceneManager(),
		gs = j2Ds.getGameStateManager(),
		tm = j2Ds.getTextureManager(),
		m = j2Ds.getMathManager(),
		res = j2Ds.getResourceManager(),
		io = j2Ds.getIO(),
		lr = j2Ds.getLayerManager(),
		dom = j2Ds.getDOMManager(),
		tr = j2Ds.getTriggerManager();
	

	scene.init(800, 600);
	scene.setAutoClear(true);


	var background = lr.add('background', -1).fill('#D2F0FF');
	
	var user = {
		score : 0,
		record : 0,
		id : '',
		name : 'none',
		avatar : '',
		loaded : false
	},
	
	addEnemy = tr.add('addEnemy', function(){
		enemy.add();
		user.score +=1;
	}),
	clearAll = function(){
		enemy.nodes = [];
		acopter.bullets = [];
	}, 
	enemy = {
		nodes : [],

		add : function(two){
			var dY = m.random(50, 550);
			var dX = scene.width+m.random(50, 550);
			if (two){
				var e = scene.addSpriteNode(m.v2f(dX, dY), m.v2f(112/1.5, 99/1.5), imageMap.sprite.getAnimation(288, 100, 112, 99, 1));
			} else {
				var e = scene.addSpriteNode(m.v2f(dX, dY), m.v2f(95/1.5, 80/1.5), imageMap.sprite.getAnimation(288, 0, 95, 80, 1));
			}
			this.nodes.push(e);
		},


		moveAll : function(){
			for (var i=0, len = this.nodes.length; i<len; i+=1){
				if (!this.nodes[i]) continue;
				this.nodes[i].move(m.v2f(-1, 0));
				this.nodes[i].draw();

				if (this.nodes[i].isIntersect(acopter.copter)){
					scene.setGameState('mainMenu');
					clearAll();
					if (user.score > user.record){
						VK.api('storage.set', {user_id : user.id, key : 'score', value : user.score}, function(data){
							user.record = user.score;
						});
					};
					break;
				}

				if(this.nodes[i].isOutScene().x < 0){
					this.nodes.splice(i, 1);
					this.add(1);
					this.add(1);
				}
			for (var j = 0, lenj = acopter.bullets.length; j<lenj; j+=1){
				if (this.nodes[i].isIntersect(acopter.bullets[j])){
					this.nodes.splice(i, 1);
					acopter.bullets.splice(j, 1);

					this.add();
					
					break;
				}
				
			}
			}
		}
	},

	tree = {
		trees : [],

		addTree : function(){
			var n = m.random(1, 5);
			var x = this.trees.length ? this.trees[this.trees.length-1].getPosition().x :100;
			var t = scene.addSpriteNode(m.v2f(x+scene.width+m.random(50, 300), scene.height-153/n), m.v2f(132/n, 153/n), imageMap.sprite.getAnimation(133, 0, 132, 153, 1));
			this.trees.push(t)
		},

		move : function(i){
			var x = this.trees[i-1] ? this.trees[i-1].getPosition().x : 100;
			this.trees[i].setPosition().x = x + scene.width+m.random(50, 300);
		},

		moveTree : function(){
			for (var i=0, len = this.trees.length; i<len; i+=1){
			
				this.trees[i].move(m.v2f(-2, 0));
				this.trees[i].draw();
				if (this.trees[i].getPosition().x< -49){
					
					this.move(i);
				}
			}
		}
	},

	imageMap = {
		avatar : false,
		sprite : false
	},
	text = scene.addTextNode(m.v2f(0,0), '', 23, '#1E90FF', 'sans-serif', 0, 0),
	avatar, copterMenu,

	 acopter = {
		copter : false,
		hp : 100,
		bullets : [],
		fire : function(){
			var o = scene.addCircleNode(m.v2f(this.copter.getPosition().x+30, this.copter.getPosition().y+30), 3, 'red');
			this.bullets.push(o);
		},
		moveBullets : function(){
			for (var i = 0, len = this.bullets.length; i<len; i+=1){
				if (!this.bullets[i]) continue;
				this.bullets[i].move(m.v2f(5, 0));
				this.bullets[i].draw();
				if (!this.bullets[i].isLookScene()){
					this.bullets.splice(i, 1);
				}
			}
		}
		},

	menuItems = {
		tmp : false,
		newGame : scene.addTextNode(m.v2f(330, 150), 'Новая игра', 30, 'white', 0, 10, ' #1E90FF'),
		//records : scene.addTextNode(m.v2f(330, 250), 'Твой рекорд: '+ (user.record ? user.record : '\nещё не установлен'), 25, 'white', 0, 5, " #1E90FF"),
		//exit : scene.addTextNode(m.v2f(330, 380), 'Выход', 30, 'white', 0, 10, " #1E90FF")
	};

	gs.add('connect', function() {
		if (user['loaded']) {
			imageMap.avatar = tm.loadImageMap(user['avatar']);
			imageMap.sprite = tm.loadImageMap('res/imagemap.png');
			scene.setGameState('loader');
		}
		text.drawSimpleText('Соединение..');
	});

	gs.add('loader', function(){
		
		if(res.show().added == res.show().loaded) {
    		avatar = scene.addSpriteNode(m.v2f(0,0), m.v2f(50, 50), imageMap.avatar.getAnimation(0, 0, 50, 50, 1));
    		copterMenu = scene.addSpriteNode(m.v2f(0,60), m.v2f(110, 102), imageMap.sprite.getAnimation(0, 0, 110, 102, 1));
    		acopter.copter = scene.addSpriteNode(m.v2f(35,100), m.v2f(110, 102), imageMap.sprite.getAnimation(0, 118, 110, 102, 1));
    		for (var i = 0; i < 40; i+=1) tree.addTree();

    		enemy.add();
			scene.setGameState('mainMenu');
			VK.api('storage.get', {user_id : user.id, key : 'score'}, function(data){
				user.record = data.response;
			});
		}
		text.drawSimpleText('Загрузка...');
	});

	gs.add('game', function(){
		text.drawSimpleText(user['name'] + ", " + ' твой счёт: '  + user['score'], m.v2f(55, 10));
		avatar.draw();
		if (io.isKeyDown('DOWN')){
			if (acopter.copter.getPosition().y < scene.height - 70)
			acopter.copter.move(m.v2f(0, 3));
		}
		if (io.isKeyDown('UP')){
			if (acopter.copter.getPosition().y > 50)
			acopter.copter.move(m.v2f(0, -3));
		}
		if (io.isKeyPress('SPACE')){
			acopter.fire();
		}

		acopter.copter.draw();
		acopter.moveBullets();
		tree.moveTree();
		enemy.moveAll();

		addEnemy.loop(5000);
	});

	gs.add('mainMenu', function(){
		var tmp = menuItems.newGame;
		//if (io.onNode(menuItems.records)){
		//	tmp = menuItems.records;
		//}
		//if (io.onNode(menuItems.exit)){
		//	tmp = menuItems.exit;
		//}
		copterMenu.moveTo(m.v2f(-130 + tmp.getPosition().x, tmp.getPosition().y), 30);

		//if (io.onNode(menuItems.exit) && io.isMousePress('LEFT')){
		//	dom.goURL('/', parent);
		//}
		if (io.onNode(menuItems.newGame) && io.isMousePress('LEFT')){
			scene.setGameState('game');
			user.score = 0;
		}


		text.drawSimpleText('Твой рекорд: '+ (user.record ? user.record : '\nещё не установлен'), m.v2f(320, 250));
		text.drawSimpleText('Привет,  ' + user['name'], m.v2f(55, 10));
		text.drawSimpleText('Твоя задача не допустить столкновения с инопланетной сущностью,'+'\n'+'\n'+'ты можешь использовать:'+'\n'+'\n'+'кнопки Вверх и Вниз для управления своим вертолётом,'+'\n'+'\n'+'а также Пробел для уничтожения иноплатян. Удачи!', m.v2f(25, 350));
		avatar.draw();
		copterMenu.draw();
		menuItems.newGame.draw();
		//menuItems.records.draw();
		//menuItems.exit.draw();
	});

	var initGame = function() {
		
		scene.start('connect', 60);

	VK.api("users.get", {'fields' : 'photo_50'}, function(data) { 
		user['id'] = data.response[0].id;
		user['name'] = data.response[0].first_name;
		user['avatar'] = data.response[0].photo_50;
		user['loaded'] = true;
		});
    };
   
	

	VK.init(function() { 
	     initGame();
	  }, function() { 
	     console.log("error"); 
	}, '5.52');