import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция для поиска директории git-hooks
function findGitHooksDirectory(startDir) {
    let currentDir = startDir;

    // Поднимаемся по уровням до корня
    while (currentDir !== path.parse(currentDir).root) {
        const gitHooksPath = path.resolve(currentDir, 'git-hooks');
        if (fs.existsSync(gitHooksPath)) {
            console.log(`Found git-hooks at: ${gitHooksPath}`);
            return gitHooksPath;
        }
        // Поднимаемся на один уровень вверх
        currentDir = path.resolve(currentDir, '..');
    }

    console.log('git-hooks directory not found');
    return null;
}

// Функция для копирования файлов из git-hooks в .git/hooks
function copyHooks(gitHooksPath, gitDir) {
    const gitHooks = fs.readdirSync(gitHooksPath);

    gitHooks.forEach((hook) => {
        const sourcePath = path.resolve(gitHooksPath, hook);
        const destPath = path.resolve(gitDir, 'hooks', hook);

        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`Copied ${hook} to ${destPath}`);
        }
    });
}

// Основная логика
function updateBashHooks() {
    let gitRoot;
    try {
        // Находим корень Git репозитория
        gitRoot = execSync('git rev-parse --git-dir').toString().trim();
    } catch {
        // Обработка ошибки, если git не найден или репозиторий не инициализирован
        console.error('Git repository not found. Please initialize a git repository first.');
        return;
    }

    const gitDir = path.resolve(gitRoot); // Это .git

    // Находим папку git-hooks
    const gitHooksPath = findGitHooksDirectory(__dirname);

    if (gitHooksPath) {
        // Копируем файлы из git-hooks в .git/hooks
        copyHooks(gitHooksPath, gitDir);
        console.log('Git hooks updated successfully.');
    } else {
        console.log('Git hooks directory not found, nothing to update.');
    }
}

// Запускаем скрипт
updateBashHooks();
