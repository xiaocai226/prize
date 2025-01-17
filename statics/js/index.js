const globalProps = {
    storageKey: {
        luckMemberIndexArr: `luckMemberIndexArr`,// 已抽奖名单
        prizeIndex: `prizeIndex`,// 已抽奖品
        hiddenLuckMemberIndexArr: 'hiddenLuckMemberIndexArr', // 已抽隐藏奖名单
        hiddenPrizeRecords: 'hiddenPrizeRecords', // 新增：存储隐藏奖记录（包含金额）
    },
    el: {},
    nowLuckMemberIndexArr: [],// 当前抽奖名单
    nowHiddenLuckMemberIndexArr: [], // 当前隐藏奖名单
    nowPrizeObj: [],// 当前奖品
    running: false,// 抽奖进行与否
    hiddenPrizeAmount: 0, // 隐藏奖金额
    isHiddenPrize: false, // 是否在抽隐藏奖
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
// globalProps.el.lockBtn = document.getElementById(`lockBtn`)
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
        dragControl: 1,
        textFont: null,
        textColour: "＃fff",
        // textHeight: 10,
        // wheelZoom: false,
        imageScale: 0.18, // 控制图片缩放比例
        // imageRadius: 10, // 控制图片半径
        // imageMode: "both", // 同时显示图片和文字
        // imagePosition: "top", // 图片位置
        // outlineMethod: "none", // 移除轮廓
    })
}

const operateInit = () => {
    globalProps.el.startBtn.addEventListener(`click`, luckDrawStart)
    // ???????
    // document.onkeydown = (event) => {
    //     if (event.key === "Enter" || event.key === "Tab" || event.key === "PageUp" || event.key === "PageDown") {
    //         if(!globalProps.lock){
    //             return false
    //         }
    //         if (globalProps.running) {
    //             luckDrawPause()
    //         } else {
    //             luckDrawStart()
    //         }
    //         return false
    //     }
    // }
    globalProps.el.pauseBtn.addEventListener(`click`, luckDrawPause)
    // 双击重置
    globalProps.el.resetBtn.addEventListener(`dblclick`, resetAll)
    // globalProps.el.lockBtn.addEventListener(`click`, () => {
    //     globalProps.lock = true;// 锁定
    //     globalProps.el.lockBtn.classList.add(`hide-g`)
    // })
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

// 开始抽奖
const luckDrawStart = () => {
    // 检查是否选择了奖品
    if (globalProps.nowPrizeObj.length === 0) {
        const confirmHidden = confirm(`当前未选择奖品，且抽奖人数为 ${getMemberNumInputVal()}，是否要抽取隐藏奖？`);
        if (!confirmHidden) {
            return; // 如果用户点击取消，则终止抽奖
        }
        
        // 密码验证
        // const password = prompt('请输入隐藏奖密码：');
        // if (password !== 'lucky888') { // 这里设置密码为'lucky888'
        //     alert('密码错误，无法抽取隐藏奖！');
        //     return;
        // }
        
        // 输入奖品内容（更灵活的输入）
        const amount = prompt('请输入隐藏奖内容（可以是金额或文字）：');
        if (!amount) {
            alert('请输入有效的隐藏奖内容！');
            return;
        }
        
        globalProps.isHiddenPrize = true; // 标记为隐藏奖抽奖
        globalProps.hiddenPrizeAmount = amount;
    } else {
        globalProps.isHiddenPrize = false;
    }
    
    // 根据是否是隐藏奖获取对应的已中奖名单
    const storageKey = globalProps.isHiddenPrize ? 
        globalProps.storageKey.hiddenLuckMemberIndexArr : 
        globalProps.storageKey.luckMemberIndexArr;
    
    const luckMemberIndexArrStr = localStorage.getItem(storageKey);
    const luckMemberIndexArr = luckMemberIndexArrStr ? JSON.parse(luckMemberIndexArrStr) : [];

    // 获取抽奖人数
    const newLuckNum = getMemberNumInputVal();
    
    // 如果已中奖人数等于总人数，则提示重置
    if (luckMemberIndexArr.length === memberList.length) {
        alert(`所有人都已经中奖，请重置抽奖程序！`);
        return;
    }
    if ((luckMemberIndexArr.length + newLuckNum) > memberList.length) {
        alert(`当前抽奖人数超过剩余未中奖人数！`);
        return;
    }

    // 获取奖品
    const prizeIndex = getPrizeIndex()
    // 已抽奖品 存到本地
    localStorage.setItem(globalProps.storageKey.prizeIndex, prizeIndex.toString());

    globalProps.running = true;// 开始抽奖 抽奖进行中
    globalProps.el.runningMusic.pause()// 暂停背景音乐
    globalProps.el.runningSpecialMusic.currentTime = 7.2// 设置背景音乐播放时间
    globalProps.el.runningSpecialMusic.play()// 播放背景音乐 

    globalProps.el.prizeShow.classList.add(`hide-g`)// 隐藏奖品列表
    globalProps.el.startBtn.classList.add(`hide-g`)// 隐藏开始按钮
    globalProps.el.pauseBtn.classList.remove(`hide-g`)// 显示停止按钮
    TagCanvas.SetSpeed("canvas", [0.8, 0.1])// 设置抽奖速度

    globalProps.nowLuckMemberIndexArr = []// 清空已抽奖名单
    let randomNum
    // 抽奖 直到抽奖人数等于抽奖人数
    while (globalProps.nowLuckMemberIndexArr.length !== newLuckNum) {
        randomNum = Math.ceil(Math.random() * memberList.length)
        randomNum = randomNum - 1
        if (!luckMemberIndexArr.includes(randomNum)) {
            globalProps.nowLuckMemberIndexArr.push(randomNum)
            luckMemberIndexArr.push(randomNum)
        }
    }
    // 已抽奖名单 存到本地
    localStorage.setItem(storageKey, JSON.stringify(luckMemberIndexArr));

    // 更新对应的当前抽奖名单
    if (globalProps.isHiddenPrize) {
        globalProps.nowHiddenLuckMemberIndexArr = globalProps.nowLuckMemberIndexArr;
    }
}

// 暂停抽奖
const luckDrawPause = () => {
    globalProps.el.pauseBtn.classList.add(`hide-g`);// 隐藏停止按钮
    globalProps.el.startBtn.classList.remove(`hide-g`);// 显示开始按钮
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
    // globalProps.lock = false// 解锁
    // globalProps.el.lockBtn.classList.remove(`hide-g`)// 显示锁按钮
    if (globalProps.isHiddenPrize && globalProps.nowHiddenLuckMemberIndexArr.length > 0) {
        // 保存隐藏奖记录
        const hiddenRecordsStr = localStorage.getItem(globalProps.storageKey.hiddenPrizeRecords);
        const hiddenRecords = hiddenRecordsStr ? JSON.parse(hiddenRecordsStr) : [];
        
        hiddenRecords.push({
            winners: globalProps.nowHiddenLuckMemberIndexArr,
            amount: globalProps.hiddenPrizeAmount
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
    let newLuckMember;
    let newLuckMembers = globalProps.isHiddenPrize ? 
        [...globalProps.nowHiddenLuckMemberIndexArr] : 
        [...globalProps.nowLuckMemberIndexArr];
    
    // 无论是隐藏奖还是普通奖品，都使用相同的显示样式
    let prizeSectionsHtml = ``;
    
    if (globalProps.isHiddenPrize) {
        // 隐藏奖的显示逻辑
        let winnersHtml = ``;
        newLuckMembers.forEach((newLuckMemberIndex) => {
            newLuckMember = memberList[newLuckMemberIndex];
            winnersHtml += `
                <div class="winner-card">
                    <div class="winner-avatar">
                        <img src="./statics/images/member/${newLuckMember.name}.png" alt="${newLuckMember.name}">
                    </div>
                    <div class="winner-name">${newLuckMember.name}</div>
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
        // 普通奖品的显示逻辑（保持不变）
        globalProps.nowPrizeObj.forEach(item => {
            let winnersHtml = ``;
            newLuckMembers.forEach((newLuckMemberIndex, index) => {
                if (item.memberNum > index) {
                    newLuckMember = memberList[newLuckMemberIndex];
                    winnersHtml += `
                        <div class="winner-card">
                            <div class="winner-avatar">
                                <img src="./statics/images/member/${newLuckMember.name}.png" alt="${newLuckMember.name}">
                            </div>
                            <div class="winner-name">${newLuckMember.name}</div>
                        </div>
                    `;
                }
            });
            
            prizeSectionsHtml += `
                <div class="prize-section">
                    <div class="prize-image">
                        <img src="./statics/images/prize-min/${item.id}.png" alt="${item.name}"/>
                    </div>
                    <div class="winners-grid">
                        ${winnersHtml}
                    </div>
                </div>
            `;
            
            newLuckMembers.splice(0, item.memberNum);
        });
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
    
    // 延时截图
    setTimeout(() => {
        // if (globalProps.nowPrizeObj.length && globalProps.nowPrizeObj[0].id === 1) {
            // exportNotLuckMemberList(); // 特等奖抽完后导出未中奖名单
            // exportLuckMemberList();// 导出中奖名单
        // }
        // 根据是否是隐藏奖调用对应的导出函数
        // exportNotLuckMemberList(globalProps.isHiddenPrize);
        // exportLuckMemberList(globalProps.isHiddenPrize);
        if (!globalProps.isHiddenPrize) {
            // 检查是否所有常规奖品都已抽完
            const prizeIndexStr = localStorage.getItem(globalProps.storageKey.prizeIndex);
            const prizeIndexArr = prizeIndexStr ? prizeIndexStr.split(',') : [];
            
            // 计算所有常规奖品的总数
            const totalRegularPrizes = prizeList.length;
            
            // 如果已抽取的奖品数等于总奖品数，说明所有常规奖品都抽完了
            if (prizeIndexArr.length === totalRegularPrizes) {
                // 导出中奖和未中奖名单
                exportLuckMemberList(false);
                exportNotLuckMemberList(false);
            }
        } else {
            // 隐藏奖的导出逻辑保持不变
            exportNotLuckMemberList(globalProps.isHiddenPrize);
            exportLuckMemberList(globalProps.isHiddenPrize);
        }
    }, 300);
}

// 关闭抽奖结果
const closeResult = () => {
    globalProps.el.mask.classList.add(`hide-g`);
    globalProps.el.result.classList.add(`hide-g`);
    globalProps.el.prizeShow.classList.add(`hide-g`);
    globalProps.el.runningMusic.pause()
    globalProps.el.runningSpecialMusic.pause()
    globalProps.el.resultMusic.pause()
    globalProps.nowPrizeObj = [];
    globalProps.nowLuckMemberIndexArr = [];
    
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
    let prizeRowHtml = ``
    prizeList.forEach(item => {
        prizeRowHtml += `<div class="row ${prizeIndexArr.includes(item.id.toString())?'disabled':''}">
                            <span><input type="checkbox" ${prizeIndexArr.includes(item.id.toString())?'disabled':''} value="${item.id}" name="prize-id"></span>
                            <span>${item.level}</span>
                            <span>${item.name}</span>
                            <span>${item.memberNum}</span>
                        </div>`
    })

    let prizeTdHtml=`<div class="tableTitle">
                        <span>奖品列表</span>
                        <span id="hidePrizeBtn">关闭</span>
                    </div>
                    <div class="tableCont">
                        ${prizeRowHtml}
                    </div>`

    globalProps.el.prizeShow.innerHTML = prizeTdHtml

    const hidePrizeBtnEl = document.getElementById(`hidePrizeBtn`)
    hidePrizeBtnEl.addEventListener(`click`, () => {
        globalProps.el.prizeShow.classList.add(`hide-g`)
    })

    //再添加input的点击事件 更新抽奖人数
    const prizeIdInputEls = document.getElementsByName(`prize-id`)
    prizeIdInputEls.forEach(prizeIdInputEl => {
        prizeIdInputEl.addEventListener(`click`, () => {
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

        })
    })

    globalProps.el.prizeShow.classList.remove(`hide-g`)
}

// 修改导出未中奖名单函数
const exportNotLuckMemberList = (isHidden = false) => {
    // 根据是否是隐藏奖选择对应的存储键
    const storageKey = isHidden ? 
        globalProps.storageKey.hiddenLuckMemberIndexArr : 
        globalProps.storageKey.luckMemberIndexArr;
    
    const luckMemberIndexArrStr = localStorage.getItem(storageKey);
    const luckMemberIndexArr = luckMemberIndexArrStr ? JSON.parse(luckMemberIndexArrStr) : [];
    
    // 过滤出未中奖名单
    const notLuckMemberList = memberList.filter((member, index) => {
        return !luckMemberIndexArr.includes(index);
    });

    // 如果没有未中奖人员，直接返回
    if (notLuckMemberList.length === 0) {
        return;
    }

    // 生成CSV内容
    let csvContent = '姓名\n'; // CSV头部
    notLuckMemberList.forEach(member => {
        csvContent += `${member.name}\n`; // 每行添加一个名字
    });

    // 添加 BOM 头，确保Excel正确识别中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    const prefix = isHidden ? '隐藏奖_' : '常规奖_';
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    link.download = `${prefix}未中奖名单_${formattedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// 修改导出中奖名单函数
const exportLuckMemberList = (isHidden = false) => {
    if (isHidden) {
        // 获取历史隐藏奖记录
        const hiddenRecordsStr = localStorage.getItem(globalProps.storageKey.hiddenPrizeRecords);
        const hiddenRecords = hiddenRecordsStr ? JSON.parse(hiddenRecordsStr) : [];
        
        // 检查是否有中奖记录
        if (hiddenRecords.length === 0 && globalProps.nowHiddenLuckMemberIndexArr.length === 0) {
            return;
        }

        // 隐藏奖的CSV格式
        let csvContent = '奖项,中奖人员,奖品内容\n';
        
        // 添加历史记录
        hiddenRecords.forEach(record => {
            const winners = record.winners.map(index => memberList[index].name);
            csvContent += `隐藏奖,${winners.join('、')},${record.amount}\n`;
        });

        // 输出CSV
        outputCSV(csvContent, isHidden);
    } else {
        // 常规奖的处理逻辑
        const luckMemberIndexArrStr = localStorage.getItem(globalProps.storageKey.luckMemberIndexArr);
        const luckMemberArr = luckMemberIndexArrStr ? JSON.parse(luckMemberIndexArrStr) : [];
        const prizeIndexStr = localStorage.getItem(globalProps.storageKey.prizeIndex);
        const prizeIndexArr = prizeIndexStr ? prizeIndexStr.split(',') : [];
        console.log(luckMemberIndexArrStr,'已中奖名单')
        console.log(luckMemberArr,'已中奖名单数组')
        console.log(prizeIndexStr,'已中奖奖品')
        console.log(prizeIndexArr,'已中奖奖品数组')

        if (luckMemberArr.length === 0) {
            return;
        }

        // 常规奖的CSV格式
        let csvContent = '奖项,中奖人员\n';
        let currentIndex = 0;

        // 按照抽奖顺序处理奖品
        prizeIndexArr.forEach(prizeId => {
            const prize = prizeList.find(p => p.id.toString() === prizeId);
            if (prize) {
                const winners = luckMemberArr
                    .slice(currentIndex, currentIndex + prize.memberNum)
                    .map(index => memberList[index].name);
                
                csvContent += `${prize.level} - ${prize.name},${winners.join('、')}\n`;
                currentIndex += prize.memberNum;
            }
        });

        // 输出CSV
        outputCSV(csvContent, isHidden);
    }
};

// 辅助函数：输出CSV文件
const outputCSV = (csvContent, isHidden) => {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    const prefix = isHidden ? '隐藏奖_' : '常规奖_';
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    link.download = `${prefix}中奖名单_${formattedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// 重置所有数据
const resetAll = () => {
    localStorage.removeItem(globalProps.storageKey.luckMemberIndexArr);
    localStorage.removeItem(globalProps.storageKey.hiddenLuckMemberIndexArr);
    localStorage.removeItem(globalProps.storageKey.prizeIndex);
    localStorage.removeItem(globalProps.storageKey.hiddenPrizeRecords); // 清空隐藏奖记录
    location.reload();
};

const init = () => {
    canvasInit()
    operateInit()
    prizeInit()
}

init()