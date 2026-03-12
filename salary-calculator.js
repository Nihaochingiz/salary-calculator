const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ставка НДФЛ в России (13% для резидентов)
const NDFL_RATE = 0.13;

console.log('💰 Калькулятор зарплаты по ТК РФ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Я посчитаю, сколько нужно просить у работодателя,');
console.log('чтобы получать желаемую сумму на руки.\n');

function calculateSalary() {
  rl.question('Введите сумму, которую хотите получать на руки (в рублях): ', (answer) => {
    // Убираем пробелы и проверяем, что ввели число
    const cleanAnswer = answer.replace(/\s/g, '');
    const handSalary = parseFloat(cleanAnswer);
    
    if (isNaN(handSalary) || handSalary <= 0) {
      console.log('❌ Пожалуйста, введите корректную положительную сумму\n');
      calculateSalary();
      return;
    }
    
    // Расчёт: сумма с НДФЛ = сумма на руки / (1 - ставка НДФЛ)
    const grossSalary = handSalary / (1 - NDFL_RATE);
    const ndflAmount = grossSalary - handSalary;
    
    console.log('\n📊 РЕЗУЛЬТАТ РАСЧЁТА:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`💰 На руки:         ${handSalary.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`);
    console.log(`🧾 НДФЛ (13%):      ${ndflAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`);
    console.log(`💼 Просить у работодателя: ${grossSalary.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\nХотите рассчитать ещё одну сумму?');
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
}

calculateSalary();