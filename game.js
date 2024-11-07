class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // 初始化UI元素
        this.menuOverlay = document.getElementById('menu-overlay');
        this.startMenu = document.getElementById('start-menu');
        this.gameOverMenu = document.getElementById('game-over-menu');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');

        // 游戏状态
        this.gameState = 'menu'; // menu, playing, gameOver
        
        // 初始化所有游戏参数
        this.initializeParameters();
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 初始化游戏
        this.initializeGame();
        
        // 开始游戏循环
        this.gameLoop();
    }

    // 添加新方法来初始化参数
    initializeParameters() {
        // 物理引擎参数
        this.physics = {
            friction: 0.99,
            maxSpeed: 8,
            acceleration: 0.4,
            rotationSpeed: 0.08,
            thrust: 0.4
        };

        // 虫洞参数
        this.wormholeParams = {
            pairCount: 2,
            radius: 40,
            pulseSpeed: 0.05,
            pulseSize: 5
        };

        // 运动参数
        this.motionParams = {
            orbitSpeed: 0.001,
            wobbleAmount: 30,
            wobbleSpeed: 0.02
        };

        // 多元宇宙参数
        this.multiverse = {
            currentUniverse: 1,
            maxUniverses: 5,
            universeColors: ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff0000'],
            universeProperties: {
                1: {
                    gravityStrength: 1,
                    playerSpeed: 1,
                    timeWarpEffect: 1
                },
                2: {
                    gravityStrength: 2,
                    playerSpeed: 1.2,
                    timeWarpEffect: 1.2
                },
                3: {
                    gravityStrength: 0.8,
                    playerSpeed: 1.5,
                    timeWarpEffect: 1.5
                },
                4: {
                    gravityStrength: 1.5,
                    playerSpeed: 1.3,
                    timeWarpEffect: 2
                },
                5: {
                    gravityStrength: 1.2,
                    playerSpeed: 1.4,
                    timeWarpEffect: 1.8
                }
            }
        };

        // 寿命系统
        this.lifeSystem = {
            maxLife: 200,
            currentLife: 200,
            drainRate: 0.05,
            collectBonus: 30,
            wormholeConsumption: 10
        };
    }

    initializeGame() {
        // 改进玩家属性
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 20,
            velocity: { x: 0, y: 0 },
            rotation: 0,           // 玩家旋转角度
            thrusting: false,      // 是否在推进
            rotatingLeft: false,   // 是否在左转
            rotatingRight: false   // 是否在右转
        };
        
        // 游戏元素
        this.blackHoles = [];
        this.collectiblePlanets = [];
        this.timeWarpZones = [];
        this.stars = [];
        
        // 游戏参数
        this.gameSpeed = 1;
        this.gravitationalConstant = 0.5;
        this.score = 0;
        this.planetsCollected = 0;
        
        // 初始化游戏元素
        this.initializeGameElements();
        
        // 键盘状态
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };

        // 重置寿命
        this.lifeSystem.currentLife = this.lifeSystem.maxLife;
        
        // 设置当前宇宙的颜色
        this.playerColor = this.multiverse.universeColors[this.multiverse.currentUniverse - 1];

        // 应用当前宇宙的特殊属性
        const universeProps = this.multiverse.universeProperties[this.multiverse.currentUniverse];
        this.physics = {
            friction: 0.99,
            maxSpeed: 8 * universeProps.playerSpeed,
            acceleration: 0.4 * universeProps.playerSpeed,
            rotationSpeed: 0.08,
            thrust: 0.4 * universeProps.playerSpeed
        };

        this.gravitationalConstant = 0.5 * universeProps.gravityStrength;
        
        // 根据宇宙调整游戏元素
        this.adjustGameElementsByUniverse();
    }

    adjustGameElementsByUniverse() {
        const universe = this.multiverse.currentUniverse;
        
        switch(universe) {
            case 2: // 高重力宇宙
                // 增加黑洞数量
                this.blackHoles.push(...this.createExtraBlackHoles(2));
                break;
            case 3: // 快速宇宙
                // 行星移动更快
                this.motionParams.orbitSpeed *= 1.5;
                this.motionParams.wobbleSpeed *= 1.5;
                break;
            case 4: // 混沌宇宙
                // 随机传送门
                this.addRandomTeleports();
                break;
            case 5: // 量子宇宙
                // 量子纠缠效果
                this.addQuantumEntanglement();
                break;
        }
    }

    createExtraBlackHoles(count) {
        const newBlackHoles = [];
        for (let i = 0; i < count; i++) {
            newBlackHoles.push({
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: Math.random() * (this.canvas.height - 100) + 50,
                radius: 25,
                strength: 2.5,
                rotationAngle: 0,
                centerX: 0,
                centerY: 0,
                orbitAngle: Math.random() * Math.PI * 2,
                wobblePhase: Math.random() * Math.PI * 2
            });
        }
        return newBlackHoles;
    }

    addRandomTeleports() {
        // 每隔一段时间随机传送一个行星
        setInterval(() => {
            if (this.gameState === 'playing') {
                this.collectiblePlanets.forEach(planet => {
                    if (!planet.collected && Math.random() < 0.1) {
                        planet.x = Math.random() * this.canvas.width;
                        planet.y = Math.random() * this.canvas.height;
                        planet.centerX = planet.x;
                        planet.centerY = planet.y;
                    }
                });
            }
        }, 3000);
    }

    addQuantumEntanglement() {
        // 创建纠缠的行星对
        this.collectiblePlanets = this.collectiblePlanets.map((planet, index) => {
            if (index % 2 === 0) {
                const entangledPlanet = this.collectiblePlanets[index + 1];
                if (entangledPlanet) {
                    planet.entangledWith = entangledPlanet;
                    entangledPlanet.entangledWith = planet;
                }
            }
            return planet;
        });
    }

    initializeGameElements() {
        // 初始化黑洞
        this.blackHoles = [];
        for (let i = 0; i < 3; i++) {
            this.blackHoles.push({
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: Math.random() * (this.canvas.height - 100) + 50,
                radius: 30,
                strength: 2,
                rotationAngle: 0
            });
        }

        // 初始化可收集的行星
        this.collectiblePlanets = [];
        for (let i = 0; i < 5; i++) {
            this.collectiblePlanets.push({
                x: Math.random() * (this.canvas.width - 60) + 30,
                y: Math.random() * (this.canvas.height - 60) + 30,
                radius: 15,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                collected: false
            });
        }

        // 初始化时间扭曲区域
        this.timeWarpZones = [];
        this.timeWarpZones.push({
            x: this.canvas.width * 0.7,
            y: this.canvas.height * 0.3,
            radius: 100,
            timeScale: 0.5
        });

        // 初始化星空背景
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                brightness: Math.random()
            });
        }

        // 重置玩家位置和状态
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 20,
            velocity: { x: 0, y: 0 },
            rotation: 0,
            thrusting: false,
            rotatingLeft: false,
            rotatingRight: false
        };

        // 重置游戏参数
        this.score = 0;
        this.time = 0;
        this.gameSpeed = 1;

        // 初始化虫洞对
        this.wormholes = [];
        for (let i = 0; i < this.wormholeParams.pairCount; i++) {
            // 创建一对虫洞
            const entrance = {
                x: Math.random() * (this.canvas.width - 200) + 100,
                y: Math.random() * (this.canvas.height - 200) + 100,
                radius: this.wormholeParams.radius,
                phase: 0,
                pair: null,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            };
            
            const exit = {
                x: Math.random() * (this.canvas.width - 200) + 100,
                y: Math.random() * (this.canvas.height - 200) + 100,
                radius: this.wormholeParams.radius,
                phase: Math.PI, // 反相位
                pair: null,
                color: entrance.color
            };
            
            entrance.pair = exit;
            exit.pair = entrance;
            
            this.wormholes.push(entrance, exit);
        }

        // 为黑洞和行星添加运动参数
        this.blackHoles.forEach(blackHole => {
            blackHole.centerX = blackHole.x;
            blackHole.centerY = blackHole.y;
            blackHole.orbitAngle = Math.random() * Math.PI * 2;
            blackHole.wobblePhase = Math.random() * Math.PI * 2;
        });

        this.collectiblePlanets.forEach(planet => {
            planet.centerX = planet.x;
            planet.centerY = planet.y;
            planet.orbitAngle = Math.random() * Math.PI * 2;
            planet.wobblePhase = Math.random() * Math.PI * 2;
        });
    }

    setupEventListeners() {
        // 移除鼠标控制，只保留键盘控制
        window.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.player.thrusting = true;
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.player.rotatingLeft = true;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.player.rotatingRight = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.player.thrusting = false;
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.player.rotatingLeft = false;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.player.rotatingRight = false;
                    break;
            }
        });
        
        // 窗口大小改变
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 按钮点击事件
        this.startButton.addEventListener('click', () => {
            console.log('Start button clicked'); // 调试用
            this.startGame();
        });
        
        this.restartButton.addEventListener('click', () => {
            console.log('Restart button clicked'); // 调试用
            this.startGame();
        });
    }

    startGame() {
        console.log('Starting game...'); // 调试用
        this.gameState = 'playing';
        
        // 隐藏菜单
        if (this.menuOverlay) {
            this.menuOverlay.style.display = 'none';
        }
        
        // 重置游戏状态
        this.initializeGame();
        this.score = 0;
        this.time = 0;
        this.multiverse.currentUniverse = 1;
        this.lifeSystem.currentLife = this.lifeSystem.maxLife;
    }

    updatePlayer() {
        if (this.gameState !== 'playing') return;

        // 更新旋转
        if (this.player.rotatingLeft) {
            this.player.rotation -= this.physics.rotationSpeed;
        }
        if (this.player.rotatingRight) {
            this.player.rotation += this.physics.rotationSpeed;
        }

        // 应用推进力
        if (this.player.thrusting) {
            // 根据当前旋转角度计算推进方向
            this.player.velocity.x += Math.cos(this.player.rotation) * this.physics.thrust;
            this.player.velocity.y += Math.sin(this.player.rotation) * this.physics.thrust;
        }

        // 限制最大速度
        const speed = Math.sqrt(
            this.player.velocity.x * this.player.velocity.x + 
            this.player.velocity.y * this.player.velocity.y
        );
        
        if (speed > this.physics.maxSpeed) {
            const ratio = this.physics.maxSpeed / speed;
            this.player.velocity.x *= ratio;
            this.player.velocity.y *= ratio;
        }
        
        // 应用摩擦力
        this.player.velocity.x *= this.physics.friction;
        this.player.velocity.y *= this.physics.friction;
        
        // 更新位置
        this.player.x += this.player.velocity.x;
        this.player.y += this.player.velocity.y;
        
        // 环绕边界
        if (this.player.x < 0) this.player.x = this.canvas.width;
        if (this.player.x > this.canvas.width) this.player.x = 0;
        if (this.player.y < 0) this.player.y = this.canvas.height;
        if (this.player.y > this.canvas.height) this.player.y = 0;
    }

    gameOver() {
        this.gameState = 'gameOver';
        
        // 显示游戏结束菜单
        if (this.menuOverlay) {
            this.menuOverlay.style.display = 'flex';
            this.startMenu.classList.add('hidden');
            this.gameOverMenu.classList.remove('hidden');
            
            // 更新最终分数
            const finalScoreElement = document.getElementById('final-score');
            if (finalScoreElement) {
                finalScoreElement.textContent = `最终得分: ${this.score}`;
            }
        }
    }

    update() {
        if (this.gameState !== 'playing') return;

        this.time += 1/60; // 假设60fps
        this.updatePlayer();
        this.updateObjects(); // 添加这行
        this.updateBlackHoles();
        this.checkCollisions();
        this.checkWormholeCollisions(); // 添加这行
        this.updateTimeWarp();

        // 更新寿命
        this.updateLife();
    }

    render() {
        // 清空画布
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制游戏元素
        this.drawStars();
        this.drawGravityLensEffect();
        this.drawTimeWarpZones();
        this.drawBlackHoles();
        this.drawCollectiblePlanets();
        
        // 在绘制玩家之前绘制虫洞
        this.drawWormholes();
        
        // 只在游戏进行中绘制玩家
        if (this.gameState === 'playing') {
            this.drawPlayer();
        }
        
        // 更新UI
        if (this.gameState === 'playing') {
            this.updateUI();
        }
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    playerJump() {
        if (!this.player.isJumping) {
            this.player.velocity.y = -10;
            this.player.isJumping = true;
        }
    }

    updateBlackHoles() {
        this.blackHoles.forEach(blackHole => {
            // 计算玩家与黑洞的距离
            const dx = blackHole.x - this.player.x;
            const dy = blackHole.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 应用引力效果
            if (distance < 200) {
                const force = (this.gravitationalConstant * blackHole.strength) / (distance * distance);
                this.player.velocity.x += (dx / distance) * force;
                this.player.velocity.y += (dy / distance) * force;
            }
            
            // 更新黑洞旋转
            blackHole.rotationAngle += 0.02;
        });
    }

    checkCollisions() {
        // 检查与可收集行星的碰撞
        this.collectiblePlanets.forEach(planet => {
            if (!planet.collected) {
                const dx = planet.x - this.player.x;
                const dy = planet.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.player.radius + planet.radius) {
                    planet.collected = true;
                    this.score += 100;
                    this.planetsCollected++;
                    
                    // 收集行星增加寿命
                    this.lifeSystem.currentLife = Math.min(
                        this.lifeSystem.maxLife,
                        this.lifeSystem.currentLife + this.lifeSystem.collectBonus
                    );
                }
            }
        });

        // 检查与黑洞的碰撞
        this.blackHoles.forEach(blackHole => {
            const dx = blackHole.x - this.player.x;
            const dy = blackHole.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.radius + blackHole.radius) {
                this.gameOver();
            }
        });
    }

    updateTimeWarp() {
        this.timeWarpZones.forEach(zone => {
            const dx = zone.x - this.player.x;
            const dy = zone.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < zone.radius) {
                this.gameSpeed = zone.timeScale;
            } else {
                this.gameSpeed = 1;
            }
        });
    }

    drawGravityLensEffect() {
        this.blackHoles.forEach(blackHole => {
            const gradient = this.ctx.createRadialGradient(
                blackHole.x, blackHole.y, 0,
                blackHole.x, blackHole.y, 150
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(blackHole.x, blackHole.y, 150, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawStars() {
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    drawBlackHoles() {
        this.blackHoles.forEach(blackHole => {
            // 绘制黑洞核心
            this.ctx.beginPath();
            this.ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#000000';
            this.ctx.fill();
            
            // 绘制吸积盘
            this.ctx.beginPath();
            this.ctx.arc(blackHole.x, blackHole.y, blackHole.radius + 10, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#4400ff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        });
    }

    drawTimeWarpZones() {
        this.timeWarpZones.forEach(zone => {
            this.ctx.beginPath();
            this.ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            this.ctx.stroke();
        });
    }

    drawCollectiblePlanets() {
        this.collectiblePlanets.forEach(planet => {
            if (!planet.collected) {
                this.ctx.beginPath();
                this.ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = planet.color;
                this.ctx.fill();
            }
        });
    }

    drawPlayer() {
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.rotation);
        
        // 使用当前宇宙的颜色
        this.ctx.fillStyle = this.playerColor;
        
        // 绘制玩家三角形
        this.ctx.beginPath();
        this.ctx.moveTo(20, 0);
        this.ctx.lineTo(-10, -10);
        this.ctx.lineTo(-10, 10);
        this.ctx.closePath();
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fill();

        // 如果正在推进，绘制推进器效果
        if (this.player.thrusting) {
            this.ctx.beginPath();
            this.ctx.moveTo(-10, 0);
            this.ctx.lineTo(-20, -5);
            this.ctx.lineTo(-20, 5);
            this.ctx.closePath();
            this.ctx.fillStyle = '#ff4400';
            this.ctx.fill();
        }

        // 添加光晕效果
        const gradient = this.ctx.createRadialGradient(0, 0, 10, 0, 0, 30);
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    updateUI() {
        document.getElementById('score').textContent = `分数: ${this.score}`;
        document.getElementById('time').textContent = `时间: ${Math.floor(this.time)}`;
        
        // 添加寿命和宇宙信息
        const lifeElement = document.getElementById('life') || this.createLifeUI();
        const universeElement = document.getElementById('universe') || this.createUniverseUI();
        
        lifeElement.textContent = `寿命: ${Math.ceil(this.lifeSystem.currentLife)}`;
        universeElement.textContent = `宇宙: ${this.multiverse.currentUniverse}/${this.multiverse.maxUniverses}`;
    }

    createLifeUI() {
        const lifeDiv = document.createElement('div');
        lifeDiv.id = 'life';
        document.getElementById('ui-overlay').appendChild(lifeDiv);
        return lifeDiv;
    }

    createUniverseUI() {
        const universeDiv = document.createElement('div');
        universeDiv.id = 'universe';
        document.getElementById('ui-overlay').appendChild(universeDiv);
        return universeDiv;
    }

    updateObjects() {
        // 更新黑洞位置
        this.blackHoles.forEach(blackHole => {
            blackHole.orbitAngle += this.motionParams.orbitSpeed;
            blackHole.wobblePhase += this.motionParams.wobbleSpeed;
            
            blackHole.x = blackHole.centerX + 
                Math.cos(blackHole.orbitAngle) * this.motionParams.wobbleAmount;
            blackHole.y = blackHole.centerY + 
                Math.sin(blackHole.wobblePhase) * this.motionParams.wobbleAmount;
        });

        // 更新行星位置
        this.collectiblePlanets.forEach(planet => {
            if (!planet.collected) {
                planet.orbitAngle += this.motionParams.orbitSpeed * 1.5;
                planet.wobblePhase += this.motionParams.wobbleSpeed * 1.2;
                
                planet.x = planet.centerX + 
                    Math.cos(planet.orbitAngle) * this.motionParams.wobbleAmount * 0.7;
                planet.y = planet.centerY + 
                    Math.sin(planet.wobblePhase) * this.motionParams.wobbleAmount * 0.7;
            }
        });

        // 更新虫洞效果
        this.wormholes.forEach(wormhole => {
            wormhole.phase += this.wormholeParams.pulseSpeed;
        });
    }

    checkWormholeCollisions() {
        this.wormholes.forEach(wormhole => {
            const dx = this.player.x - wormhole.x;
            const dy = this.player.y - wormhole.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < wormhole.radius + this.player.radius) {
                // 检查是否有足够的寿命使用虫洞
                if (this.lifeSystem.currentLife >= this.lifeSystem.wormholeConsumption) {
                    // 消耗寿命
                    this.lifeSystem.currentLife -= this.lifeSystem.wormholeConsumption;
                    
                    // 传送逻辑
                    const exitWormhole = wormhole.pair;
                    this.player.x = exitWormhole.x;
                    this.player.y = exitWormhole.y;
                    
                    // 保持速度方向，但略微改变大小
                    const speed = Math.sqrt(
                        this.player.velocity.x * this.player.velocity.x + 
                        this.player.velocity.y * this.player.velocity.y
                    );
                    const angle = Math.atan2(this.player.velocity.y, this.player.velocity.x);
                    this.player.velocity.x = Math.cos(angle) * speed * 1.2;
                    this.player.velocity.y = Math.sin(angle) * speed * 1.2;
                    
                    // 添加传送效果
                    this.createWormholeEffect(exitWormhole);
                }
            }
        });
    }

    createWormholeEffect(wormhole) {
        // 创建传送特效
        const particles = [];
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            particles.push({
                x: wormhole.x + Math.cos(angle) * wormhole.radius,
                y: wormhole.y + Math.sin(angle) * wormhole.radius,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 1
            });
        }
        
        // 添加粒子动画
        const animate = () => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= 0.02;
                
                if (particle.life > 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.life})`;
                    this.ctx.fill();
                }
            });
            
            if (particles.some(p => p.life > 0)) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    drawWormholes() {
        this.wormholes.forEach(wormhole => {
            // 绘制外环
            this.ctx.beginPath();
            this.ctx.arc(wormhole.x, wormhole.y, 
                wormhole.radius + Math.sin(wormhole.phase) * this.wormholeParams.pulseSize, 
                0, Math.PI * 2);
            this.ctx.strokeStyle = wormhole.color;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // 绘制内部漩涡
            const gradient = this.ctx.createRadialGradient(
                wormhole.x, wormhole.y, 0,
                wormhole.x, wormhole.y, wormhole.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(0.5, wormhole.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // 绘制能量线
            for (let i = 0; i < 8; i++) {
                const angle = (wormhole.phase + (Math.PI * 2 / 8) * i) % (Math.PI * 2);
                this.ctx.beginPath();
                this.ctx.moveTo(
                    wormhole.x + Math.cos(angle) * (wormhole.radius * 0.3),
                    wormhole.y + Math.sin(angle) * (wormhole.radius * 0.3)
                );
                this.ctx.lineTo(
                    wormhole.x + Math.cos(angle) * wormhole.radius,
                    wormhole.y + Math.sin(angle) * wormhole.radius
                );
                this.ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }

    updateLife() {
        // 持续减少寿命
        this.lifeSystem.currentLife -= this.lifeSystem.drainRate;

        // 检查寿命是否耗尽
        if (this.lifeSystem.currentLife <= 0) {
            this.handleDeath();
        }
    }

    handleDeath() {
        if (this.multiverse.currentUniverse < this.multiverse.maxUniverses) {
            // 还有平行宇宙可用，切换到新宇宙
            this.multiverse.currentUniverse++;
            this.switchUniverse();
        } else {
            // 所有平行宇宙都用完了，游戏结束
            this.gameOver();
        }
    }

    switchUniverse() {
        const previousScore = this.score;
        
        // 显示宇宙切换消息
        this.showUniverseTransitionMessage();
        
        // 重新初始化游戏
        this.initializeGame();
        this.score = previousScore;
        
        // 创建更华丽的宇宙切换效果
        this.createEnhancedUniverseTransitionEffect();
    }

    showUniverseTransitionMessage() {
        const message = document.createElement('div');
        message.className = 'universe-transition-message';
        message.textContent = `进入平行宇宙 ${this.multiverse.currentUniverse}`;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    createEnhancedUniverseTransitionEffect() {
        const particles = [];
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 10,
                speedY: (Math.random() - 0.5) * 10,
                life: 1
            });
        }

        const animate = () => {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                particle.life -= 0.02;

                if (particle.life > 0) {
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.life})`;
                    this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
                }
            });

            if (particles.some(p => p.life > 0)) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
}

// 启动游戏
window.onload = () => {
    new Game();
};