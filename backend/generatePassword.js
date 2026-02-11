const bcrypt = require('bcryptjs');

async function generatePassword() {
    const password = 'admin123';
    const saltRounds = 10;
    
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Пароль:', password);
    console.log('Хеш для вставки в БД:', hash);
    
    // Проверка
    const isValid = await bcrypt.compare(password, hash);
    console.log('Проверка пароля:', isValid ? '✅ Успешно' : '❌ Ошибка');
}

generatePassword().catch(console.error);