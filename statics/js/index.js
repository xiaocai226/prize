const globalProps = {
    storageKey: {
        luckMemberIndexArr: `luckMemberIndexArr`,// 已抽奖名单
        prizeIndex: `prizeIndex`,// 已抽奖品索引
        hiddenLuckMemberIndexArr: 'hiddenLuckMemberIndexArr', // 已抽隐藏奖名单
        hiddenPrizeRecords: 'hiddenPrizeRecords', // 存储隐藏奖记录（包含金额）
        redrawRecords: 'redrawRecords', // 存储续抽记录
        prizeTotalCounts: 'prizeTotalCounts', // 存储每个奖项的实际总人数
        prizeDrawRecords: 'prizeDrawRecords', // 存储每个奖品的原始抽奖记录
    },
    el: {},
    nowLuckMemberIndexArr: [],// 当前抽奖名单
    nowHiddenLuckMemberIndexArr: [], // 当前隐藏奖名单
    nowPrizeObj: [],// 当前奖品
    running: false,// 抽奖进行与否
    // hiddenPrizeAmount: 0, // 隐藏奖金额
    isHiddenPrize: false, // 是否在抽隐藏奖
    isRedrawMode: false, // 是否处于续抽模式
    buttons: [], // 存储需要禁用的按钮
    lock: false, // 是否锁定 默认锁定
}
globalProps.el.prizeImg = document.getElementById(`prizeImg`)
globalProps.el.mask = document.getElementById(`mask`)
globalProps.el.main = document.getElementById(`main`)
globalProps.el.result = document.getElementById(`result`)
globalProps.el.prizeShow = document.getElementById(`prizeShow`)
globalProps.el.memberNumInput = document.getElementById(`memberNumInput`)
globalProps.el.startBtn = document.getElementById(`startBtn`)
globalProps.el.pauseBtn = document.getElementById(`pauseBtn`)
globalProps.el.resetBtn = document.getElementById(`resetBtn`)
globalProps.el.runningMusic = document.getElementById(`runningMusic`)
globalProps.el.runningSpecialMusic = document.getElementById(`runningSpecialMusic`)
globalProps.el.resultMusic = document.getElementById(`resultMusic`)
globalProps.el.lockBtn = document.getElementById(`lockBtn`)
globalProps.el.showPrizeImgBtn = document.getElementById(`showPrizeImgBtn`)
globalProps.el.prizeLevel = document.getElementById(`prizeLevel`)

const getCanvasSpeed = () => {
    // return [0.08, -0.02]
    return [0.1 * Math.random() + 0.01, -(0.1 * Math.random() + 0.01)]
}

const generateMemberListHtml = () => {
    const html = [`<ul>`]
    memberList.forEach((member, index) => {
        html.push(`
            <li> 
                <a>
                    <img src="./statics/images/member/${member.name}.png" 
                         alt="${member.name}">
                </a>
            </li>
        `)
    })
    html.push("</ul>")
    return html.join("")
}

const canvasInit = () => {
    const canvasEl = document.createElement("canvas")
    canvasEl.id = "canvas"
    canvasEl.width = document.body.offsetWidth
    canvasEl.height = document.body.offsetHeight
    canvasEl.innerHTML = generateMemberListHtml()
    globalProps.el.main.appendChild(canvasEl)
    TagCanvas.Start("canvas", "", {
        initial: getCanvasSpeed(),
        shuffleTags: true,// 随机排序
        wheelZoom: false,// 鼠标滚轮缩放
        // 圆形
        dragControl: 1,// 拖拽控制
        imageScale: 0.16, // 控制图片缩放比例
        textFont: null,// 字体
        textColour: "＃fff",// 文字颜色
        // textHeight: 10,// 文字高度
        // imageRadius: 10, // 控制图片半径
        // imageMode: "both", // 同时显示图片和文字
        // imagePosition: "top", // 图片位置
        // outlineMethod: "none", // 移除轮廓

        // 圆柱
        // textColour: '#fff',
        // outlineColour: '#ff00ff',
        // reverse: true,
        // depth: 0.8,
        // maxSpeed: 0.05,
        // weight: true,
        // shape: 'vcylinder',
        // noSelect: true,
        // // textHeight: 14,// 文字高度
        // // freezeActive: true,// 冻结选中
        // stretchX: 1.8,// 拉伸x
        // stretchY: 0.8,// 拉伸y

        // // 垂直圆柱形
        // // textColour: '#fff',
        // // outlineColour: '#ff00ff',
        // shape: 'vcylinder',  // 垂直圆柱形
        // reverse: true,// 反向   
        // depth: 0.1,// 深度
        // // maxSpeed: 0.03,  // 降低速度使显示更清晰
        // weight: true,// 权重
        // noSelect: true,// 禁止选择
        // // textHeight: 14,// 文字高度
        // // freezeActive: true,// 冻结选中
        // stretchX: 1.2,     // 减小水平拉伸，使其更协调

        // stretchY: 1,       // 保持垂直方向正常
        // radiusX: 1,        // 调整为相同的半径使其更稳定
        // radiusY: 1,        // 调整为相同的半径使其更稳定
        // radiusZ: 1,        // 调整为相同的半径使其更稳定
        // zoom: 1,           // 正常缩放
        // pinchZoom: true,   // 保持触摸缩放
        // animTiming: 'Smooth',  // 平滑动画
        // dragControl: false  // 禁用拖拽以保持稳定
    })
}

const operateInit = () => {
    globalProps.el.startBtn.addEventListener(`click`, luckDrawStart)

    // 用于控件 控制开始抽奖 暂停抽奖
    document.onkeydown = (event) => {
        console.log(event.key,'获取按键')
        // event.key === "Enter" || event.key === "Tab" || 
        if (event.key === "PageUp" || event.key === "PageDown") {
            if(!globalProps.lock){
                console.log('锁定')
                return false
            }
            if (globalProps.running) {
                console.log('暂停抽奖')
                luckDrawPause()
            } else {
                console.log('开始抽奖')
                luckDrawStart()
            }
            return false
        }
    }

    globalProps.el.pauseBtn.addEventListener(`click`, luckDrawPause)
    // 双击重置
    globalProps.el.resetBtn.addEventListener(`dblclick`, resetAll)

    globalProps.el.lockBtn.addEventListener(`click`, () => {
        globalProps.lock = true;// 解锁
        globalProps.el.lockBtn.classList.add(`hide-g`);// 隐藏锁定按钮
    })

    globalProps.el.showPrizeImgBtn.addEventListener(`click`, () => {
        if (globalProps.el.prizeLevel.classList.contains(`hide-g`)) {
            globalProps.el.prizeLevel.classList.remove(`hide-g`)
        } else {
            globalProps.el.prizeLevel.classList.add(`hide-g`)
        }
    })

    globalProps.el.prizeLevel.addEventListener(`click`, (e) => {
        if (e.target.tagName === `SPAN`) {
            let htm = `<div class="close-btn" id="hidePrizeImgBtn">+</div>
                      <div class="prize-container">`; // 添加内部容器
            prizeList.forEach((item, index) => {
                if(item.level==e.target.textContent){
                    htm+=`<div class="prizeImgItem prizeImgItem-${item.levelCode}">
                            <img src="./statics/images/prize-min/${item.id}.png" alt="${item.name}">
                          </div>`
                }
            })
            htm += `</div>`; // 关闭内部容器
            globalProps.el.prizeImg.innerHTML = htm;
            globalProps.el.prizeImg.classList.remove(`hide-g`);

            const hidePrizeImgBtnEl = document.getElementById(`hidePrizeImgBtn`);
            hidePrizeImgBtnEl.addEventListener(`click`, () => {
                globalProps.el.prizeImg.classList.add(`hide-g`);
            })
        }
    })
}

// 获取抽奖人数
const getMemberNumInputVal = () => {
    let value = parseInt(globalProps.el.memberNumInput.value)
    if (!value || value < 1) {
        value = 1
    }
    globalProps.el.memberNumInput.value = value.toString()
    return value
}

// 获取奖品id
const getPrizeIndex = () => {
    let prizeIndex = globalProps.nowPrizeObj.map(item => item.id)
    let prizeIndexStr = localStorage.getItem(globalProps.storageKey.prizeIndex)

    if (prizeIndexStr) {
        prizeIndexStr = prizeIndexStr.split(`,`)
        prizeIndexStr=prizeIndexStr.concat(prizeIndex)
        return prizeIndexStr
    }else{
        return prizeIndex
    }
}

// 添加禁用按钮的函数
const disableButtons = () => {
    // 获取所有需要禁用的按钮
    const buttons = [
        document.getElementById('resetBtn'),
        document.querySelector('.export-btn'),
        document.getElementById('showPrizeImgBtn'),
        document.getElementById('showPrizeBtn'),
        document.getElementById('audioOpenBtn'),
        document.getElementById('memberNumInput')
    ];
    
    // 禁用所有按钮
    buttons.forEach(button => {
        if (button) {
            button.style.opacity = '0.5';
            button.style.pointerEvents = 'none';
            if (button.tagName.toLowerCase() === 'input') {
                button.disabled = true;
            }
        }
    });
}

// 添加启用按钮的函数
const enableButtons = () => {
    // 获取所有需要启用的按钮
    const buttons = [
        document.getElementById('resetBtn'),
        document.querySelector('.export-btn'),
        document.getElementById('showPrizeImgBtn'),
        document.getElementById('showPrizeBtn'),
        document.getElementById('audioOpenBtn'),
        document.getElementById('memberNumInput')
    ];
    
    // 启用所有按钮
    buttons.forEach(button => {
        if (button) {
            button.style.opacity = '';
            button.style.pointerEvents = '';
            if (button.tagName.toLowerCase() === 'input') {
                button.disabled = false;
            }
        }
    });
}

// 开始抽奖
const luckDrawStart = () => {
    // 检查是否选择了奖品
    if (globalProps.nowPrizeObj.length === 0 && !globalProps.isRedrawMode) {
        // const confirmHidden = confirm(`当前未选择奖品，且抽奖人数为 ${getMemberNumInputVal()}，是否要抽取隐藏奖？`);
        // if (!confirmHidden) {
        //     return; // 如果用户点击取消，则终止抽奖
        // }
        
        // 密码验证
        // const password = prompt('请输入隐藏奖密码：');
        // if (password !== 'lucky888') { // 这里设置密码为'lucky888'
        //     alert('密码错误，无法抽取隐藏奖！');
        //     return;
        // }
        
        // 输入奖品内容（更灵活的输入）
        // const amount = prompt('请输入隐藏奖内容（可以是金额或文字）：');
        // if (!amount) {
        //     alert('请输入有效的隐藏奖内容！');
        //     return;
        // }
        
        globalProps.isHiddenPrize = true; // 标记为隐藏奖抽奖
        // globalProps.hiddenPrizeAmount = amount;
    } else {
        globalProps.isHiddenPrize = false;
    }
    
    // 根据是否是隐藏奖获取对应的已中奖名单
    const storageKey = globalProps.isHiddenPrize ? 
        globalProps.storageKey.hiddenLuckMemberIndexArr : 
        globalProps.storageKey.luckMemberIndexArr;
    
    const luckMemberArrStr = localStorage.getItem(storageKey);
    const luckMemberArr = luckMemberArrStr ? JSON.parse(luckMemberArrStr) : [];
    
    // 获取已中奖的名字列表
    const luckMemberNames = luckMemberArr.map(member => member.name);

    // 获取抽奖人数
    const newLuckNum = getMemberNumInputVal();
    
    // 如果已中奖人数等于总人数，则提示重置
    if (luckMemberArr.length === memberList.length) {
        alert(`所有人都已经中奖，请重置抽奖程序！`);
        return;
    }
    if ((luckMemberArr.length + newLuckNum) > memberList.length) {
        alert(`当前抽奖人数超过剩余未中奖人数！`);
        return;
    }

    // 获取奖品
    if (globalProps.isRedrawMode) {
        // 续抽模式：收集选中的奖品和数量
        globalProps.nowPrizeObj = [];
        const checkedPrizes = document.querySelectorAll('.prize-table .row.disabled input[type="checkbox"]:checked');
        checkedPrizes.forEach(checkbox => {
            const row = checkbox.closest('.row');
            const redrawInput = row.querySelector('.redraw-input');
            const prizeId = parseInt(checkbox.value);
            const prize = prizeList.find(item => item.id === prizeId);
            if (prize) {
                const redrawCount = parseInt(redrawInput.value || 1);
                prize.memberNum = redrawCount;
                globalProps.nowPrizeObj.push({...prize});
            }
        });
    }

    // 检查并保存奖品ID，避免重复
    const existingPrizeIndexStr = localStorage.getItem(globalProps.storageKey.prizeIndex);
    const existingPrizeIds = existingPrizeIndexStr ? existingPrizeIndexStr.split(',').map(id => parseInt(id)) : [];
    const newPrizeIds = globalProps.nowPrizeObj.map(prize => prize.id);
    
    // 只保存不在已存储列表中的新ID
    const prizeIdsToSave = newPrizeIds.filter(id => !existingPrizeIds.includes(id));
    
    if (prizeIdsToSave.length > 0) {
        const updatedPrizeIds = [...existingPrizeIds, ...prizeIdsToSave];
        localStorage.setItem(globalProps.storageKey.prizeIndex, updatedPrizeIds.toString());
    }

    // 更新奖项总人数
    const prizeTotalCountsStr = localStorage.getItem(globalProps.storageKey.prizeTotalCounts);
    const prizeTotalCounts = prizeTotalCountsStr ? JSON.parse(prizeTotalCountsStr) : {};
    
    globalProps.nowPrizeObj.forEach(prize => {
        if (!prizeTotalCounts[prize.id]) {
            // 如果是首次抽取，使用原始人数
            prizeTotalCounts[prize.id] = {
                count: prize.memberNum,
                name: prize.name,
                level: prize.level
            };
        } else if (globalProps.isRedrawMode) {
            // 如果是续抽，累加人数
            prizeTotalCounts[prize.id].count += prize.memberNum;
        }
    });
    
    // 存储每个奖项的实际总人数
    localStorage.setItem(globalProps.storageKey.prizeTotalCounts, JSON.stringify(prizeTotalCounts));

    globalProps.running = true;// 开始抽奖 抽奖进行中
    globalProps.el.runningMusic.pause()// 暂停背景音乐
    globalProps.el.runningSpecialMusic.currentTime = 7.2// 设置背景音乐播放时间
    globalProps.el.runningSpecialMusic.play()// 播放背景音乐 

    globalProps.el.prizeShow.classList.add(`hide-g`)// 隐藏奖品列表
    globalProps.el.startBtn.classList.add(`hide-g`)// 隐藏开始按钮
    globalProps.el.pauseBtn.classList.remove(`hide-g`)// 显示停止按钮
    
    // 禁用其他按钮
    disableButtons();
    
    TagCanvas.SetSpeed("canvas", [0.8, 0.1])// 设置抽奖速度

    globalProps.nowLuckMemberIndexArr = []// 清空已抽奖名单
    let randomNum
    // 抽奖 直到抽奖人数等于抽奖人数
    while (globalProps.nowLuckMemberIndexArr.length !== newLuckNum) {
        randomNum = Math.ceil(Math.random() * memberList.length) - 1;
        const memberName = memberList[randomNum].name;
        if (!luckMemberNames.includes(memberName)) {
            globalProps.nowLuckMemberIndexArr.push(randomNum);
            // 无论是否是续抽模式，都将新中奖者添加到总名单中
            luckMemberArr.push({
                index: randomNum,
                name: memberName
            });
            luckMemberNames.push(memberName);
        }
    }

    // 保存续抽记录
    if (globalProps.isRedrawMode) {
        const redrawRecordsStr = localStorage.getItem(globalProps.storageKey.redrawRecords);
        const redrawRecords = redrawRecordsStr ? JSON.parse(redrawRecordsStr) : [];
        
        // 为每个奖品创建单独的续抽记录
        let startIndex = 0;
        const currentRedrawRecords = globalProps.nowPrizeObj.map(prize => {
            // 找出这个奖品对应的中奖者
            const prizeWinners = globalProps.nowLuckMemberIndexArr
                .slice(startIndex, startIndex + prize.memberNum)
                .map(index => ({
                    index,
                    name: memberList[index].name
                }));
            
            // 更新开始索引
            startIndex += prize.memberNum;
            
            return {
                date: new Date().toISOString(),
                prize: {
                    id: prize.id,
                    name: prize.name,
                    level: prize.level
                },
                count: prize.memberNum,
                winners: prizeWinners
            };
        });
        
        redrawRecords.push(...currentRedrawRecords);
        localStorage.setItem(globalProps.storageKey.redrawRecords, JSON.stringify(redrawRecords));
    }

    // 无论是否是续抽模式，都更新总中奖名单
    localStorage.setItem(storageKey, JSON.stringify(luckMemberArr));

    // 更新对应的当前抽奖名单
    if (globalProps.isHiddenPrize) {
        globalProps.nowHiddenLuckMemberIndexArr = globalProps.nowLuckMemberIndexArr;
    }

    // 在 luckDrawStart 函数中添加存储原始抽奖记录的代码
    if (!globalProps.isRedrawMode && !globalProps.isHiddenPrize) {
        const prizeDrawRecordsStr = localStorage.getItem(globalProps.storageKey.prizeDrawRecords);
        const prizeDrawRecords = prizeDrawRecordsStr ? JSON.parse(prizeDrawRecordsStr) : [];
        
        // 为每个奖品创建抽奖记录
        let startIndex = 0;
        const currentDrawRecords = globalProps.nowPrizeObj.map(prize => {
            // 找出这个奖品对应的中奖者
            const prizeWinners = globalProps.nowLuckMemberIndexArr
                .slice(startIndex, startIndex + prize.memberNum)
                .map(index => ({
                    index,
                    name: memberList[index].name
                }));
            
            // 更新开始索引
            startIndex += prize.memberNum;
            
            return {
                date: new Date().toISOString(),
                prize: {
                    id: prize.id,
                    name: prize.name,
                    level: prize.level
                },
                count: prize.memberNum,
                winners: prizeWinners
            };
        });
        
        prizeDrawRecords.push(...currentDrawRecords);
        localStorage.setItem(globalProps.storageKey.prizeDrawRecords, JSON.stringify(prizeDrawRecords));
    }
}

// 暂停抽奖
const luckDrawPause = () => {
    globalProps.el.pauseBtn.classList.add(`hide-g`);// 隐藏停止按钮
    globalProps.el.startBtn.classList.remove(`hide-g`);// 显示开始按钮
    
    // 启用其他按钮
    enableButtons();
    
    TagCanvas.SetSpeed("canvas", getCanvasSpeed());// 设置抽奖速度
    globalProps.el.runningMusic.pause();// 暂停背景音乐
    globalProps.el.runningSpecialMusic.pause();// 暂停背景音乐
    globalProps.el.resultMusic.currentTime = 2.3;// 设置结果音乐播放时间
    globalProps.el.resultMusic.play();// 播放结果音乐
    setTimeout(() => {
        globalProps.el.resultMusic.pause()// 暂停结果音乐
        globalProps.el.runningMusic.currentTime = 1.5// 设置背景音乐播放时间
        globalProps.el.runningMusic.play()// 播放背景音乐
    },6400)
    globalProps.lock = false// 锁定
    globalProps.el.lockBtn.classList.remove(`hide-g`)// 显示锁按钮
    if (globalProps.isHiddenPrize && globalProps.nowHiddenLuckMemberIndexArr.length > 0) {
        // 保存隐藏奖记录
        const hiddenRecordsStr = localStorage.getItem(globalProps.storageKey.hiddenPrizeRecords);
        const hiddenRecords = hiddenRecordsStr ? JSON.parse(hiddenRecordsStr) : [];
        
        hiddenRecords.push({
            winners: globalProps.nowHiddenLuckMemberIndexArr,
            date: new Date().toISOString()
        });
        
        localStorage.setItem(globalProps.storageKey.hiddenPrizeRecords, JSON.stringify(hiddenRecords));
    }
    
    showNewLuckMemberResult();
    globalProps.running = false;
    
    // 重置输入框值为1
    globalProps.el.memberNumInput.value = "1";
}

// 显示抽奖结果
const showNewLuckMemberResult = () => {
    let resultHtml = ``;
    let prizeSectionsHtml = ``;
    
    if (globalProps.isHiddenPrize) {
        // 隐藏奖的显示逻辑
        let winnersHtml = ``;
        globalProps.nowHiddenLuckMemberIndexArr.forEach((index) => {
            const winner = memberList[index];
            winnersHtml += `
                <div class="winner-card">
                    <div class="winner-avatar">
                        <img src="./statics/images/member/${winner.name}.png" alt="${winner.name}">
                    </div>
                    <div class="winner-name">${winner.name}</div>
                </div>
            `;
        });
        
        prizeSectionsHtml = `
            <div class="prize-section hidden-prize">
                <div class="prize-image">
                    <img src="./statics/images/prize-min/27.png" alt="隐藏奖"/>
                </div>
                <div class="winners-grid">
                    ${winnersHtml}
                </div>
            </div>
        `;
    } else {
        // 修改普通奖品的显示逻辑
        let startIndex = 0;
        prizeSectionsHtml = globalProps.nowPrizeObj.map(prize => {
            const prizeWinners = globalProps.nowLuckMemberIndexArr
                .slice(startIndex, startIndex + prize.memberNum);
            
            const winnerCount = prizeWinners.length;
            const gridClass = winnerCount === 5 ? 'five-winners' : 'seven-winners';
            
            // 分割获奖者为两行
            let firstRow, secondRow;
            if (winnerCount === 5) {
                firstRow = prizeWinners.slice(0, 2);
                secondRow = prizeWinners.slice(2);
            } else {
                firstRow = prizeWinners.slice(0, 3);
                secondRow = prizeWinners.slice(3);
            }

            // 生成行HTML
            const generateRowHtml = (winners) => {
                return winners.map(index => {
                    const winner = memberList[index];
                    return `
                        <div class="winner-card">
                            <div class="winner-avatar">
                                <img src="./statics/images/member/${winner.name}.png" alt="${winner.name}">
                            </div>
                            <div class="winner-name">${winner.name}</div>
                        </div>
                    `;
                }).join('');
            };
            
            startIndex += prize.memberNum;
            
            return `
                <div class="prize-section">
                    <div class="prize-image">
                        <img src="./statics/images/prize-min/${prize.id}.png" alt="${prize.name}"/>
                    </div>
                    <div class="winners-grid ${gridClass}">
                        <div class="winners-row">${generateRowHtml(firstRow)}</div>
                        <div class="winners-row">${generateRowHtml(secondRow)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    resultHtml = `
        <div class="prize-sections">
            ${prizeSectionsHtml}
        </div>
    `;

    globalProps.el.result.innerHTML = `<div id="resultRow">${resultHtml}</div>`;
    const closeBtnEl = document.createElement(`div`);
    closeBtnEl.classList.add(`close-btn`);
    closeBtnEl.innerText = `+`;
    closeBtnEl.addEventListener(`click`, closeResult);
    globalProps.el.result.appendChild(closeBtnEl);
    globalProps.el.mask.classList.remove(`hide-g`);
    globalProps.el.result.classList.remove(`hide-g`);
    
    // // 延时截图
    // setTimeout(() => {
        
    //     if (!globalProps.isHiddenPrize) {
    //         // 检查是否所有常规奖品都已抽完
    //         const prizeIndexStr = localStorage.getItem(globalProps.storageKey.prizeIndex);
    //         const prizeIndexArr = prizeIndexStr ? prizeIndexStr.split(',') : [];
            
    //         // 计算所有常规奖品的总数
    //         const totalRegularPrizes = prizeList.length;
            
    //         // 如果已抽取的奖品数等于总奖品数，说明所有常规奖品都抽完了
    //         if (prizeIndexArr.length === totalRegularPrizes) {
    //             // 导出中奖和未中奖名单
    //             exportLuckMemberList(false);
    //             exportNotLuckMemberList(false);
    //         }
    //     } else {
    //         // 隐藏奖的导出逻辑保持不变
    //         exportNotLuckMemberList(globalProps.isHiddenPrize);
    //         exportLuckMemberList(globalProps.isHiddenPrize);
    //     }
    // }, 300);
}

// 关闭抽奖结果
const closeResult = () => {
    globalProps.el.mask.classList.add(`hide-g`);
    globalProps.el.result.classList.add(`hide-g`);
    globalProps.el.prizeShow.classList.add(`hide-g`);
    globalProps.el.runningMusic.pause()
    globalProps.el.runningSpecialMusic.pause()
    // globalProps.el.resultMusic.pause()
    // 保证音乐一直播放
    globalProps.el.runningMusic.currentTime = 1.5
    globalProps.el.runningMusic.play()
    globalProps.nowPrizeObj = [];
    globalProps.nowLuckMemberIndexArr = [];
    globalProps.isRedrawMode = false; // 重置续抽模式
    
    // 重置输入框值为1
    globalProps.el.memberNumInput.value = "1";
}

// 奖品初始化
const prizeInit = () => {
    const showPrizeBtnEl = document.getElementById(`showPrizeBtn`)
    showPrizeBtnEl.addEventListener(`click`, () => {
        prizeShow()
    })
    // 打开背景音乐
    const audioOpenBtnEl = document.getElementById(`audioOpenBtn`)
    audioOpenBtnEl.addEventListener(`click`, () => {
        globalProps.el.runningMusic.currentTime = 1.5
        globalProps.el.runningMusic.play()
    })
}

// 显示奖品列表
const prizeShow = () => {
    globalProps.nowPrizeObj=[]
    globalProps.el.prizeImg.classList.add(`hide-g`)

    let prizeIndexArr = []
    if(localStorage.getItem(globalProps.storageKey.prizeIndex)){
        prizeIndexArr=localStorage.getItem(globalProps.storageKey.prizeIndex).split(`,`)
    }

    // 获取每个奖项的实际总人数
    const prizeTotalCountsStr = localStorage.getItem(globalProps.storageKey.prizeTotalCounts);
    const prizeTotalCounts = prizeTotalCountsStr ? JSON.parse(prizeTotalCountsStr) : {};

    let prizeRowHtml = ``
    prizeList.forEach(item => {
        const isDrawn = prizeIndexArr.includes(item.id.toString());
        const totalCount = prizeTotalCounts[item.id] ? prizeTotalCounts[item.id].count : item.memberNum;
        
        prizeRowHtml += `<div class="row ${isDrawn ? 'disabled' : ''}">
                            <span><input type="checkbox" ${isDrawn ? 'disabled' : ''} value="${item.id}" name="prize-id"></span>
                            <span>${item.level}</span>
                            <span>${item.name}</span>
                            <span>${totalCount}</span>
                            ${isDrawn ? `<input type="number" class="redraw-input hide-g" min="1" max="${item.memberNum}" value="1">` : ''}
                        </div>`
    })

    let prizeTdHtml=`<div class="tableTitle">
                        <span>奖品列表</span>
                        <div class="title-buttons">
                            ${prizeIndexArr.length > 0 ? '<span id="redrawBtn" class="title-button">续抽</span>' : ''}
                            <span id="hidePrizeBtn" class="title-button">关闭</span>
                        </div>
                    </div>
                    <div class="tableCont">
                        ${prizeRowHtml}
                    </div>`

    globalProps.el.prizeShow.innerHTML = prizeTdHtml

    const hidePrizeBtnEl = document.getElementById(`hidePrizeBtn`)
    hidePrizeBtnEl.addEventListener(`click`, () => {
        globalProps.el.prizeShow.classList.add(`hide-g`)
        globalProps.isRedrawMode = false
    })

    if (prizeIndexArr.length > 0) {
        const redrawBtnEl = document.getElementById(`redrawBtn`)
        redrawBtnEl.addEventListener(`click`, toggleRedrawMode)
    }

    //再添加input的点击事件 更新抽奖人数
    const prizeIdInputEls = document.getElementsByName(`prize-id`)
    prizeIdInputEls.forEach(prizeIdInputEl => {
        prizeIdInputEl.addEventListener(`click`, () => {
            if (globalProps.isRedrawMode) {
                const row = prizeIdInputEl.closest('.row')
                const redrawInput = row.querySelector('.redraw-input')
                if (prizeIdInputEl.checked) {
                    redrawInput.classList.remove('hide-g')
                    updateRedrawCount()
                } else {
                    redrawInput.classList.add('hide-g')
                    updateRedrawCount()
                }
            } else {
                const prizeId = parseInt(prizeIdInputEl.value)
                if (prizeIdInputEl.checked) {
                    globalProps.nowPrizeObj.push(prizeList.find(item => item.id === prizeId))
                } else {
                    globalProps.nowPrizeObj = globalProps.nowPrizeObj.filter(item => item.id !== prizeId)
                }

                //更新memberNumInput的值 更新抽奖人数
                let nowPrizeObjCount = 0
                globalProps.nowPrizeObj.forEach(item => {
                    nowPrizeObjCount += item.memberNum
                })
                globalProps.el.memberNumInput.value = nowPrizeObjCount
            }
        })
    })

    // 为续抽数量输入框添加事件监听
    const redrawInputs = document.querySelectorAll('.redraw-input')
    redrawInputs.forEach(input => {
        input.addEventListener('input', updateRedrawCount)
    })

    globalProps.el.prizeShow.classList.remove(`hide-g`)
}

// 切换续抽模式
const toggleRedrawMode = () => {
    globalProps.isRedrawMode = !globalProps.isRedrawMode
    const rows = document.querySelectorAll('.prize-table .row.disabled')
    const redrawBtn = document.getElementById('redrawBtn')
    
    rows.forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]')
        const redrawInput = row.querySelector('.redraw-input')
        
        if (globalProps.isRedrawMode) {
            row.classList.add('highlight')
            checkbox.disabled = false
            if (checkbox.checked) {
                redrawInput.classList.remove('hide-g')
            }
        } else {
            row.classList.remove('highlight')
            checkbox.disabled = true
            checkbox.checked = false
            redrawInput.classList.add('hide-g')
        }
    })
    
    redrawBtn.style.color = globalProps.isRedrawMode ? '#e56e6e' : ''
    updateRedrawCount()
}

// 更新续抽数量
const updateRedrawCount = () => {
    if (!globalProps.isRedrawMode) {
        globalProps.el.memberNumInput.value = "1"
        return
    }
    
    let totalCount = 0
    const checkedPrizes = document.querySelectorAll('.prize-table .row.disabled input[type="checkbox"]:checked')
    
    checkedPrizes.forEach(checkbox => {
        const row = checkbox.closest('.row')
        const redrawInput = row.querySelector('.redraw-input')
        totalCount += parseInt(redrawInput.value || 0)
    })
    
    globalProps.el.memberNumInput.value = totalCount || "1"
}

// 修改导出未中奖名单函数
const exportNotLuckMemberList = (isHidden = false) => {
    // 获取所有中奖记录
    const regularLuckMemberStr = localStorage.getItem(globalProps.storageKey.luckMemberIndexArr);
    const hiddenLuckMemberStr = localStorage.getItem(globalProps.storageKey.hiddenLuckMemberIndexArr);
    
    // 合并所有中奖者名单
    const regularLuckMembers = regularLuckMemberStr ? JSON.parse(regularLuckMemberStr) : [];
    const hiddenLuckMembers = hiddenLuckMemberStr ? JSON.parse(hiddenLuckMemberStr) : [];
    const allWinners = [...regularLuckMembers, ...hiddenLuckMembers];
    const winnerNames = allWinners.map(member => member.name);
    
    // 过滤出未中奖名单
    const notLuckMemberList = memberList.filter(member => !winnerNames.includes(member.name));

    if (notLuckMemberList.length === 0) {
        alert('当前没有未中奖人员！');
        return;
    }

    // 生成CSV内容
    let csvContent = '序号,姓名\n';
    notLuckMemberList.forEach((member, index) => {
        csvContent += `${index + 1},${member.name}\n`;
    });

    // 导出文件
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    downloadCSV(csvContent, `未中奖名单_${formattedDate}.csv`);
};

// 修改导出中奖名单函数
const exportLuckMemberList = (isHidden = false) => {
    if (isHidden) {
        // 导出隐藏奖名单
        const hiddenRecordsStr = localStorage.getItem(globalProps.storageKey.hiddenPrizeRecords);
        const hiddenRecords = hiddenRecordsStr ? JSON.parse(hiddenRecordsStr) : [];

        if (hiddenRecords.length === 0) {
            alert('当前没有隐藏奖中奖记录！');
            return;
        }

        let csvContent = '序号,中奖人员,抽取时间\n';
        hiddenRecords.forEach((record, index) => {
            const winners = record.winners.map(index => memberList[index].name);
            const date = new Date(record.date || new Date()).toLocaleString('zh-CN');
            csvContent += `${index + 1},${winners.join('、')},${date}\n`;
        });

        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        downloadCSV(csvContent, `隐藏奖中奖名单_${formattedDate}.csv`);
    } else {
        // 导出常规奖中奖名单
        const prizeDrawRecordsStr = localStorage.getItem(globalProps.storageKey.prizeDrawRecords);
        const redrawRecordsStr = localStorage.getItem(globalProps.storageKey.redrawRecords);
        
        const prizeDrawRecords = prizeDrawRecordsStr ? JSON.parse(prizeDrawRecordsStr) : [];
        const redrawRecords = redrawRecordsStr ? JSON.parse(redrawRecordsStr) : [];

        if (prizeDrawRecords.length === 0 && redrawRecords.length === 0) {
            alert('当前没有常规奖中奖记录！');
            return;
        }

        let csvContent = '序号,奖项,中奖人员,类型,抽取时间\n';
        let index = 1;

        // 添加首次抽奖记录
        prizeDrawRecords.forEach(record => {
            const winners = record.winners.map(w => w.name);
            const date = new Date(record.date).toLocaleString('zh-CN');
            csvContent += `${index++},${record.prize.level} - ${record.prize.name},${winners.join('、')},首次抽取,${date}\n`;
        });

        // 添加续抽记录
        redrawRecords.forEach(record => {
            const winners = record.winners.map(w => w.name);
            const date = new Date(record.date).toLocaleString('zh-CN');
            csvContent += `${index++},${record.prize.level} - ${record.prize.name},${winners.join('、')},续抽,${date}\n`;
        });

        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        downloadCSV(csvContent, `常规奖中奖名单_${formattedDate}.csv`);
    }
};

// 辅助函数：下载CSV文件
const downloadCSV = (content, filename) => {
    const BOM = '\uFEFF'; // 添加BOM头，解决中文乱码
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// 重置所有数据
const resetAll = () => {
    if (!confirm('确定要重置所有数据吗？这将清空所有抽奖记录！')) {
        return;
    }
    
    if (!confirm('再次确认是否重置？重置后数据将无法恢复！')) {
        return;
    }

    localStorage.removeItem(globalProps.storageKey.luckMemberIndexArr);
    localStorage.removeItem(globalProps.storageKey.hiddenLuckMemberIndexArr);
    localStorage.removeItem(globalProps.storageKey.prizeIndex);
    localStorage.removeItem(globalProps.storageKey.hiddenPrizeRecords);
    localStorage.removeItem(globalProps.storageKey.redrawRecords);
    localStorage.removeItem(globalProps.storageKey.prizeTotalCounts); // 清空奖项总人数记录
    localStorage.removeItem(globalProps.storageKey.prizeDrawRecords); // 清空每个奖品的原始抽奖记录
    location.reload();
};

const init = () => {
    canvasInit()
    operateInit()
    prizeInit()
    
    // 添加导出按钮点击事件
    const exportBtn = document.querySelector('.export-btn');
    const exportDropdown = document.querySelector('.export-dropdown');
    const hideStartBtn = document.querySelector('#hideStartBtn');
    const startBtn = document.querySelector('#startBtn');
    const pauseBtn = document.querySelector('#pauseBtn');
    let isDropdownVisible = false;

    // 点击导出按钮时切换下拉菜单
    exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isDropdownVisible = !isDropdownVisible;
        if (isDropdownVisible) {
            exportDropdown.classList.add('show');
        } else {
            exportDropdown.classList.remove('show');
        }
    });

    // 添加隐藏开始按钮的点击事件
    hideStartBtn.addEventListener('click', () => {
        if (startBtn.style.display === 'none') {
            startBtn.style.display = '';
            pauseBtn.style.display = '';
        } else {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'none';
        }
    });

    // 点击下拉菜单项时不关闭菜单
    exportDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 点击页面其他地方时关闭下拉菜单
    document.addEventListener('click', () => {
        isDropdownVisible = false;
        exportDropdown.classList.remove('show');
    });
}

init()