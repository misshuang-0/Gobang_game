var vm = new Vue({
    el: '#app',
    data: {
        tips: '请点击开始游戏',   //提示内容
        canvas: {}, //画布
        ctx: {}, //画笔
        newGame: true,
        modelMsg: 'dom 模式',
        dom: true,  //当前默认页面是 dom 
        player: false,   //判断是否是玩家对战
        i: 0, //当前我方位置上一步的横坐标
        j: 0, //当前我方位置上一步的纵坐标
        u: 0, //当前电脑方位置上一步的横坐标
        v: 0, //当前电脑方位置上一步的纵坐标
        me: true, //是否是我，默认是
        piecesArr: [], //记录已走过的棋子位置
        wins: [], //赢法数组
        count: 0, //所以赢法的数量
        myWin: [], //我方赢法的统计数组
        computerWin: [], //电脑赢法的统计数组
        over: false, //游戏是否结束
        img: 'pic1', //背景图
        Bg1: {
            show: true,
            hide: false
        }, //控制背景1显示隐藏
        Bg2: {
            hide: true,
            show: false,
        }, //控制背景2显示隐藏
        canPlay: {
            noClick: true, //控制棋盘是否可以正常落子
        },
        myAudioPause: {
            show: true,
            hide: false
        }, //控制背景音乐暂停按钮显示隐藏
        myAudioPlay: {
            hide: true,
            show: false,
        }, //控制背景音乐播放按钮显示隐藏
        revertFlag: false, //是否不能悔棋
        myScore: [],    //记录我方的得分
        computerScore: [],    //记录电脑的得分
        //---------------------------------------------
        // 以下是dom 数据
        chessTrList: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],  //棋子网格，tr列表
        chessTdList: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],  //棋子网格，td列表
        chessBgTrList: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],  //棋盘背景，td列表
        chessBgTdList: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],  //棋盘背景，td列表
    },
    created(){
        // 判断 type值是dom 还是canvas
        // this.getType();
    },
    mounted() {
        // 当页面挂载完毕，初始化界面
        this.init();

        // 背景切换
        this.changeImg();

        // 设置音频音量
        this.$refs.myAudio.volume = 0.05; //音频音量

    },
    methods: {
        // 判断 type值是dom 还是canvas
        // getType(){
        //     // 获取浏览器 url
        //     var str = window.location.search;
        //     // 找到 ‘=’ 的位置
        //     var i = str.indexOf('=');
        //     // 截取 '=' 以后的字符串
        //     str = str.slice(i+1);
        //     if(str == 'dom'){
        //         this.dom = true;
        //     }else {
        //         this.dom = false;
        //     }
        // },
        // 切换 canvas 和 dom 按钮
        changeType(){
            // 水滴声音
            this.chessVioce(this.$refs.btnAudio);

            // 切换模式
            this.dom = !this.dom;
            
            // dom
            if(this.dom){
                this.modelMsg = 'dom 模式';
                // this.$nextTick  将回调延迟到下次 DOM 更新循环之后执行。
                this.$nextTick(()=>{
                    // 绘制棋子
                    for(let j = 0; j < 20;j ++){
                        for(let i = 0; i < 20; i ++){
                            // 黑子
                            if(this.piecesArr[i][j] == 1){
                                this.$refs[i+'-'+j][0].style.background = "url('./img/black.png') 50%/80% no-repeat";
                            }else if(this.piecesArr[i][j] == 2){    //白子
                                this.$refs[i+'-'+j][0].style.background = "url('./img/white.png') 50%/80% no-repeat";
                            }
                        }
                    }
                })
            }else{  // canvas
                this.modelMsg = 'canvas 模式';
                this.$nextTick(()=>{
                    // console.log(this.$refs.myCanvas)
                    // 获取棋子画布
                    this.canvas = this.$refs.myCanvas;
                    // 获取棋子画笔
                    this.ctx = this.canvas.getContext('2d');
                    // 获取棋盘背景画布
                    this.gridCanvas = this.$refs.gridCanvas;
                    // 获取棋盘背景画笔
                    this.ctx2 = this.gridCanvas.getContext('2d');

                    // 绘制 canvas 棋盘背景
                    this.drawCheckerboard();

                    // 绘制棋子
                    for(let j = 0; j < 19;j ++){
                        for(let i = 0; i < 19; i ++){
                            if(this.piecesArr[i][j] == 1){      //黑子
                                this.drawPieces(i,j,true);
                            }else if(this.piecesArr[i][j] == 2){       //白子
                                this.drawPieces(i,j,false);
                            }
                        }
                    }
                })                
            }
        },

        // 播放背景音乐
        playAudio() {
            // 播放背景音乐
            this.chessVioce(this.$refs.myAudio);
            this.$refs.myAudio.volume = 0.05;

            // 控制播放暂停按钮的显示和隐藏
            this.myAudioPause = {
                show: true,
                hide: false
            };
            this.myAudioPlay = {
                hide: true,
                show: false,
            };
        },
        // 暂停背景音乐
        pauseAudio() {
            // 暂停
            this.$refs.myAudio.pause();
            
            // 控制播放暂停按钮的显示和隐藏
            this.myAudioPause = {
                hide: true,
                show: false,
            };
            this.myAudioPlay = {
                show: true,
                hide: false
            };
        },
        // 点击开始游戏
        startGame() {
            // 播放背景音乐
            this.chessVioce(this.$refs.myAudio);
            // 设置音频音量
            this.$refs.myAudio.volume = 0.05; //音频音量

            // 水滴声音
            this.chessVioce(this.$refs.btnAudio);

            this.player = false;    //恢复人机对战
            this.tips = "当前模式：人机对战";

            this.canPlay = {
                noClick: false,
            }; //让棋盘恢复可点击状态

            // 如果不是新游戏
            if(!this.newGame){
                // 清空棋盘，从新开始游戏
                this.reStart();   
            }
        },
        // 背景图切换
        changeImg() {
            setInterval(() => {
                if (this.Bg1.show) {
                    this.Bg1 = {
                        show: false,
                        hide: true
                    };
                    this.Bg2 = {
                        show: true,
                        hide: false
                    };
                } else {
                    this.Bg1 = {
                        show: true,
                        hide: false
                    };
                    this.Bg2 = {
                        show: false,
                        hide: true
                    };
                }
            }, 11000)
        },
        //初始化棋盘
        init() {
            // 以下判断是否兼容canvas用的是模拟的方法，用ref查找棋盘的dom元素，如果存在即走canvas,不存在走dom
            // 实际开发过程，用this.ctx即画笔是否存在来判断，如果不兼容canvas，获取不了画笔

            // canvas 初始化
            if(this.$refs.gridCanvas && this.$refs.myCanvas){
                // 获取棋子画布
                this.canvas = this.$refs.myCanvas;
                // 获取棋子画笔
                this.ctx = this.canvas.getContext('2d');
                // 获取棋盘背景画布
                this.gridCanvas = this.$refs.gridCanvas;
                // 获取棋盘背景画笔
                this.ctx2 = this.gridCanvas.getContext('2d');

                // 绘制 canvas 棋盘背景
                this.drawCheckerboard();
            }
            
            // 初始化棋子落子状态（清零）
            this.hasPieces();
            // 棋子赢法判断
            this.winsMethods();
        },
        //重置游戏
        reStart() {
            // // console.log('重置游戏')

            // 水滴声音
            this.chessVioce(this.$refs.btnAudio);

            this.player = false;    //恢复人机对战
            this.tips = "当前模式：人机对战";

            this.canPlay = {
                noClick: false,
            }; //让棋盘恢复可点击状态
            
            // 重置数据
            this.me = true;
            this.piecesArr = [];
            this.wins = [];
            this.count = 0;
            this.myWin = [];
            this.computerWin = [];
            this.over = false;
            // 棋盘初始化所有状态
            if(this.$refs.myCanvas){    //如果兼容 canvas
                // 将画布清空
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawCheckerboard(); //重新绘制棋盘
            }else{  //反之
                for(var i = 0; i < 20;i++){
                    for(var j = 0; j < 20;j ++){
                        this.$refs[i + '-' + j][0].style.background = 'none';
                    }
                }   //dom操作 遍历所有棋子，清楚其背景图
            }
            this.hasPieces();       // 初始化棋子落子状态（清零）
            this.winsMethods();     // 棋子赢法判断
        },
        // 判断某个位置是否有落子
        hasPieces() {
            // 用二维数组遍历棋盘上所有可以走的点
            for (let i = 0; i < 20; i++) {
                this.piecesArr[i] = [];
                for (let j = 0; j < 20; j++) {
                    // 将棋盘上所有的点默认值设为0，即没有落子的状态
                    this.piecesArr[i][j] = 0;
                }
            }
        },
        // 赢法判断
        winsMethods() {
            // 初始化赢法数组
            for (let i = 0; i < 20; i++) {
                this.wins[i] = [];
                for (let j = 0; j < 20; j++) {
                    this.wins[i][j] = [];
                }
            }
            // 横向赢法，扫描页面的所有横向的赢法
            // i代表横列，j代表纵列，k代表连续相连的棋子，循环5次
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 16; j++) {  // 当j到15时，已经到了棋盘边界值
                    for (let k = 0; k < 5; k++) {
                        this.wins[i][j + k][this.count] = true;
                    }
                    // 赢法总数++
                    this.count++;
                }
            }
            // 纵向赢法，扫描页面的所有纵向的赢法
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 16; j++) {
                    for (let k = 0; k < 5; k++) {
                        this.wins[j + k][i][this.count] = true;
                    }
                    this.count++;
                }
            }
            // 斜线赢法，扫描页面的所有正斜线的赢法
            for (let i = 0; i < 16; i++) {
                for (let j = 0; j < 16; j++) {
                    for (let k = 0; k < 5; k++) {
                        this.wins[i + k][j + k][this.count] = true;
                    }
                    this.count++;
                }
            }
            // 反斜线赢法，扫描页面的所有反斜线的赢法
            for (let i = 0; i < 16; i++) {
                for (let j = 19; j > 3; j--) {
                    for (let k = 0; k < 5; k++) {
                        this.wins[i + k][j - k][this.count] = true;
                    }
                    this.count++;
                }
            }
            // console.log(this.count)
            // 两方的赢法统计，所有赢法数量清零
            for (let i = 0; i < this.count; i++) {
                this.myWin[i] = 0;
                this.computerWin[i] = 0;
            }
        },
        // dom 绘制棋子样式
        drawDomPieces(i,j,me){
            
            // 黑子
            if(me){
                // console.log('dom绘制棋子'+ i+j)
                this.$refs[i+'-'+j][0].style.background = "url('./img/black.png') 50%/80% no-repeat";
            }else{  //白子
                this.$refs[i+'-'+j][0].style.background = "url('./img/white.png') 50%/80% no-repeat";
            }
        },
        // 绘制canvas棋盘
        drawCheckerboard() {
            this.ctx2.strokeStyle = '#000';
            for (let i = 0; i < 20; i++) {
                // 横线
                this.ctx2.beginPath();
                this.ctx2.moveTo(15 + i * 30, 15);
                this.ctx2.lineTo(15 + i * 30, 585);
                this.ctx2.stroke();
                // 竖线
                this.ctx2.beginPath();
                this.ctx2.moveTo(15, 15 + i * 30);
                this.ctx2.lineTo(585, 15 + i * 30);
                this.ctx2.stroke();
            }
        },
        // canvas绘制棋子,参数x代表横向移动的距离，y代表纵向移动的距离
        drawPieces(x, y, me) {
            this.ctx.beginPath();
            // 绘制的棋子
            this.ctx.arc(15 + x * 30, 15 + y * 30, 13, 0, 2 * Math.PI);
            this.ctx.closePath();
            // 绘制棋子的光泽（径向渐变）
            const grd = this.ctx.createRadialGradient(15 + x * 30 + 2, 15 + y * 30 - 2, 13, 15 + x * 30 + 2, 15 + y * 30 - 2, 2);
            // 判断是我方落子还是电脑落子，然后进行颜色渲染
            if (me) {
                grd.addColorStop(0, '#0d0d0d');
                grd.addColorStop(1, '#6f6f6f');
            } else {
                grd.addColorStop(0, '#d1d1d1');
                grd.addColorStop(1, '#fff');
            }

            this.ctx.fillStyle = grd;
            this.ctx.fill();
        },
        // 我方落子
        myChess(i,j) {
            // console.log(i,j)
            // console.log('我方落子')
            // 落子声音
            this.chessVioce(this.$refs.chessDown);

            // 判断游戏是否结束
            if (this.over) return;
            
            if(!this.player){    //如果不是玩家对战(即人机对战)
                // 如果不是我方下棋，终止函数
                if (!this.me) return;
            }

            // 如果是我方下子(黑子方)
            if(this.me){

                // 如果兼容canvas画布
                if(this.$refs.myCanvas){
                    // canvas 获取棋子位置
                    // 获取鼠标点击位置(i在此处是作为事件对象，event)
                    var mouseX = i.offsetX;
                    var mouseY = i.offsetY;
                    // 根据鼠标点击位置，判断棋子的位置,赋值给当前我方落子坐标
                    this.i = Math.floor(mouseX / 30);
                    this.j = Math.floor(mouseY / 30);
                }else{  //如果不兼容，走dom，i和j通过传参进来
                    // dom 获取棋子位置
                    this.i = i;
                    this.j = j;
                    // console.log('mychess'+ i+j)

                }

                // 查询该位置是否已落子,如果该位置的值为0，则还没有落子
                if (this.piecesArr[this.i][this.j] == 0) {
                    // 将该位置的值改为1，表示该位置是我方落子(黑子)
                    this.piecesArr[this.i][this.j] = 1;
                    // 如果兼容canvas
                    if(this.$refs.myCanvas){
                        // canvas 向棋盘落子（绘制棋子）
                        this.drawPieces(this.i, this.j, this.me);
                    }else{  //反之
                        // dom 向棋盘落子（绘制棋子）
                        this.drawDomPieces(this.i,this.j,this.me);
                    }
                    this.newGame = false;   //已落子，不再是新开始的游戏
                    this.revertFlag = false; //落子完成，可以进行悔棋

                    // console.log('当前我方落子'+ this.i+this.j)

                    // 更新我(黑子)方赢法数组
                    for (let k = 0; k < this.count; k++) {
                        // 如果当前位置存在赢法
                        if (this.wins[this.i][this.j][k]) {
                            // 我方的该赢法数量加1
                            this.myWin[k]++;
                            // 如果该赢法已经到了5个，即5子相连成功
                            if (this.myWin[k] == 5) {
                                // console.log('我方五子')
                                this.tips = '游戏结束，黑子赢！';
                                // 游戏结束
                                this.over = true;
                                this.canPlay = {
                                    noClick: true,
                                }; //让棋盘成为不可点击状态
                                return;
                            }
                        }
                    }

                    this.me = !this.me; //改变持方
                    // 如果游戏还未结束并且不是玩家对战
                    if (!this.over && !this.player) {
                        // 转交给电脑下棋
                        this.computerChess();
                    }
                }
            }else{  //白子
                // 如果兼容canvas画布
                if(this.$refs.myCanvas){
                    // canvas 获取棋子位置
                    // 获取鼠标点击位置(i在此处是作为事件对象，event)
                    var mouseX = i.offsetX;
                    var mouseY = i.offsetY;
                    // 根据鼠标点击位置，判断棋子的位置,赋值给当前我方落子坐标
                    this.u = Math.floor(mouseX / 30);
                    this.v = Math.floor(mouseY / 30);
                }else{  //如果不兼容，走dom，i和j通过传参进来
                    // dom 获取棋子位置
                    this.u = i;
                    this.v = j;
                }

                if(this.piecesArr[this.u][this.v] == 0){
                    // 将该位置的值改为2，表示该位置是白子落子
                    this.piecesArr[this.u][this.v] = 2;

                    // 如果兼容canvas
                    if(this.$refs.myCanvas){
                        // canvas 向棋盘落子（绘制棋子）
                        this.drawPieces(this.u, this.v, this.me);
                    }else{  //反之
                        // dom 向棋盘落子（绘制棋子）
                        this.drawDomPieces(this.u,this.v,this.me);
                    }

                    this.newGame = false;   //已落子，不再是新开始的游戏
                    this.revertFlag = false; //落子完成，可以进行悔棋

                    // 更新白子方赢法数组
                    for(let k = 0;k < this.count; k++){
                        // 如果当前位置存在赢法
                        if (this.wins[this.u][this.v][k]) {
                            // 白子方的该赢法数量加1
                            this.computerWin[k]++;
                            // 如果该赢法已经到了5个，即5子相连成功
                            if (this.computerWin[k] == 5) {
                                // console.log('我方五子')
                                this.tips = '游戏结束，白子赢！';
                                // 游戏结束
                                this.over = true;
                                this.canPlay = {
                                    noClick: true,
                                }; //让棋盘成为不可点击状态
                                return;
                            }
                        }
                    }
                    this.me = !this.me; //改变持方
                }
            }

        },
        // 电脑落子
        computerChess() {
            // console.log('电脑落子')
            var max = 0;
            var u = 0,
                v = 0; //保存最高分数点的坐标
            // 得分初始化
            for (let i = 0; i < 20; i++) {
                this.myScore[i] = [];
                this.computerScore[i] = [];
                for (let j = 0; j < 20; j++) {
                    this.myScore[i][j] = 0;
                    this.computerScore[i][j] = 0;
                }
            }
            // 遍历棋盘
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    // 如果当前位置还没有落子,进行分数计算
                    // var kkk=0;
                    if (this.piecesArr[i][j] === 0) {
                        // 遍历赢法数组
                        for (let k = 0; k < this.count; k++) {
                            if (this.wins[i][j][k]) {
                                // 判断黑子（玩家/我方）在该赢法已经有了几颗子
                                if (this.myWin[k] === 1) {
                                    this.myScore[i][j] += 200;
                                } else if (this.myWin[k] === 2) {
                                    this.myScore[i][j] += 400;
                                } else if (this.myWin[k] === 3) {
                                    this.myScore[i][j] += 2000;
                                } else if (this.myWin[k] === 4) {
                                    this.myScore[i][j] += 10000;
                                }
                                // 判断白子（电脑）在该赢法已经有了几颗子
                                if (this.computerWin[k] === 1) {
                                    this.computerScore[i][j] += 240;
                                } else if (this.computerWin[k] === 2) {
                                    this.computerScore[i][j] += 440;
                                } else if (this.computerWin[k] === 3) {
                                    this.computerScore[i][j] += 2200;
                                } else if (this.computerWin[k] === 4) {
                                    this.computerScore[i][j] += 20000;
                                }
                            }
                        }
                        // 遍历所有点，如果分数小于 this.myScore，则落子到当前位置
                        if (this.myScore[i][j] > max) {
                            max = this.myScore[i][j];
                            u = i;
                            v = j;
                        } else if (this.myScore[i][j] === max) { //如果相等，则比较 this.computerScore 在两个位置的分数
                            if (this.computerScore[i][j] > this.computerScore[u][v]) {
                                u = i;
                                v = j;
                            }
                        }
                        // 遍历所有点，如果分数小于 this.computerScore，则落子到当前位置
                        if (this.computerScore[i][j] > max) {
                            max = this.computerScore[i][j];
                            u = i;
                            v = j;
                        } else if (this.computerScore[i][j] === max) {   //如果相等，则比较 this.myScore 在两个位置的分数
                            if (this.myScore[i][j] > this.myScore[u][v]) {
                                u = i;
                                v = j;
                            }
                        }
                        
                    }
                }
            }

            // 赋值最高分数点的坐标给 当前电脑落子坐标
            this.u = u;
            this.v = v;
            
            // 记录该位置是计算机落子
            this.piecesArr[u][v] = 2;
            // 如果兼容canvas
            if(this.$refs.myCanvas){
                // canvas 电脑落子
                this.drawPieces(u, v, false);
            }else{
                // dom 电脑向棋盘落子
                this.drawDomPieces(u,v,false);
            }

            //更新电脑的赢法
            for (let k = 0; k < this.count; k++) {
                // 如果当前位置电脑存在赢法
                if (this.wins[u][v][k]) {
                    this.computerWin[k]++;   //电脑的该赢法加1
                    if (this.computerWin[k] === 5) {
                        // console.log('电脑五子！！！！！！！！')
                        this.tips = '游戏结束，你输了！';
                        this.over = true;
                        this.canPlay = {
                            noClick: true,
                        }; //让棋盘成为不可点击状态
                        return;
                    }
                }
            }

            // 如果游戏未结束，计算我方下子
            if (!this.over) {
                // console.log('转向我方')
                this.me = !this.me
            }
        },
        // 声音公用方法
        chessVioce(audio) {
            var playPromise = audio.play();
            if (playPromise) {
                // 音频加载成功
                playPromise.then(() => {
                    setTimeout(() => {
                        // 播放音频
                        playPromise;
                    }, audio.duration * 1000);
                }).catch((e)=>{
                     // 音频加载失败
                })
            }
            audio.volume = 0.3;
        },
        // 悔棋功能
        regretGame() {
            // 水滴声音
            this.chessVioce(this.$refs.btnAudio);

            // 获取当前双方的棋子位置
            const i = this.i;
            const j = this.j;
            const u = this.u;
            const v = this.v;
            // console.log(i,j,u,v)

            // 如果不是玩家对战
            if(!this.player){
                // 如果不是我方下子，不能悔棋
                if (!this.me) {
                    alert('不能悔棋');
                    return;
                }
            }

            // 如果已经点击了悔棋，不能马上再点悔棋
            if((i == 0 && j == 0) || (u == 0 && v == 0)){
                alert('您已悔过棋了，暂时不能悔棋了！^_^');
                return;
            }

            // 判断游戏是否结束，是否可以悔棋
            if (!this.over && !this.revertFlag) {
                if(this.$refs.myCanvas){    //如果兼容canvas
                    this.ctx.clearRect(i * 30, j * 30, 30, 30);     //清除当前我方落子的棋子
                    this.ctx.clearRect(u * 30, v * 30, 30, 30);     //清除当前电脑方落子的棋子
                }else{
                    this.$refs[i+'-'+j][0].style.background = 'none';
                    this.$refs[u+'-'+v][0].style.background = 'none';
                }
                this.piecesArr[i][j] = 0; //将我方该位置的棋子清除
                this.piecesArr[u][v] = 0; //将电脑方该位置的棋子清除

                for (let k = 0; k < this.count; k++) {
                    // 如果电脑在此处存在赢法，
                    if (this.wins[u][v][k]){
                        this.computerWin[k]--;
                    }
                    // 如果我方在此处存在赢法，
                    if (this.wins[i][j][k]) {
                            this.myWin[k]--; //该赢法减一
                    }
                }

                // 将存储的上一步双方的坐标清零
                this.i = 0, this.j = 0;
                this.u = 0, this.v = 0;

                if(!this.player){    //如果不是玩家对战
                    // 回到我方落子
                    this.me = true;
                }
                this.revertFlag = true; //悔棋完成，不能再悔棋
            }
        },
        // 玩家对战
        playerGame(){
            // 水滴声音
            this.chessVioce(this.$refs.btnAudio);

            // 如果不是新游戏
            if(!this.newGame){
                // 从新开始游戏
                this.reStart();   
            }

            this.player = true;     //玩家对战
            this.tips = "当前模式：玩家对战";
            
            this.canPlay = {
                noClick: false,
            }; //让棋盘恢复可点击状态
        },
    }

})