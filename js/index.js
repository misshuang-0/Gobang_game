var vm = new Vue({
    el: '#app',
    data: {
        canvas: {}, //画布
        ctx: {}, //画笔
        me: true, //是否是我，默认是
        piecesArr: [], //记录已走过的棋子位置
        wins: [], //赢法数组
        count: 0, //所以赢法的数量
        myWin: [], //我方赢法的统计数组
        computerWin: [], //电脑赢法的统计数组
        over: false, //游戏是否结束
    },
    mounted() {
        // 当页面挂载完毕，初始化界面
        this.init()
    },
    methods: {
        //初始化
        init() {
            // 获取画布
            this.canvas = this.$refs.myCanvas;
            // 获取画笔
            this.ctx = this.canvas.getContext('2d');
            // 棋盘初始化
            this.drawCheckerboard();
            // 初始化棋子落子状态（清零）
            this.hasPieces();
            // 赢法判断
            this.winsMethods();
        },
        //重置游戏
        reStart() {
            // 将画布清空
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.me = true;
            this.piecesArr = [];
            this.wins = [];
            this.count = 0;
            this.myWin = [];
            this.computerWin = [];
            this.over = false;
            // 棋盘初始化所有状态
            this.drawCheckerboard();
            this.hasPieces();
            this.winsMethods();
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
            // 横向赢法
            // i代表横列，j代表纵列，k代表连续相连的棋子，循环5次
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 16; j++) {
                    for (let k = 0; k < 5; k++) {
                        this.wins[i][j + k][this.count] = true;
                    }
                    // 得到一种赢的方法，赢法总数++
                    this.count++;
                }
            }
            // 纵向赢法
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 16; j++) {
                    for (let k = 0; k < 5; k++) {
                        this.wins[j + k][i][this.count] = true;
                    }
                    this.count++;
                }
            }
            // 斜线赢法
            for (let i = 0; i < 16; i++) {
                for (let j = 0; j < 16; j++) {
                    for (let k = 0; k < 5; k++) {
                        this.wins[i + k][j + k][this.count] = true;
                    }
                    this.count++;
                }
            }
            // 反斜线赢法
            for (let i = 0; i < 16; i++) {
                for (let j = 19; j > 3; j--) {
                    for (let k = 0; k < 5; k++) {
                        this.wins[i + k][j - k][this.count] = true;
                    }
                    this.count++;
                }
            }
            // console.log(this.count)
            // 两方的赢法统计
            for (let i = 0; i < this.count; i++) {
                this.myWin[i] = 0;
                this.computerWin[i] = 0;
            }
        },
        // 绘制棋盘
        drawCheckerboard() {
            this.ctx.strokeStyle = '#000';
            for (let i = 0; i < 20; i++) {
                // 横线
                this.ctx.beginPath();
                this.ctx.moveTo(15 + i * 30, 15);
                this.ctx.lineTo(15 + i * 30, 585);
                this.ctx.stroke();
                // 竖线
                this.ctx.beginPath();
                this.ctx.moveTo(15, 15 + i * 30);
                this.ctx.lineTo(585, 15 + i * 30);
                this.ctx.stroke();
            }
        },
        // 绘制棋子,参数x代表横向移动的距离，y代表纵向移动的举例
        drawPieces(x, y, me) {
            this.ctx.beginPath();
            // 绘制的棋子
            this.ctx.arc(15 + x * 30, 15 + y * 30, 13, 0, 2 * Math.PI);
            this.ctx.closePath();
            // 绘制棋子的光泽（径向渐变）
            const grd = this.ctx.createRadialGradient(15 + x * 30 + 2, 15 + y * 30 - 2, 13, 15 + x * 30 + 2, 15 + y * 30 - 2, 0);
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
        myChess(e) {
            // 判断游戏是否结束
            if (this.over) return;
            // 如果不是我方下棋，终止函数
            if (!this.me) return;

            // 获取鼠标点击位置
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;
            // 根据鼠标点击位置，判断棋子的位置
            const x = Math.floor(mouseX / 30);
            const y = Math.floor(mouseY / 30);

            // 查询该位置是否已落子,如果该位置的值为0，则还没有落子
            if (this.piecesArr[x][y] == 0) {
                // 将该位置的值改为1，表示该位置是我方落子
                this.piecesArr[x][y] = 1;
                // 向棋盘落子（绘制棋子）
                this.drawPieces(x, y, this.me);
                // 遍历赢法数组
                for (let k = 0; k < this.count; k++) {
                    // 如果当前位置存在赢法
                    if (this.wins[x][y][k]) {
                        // 我方的该赢法数量加1
                        this.myWin[k]++;
                        // 电脑方在此方法已经不可能赢，所以可以赋值一个不可能的数
                        this.computerWin[k] = 6;
                        // 如果该赢法已经到了5个，即5子相连成功
                        if (this.myWin[k] === 5) {
                            // 弹出框提示：我方胜利
                            alert('you win!');
                            // 游戏结束
                            this.over = true;
                        }
                    }
                }
                // 如果游戏还未结束
                if (!this.over) {
                    // 转交给电脑下棋
                    this.me = !this.me;
                    this.computerChess();
                }
            }
        },
        // 电脑落子
        computerChess() {
            var myScore = []; //记录我方的得分
            var computerScore = []; //记录电脑的得分
            var max = 0; //保存最高分数
            var u = 0,
                v = 0; //保存最高分数点的坐标
            // 得分初始化
            for (let i = 0; i < 20; i++) {
                myScore[i] = [];
                computerScore[i] = [];
                for (let j = 0; j < 20; j++) {
                    myScore[i][j] = 0;
                    computerScore[i][j] = 0;
                }
            }
            // 遍历棋盘
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    // 如果当前位置还没有落子,进行分数计算
                    if (this.piecesArr[i][j] === 0) {
                        // 遍历赢法数组
                        for (let k = 0; k < this.count; k++) {
                            if (this.wins[i][j][k]) {
                                // 判断黑子（玩家/我方）在该赢法已经有了几颗子
                                if (this.myWin[k] === 1) {
                                    myScore[i][j] += 200;
                                } else if (this.myWin[k] === 2) {
                                    myScore[i][j] += 400;
                                } else if (this.myWin[k] === 3) {
                                    myScore[i][j] += 2000;
                                } else if (this.myWin[k] === 4) {
                                    myScore[i][j] += 10000;
                                }
                                // 判断白子（电脑）在该赢法已经有了几颗子
                                if (this.computerWin[k] === 1) {
                                    computerScore[i][j] += 220;
                                } else if (this.computerWin[k] === 2) {
                                    computerScore[i][j] += 420;
                                } else if (this.computerWin[k] === 3) {
                                    computerScore[i][j] += 2100;
                                } else if (this.computerWin[k] === 4) {
                                    computerScore[i][j] += 20000;
                                }
                            }
                        }
                        // 与 myScore 比较分数
                        if (myScore[i][j] > max) {
                            max = myScore[i][j];
                            u = i;
                            v = j;
                        } else if (myScore[i][j] === max) {
                            if (computerScore[i][j] > computerScore[u][v]) {
                                u = i;
                                v = j;
                            }
                        }
                        // 与 computerScore 比较分数
                        if (computerScore[i][j] > max) {
                            max = computerScore[i][j];
                            u = i;
                            v = j;
                        } else if (computerScore[i][j] === max) {
                            if (myScore[i][j] > myScore[u][v]) {
                                u = i;
                                v = j;
                            }
                        }
                    }
                }
            }
            // 电脑落子
            this.drawPieces(u, v, false);
            // 该位置是计算机落子
            this.piecesArr[u][v] = 2;

            //统计电脑的赢法
            for (let k = 0; k < this.count; k++) {
                if (this.wins[u][v][k]) {
                    this.computerWin[k]++
                        this.myWin[k] = 6
                    if (this.computerWin[k] === 5) {
                        alert('计算机赢了')
                        this.over = true
                    }
                }
            }
            // 如果游戏未结束，计算我方下子
            if (!this.over) {
                this.me = !this.me
            }
        },
    }

})