function switchLan() {
  const lanElements = document.querySelectorAll(".lan");
  const placeholders = document.querySelectorAll(".form-control");
  const currentLang = document.querySelector(".here").textContent.trim();
  const enLabel = document.querySelector(".en");
  const twLabel = document.querySelector(".tw");

  const langText = {
    EN: [
      "ABG Calculator",
      "pH",
      "PaO2",
      "PaCO2",
      "HCO3‾",
      "Na+",
      "Cl-",
      "Calculate",
      "Result：",
    ],
    TW: [
      "動脈血氣體計算機",
      "酸鹼值",
      "動脈血氧分壓",
      "動脈二氧化碳分壓",
      "碳酸氫鹽",
      "鈉離子",
      "氯離子",
      "計算",
      "結果：",
    ],
  };

  const langLabels = { EN: enLabel, TW: twLabel };
  const targetLang = currentLang === "EN" ? "TW" : "EN";
  const requiredFields = [1, 2, 3, 4];

  // 設置文字內容
  setLanguageText(lanElements, targetLang, requiredFields);

  // 設置占位符
  setPlaceholders(placeholders, targetLang);

  // 切換標籤
  updateActiveLabel(targetLang);

  function setLanguageText(elements, targetLang, requiredFields) {
    elements.forEach((element, index) => {
      if (requiredFields.includes(index)) {
        element.textContent = `${langText[targetLang][index]} (*${
          targetLang === "EN" ? "required" : "必填"
        })`;
      } else {
        element.textContent = langText[targetLang][index];
      }
    });
  }

  function setPlaceholders(elements, targetLang) {
    elements.forEach((element, index) => {
      element.placeholder = `${
        targetLang === "EN" ? "Please enter " : "請輸入"
      }${langText[targetLang][index + 1]}`;
    });
  }

  function updateActiveLabel() {
    Object.values(langLabels).forEach((label) =>
      label.classList.toggle("here")
    );
  }
}

function calculate() {
  const pH = parseFloat(document.getElementById("pH").value);
  const PaO2 = parseInt(document.getElementById("PaO2").value, 10);
  const PaCO2 = parseInt(document.getElementById("PaCO2").value, 10);
  const HCO3 = parseInt(document.getElementById("HCO3").value, 10);
  const Na = parseInt(document.getElementById("Na").value, 10);
  const Cl = parseInt(document.getElementById("Cl").value, 10);
  const elementResult = document.getElementById("result");

  if (isNaN(pH) || isNaN(PaO2) || isNaN(PaCO2) || isNaN(HCO3)) {
    elementResult.style.color = "red";
    elementResult.textContent = `請輸入數字，或是欄位尚未填寫完全`;
    return;
  }

  try {
    // 計算氧合
    let bloodO2;
    if (PaO2 > 80) {
      bloodO2 = `血氧正常`;
    } else if (PaO2 > 60) {
      bloodO2 = `併輕度低血氧`;
    } else if (PaO2 > 40) {
      bloodO2 = `併中度低血氧`;
    } else {
      bloodO2 = `併重度低血氧`;
    }

    if (pH > 7.7 || pH < 6.6) {
      elementResult.style.color = "red";
      elementResult.textContent = `別算了，快去看看患者生命徵象是否穩定!!!`;
      return;
    }

    if (
      pH > 7.35 &&
      pH < 7.45 &&
      PaCO2 > 35 &&
      PaCO2 < 45 &&
      HCO3 > 22 &&
      HCO3 < 26
    ) {
      PaO2 > 80
        ? (elementResult.style.color = "green")
        : (elementResult.style.color = "red");
      elementResult.textContent = `患者目前血液酸鹼值在正常值內，${bloodO2}`;
      return;
    } else if (pH <= 7.4) {
      elementResult.style.color = "red";

      while (PaCO2 < 40 && HCO3 > 24) {
        elementResult.textContent = `請檢察輸入是否有誤，若有誤請重新輸入PaCO3, HCO3`;
        return;
      }

      if (PaCO2 > 40) {
        const deltaHydrogen = Math.abs(40 - Math.pow(10, 9 - pH));
        const progression = deltaHydrogen / Math.abs(PaCO2 - 40 + 0.0000001);

        if (progression >= 0.3) {
          const HCO3Comp = 24 + 0.1 * (PaCO2 - 40);

          if (HCO3 > HCO3Comp + 3) {
            elementResult.textContent = `患者目前為，急性呼吸酸併代謝鹼，${bloodO2}`;
            return;
          } else if (HCO3 < HCO3Comp - 3) {
            elementResult.textContent = `患者目前為，急性呼吸酸併代謝酸，${bloodO2}`;
            return;
          } else if (HCO3 <= HCO3Comp + 3 && HCO3 >= HCO3Comp - 3) {
            if (pH < 7.35) {
              elementResult.textContent = `患者目前為，急性呼吸酸併代謝不完全代償，${bloodO2}`;
              return;
            } else {
              elementResult.textContent = `患者目前為，急性呼吸酸併代謝完全代償，${bloodO2}`;
              return;
            }
          } else {
            elementResult.textContent = `請檢察輸入是否有誤`;
            return;
          }
        } else {
          // progression < 0.3
          const HCO3Comp = 24 + 0.35 * (PaCO2 - 40);

          if (HCO3 > HCO3Comp + 3) {
            elementResult.textContent = `患者目前為，慢性呼吸酸併代謝鹼，${bloodO2}`;
            return;
          } else if (HCO3 < HCO3Comp - 3) {
            elementResult.textContent = `患者目前為，慢性呼吸酸併代謝酸，${bloodO2}`;
            return;
          } else if (HCO3 <= HCO3Comp + 3 && HCO3 >= HCO3Comp - 3) {
            if (pH < 7.35) {
              elementResult.textContent = `患者目前為，慢性呼吸酸併代謝不完全代償，${bloodO2}`;
              return;
            } else {
              elementResult.textContent = `患者目前為，慢性呼吸酸併代謝完全代償，${bloodO2}`;
              return;
            }
          } else {
            elementResult.textContent = `請檢察輸入是否有誤`;
            return;
          }
        }
      } else {
        // PaCO2 <= 40
        if (HCO3 <= 24) {
          const PaCO2Comp = 40 - 1.2 * (24 - HCO3);
          const ag = Na - Cl - HCO3;

          // 計算 AG
          let agResult;
          if (ag > 14) {
            agResult = `陰離子間隙為${ag}，高AG代謝性酸中毒`;
          } else if (ag >= 10 && ag <= 14) {
            agResult = `陰離子間隙為${ag}，高氯性代謝性酸中毒`;
          } else {
            elementResult.textContent = `請檢察輸入是否有誤，若有誤請重新輸入Na+,Cl-`;
            return;
          }

          if (PaCO2 > PaCO2Comp + 5) {
            elementResult.textContent = `患者目前${agResult}，代謝酸併呼吸酸，${bloodO2}`;
            return;
          } else if (PaCO2 < PaCO2Comp - 5) {
            elementResult.textContent = `患者目前${agResult}，代謝酸併呼吸鹼，${bloodO2}`;
            return;
          } else if (PaCO2 <= PaCO2Comp + 5 && PaCO2 >= PaCO2Comp - 5) {
            if (pH < 7.35) {
              elementResult.textContent = `患者目前${agResult}，代謝酸併呼吸不完全代償，${bloodO2}`;
              return;
            } else {
              elementResult.textContent = `患者目前${agResult}，代謝酸併呼吸完全代償，${bloodO2}`;
              return;
            }
          } else {
            elementResult.textContent = `請檢察輸入是否有誤`;
            return;
          }
        } else {
          elementResult.textContent = `請檢察輸入是否有誤`;
          return;
        }
      }
    } else {
      // pH > 7.4
      elementResult.style.color = "red";

      if (PaCO2 <= 40) {
        const deltaHydrogen = Math.abs(40 - Math.pow(10, 9 - pH));
        const progression = deltaHydrogen / Math.abs(PaCO2 - 40 + 0.0000001);

        if (progression >= 0.3) {
          const HCO3Comp = 24 - 0.2 * (40 - PaCO2);

          if (HCO3 > HCO3Comp + 3) {
            elementResult.textContent = `患者目前為，急性呼吸鹼併代謝鹼，${bloodO2}`;
            return;
          } else if (HCO3 < HCO3Comp - 3) {
            elementResult.textContent = `患者目前為，急性呼吸鹼併代謝酸，${bloodO2}`;
            return;
          } else if (HCO3 <= HCO3Comp + 3 && HCO3 >= HCO3Comp - 3) {
            if (pH > 7.45) {
              elementResult.textContent = `患者目前為，急性呼吸鹼併代謝不完全代償，${bloodO2}`;
              return;
            } else {
              elementResult.textContent = `患者目前為，急性呼吸鹼併代謝完全代償，${bloodO2}`;
              return;
            }
          } else {
            elementResult.textContent = `請檢察輸入是否有誤`;
            return;
          }
        } else if (progression < 0.3) {
          const HCO3Comp = 24 - 0.4 * (40 - PaCO2);

          if (HCO3 > HCO3Comp + 3) {
            elementResult.textContent = `患者目前為，慢性呼吸鹼併代謝鹼，${bloodO2}`;
            return;
          } else if (HCO3 < HCO3Comp - 3) {
            elementResult.textContent = `患者目前為，慢性呼吸鹼併代謝酸，${bloodO2}`;
            return;
          } else if (HCO3 <= HCO3Comp + 3 && HCO3 >= HCO3Comp - 3) {
            if (pH > 7.45) {
              elementResult.textContent = `患者目前為，慢性呼吸鹼併代謝不完全代償，${bloodO2}`;
              return;
            } else {
              elementResult.textContent = `患者目前為，慢性呼吸鹼併代謝完全代償，${bloodO2}`;
              return;
            }
          } else {
            elementResult.textContent = `請檢察輸入是否有誤`;
            return;
          }
        } else {
          elementResult.textContent = `請檢察輸入是否有誤`;
          return;
        }
      } else if (PaCO2 > 40) {
        if (HCO3 >= 24) {
          const PaCO2Comp = 40 + 0.7 * (HCO3 - 24);

          if (PaCO2 > PaCO2Comp + 5) {
            elementResult.textContent = `患者目前為，代謝鹼併呼吸酸，${bloodO2}`;
            return;
          } else if (PaCO2 < PaCO2Comp - 5) {
            elementResult.textContent = `患者目前為，代謝鹼併呼吸鹼，${bloodO2}`;
            return;
          } else if (PaCO2 <= PaCO2Comp + 5 && PaCO2 >= PaCO2Comp - 5) {
            if (pH > 7.45) {
              elementResult.textContent = `患者目前為，代謝鹼併呼吸不完全代償，${bloodO2}`;
              return;
            } else {
              elementResult.textContent = `患者目前為，代謝鹼併呼吸完全代償，${bloodO2}`;
              return;
            }
          } else {
            elementResult.textContent = `請檢察輸入是否有誤`;
            return;
          }
        } else {
          elementResult.textContent = `請檢察輸入是否有誤`;
          return;
        }
      } else {
        elementResult.textContent = `請檢察輸入是否有誤`;
        return;
      }
    }
  } catch (err) {
    console.log(err);
    elementResult.textContent = `發生錯誤：${err}`;
    return;
  }
}
