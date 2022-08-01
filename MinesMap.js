/*
* 1、画空格（9x9）
* 2、生成随机的雷和数字
*       生成雷
*           确定好雷的数量 9
*           随机生成 0-80 的数字 9 个，不重复，重复就重新生成。用一个数组，保存生成的数字
*           生成的数字除以 9，向下取整得到 y，求余得到 x，最终得到 x,y（y 是行，x 是列）。
*
*       生成数字
*           以每个位置为九宫格的中心，查询中心周边雷的数量，生成该位置的数字
*
*       得到所有数字的二维数组。用于点击时查询
*
* 3、绑定点击事件
*       点击时，查询该位置的值，具体情况如下：
*           点击格子以外的地方，不处理
*           展开时，将坐标位置存到数组中
*
*           点击 非9 非0 的数字的时候，直接展开，画出数字
*           点击 9 的时候，展开所有 9
*           点击 0 的时候，以点击位置为九宫格中心，向四周展开，直到遇到数字，展开后停止
*
* */

/*
* 增加功能
*   1、检测第一次点击
        第一次点击的一定为 0
*   2、拖拽条，可控制行列
*   3、在格子右下角可以拖拽，控制行列
*       鼠标移动到右下角边界距离 5 以内的位置时，鼠标图标变成可拖拽图标
*       鼠标在右下角边界距离 5 以内的位置按下时，行列变为可拖拽，
*           鼠标移动，根据当前 x y，变换行列数量
*       鼠标抬起时，记录下抬起坐标，根据当前行列，生成指定数量的雷以及生成数字
*
* */
class MinesMap {
    constructor() {
        // 初始化地图和数字
        this.canvas = e('#id-canvas')
        this.context = this.canvas.getContext('2d')
        this.allCellArr = []

        this.minesArr = []
        // 已经展开的 0
        this.opened = []
        // 第一次点击的位置
        this.noMines = []
        this.firstClick = true

        // 单元格的宽高
        this.unit = 25
        this.enableDrag = false

        this.minesNum = e('#id-mines-num')
        this.minesNumLabel = e('.mines-num-label')
        this.linesNum = e('#id-lines-num')
        this.linesNumLabel = e('.lines-num-label')
        this.columnsNum = e('#id-columns-num')
        this.columnsNumLabel = e('.columns-num-label')
        this.initInput()
        // canvas 禁止右键菜单
        this.canvas.addEventListener('contextmenu',function(e){
            e.preventDefault()
        })
    }
    initInput() {
        // 雷
        this.minesNumLabel.innerHTML = this.mines
        // 行
        this.linesNumLabel.innerHTML = this.lines
        // 列
        this.columnsNumLabel.innerHTML = this.columns
    }
    bindInputEvent() {
        let minesNum = this.minesNum
        minesNum.addEventListener('change', (e) => {
            this.minesNumLabel.innerHTML = e.target.value
        })

        let linesNum = this.linesNum
        linesNum.addEventListener('change', (e) => {
            this.linesNumLabel.innerHTML = e.target.value
            this.drawMap()
        })

        let columnsNum = this.columnsNum
        columnsNum.addEventListener('change', (e) => {
            this.columnsNumLabel.innerHTML = e.target.value
            this.drawMap()
        })
    }

    init() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.minesArr = []
        this.opened = []
        this.noMines = []
        this.firstClick = true
    }

    get mines() {
        return Number(this.minesNum.value)
    }
    set mines(v) {
        return this.minesNum.value = Number(v)
    }
    get lines() {
        return Number(this.linesNum.value)
    }
    get columns() {
        return Number(this.columnsNum.value)
    }
    get borderX() {
        return this.unit * this.columns
    }
    get borderY() {
        return this.unit * this.lines
    }
    get maxX() {
        return Math.floor(this.canvas.width / this.unit)
    }
    get maxY() {
        return Math.floor(this.canvas.height / this.unit)
    }

    allCell() {
        for (let y = 0; y < this.lines; y++) {
            for (let x = 0; x < this.columns; x++) {
                let v = this.allCellArr[y][x]
                let r = `y${y},x${x}`
                if (!this.opened.includes(r)) {
                    this.draw(v, x, y)
                }
            }
        }
    }
    drawMines(x, y) {
        log('画雷', this.minesArr)
        for (let i = 0; i < this.minesArr.length; i++) {
            let [y1, x1] = this.minesArr[i].split(',')
            y1 = Number(y1.slice(1))
            x1 = Number(x1.slice(1))
            if (x1 === x && y1 === y) {
                log('9999')
            } else {
                // log('!!!!', x1, y1)
                this.draw('mine', x1, y1)
            }
        }
    }
    checkNum(x, y) {
        // 不超出边界
        if ((x < 0 || x >= this.columns) || (y < 0 || y >= this.lines)) {
            return false
        }
        return this.allCellArr[y][x] !== 9
    }
    checkCell(x, y) {
        let r = `y${y},x${x}`
        if (!this.opened.includes(r)) {
            if (this.checkNum(x, y)) {
                let v = this.allCellArr[y][x]
                this.draw(v, x, y)
                if (v === 0) {
                    this.openAround(x, y)
                }
            }
        }
    }
    openAround(x, y) {
        // 左
        this.checkCell(x - 1, y - 1)
        this.checkCell(x - 1, y)
        this.checkCell(x - 1, y + 1)

        // 中
        this.checkCell(x, y - 1)
        this.checkCell(x, y + 1)

        // 右
        this.checkCell(x + 1, y - 1)
        this.checkCell(x + 1, y)
        this.checkCell(x + 1, y + 1)
    }
    addOpened(x, y) {
        let r = `y${y},x${x}`
        this.opened.push(r)
    }
    draw(name, x, y) {
        name = String(name)

        // 不是画空格
        if(name !== 'blank') {
            this.addOpened(x, y)
        }

        let img = window.images[name]
        let px = x * this.unit
        let py = y * this.unit
        this.context.drawImage(img, px, py)
    }
    clickCell(x, y) {
        // 点到格子外面
        if (x >= this.columns || y >= this.lines) {
            return
        }

        let r = `y${y},x${x}`
        if (!this.opened.includes(r)) {
            let v = this.allCellArr[y][x]
            if (v === 0) {
                this.draw(v, x, y)
                this.openAround(x, y)
            } else if (v === 9) {
                this.draw('blood', x, y)
                this.drawMines(x, y)
                this.allCell()
            } else {
                this.draw(v, x, y)
            }
        }
    }

    // 鼠标事件
    bindMouseEvent() {
        // 边界的距离
        let n = 50
        let canvas = this.canvas

        canvas.addEventListener('mousedown', (event) => {
            let x = event.offsetX
            let y = event.offsetY
            // event.button 0 左键，1 中键，2 右键
            // 可拖拽区域
            if ((x - this.borderX < n && x - this.borderX > 0) && (y - this.borderY < n && y - this.borderY > 0)) {
                this.enableDrag = true
            }
        })
        canvas.addEventListener('mousemove', (event) => {
            let x = event.offsetX
            let y = event.offsetY

            // 变换鼠标图标
            if ((x - this.borderX < n && x - this.borderX > 0) && (y - this.borderY < n && y - this.borderY > 0)) {
                canvas.style.cursor = 'nwse-resize'
            } else {
                canvas.style.cursor = 'auto'
            }

            if (this.enableDrag) {
                // log(`可拖拽 移动  y${y},x${x}`)
                let x1 = Math.floor(x / this.unit)
                let y1 = Math.floor(y / this.unit)

                let minX = 5
                let minY = 5
                x1 <= minX ? x1 = minX : ''
                y1 <= minY ? y1 = minY : ''
                x1 >= this.maxX ? x1 = this.maxX - 2 : ''
                y1 >= this.maxY ? y1 = this.maxY - 2 : ''

                let s = x1 * y1
                if (s - 9 <= this.mines) {
                    this.mines = s - 9
                }
                // log('s', s, 'this.mines', this.mines)

                this.columnsNum.value = x1
                this.columnsNumLabel.innerHTML = x1
                this.linesNum.value = y1
                this.linesNumLabel.innerHTML = y1

                this.drawMap()
            }
        })
        canvas.addEventListener('mouseup', () => {
            this.enableDrag = false
        })
    }

    // log 所有数据
    fakeLog() {
        for (let i = 0; i < this.allCellArr.length; i++) {
            let m = this.allCellArr[i]
            let t = `<pre>${m}</pre>`
            document.body.insertAdjacentHTML('beforeend', t)
        }
    }
    addOne(x, y) {
        // 超过边界，不处理
        if ((x < 0 || x >= this.columns) || (y < 0 || y >= this.lines)) {
            return
        }
        // 在范围内，且不为 9
        if (this.allCellArr[y][x] !== 9) {
            this.allCellArr[y][x] += 1
        }
    }
    countBomb(y, x) {
        // 左
        this.addOne(x - 1, y - 1)
        this.addOne(x - 1, y)
        this.addOne(x - 1, y + 1)

        // 中
        this.addOne(x, y - 1)
        this.addOne(x, y + 1)

        // 右
        this.addOne(x + 1, y - 1)
        this.addOne(x + 1, y)
        this.addOne(x + 1, y + 1)
    }
    randomNum(columns, lines) {
        let x = Math.floor(Math.random() * (0 - columns) + columns)
        let y = Math.floor(Math.random() * (0 - lines) + lines)
        return `y${y},x${x}`
    }
    createBomb(num) {
        let columns = this.columns
        let lines = this.lines

        // 第一次点击的位置不能是雷
        let nLen = this.noMines.length
        let minesArr = [...this.noMines]
        while(minesArr.length !== num + nLen) {
            let r = this.randomNum(columns, lines)
            if (minesArr.includes(r)) {
                r = this.randomNum(columns, lines)
            } else {
                minesArr.push(r)
            }
        }
        minesArr = minesArr.slice(nLen)
        minesArr.sort()
        // log('雷的位置 minesArr', minesArr)
        return minesArr
    }
    initArr(lines, columns) {
        let list = []
        for (let i = 0; i < lines; i++) {
            let arr = []
            for (let j = 0; j < columns; j++) {
                arr.push(0)
            }
            list.push(arr)
        }
        return list
    }
    // 生成格子数据（雷和数字）
    createMap() {
        // 初始化数组
        this.allCellArr = this.initArr(this.lines, this.columns)

        // 生成雷
        this.minesArr = this.createBomb(this.mines)
        for (let i = 0; i < this.minesArr.length; i++) {
            let [y, x] = this.minesArr[i].split(',')
            y = Number(y.slice(1))
            x = Number(x.slice(1))
            this.allCellArr[y][x] = 9
            this.countBomb(y, x)
        }
        // log('最终地图', JSON.parse(JSON.stringify(allCellArr)))
    }
    setNoMine(x, y) {
        if ((x >= 0 && x < this.columns) && (y >= 0 && y < this.lines)) {
            let r = `y${y},x${x}`
            this.noMines.push(r)
        }
    }
    setNoMines(x, y) {
        // 左
        this.setNoMine(x - 1, y - 1)
        this.setNoMine(x - 1, y)
        this.setNoMine(x - 1, y + 1)

        // 中
        this.setNoMine(x, y - 1)
        this.setNoMine(x, y)
        this.setNoMine(x, y + 1)

        // 右
        this.setNoMine(x + 1, y - 1)
        this.setNoMine(x + 1, y)
        this.setNoMine(x + 1, y + 1)

        this.noMines.sort()
    }
    bindClickEvent() {
        this.canvas.addEventListener('mousedown', (event) => {
            let x = event.offsetX
            let y = event.offsetY
            let x1 = Math.floor(x / this.unit)
            let y1 = Math.floor(y / this.unit)

            // 点在格子内
            if (x < this.borderX && y < this.borderY) {
                let mbArr = ['左键', '中键', '右键']
                let mb = mbArr[event.button]
                // log('mb', mb)
                if (mb === '左键' || mb === '中键') {
                    // 检测第一次点击，生成格子数据
                    if (this.firstClick) {
                        this.firstClick = false
                        this.setNoMines(x1, y1)

                        // 生成格子数据
                        this.createMap()
                        this.fakeLog()
                    }

                    this.clickCell(x1, y1)
                } else if (mb === '右键') {
                    log('右键')
                    // this.draw('flag', x1, y1)
                }
            }
        })
    }

    // 绑定事件
    bindEvents() {
        this.bindClickEvent()
        this.bindMouseEvent()
        this.bindInputEvent()
    }

    drawMap() {
        this.init()
        for (let y = 0; y < this.lines; y++) {
            for (let x = 0; x < this.columns; x++) {
                this.draw('blank', x, y)
            }
        }
    }

    loadAssets(src) {
        window.images = {}
        let loaded = 0
        let toLoad = 0
        let names = Object.keys(src)
        return new Promise((resolve) => {
            if (names.length === 0) {
                resolve()
            }
            for (let name of names) {
                toLoad += 1
                let path = src[name]
                let img = new Image()
                img.src = path
                img.dataset.id = name
                img.onload = () => {
                    loaded += 1
                    window.images[name] = img
                    if (loaded === toLoad) {
                        resolve()
                    }
                }
            }
        })
    }

    __main() {
        const assets = {
            '0': './img/0.gif',
            '1': './img/1.gif',
            '2': './img/2.gif',
            '3': './img/3.gif',
            '4': './img/4.gif',
            '5': './img/5.gif',
            '6': './img/6.gif',
            '7': './img/7.gif',
            '8': './img/8.gif',
            'ask': './img/ask.gif',
            'error': './img/error.gif',
            'blank': './img/blank.gif',
            'blood': './img/blood.gif',
            'flag': './img/flag.gif',
            'mine': './img/mine.gif',
        }
        this.loadAssets(assets).then(() => {
            // 1、画空白格子（9x9）
            this.drawMap()
            // 2、事件绑定
            this.bindEvents()
        })
    }
}

const __main = () => {
    let minesMap = new MinesMap()

    minesMap.__main()
}

__main()