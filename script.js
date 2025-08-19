const alphabets = [
    {
        name: 'alphabet',
        characters: ['B', 'C', 'D', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'X'],
        modulo: 16,
        extraShift: 0
    },
    {
        name: 'thanh',
        characters: ['A', 'E', 'I', 'O', 'U', 'Y'],
        modulo: 6,
        extraShift: 0
    },
    {
        name: 'english',
        characters: ['F','J','W','Z'],
        modulo: 4,
        extraShift: 0
    },
    {
        name: 'numbers',
        characters: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        modulo: 10,
        extraShift: 0
    },
    {
        name: 'vietnameseAux1',
        characters: ['Ă', 'Â', 'Đ', 'Ê', 'Ô', 'Ơ', 'Ư'],
        modulo: 7,
        extraShift: 0
    },
    {
        name: 'vietnameseAuxTones',
        subgroups: [
            ['Á', 'À', 'Ả', 'Ã', 'Ạ'],
            ['É', 'È', 'Ẻ', 'Ẽ', 'Ẹ'],
        ],
        subgroupModulo: 5,
        groupModulo: 2, // Number of subgroups
        extraShift: 0
    },
    {
        name: 'vietnameseAuxTones2',
        subgroups: [
            
            ['Ắ', 'Ằ', 'Ẳ', 'Ẵ', 'Ặ'],
            ['Ấ', 'Ầ', 'Ẩ', 'Ẫ', 'Ậ']
        ],
        subgroupModulo: 5,
        groupModulo: 2, // Number of subgroups
        extraShift: 0
    }
];

const translations = {
    en: {
        title: "Caesar Cipher Tool",
        inputLabel: "Input Text",
        shiftLabel: "Shift Key (K)",
        encodeBtn: "Encode",
        decodeBtn: "Decode",
        outputLabel: "Result",
        copyBtn: "Copy",
        theme: { light: "Light", dark: "Dark", gradient: "Gradient" },
        lang: { en: "English", vi: "Vietnamese" }
    },
    vi: {
        title: "Công cụ Mã hóa Caesar",
        inputLabel: "Văn bản đầu vào",
        shiftLabel: "Khóa dịch chuyển (K)",
        encodeBtn: "Mã hóa",
        decodeBtn: "Giải mã",
        outputLabel: "Kết quả",
        copyBtn: "Sao chép",
        theme: { light: "Sáng", dark: "Tối", gradient: "Gradient" },
        lang: { en: "Tiếng Anh", vi: "Tiếng Việt" }
    }
};

function caesarCipher(text, shift, encode = true) {
    shift = parseInt(shift);
    if (!encode) shift = -shift;
    return text.split('').map(char => {
        const isUpperCase = char === char.toUpperCase();
        const charUpper = char.toUpperCase();

        for (const alphabet of alphabets) {
            // Handle regular alphabets
            if (alphabet.characters) {
                const index = alphabet.characters.indexOf(charUpper);
                if (index !== -1) {
                    let newIndex = (index + shift + (encode ? alphabet.extraShift : -alphabet.extraShift)) % alphabet.modulo;
                    if (newIndex < 0) newIndex += alphabet.modulo;
                    let newChar = alphabet.characters[newIndex];
                    // Protection: If result matches input, adjust +1/-1
                    if (newChar.toLowerCase() === char.toLowerCase()) {
                        newIndex = encode ? (newIndex + 1) % alphabet.modulo : (newIndex - 1 + alphabet.modulo) % alphabet.modulo;
                        newChar = alphabet.characters[newIndex];
                    }
                    return isUpperCase ? newChar : newChar.toLowerCase();
                }
            }
            // Handle vietnameseAuxTones with subgroups
            if (alphabet.subgroups) {
                for (let groupIndex = 0; groupIndex < alphabet.subgroups.length; groupIndex++) {
                    const group = alphabet.subgroups[groupIndex];
                    const charIndex = group.indexOf(charUpper);
                    if (charIndex !== -1) {
                        // Shift within subgroup
                        let newCharIndex = (charIndex + shift) % alphabet.subgroupModulo;
                        if (newCharIndex < 0) newCharIndex += alphabet.subgroupModulo;
                        // Shift to next/previous group
                        let newGroupIndex = (groupIndex + (encode ? 1 : -1)) % alphabet.groupModulo;
                        if (newGroupIndex < 0) newGroupIndex += alphabet.groupModulo;
                        let newChar = alphabet.subgroups[newGroupIndex][newCharIndex];
                        // Protection: If result matches input, adjust +1/-1 within subgroup
                        if (newChar.toLowerCase() === char.toLowerCase()) {
                            newCharIndex = encode ? (newCharIndex + 1) % alphabet.subgroupModulo : (newCharIndex - 1 + alphabet.subgroupModulo) % alphabet.subgroupModulo;
                            newChar = alphabet.subgroups[newGroupIndex][newCharIndex];
                        }
                        return isUpperCase ? newChar : newChar.toLowerCase();
                    }
                }
            }
        }
        return char; // Keep unchanged if not in any alphabet
    }).join('');
}

function applyTheme(theme) {
    document.body.classList.remove('light', 'dark', 'gradient');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
}

function applyLanguage(lang) {
    const trans = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key.includes('.')) {
            const [category, subKey] = key.split('.');
            element.textContent = trans[category][subKey];
        } else {
            element.textContent = trans[key];
        }
    });
    document.querySelector(`#languageSelect option[value="${lang}"]`).selected = true;
    localStorage.setItem('language', lang);
}

document.getElementById('themeSelect').addEventListener('change', (e) => {
    applyTheme(e.target.value);
});

document.getElementById('languageSelect').addEventListener('change', (e) => {
    applyLanguage(e.target.value);
});

document.getElementById('encodeBtn').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value;
    const shiftKey = document.getElementById('shiftKey').value;
    const result = caesarCipher(inputText, shiftKey, true);
    document.getElementById('outputText').value = result;
});

document.getElementById('decodeBtn').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value;
    const shiftKey = document.getElementById('shiftKey').value;
    const result = caesarCipher(inputText, shiftKey, false);
    document.getElementById('outputText').value = result;
});

document.getElementById('copyBtn').addEventListener('click', () => {
    const outputText = document.getElementById('outputText');
    outputText.select();
    navigator.clipboard.writeText(outputText.value);
    const lang = localStorage.getItem('language') || 'en';
    alert(translations[lang].copyBtn + ' to clipboard!');
});

// Initialize theme and language
const savedTheme = localStorage.getItem('theme') || 'light';
const savedLanguage = localStorage.getItem('language') || 'en';
applyTheme(savedTheme);
applyLanguage(savedLanguage);
document.querySelector(`#themeSelect option[value="${savedTheme}"]`).selected = true;