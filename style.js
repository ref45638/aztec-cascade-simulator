// 12種顏色
const colors = [
  "#ffd900ff", // 1 WW
  "#FFB347", // 2 H1
  "#e4633bff", // 3 H2
  "#ff7eeeff", // 4 H3
  "#614a8aff", // 5 H4
  "#6699CC", // 6 H5
  "#1b7258ff", // 7 H6
  "#A0522D", // 8 A
  "#a057aaff", // 9 K
  "#a188caff", // 10 Q
  "#67998bff", // 11 J
  "#7dc0acff", // 12 T
];

// 盤面形狀：1=有格，0=空格
// 直向排列，每一子陣列是一「列」
// 每列長度（最高5），不足就填0
const shape = [
  [0, 1, 1, 1, 1, 1], // 第一列（最左）
  [1, 1, 1, 1, 1, 1], // 第二列
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1], // 最右
];

// 陣列填入方式 (直向順序)
// 32格
let firstArray = [
  7, 8, 9, 3, 2, 5, 5, 8, 8, 4, 10, 1, 1, 7, 9, 5, 5, 5, 10, 10, 11, 10, 3, 7,
  9, 9, 9, 12, 7, 5, 5, 5, 5, 5, 2, 5, 2, 8, 12, 3, 11, 2, 8, 8, 11, 9, 4, 5,
];

const SILVER = "silver";
const GOLD = "gold";
const WILD = "wild";
const NORMAL = "normal";

// 邊框配置，例如：[{ID: 1, Pos: 11, Type: "2", Kind: "NORMAL"}]
let borderConfigs = [
  { ID: 1, Pos: 11, Type: "2", Kind: NORMAL, Amount: 0 },
  { ID: 5, Pos: 15, Type: "2", Kind: SILVER, Amount: 0 },
  { ID: 10, Pos: 18, Type: "2", Kind: NORMAL, Amount: 0 },
  { ID: 9, Pos: 24, Type: "3", Kind: SILVER, Amount: 0 },
  { ID: 5, Pos: 29, Type: "2", Kind: NORMAL, Amount: 0 },
  { ID: 5, Pos: 31, Type: "2", Kind: NORMAL, Amount: 0 },
];

function renderBoard(arr, borders = [], blinkPositions = []) {
  let idx = 0;
  const board = document.createElement("div");
  board.className = "board";
  board.style.position = "relative"; // 讓board成為定位容器

  // 建立位置到邊框配置的映射
  const borderMap = {};
  const borderGroups = {};

  borders.forEach((border, borderIndex) => {
    const positions = getBorderPositions(border.Pos, border.Type);
    // 使用唯一的鍵來避免ID衝突
    const uniqueKey = `${border.ID}_${borderIndex}`;
    borderGroups[uniqueKey] = {
      config: border,
      positions: positions,
      cells: [],
    };
    positions.forEach((pos) => {
      if (!borderMap[pos]) {
        borderMap[pos] = [];
      }
      borderMap[pos].push({ ...border, uniqueKey });
    });
  });

  // 記錄每個格子的位置信息
  const cellPositions = [];

  for (let c = 0; c < shape.length; c++) {
    const col = document.createElement("div");
    col.className = "col";

    for (let r = 0; r < shape[c].length; r++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.position = idx;

      if (shape[c][r]) {
        const colorIndex = (arr[idx % arr.length] - 1) % colors.length;
        cell.style.background = colors[colorIndex];
        cell.textContent = idxToShow(arr[idx % arr.length]);

        // 檢查是否需要閃爍
        if (blinkPositions.includes(idx)) {
          cell.classList.add("blink");
        }

        // 記錄格子位置和元素
        cellPositions[idx] = {
          element: cell,
          col: c,
          row: r,
          index: idx,
        };

        // 檢查是否屬於某個邊框組
        if (borderMap[idx]) {
          borderMap[idx].forEach((border) => {
            if (!borderGroups[border.uniqueKey].cells) {
              borderGroups[border.uniqueKey].cells = [];
            }
            borderGroups[border.uniqueKey].cells.push({
              element: cell,
              col: c,
              row: r,
              index: idx,
            });
          });
        }

        idx++;
      } else {
        cell.classList.add("empty");
      }

      col.appendChild(cell);
    }
    board.appendChild(col);
  }

  // 添加邊框覆蓋層
  setTimeout(() => {
    Object.values(borderGroups).forEach((group) => {
      if (group.cells && group.cells.length > 0) {
        createBorderOverlay(board, group);
      }
    });
  }, 0);

  // 為每個 blink 格子添加點擊事件監聽器
  setTimeout(() => {
    const blinkingCells = board.querySelectorAll(".cell.blink");
    blinkingCells.forEach((cell) => {
      cell.addEventListener("click", function (event) {
        // 查找所有具有 blink 類別的元素（包括已隱藏的）
        const allBlinkingCells = board.querySelectorAll(
          ".cell.blink, .cell.blink-hidden"
        );

        if (allBlinkingCells.length > 0) {
          // 檢查當前狀態：是否有隱藏的元素
          const hiddenCells = board.querySelectorAll(".cell.blink-hidden");

          if (hiddenCells.length > 0) {
            // 如果有隱藏的元素，則恢復顯示
            allBlinkingCells.forEach((blinkCell) => {
              blinkCell.style.opacity = "1";
              blinkCell.classList.remove("blink-hidden");
              blinkCell.classList.add("blink");
            });
          } else {
            // 如果沒有隱藏的元素，則隱藏所有閃爍元素
            allBlinkingCells.forEach((blinkCell) => {
              blinkCell.style.opacity = "0";
              blinkCell.classList.remove("blink");
              blinkCell.classList.add("blink-hidden");
            });
          }

          // 阻止事件冒泡，避免重複觸發
          event.stopPropagation();
        }
      });
    });
  }, 100);

  return board;
}

function createBorderOverlay(board, borderGroup) {
  const cells = borderGroup.cells;
  const config = borderGroup.config;

  if (cells.length === 0) return;

  // 創建邊框覆蓋層
  const overlay = document.createElement("div");

  // 根據Kind屬性決定CSS類別
  let overlayClass = "border-overlay";
  if (config.Kind === "silver") {
    overlayClass += " border-overlay-silver";
  } else if (config.Kind === "gold") {
    overlayClass += " border-overlay-gold";
  }

  overlay.className = overlayClass;
  overlay.dataset.borderId = config.ID;
  overlay.dataset.borderType = config.Type;
  overlay.dataset.borderKind = config.Kind;

  // 計算覆蓋層的位置和大小
  const firstCell = cells[0].element;
  const lastCell = cells[cells.length - 1].element;

  const firstRect = firstCell.getBoundingClientRect();
  const lastRect = lastCell.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();

  // 獲取board的padding值
  const boardStyles = window.getComputedStyle(board);
  const paddingLeft = parseInt(boardStyles.paddingLeft) || 0;
  const paddingTop = parseInt(boardStyles.paddingTop) || 0;

  // 計算相對於board內容區域的位置（扣除padding）
  const left = firstRect.left - boardRect.left - paddingLeft - 3 + 9;
  const top = firstRect.top - boardRect.top - paddingTop - 3 + 10;
  const width = lastRect.right - firstRect.left + 6 - 5;
  const height = lastRect.bottom - firstRect.top + 6 - 4;

  overlay.style.left = left + "px";
  overlay.style.top = top + "px";
  overlay.style.width = width + "px";
  overlay.style.height = height + "px";

  board.appendChild(overlay);
}

// 根據位置和類型獲取需要邊框的所有位置
function getBorderPositions(startPos, type) {
  startPos = mapping[mappingFakeIdxToRealIdx[startPos]];

  const positions = [startPos];

  switch (type) {
    case "2": // 2格邊框（垂直連續）
      positions.push(startPos + 1);
      break;
    case "3": // 3格邊框（垂直連續）
      positions.push(startPos + 1, startPos + 2);
      break;
    case "4": // 4格邊框（垂直連續）
      positions.push(startPos + 1, startPos + 2, startPos + 3);
      break;
  }

  return positions;
}

idxToShow = (idx) => {
  switch (idx) {
    case 0:
      return "SF";
    case 1:
      return "WW";
    case 2:
      return "H1";
    case 3:
      return "H2";
    case 4:
      return "H3";
    case 5:
      return "H4";
    case 6:
      return "H5";
    case 7:
      return "H6";
    case 8:
      return "A";
    case 9:
      return "K";
    case 10:
      return "Q";
    case 11:
      return "J";
    case 12:
      return "T";
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const boardsContainer = document.getElementById("boardsContainer");
  const gameDataField = document.getElementById("gameData");

  // 初始化輸入框的值
  firstArray = fakeArrToRealArr(firstArray);

  // 設置您提供的遊戲資料
  const initialGameData = JSON.parse(
    `{"ReelInfo":{"ReelStrip":[5,6,8,9,3,2,7,12,1,1,6,6,6,3,9,7,7,3,7,7,9,10,1,1,1,1,6,12,3,6,6,6,0,0,9,8,5,9,8,11,9,2,2,4,4,5,8,5],"ReelIndex":[22,71,79,19,72,99,90],"SymbolInfos":[{"ID":1,"Pos":8,"Type":"2","Kind":"normal","Amount":0},{"ID":6,"Pos":10,"Type":"3","Kind":"normal","Amount":0},{"ID":7,"Pos":15,"Type":"2","Kind":"silver","Amount":0},{"ID":7,"Pos":18,"Type":"2","Kind":"normal","Amount":0},{"ID":1,"Pos":22,"Type":"4","Kind":"normal","Amount":0},{"ID":6,"Pos":29,"Type":"3","Kind":"normal","Amount":0},{"ID":0,"Pos":32,"Type":"2","Kind":"normal","Amount":0}],"RemoveInfos":[{"FallReels":[[7],[5,7],[4],[10,4,9,11],[],[],[]],"RemovePos":[4,8,9,17,22,23,24,25],"ReelStrip":[5,7,6,8,9,2,7,5,5,7,6,6,6,6,10,4,7,7,7,7,7,6,10,4,9,11,6,12,12,6,6,6,0,0,9,9,5,9,8,11,9,7,8,4,4,5,8,10],"SymbolInfos":[{"ID":6,"Pos":10,"Type":"3","Kind":"normal","Amount":0},{"ID":7,"Pos":18,"Type":"2","Kind":"silver","Amount":0},{"ID":6,"Pos":29,"Type":"3","Kind":"normal","Amount":0},{"ID":0,"Pos":32,"Type":"2","Kind":"normal","Amount":0},{"ID":0,"Pos":32,"Type":"2","Kind":"normal","Amount":0}],"WinConditions":[{"WinLine":0,"WinItem":3,"WinType":1,"WinPay":40}],"RemoveWin":4000,"Multiple":2,"RemoveWays":7200},{"FallReels":[[4],[8],[10,6,10,10],[],[],[],[]],"RemovePos":[1,9,16,17,18,19],"ReelStrip":[11,4,6,8,9,2,10,8,8,5,6,6,6,4,8,10,6,4,10,10,10,6,10,4,9,11,6,9,12,6,6,6,0,0,12,7,5,9,8,11,9,4,6,4,4,5,8,5],"SymbolInfos":[{"ID":7,"Pos":18,"Type":"2","Kind":"gold","Amount":0},{"ID":0,"Pos":32,"Type":"2","Kind":"normal","Amount":0},{"ID":0,"Pos":32,"Type":"2","Kind":"normal","Amount":0},{"ID":0,"Pos":32,"Type":"2","Kind":"normal","Amount":0}],"WinConditions":[{"WinLine":0,"WinItem":7,"WinType":0,"WinPay":12}],"RemoveWin":2400,"Multiple":3,"RemoveWays":9000},{"FallReels":[[8],[5,10,11],[8],[11],[12,9,5],[],[]],"RemovePos":[2,10,11,12,16,26,29,30,31],"ReelStrip":[7,8,4,8,9,2,11,10,5,10,11,8,5,4,2,8,10,4,10,10,2,6,11,10,4,9,11,9,2,12,9,5,0,0,4,6,5,9,8,11,9,3,11,4,4,5,8,2],"SymbolInfos":[{"ID":7,"Pos":18,"Type":"2","Kind":"gold","Amount":0},{"ID":0,"Pos":32,"Type":"2","Kind":"normal","Amount":0}],"WinConditions":[{"WinLine":0,"WinItem":6,"WinType":2,"WinPay":20}],"RemoveWin":6000,"Multiple":4,"RemoveWays":22500},{"FallReels":[[4,12],[4],[2],[],[],[],[4]],"RemovePos":[1,3,46,11,15],"ReelStrip":[9,4,12,4,9,2,3,12,4,5,10,11,5,2,8,2,10,4,10,10,11,3,11,10,4,9,11,12,4,12,9,5,0,0,11,10,5,9,8,11,9,5,8,4,4,4,5,4],"SymbolInfos":[{"ID":7,"Pos":18,"Type":"2","Kind":"gold","Amount":0},{"ID":0,"Pos":32,"Type":"2","Kind":"normal","Amount":0}],"WinConditions":[{"WinLine":0,"WinItem":8,"WinType":0,"WinPay":16}],"RemoveWin":6400,"Multiple":5,"RemoveWays":22500},{"FallReels":[[11,3],[8],[5],[6],[],[],[6,5,12]],"RemovePos":[1,3,8,45,17,44,24,43],"ReelStrip":[9,11,3,12,9,2,12,4,8,5,10,11,5,4,6,5,2,10,10,10,6,9,6,11,10,9,11,2,2,12,9,5,0,0,6,10,5,9,8,11,9,3,11,6,5,12,5,10],"SymbolInfos":[{"ID":7,"Pos":18,"Type":"2","Kind":"gold","Amount":0},{"ID":0,"Pos":32,"Type":"2","Kind":"normal","Amount":0}],"WinConditions":[{"WinLine":0,"WinItem":4,"WinType":2,"WinPay":400}],"RemoveWin":200000,"Multiple":6,"RemoveWays":22500},{"FallReels":null,"RemovePos":null,"ReelStrip":null,"SymbolInfos":null,"WinConditions":null,"RemoveWin":0,"Multiple":0,"RemoveWays":0}],"CurrentWays":2700},"WinInfo":{"FgGameTimes":0,"FgGameType":0,"FgFirstReelInfo":{"ReelStrip":null,"ReelIndex":null,"SymbolInfos":null,"RemoveInfos":null,"CurrentWays":0},"TotalWin":218800,"TotalPay":2188,"TotalLine":0,"WinCondition":null},"WagerID":"129016e0defc2221000","Coin":4407973900,"Wallet":{"Coin":4407973900,"Revision":1}}`
  );

  gameDataField.value = JSON.stringify(initialGameData, null, 2);

  // 為gameData輸入框添加onchange事件監聽器
  gameDataField.addEventListener("input", updateFromGameData);

  // 觸發更新來渲染所有盤面
  updateFromGameData();
});

function renderAllBoards(initialReelStrip, initialSymbolInfos, removeInfos) {
  const boardsContainer = document.getElementById("boardsContainer");
  boardsContainer.innerHTML = "";

  // 渲染第一個盤面（原始盤面）
  const firstBoardSection = document.createElement("div");
  firstBoardSection.className = "board-section";

  const firstTitle = document.createElement("div");
  firstTitle.className = "board-title";
  firstTitle.textContent = "原始盤面";
  firstBoardSection.appendChild(firstTitle);

  // 第一個 board 使用第一個 RemoveInfo 的 RemovePos 來閃爍
  const firstBlinkPositions =
    removeInfos && removeInfos.length > 0 && removeInfos[0].RemovePos
      ? removeInfos[0].RemovePos.map((pos) =>
          convertFakePositionToRealPosition(pos)
        )
      : [];

  firstBoardSection.appendChild(
    renderBoard(initialReelStrip, initialSymbolInfos, firstBlinkPositions)
  );
  boardsContainer.appendChild(firstBoardSection);

  // 渲染 RemoveInfos 中的每個盤面
  if (removeInfos && removeInfos.length > 0) {
    removeInfos.forEach((removeInfo, index) => {
      // 只渲染有效的 RemoveInfo（ReelStrip 不為 null）
      if (removeInfo.ReelStrip && removeInfo.ReelStrip.length > 0) {
        // 添加箭頭
        const arrowContainer = document.createElement("div");
        arrowContainer.className = "arrow-container";
        const arrow = document.createElement("div");
        arrow.className = "arrow-down";
        arrow.innerHTML = "&#8595;";
        arrowContainer.appendChild(arrow);
        boardsContainer.appendChild(arrowContainer);

        // 添加盤面
        const boardSection = document.createElement("div");
        boardSection.className = "board-section";

        const title = document.createElement("div");
        title.className = "board-title";
        title.textContent = `掉落後盤面 ${index + 1}`;

        // // 如果有中獎資訊，顯示中獎金額
        // if (removeInfo.RemoveWin && removeInfo.RemoveWin > 0) {
        //   title.textContent += ` (中獎: ${removeInfo.RemoveWin})`;
        // }

        boardSection.appendChild(title);

        // 處理 ReelStrip（檢查是否需要轉換）
        let processedReelStrip = removeInfo.ReelStrip;
        if (processedReelStrip.length === 48) {
          processedReelStrip = fakeArrToRealArr(processedReelStrip);
        }

        // 計算此盤面的閃爍位置（使用下一個 RemoveInfo 的 RemovePos）
        const nextRemoveInfo = removeInfos[index + 1];
        const blinkPositions =
          nextRemoveInfo && nextRemoveInfo.RemovePos
            ? nextRemoveInfo.RemovePos.map((pos) =>
                convertFakePositionToRealPosition(pos)
              )
            : [];

        boardSection.appendChild(
          renderBoard(
            processedReelStrip,
            removeInfo.SymbolInfos || [],
            blinkPositions
          )
        );
        boardsContainer.appendChild(boardSection);
      }
    });
  }
}

function updateFromGameData() {
  const gameDataField = document.getElementById("gameData");

  try {
    const gameData = JSON.parse(gameDataField.value.trim());

    // 檢查是否有正確的結構
    if (!gameData.ReelInfo) {
      throw new Error("缺少 ReelInfo 屬性");
    }

    // 提取 ReelStrip 作為 inputArray
    let firstArray = gameData.ReelInfo.ReelStrip || [];

    // 檢查是否是48格的假輪帶資料
    if (firstArray.length === 48) {
      firstArray = fakeArrToRealArr(firstArray);

      let symbolInfos =
        "{" +
        gameData.ReelInfo.SymbolInfos.map(
          (o) =>
            "{" +
            Object.entries(o)
              .map(([k, v]) =>
                typeof v === "string" ? `${k}: "${v}"` : `${k}: ${v}`
              )
              .join(", ") +
            "}"
        ).join(", ") +
        "}";

      console.log("SymbolInfos", symbolInfos);
    }

    // 提取 SymbolInfos 作為邊框配置
    const newBorderConfigs = gameData.ReelInfo.SymbolInfos || [];

    // 提取 RemoveInfos
    const removeInfos = gameData.ReelInfo.RemoveInfos || [];

    // 更新全域變數
    firstArray = firstArray;
    borderConfigs = newBorderConfigs;

    // 渲染所有盤面
    renderAllBoards(firstArray, newBorderConfigs, removeInfos);

    console.log("更新成功:", {
      firstArray: firstArray,
      borderConfigs: newBorderConfigs,
      removeInfos: removeInfos,
    });
  } catch (error) {
    console.error("遊戲資料解析錯誤:", error);
    alert("遊戲資料格式錯誤，請檢查JSON格式\n錯誤: " + error.message);
  }
}

// 設定邊框配置的函數（保留向後相容性）
function setBorderConfigs(configs) {
  borderConfigs = configs;
  renderAllBoards(firstArray, borderConfigs, []);
}

let fakeArrToRealArr = (fakeArr) => {
  let removeIdx = [0, 6, 7, 13, 14, 20, 21, 27, 28, 34, 35, 41, 42, 47]; // 移除假輪帶
  fakeArr = fakeArr.filter((_, idx) => !removeIdx.includes(idx));
  console.log("已轉換48格假輪帶為32格真輪帶:", fakeArr);

  return originalToTransfer(fakeArr);
};

const mapping = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 6,
  6: 7,
  7: 8,
  8: 9,
  9: 10,
  10: 12,
  11: 13,
  12: 14,
  13: 15,
  14: 16,
  15: 18,
  16: 19,
  17: 20,
  18: 21,
  19: 22,
  20: 24,
  21: 25,
  22: 26,
  23: 27,
  24: 28,
  25: 29,
  26: 30,
  27: 31,
  28: 32,
  29: 33,
  30: 23,
  31: 17,
  32: 11,
  33: 5,
};

originalToTransfer = (inputArr) => {
  let transferArr = [];
  for (let i = 0; i < inputArr.length; i++) {
    transferArr[mapping[i]] = inputArr[i];
  }
  return transferArr;
};

const mappingFakeIdxToRealIdx = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,

  8: 5,
  9: 6,
  10: 7,
  11: 8,
  12: 9,

  15: 10,
  16: 11,
  17: 12,
  18: 13,
  19: 14,

  22: 15,
  23: 16,
  24: 17,
  25: 18,
  26: 19,

  29: 20,
  30: 21,
  31: 22,
  32: 23,
  33: 24,

  36: 25,
  37: 26,
  38: 27,
  39: 28,
  40: 29,

  43: 30,
  44: 31,
  45: 32,
  46: 33,
};

// 將假位置轉換為真實位置的函數
function convertFakePositionToRealPosition(fakePos) {
  const realIdx = mappingFakeIdxToRealIdx[fakePos];
  if (realIdx !== undefined) {
    return mapping[realIdx];
  }
  return -1; // 如果找不到對應的位置，返回 -1
}
