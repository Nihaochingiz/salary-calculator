const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ставка НДФЛ в России (13% для резидентов)
const NDFL_RATE = 0.13;

console.log('💰 Калькулятор зарплаты по ТК РФ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Я помогу рассчитать зарплату в обе стороны:');
console.log('• Если введёте сумму "на руки" - скажу, сколько просить у работодателя');
console.log('• Если введёте сумму "грязными" - скажу, сколько получите на руки\n');

function formatNumber(num) {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function calculateSalary() {
  console.log('Выберите режим расчёта:');
  console.log('1️⃣  Хочу посчитать сумму "на руки" (ввожу то, что хочу получать)');
  console.log('2️⃣  Хочу посчитать сумму "грязными" (ввожу то, что прошу у работодателя)');
  
  rl.question('\nВаш выбор (1 или 2): ', (mode) => {
    if (mode !== '1' && mode !== '2') {
      console.log('❌ Пожалуйста, выберите 1 или 2\n');
      calculateSalary();
      return;
    }

    const modeText = mode === '1' 
      ? 'Введите сумму, которую хотите получать на руки (в рублях): '
      : 'Введите сумму, которую получаете на руки (до вычета налогов): ';

    rl.question(modeText, (answer) => {
      // Убираем пробелы и проверяем, что ввели число
      const cleanAnswer = answer.replace(/\s/g, '');
      const inputSalary = parseFloat(cleanAnswer);
      
      if (isNaN(inputSalary) || inputSalary <= 0) {
        console.log('❌ Пожалуйста, введите корректную положительную сумму\n');
        calculateSalary();
        return;
      }
      
      console.log('\n📊 РЕЗУЛЬТАТ РАСЧЁТА:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (mode === '1') {
        // Режим: с "чистой" на "грязную"
        const grossSalary = inputSalary / (1 - NDFL_RATE);
        const ndflAmount = grossSalary - inputSalary;
        
        console.log(`💰 На руки:         ${formatNumber(inputSalary)} ₽`);
        console.log(`🧾 НДФЛ (13%):      ${formatNumber(ndflAmount)} ₽`);
        console.log(`💼 Просить у работодателя: ${formatNumber(grossSalary)} ₽`);
      } else {
        // Режим: с "грязной" на "чистую"
        const ndflAmount = inputSalary * NDFL_RATE;
        const handSalary = inputSalary - ndflAmount;
        
        console.log(`💼 Запрошено у работодателя: ${formatNumber(inputSalary)} ₽`);
        console.log(`🧾 НДФЛ (13%):               ${formatNumber(ndflAmount)} ₽`);
        console.log(`💰 На руки получите:         ${formatNumber(handSalary)} ₽`);
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      console.log('\nХотите рассчитать ещё раз?');
      rl.question('(y/n): ', (again) => {
        if (again.toLowerCase() === 'y' || again.toLowerCase() === 'yes' || again.toLowerCase() === 'да') {
          console.log('\n');
          calculateSalary();
        } else {
          console.log('👋 До свидания!');
          rl.close();
        }
      });
    });
  });
}

calculateSalary();