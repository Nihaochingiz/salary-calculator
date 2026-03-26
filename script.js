(function () {
  const NDFL_RATE = 0.13;
  let currentMode = "netToGross";

  const modeNetBtn = document.querySelector('[data-mode="netToGross"]');
  const modeGrossBtn = document.querySelector('[data-mode="grossToNet"]');
  const modeDescDiv = document.getElementById("modeDescription");
  const inputLabel = document.getElementById("inputLabel");
  const amountInput = document.getElementById("amountInput");
  const calcButton = document.getElementById("calcButton");
  const resetBtn = document.getElementById("resetBtn");
  const resultDynamic = document.getElementById("resultDynamic");
  const exportMdButton = document.getElementById("exportMdButton");

  let lastCalculation = {
    mode: currentMode,
    inputRaw: null,
    inputNumber: null,
    grossSalary: null,
    netSalary: null,
    ndflAmount: null,
  };

  function formatNumber(num) {
    if (isNaN(num)) return "0.00";
    let fixed = num.toFixed(2);
    let parts = fixed.split(".");
    let integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return integerPart + "." + parts[1];
  }

  function parseSalaryInput(raw) {
    let cleaned = raw.replace(/\s/g, "").replace(",", ".");
    cleaned = cleaned.replace(/[^\d.-]/g, "");
    if (cleaned === "" || cleaned === "-") return NaN;
    let number = parseFloat(cleaned);
    return isNaN(number) ? NaN : number;
  }

  function updateUIBasedOnMode() {
    if (currentMode === "netToGross") {
      modeDescDiv.innerHTML =
        "Режим: «На руки → Оклад» — вы вводите сумму, которую хотите получать на руки. Результат покажет размер оклада (до вычета НДФЛ).";
      inputLabel.innerHTML = "Сумма на руки (чистыми), ₽";
      modeNetBtn.classList.add("active");
      modeGrossBtn.classList.remove("active");
    } else {
      modeDescDiv.innerHTML =
        "Режим: «Оклад → На руки» — вы вводите сумму оклада до вычета налога. Результат покажет сумму после удержания НДФЛ.";
      inputLabel.innerHTML = "Оклад (грязными), ₽";
      modeGrossBtn.classList.add("active");
      modeNetBtn.classList.remove("active");
    }
  }

  function clearResult(resetLast = false) {
    resultDynamic.innerHTML =
      '<div class="result-card__placeholder">ожидание расчёта</div>';
    if (resetLast) {
      lastCalculation = {
        mode: currentMode,
        inputRaw: null,
        inputNumber: null,
        grossSalary: null,
        netSalary: null,
        ndflAmount: null,
      };
    }
  }

  function showError(message) {
    resultDynamic.innerHTML = `<div style="background:#fef2f0; padding:12px; border-radius:16px; color:#b3412c; text-align:center; font-size:0.85rem;">${message}</div>`;
  }

  function performCalculation() {
    const rawValue = amountInput.value.trim();
    if (rawValue === "") {
      showError("Введите сумму в рублях.");
      return false;
    }

    const inputNumber = parseSalaryInput(rawValue);
    if (isNaN(inputNumber) || inputNumber <= 0) {
      showError("Укажите корректную положительную сумму (цифры).");
      return false;
    }

    let grossResult = null;
    let netResult = null;
    let ndflResult = null;

    if (currentMode === "netToGross") {
      const netVal = inputNumber;
      const grossVal = netVal / (1 - NDFL_RATE);
      const ndflVal = grossVal - netVal;
      grossResult = grossVal;
      netResult = netVal;
      ndflResult = ndflVal;

      resultDynamic.innerHTML = `
        <div class="result-line">
          <span class="result-label">На руки (чистыми):</span>
          <span class="result-value">${formatNumber(netResult)} ₽</span>
        </div>
        <div class="result-line">
          <span class="result-label">НДФЛ 13%:</span>
          <span class="result-value">${formatNumber(ndflResult)} ₽</span>
        </div>
        <div class="result-line">
          <span class="result-label">Оклад (до вычета налогов):</span>
          <span class="result-value result-value--highlight">${formatNumber(grossResult)} ₽</span>
        </div>
      `;
    } else {
      const grossVal = inputNumber;
      const ndflVal = grossVal * NDFL_RATE;
      const netVal = grossVal - ndflVal;
      grossResult = grossVal;
      netResult = netVal;
      ndflResult = ndflVal;

      resultDynamic.innerHTML = `
        <div class="result-line">
          <span class="result-label">Оклад (до вычета НДФЛ):</span>
          <span class="result-value">${formatNumber(grossResult)} ₽</span>
        </div>
        <div class="result-line">
          <span class="result-label">НДФЛ 13%:</span>
          <span class="result-value">${formatNumber(ndflResult)} ₽</span>
        </div>
        <div class="result-line">
          <span class="result-label">На руки (чистыми):</span>
          <span class="result-value result-value--highlight">${formatNumber(netResult)} ₽</span>
        </div>
      `;
    }

    lastCalculation = {
      mode: currentMode,
      inputRaw: rawValue,
      inputNumber: inputNumber,
      grossSalary: grossResult,
      netSalary: netResult,
      ndflAmount: ndflResult,
    };
    return true;
  }

  function resetForm() {
    amountInput.value = "";
    clearResult(true);
    amountInput.focus();
  }

  function generateMarkdownContent() {
    if (
      lastCalculation.grossSalary === null ||
      lastCalculation.netSalary === null
    ) {
      if (amountInput.value.trim() !== "") {
        const success = performCalculation();
        if (!success) {
          return "Ошибка: невозможно выгрузить сумму. Проверьте корректность введённых данных и нажмите «Рассчитать».";
        }
      } else {
        return "Нет данных для экспорта. Введите сумму и нажмите «Рассчитать».";
      }
    }

    const modeText =
      lastCalculation.mode === "netToGross"
        ? "Режим: сумма на руки → оклад (до налогов)"
        : "Режим: оклад (до налогов) → сумма на руки";

    const dateNow = new Date();
    const formattedDate = `${dateNow.toLocaleDateString("ru-RU")} ${dateNow.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;

    let mdContent = `# Результат расчёта зарплаты (НДФЛ 13%)\n\n`;
    mdContent += `**Дата расчёта:** ${formattedDate}\n\n`;
    mdContent += `**${modeText}**\n\n`;

    if (lastCalculation.mode === "netToGross") {
      const inputSumFormatted = formatNumber(lastCalculation.inputNumber);
      const grossFormatted = formatNumber(lastCalculation.grossSalary);
      const ndflFormatted = formatNumber(lastCalculation.ndflAmount);
      mdContent += `- Введённая сумма **на руки**: ${inputSumFormatted} ₽\n`;
      mdContent += `- НДФЛ (13%): ${ndflFormatted} ₽\n`;
      mdContent += `- **Оклад (грязными)**: ${grossFormatted} ₽\n`;
    } else {
      const inputGrossFormatted = formatNumber(lastCalculation.inputNumber);
      const netFormatted = formatNumber(lastCalculation.netSalary);
      const ndflFormatted = formatNumber(lastCalculation.ndflAmount);
      mdContent += `- Введённый **оклад (до вычета налогов)**: ${inputGrossFormatted} ₽\n`;
      mdContent += `- НДФЛ (13%): ${ndflFormatted} ₽\n`;
      mdContent += `- **Сумма на руки**: ${netFormatted} ₽\n`;
    }

    mdContent += `\n*Ставка налога: 13% (для резидентов РФ)*\n`;
    return mdContent;
  }

  function exportToMarkdown() {
    const currentRaw = amountInput.value.trim();
    let needRecalc = false;

    if (currentRaw !== "") {
      const currentNum = parseSalaryInput(currentRaw);
      if (!isNaN(currentNum) && currentNum > 0) {
        if (
          lastCalculation.inputNumber !== currentNum ||
          lastCalculation.mode !== currentMode
        ) {
          needRecalc = true;
        }
      } else {
        if (lastCalculation.grossSalary === null) {
          showError("Сначала выполните корректный расчёт.");
          return;
        }
      }
    } else {
      if (lastCalculation.grossSalary === null) {
        showError(
          "Нет данных для экспорта. Введите сумму и нажмите «Рассчитать».",
        );
        return;
      }
    }

    if (needRecalc) {
      const success = performCalculation();
      if (!success) {
        showError("Некорректные данные, экспорт невозможен.");
        return;
      }
    }

    const markdownText = generateMarkdownContent();
    const blob = new Blob([markdownText], {
      type: "text/markdown;charset=utf-8",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "salary_result.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function setMode(mode) {
    if (mode === "netToGross") {
      currentMode = "netToGross";
    } else if (mode === "grossToNet") {
      currentMode = "grossToNet";
    }
    updateUIBasedOnMode();

    const rawVal = amountInput.value.trim();
    if (rawVal !== "") {
      const testNum = parseSalaryInput(rawVal);
      if (!isNaN(testNum) && testNum > 0) {
        performCalculation();
      } else {
        clearResult(true);
      }
    } else {
      clearResult(true);
    }
  }

  modeNetBtn.addEventListener("click", () => setMode("netToGross"));
  modeGrossBtn.addEventListener("click", () => setMode("grossToNet"));
  calcButton.addEventListener("click", () => performCalculation());
  resetBtn.addEventListener("click", resetForm);
  exportMdButton.addEventListener("click", exportToMarkdown);

  amountInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performCalculation();
    }
  });

  amountInput.addEventListener("input", function () {
    lastCalculation = {
      mode: currentMode,
      inputRaw: null,
      inputNumber: null,
      grossSalary: null,
      netSalary: null,
      ndflAmount: null,
    };
    if (resultDynamic.innerHTML.includes("result-line")) {
      resultDynamic.innerHTML =
        '<div class="result-card__placeholder">введите сумму и нажмите «Рассчитать»</div>';
    }
  });

  setMode("netToGross");
})();
