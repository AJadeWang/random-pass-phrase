// Word lists for different types, used as fallback when connection to api can't be done
const wordLists = {
    animals: ['elephant', 'tiger', 'dolphin', 'eagle', 'panther', 'falcon', 'raven', 'wolf', 'bear', 'fox', 'lion', 'turtle', 'shark', 'whale', 'eagle'],
    colors: ['crimson', 'azure', 'golden', 'emerald', 'ruby', 'sapphire', 'amber', 'violet', 'coral', 'indigo', 'scarlet', 'jade', 'onyx', 'pearl'],
    actions: ['soaring', 'dancing', 'flowing', 'shining', 'glowing', 'racing', 'flying', 'swimming', 'leaping', 'roaring', 'blazing', 'rushing'],
    nouns: ['mountain', 'ocean', 'forest', 'crystal', 'thunder', 'lightning', 'shadow', 'flame', 'storm', 'garden', 'valley', 'river', 'star', 'moon'],
    adjectives: ['brave', 'calm', 'swift', 'bright', 'deep', 'wild', 'wise', 'kind', 'strong', 'pure', 'bold', 'fierce', 'gentle', 'mighty']
};

// Symbols list
const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '?', '+', '='];

// API Configuration
const WORD_API_URL = 'https://random-word-api.herokuapp.com/word';
const WORD_CACHE_SIZE = 20;

// Word cache
let wordCache = [];
let isFetchingWords = false;
const maxSegSize = 11;
let profanityList = [];
let profanitySet = new Set();

// DOM Elements
const passphraseDisplay = document.getElementById('passphraseDisplay');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const segmentsList = document.getElementById('segmentsList');
const addSegmentBtn = document.getElementById('addSegmentBtn');
const strengthFill = document.getElementById('strengthFill');

// Settings elements
const settingsToggle = document.getElementById('settingsToggle');
const settingsContent = document.getElementById('settingsContent');
const settingsArrow = document.querySelector('.settings-arrow');
const separatorInput = document.getElementById('separator');
const filterProfanityCheck = document.getElementById('filterProfanity');
const autoCopyCheck = document.getElementById('autoCopy');

let segments = [];
let settings = {
    separator: '',
    filterProfanity: true,
    autoCopy: false
};

// Default segment types
const segmentTypes = [
    { value: 'word', label: 'Word' },
    { value: 'number', label: 'Number' },
    { value: 'symbol', label: 'Symbol' }
];

// Capitalization options (for Word type only)
const capitalizationOptions = [
    { value: 'capitalize', label: 'Capitalize' },
    { value: 'uppercase', label: 'ALL CAPS' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'allrandom', label: 'AllRaNdOm' },
    { value: 'onerandom', label: 'randoMone' }
];

// Settings toggle
function toggleSettings() {
    if (settingsContent) {
        settingsContent.classList.toggle('open');
        if (settingsArrow) {
            settingsArrow.classList.toggle('open');
        }
    }
}

// Settings event listeners
if (settingsToggle) {
    settingsToggle.addEventListener('click', toggleSettings);
}
if (separatorInput) {
    separatorInput.addEventListener('input', (e) => {
        settings.separator = e.target.value || '';
        generatePassphrase();
    });
}

// Fetch words from external API
async function fetchWordsFromAPI(count = 20) {
    try {
        const response = await fetch(`${WORD_API_URL}?number=${count}`);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching words:', error);
        return getFallbackWords(count);
    }
}

async function loadProfanityList() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/naughty-words/en.json');
        const profanityArray = await response.json();
        
        profanityList = profanityArray;
        
        const filteredList = profanityArray
            .filter(word => !word.includes(' '))
            .map(word => word.toLowerCase());
        
        profanitySet = new Set(filteredList);
        
        const removedCount = profanityArray.length - filteredList.length;
        console.log(`Loaded ${profanitySet.size} profane words (removed ${removedCount} multi-word phrases)`);
        return profanitySet;
    } catch (error) {
        console.error('Failed to load profanity list:', error);
        profanityList = [];
        profanitySet = new Set();
        return new Set();
    }
}

if (filterProfanityCheck) {
    filterProfanityCheck.addEventListener('change', (e) => {
        settings.filterProfanity = e.target.checked;
        generatePassphrase();
    });
}

function isWordProfane(word) {
    if (!settings.filterProfanity || profanitySet.size === 0) {
        return false;
    }
    
    const wordLower = word.toLowerCase();
    
    if (profanitySet.has(wordLower)) {
        return true;
    }
    
    for (const badWord of profanitySet) {
        if (wordLower.includes(badWord)) {
            return true;
        }
    }
    
    return false;
}

function getFallbackWords(count) {
    const allWords = Object.values(wordLists).flat();
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(getRandomItem(allWords));
    }
    return result;
}

async function refillWordCache() {
    if (isFetchingWords) return;
    isFetchingWords = true;
    
    try {
        const newWords = await fetchWordsFromAPI(WORD_CACHE_SIZE);
        wordCache = newWords;
        console.log(`Word cache refilled with ${wordCache.length} words`);
    } catch (error) {
        console.error('Failed to refill word cache:', error);
    } finally {
        isFetchingWords = false;
    }
}

async function getWordFromCache() {
    if (wordCache.length === 0) {
        await refillWordCache();
    }
    
    if (wordCache.length === 0) {
        const allWords = Object.values(wordLists).flat();
        return getRandomItem(allWords);
    }
    
    return wordCache.pop();
}

function initializeWordCache() {
    refillWordCache();
}

function secureRandomInt(min, max) {
    const range = max - min + 1;
    const maxValid = Math.floor(0xFFFFFFFF / range) * range - 1;

    let value;
    do {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        value = array[0];
    } while (value > maxValid);

    return min + (value % range);
}

function getRandomItem(arr) {
    const randomIndex = secureRandomInt(0, arr.length - 1);
    return arr[randomIndex];
}

async function generateSegment(type, minLength, maxLength, capitalization) {
    const effectiveMax = maxLength >= maxSegSize ? 20 : maxLength;
    const length = Math.floor(Math.random() * (effectiveMax - minLength + 1)) + minLength;
    
    switch (type) {
        case 'word':
            let wordResult = '';
            let attempts = 0;
            const maxAttempts = 60;
            let isClean = false;
            
            while (!isClean && attempts < maxAttempts) {
                attempts++;
                let word = await getWordFromCache();
                
                if (wordCache.length < 5) {
                    refillWordCache();
                }
                
                if (word.length >= minLength && word.length <= effectiveMax) {
                    if (settings.filterProfanity && profanitySet.size > 0) {
                        const wordLower = word.toLowerCase();
                        let hasProfanity = false;
                        if (profanitySet.has(wordLower)) {
                            hasProfanity = true;
                        } else {
                            for (const badWord of profanitySet) {
                                if (wordLower.includes(badWord)) {
                                    hasProfanity = true;
                                    break;
                                }
                            }
                        }
                        
                        if (!hasProfanity) {
                            wordResult = word;
                            isClean = true;
                        }
                    } else {
                        wordResult = word;
                        isClean = true;
                    }
                }
                
                if (!isClean && attempts >= maxAttempts) {
                    const allWords = Object.values(wordLists).flat();
                    let fallbackWord = null;
                    for (const w of allWords) {
                        const wLower = w.toLowerCase();
                        if (w.length >= minLength && w.length <= effectiveMax) {
                            if (settings.filterProfanity && profanitySet.size > 0) {
                                let hasProfanity = false;
                                for (const badWord of profanitySet) {
                                    if (wLower.includes(badWord)) {
                                        hasProfanity = true;
                                        break;
                                    }
                                }
                                if (!hasProfanity) {
                                    fallbackWord = w;
                                    break;
                                }
                            } else {
                                fallbackWord = w;
                                break;
                            }
                        }
                    }
                    
                    wordResult = fallbackWord || getRandomItem(allWords);
                    isClean = true;
                }
            }
            
            if (!wordResult) {
                const allWords = Object.values(wordLists).flat();
                wordResult = getRandomItem(allWords);
            }
    
            return applyCapitalization(wordResult, capitalization || 'capitalize');
        case 'number':
            let num = '';
            for (let i = 0; i < length; i++) {
                num += Math.floor(Math.random() * 10);
            }
            return num;
        case 'symbol':
            let sym = '';
            for (let i = 0; i < length; i++) {
                sym += getRandomItem(symbols);
            }
            return sym;
        default:
            return '';
    }
}

function applyCapitalization(word, style) {
    switch (style) {
        case 'capitalize':
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        case 'uppercase':
            return word.toUpperCase();
        case 'lowercase':
            return word.toLowerCase();
        case 'allrandom':
            let result = '';
            for (let i = 0; i < word.length; i++) {
                if (Math.random() > 0.5) {
                    result += word[i].toUpperCase();
                } else {
                    result += word[i].toLowerCase();
                }
            }
            return result;
        case 'onerandom':
            if (word.length === 0) return word;
            if (word.length === 1) return word.toUpperCase();
            
            const index = Math.floor(Math.random() * word.length);
            const chars = word.toLowerCase().split('');
            chars[index] = chars[index].toUpperCase();
            return chars.join('');
        default:
            return word;
    }
}

function createSlider(segment, label, updateCallback) {
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'range-slider-container';
    
    const track = document.createElement('div');
    track.className = 'slider-track';
    sliderContainer.appendChild(track);
    
    const fill = document.createElement('div');
    fill.className = 'slider-fill';
    sliderContainer.appendChild(fill);
    
    const minHandle = document.createElement('div');
    minHandle.className = 'slider-handle min-handle';
    sliderContainer.appendChild(minHandle);
    
    const maxHandle = document.createElement('div');
    maxHandle.className = 'slider-handle max-handle';
    sliderContainer.appendChild(maxHandle);
    
    let activeHandle = null;
    let isDragging = false;
    let startX = 0;
    let startMin = 0;
    let startMax = 0;
    
    function getSliderPosition(clientX) {
        const rect = track.getBoundingClientRect();
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        return percent;
    }
    
    function updateHandlePositions() {
        const minPercent = (segment.minLength - 1) / (maxSegSize - 1);
        const maxPercent = (segment.maxLength - 1) / (maxSegSize - 1);
        
        minHandle.style.left = (minPercent * 100) + '%';
        maxHandle.style.left = (maxPercent * 100) + '%';
        fill.style.left = (minPercent * 100) + '%';
        fill.style.width = ((maxPercent - minPercent) * 100) + '%';
        
        let minDisplay = segment.minLength;
        let maxDisplay = segment.maxLength >= maxSegSize ? '∞' : segment.maxLength;
        label.textContent = `Length: ${minDisplay} - ${maxDisplay}`;
    }
    
    function startDrag(e, handle) {
        activeHandle = handle;
        isDragging = true;
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startX = clientX;
        startMin = segment.minLength;
        startMax = segment.maxLength;
        
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchmove', onDragTouch);
        document.addEventListener('touchend', endDrag);
        e.preventDefault();
    }
    
    function onDrag(e) {
        if (!isDragging || !activeHandle) return;
        const percent = getSliderPosition(e.clientX);
        const value = Math.round(1 + percent * (maxSegSize - 1));
        const clampedValue = Math.max(1, Math.min(maxSegSize, value));
        
        if (activeHandle === 'min') {
            // Allow min to go up to maxSegSize, and push max forward if needed
            if (clampedValue <= maxSegSize) {
                segment.minLength = clampedValue;
                // If min passes max, push max forward
                if (segment.minLength > segment.maxLength) {
                    segment.maxLength = segment.minLength;
                }
            }
        } else if (activeHandle === 'max') {
            // Allow max to go down to 1, and push min backward if needed
            if (clampedValue >= 1) {
                segment.maxLength = clampedValue;
                // If max goes below min, pull min backward
                if (segment.maxLength < segment.minLength) {
                    segment.minLength = segment.maxLength;
                }
            }
        }
        updateHandlePositions();
        if (updateCallback) updateCallback();
    }
    
    function onDragTouch(e) {
        const touch = e.touches[0];
        onDrag({ clientX: touch.clientX });
    }
    
    function endDrag() {
        activeHandle = null;
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', onDragTouch);
        document.removeEventListener('touchend', endDrag);
    }
    
    minHandle.addEventListener('mousedown', (e) => startDrag(e, 'min'));
    maxHandle.addEventListener('mousedown', (e) => startDrag(e, 'max'));
    minHandle.addEventListener('touchstart', (e) => startDrag(e, 'min'));
    maxHandle.addEventListener('touchstart', (e) => startDrag(e, 'max'));
    
    updateHandlePositions();
    
    return sliderContainer;
}

function renderSegments() {
    if (!segmentsList) return;
    
    segmentsList.innerHTML = '';
    
    if (segments.length === 0) {
        addDefaultSegments();
        return;
    }
    
    segments.forEach((segment, index) => {
        const div = document.createElement('div');
        div.className = 'segment-item';
        
        const indexSpan = document.createElement('span');
        indexSpan.className = 'segment-index';
        indexSpan.textContent = index + 1;
        div.appendChild(indexSpan);
        
        // Type label and selector
        const typeWrapper = document.createElement('div');
        typeWrapper.className = 'segment-field';
        
        const typeLabel = document.createElement('label');
        typeLabel.className = 'segment-label';
        typeLabel.textContent = 'Type';
        typeWrapper.appendChild(typeLabel);
        
        const select = document.createElement('select');
        segmentTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.label;
            if (segment.type === type.value) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        select.addEventListener('change', (e) => {
            segment.type = e.target.value;
            if (segment.type === 'word' && !segment.capitalization) {
                segment.capitalization = 'capitalize';
            }
            renderSegments();
            updateStrength();
        });
        typeWrapper.appendChild(select);
        div.appendChild(typeWrapper);
        
        // Capitalization (ONLY for Word type)
        if (segment.type === 'word') {
            const capWrapper = document.createElement('div');
            capWrapper.className = 'segment-field';
            
            const capLabel = document.createElement('label');
            capLabel.className = 'segment-label';
            capLabel.textContent = 'Format';
            capWrapper.appendChild(capLabel);
            
            const capSelect = document.createElement('select');
            capSelect.className = 'capitalization-select';
            
            capitalizationOptions.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                if (segment.capitalization === opt.value) {
                    option.selected = true;
                }
                capSelect.appendChild(option);
            });
            
            capSelect.addEventListener('change', (e) => {
                segment.capitalization = e.target.value;
                generatePassphrase();
            });
            
            capWrapper.appendChild(capSelect);
            div.appendChild(capWrapper);
        }
        
        // Length control
        const lengthDiv = document.createElement('div');
        lengthDiv.className = 'length-control';
        
        const label = document.createElement('label');
        label.className = 'segment-label';
        label.textContent = `Length: ${segment.minLength} - ${segment.maxLength >= maxSegSize ? '∞' : segment.maxLength}`;
        lengthDiv.appendChild(label);
        
        const slider = createSlider(segment, label, () => {
            updateStrength();
        });
        lengthDiv.appendChild(slider);
        
        div.appendChild(lengthDiv);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-remove';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', () => {
            if (segments.length > 1) {
                segments.splice(index, 1);
                renderSegments();
                updateStrength();
                generatePassphrase();
            }
        });
        div.appendChild(removeBtn);
        
        segmentsList.appendChild(div);
    });
}

function addDefaultSegments() {
    segments = [
        { type: 'word', minLength: 4, maxLength: 8, capitalization: 'capitalize' },
        { type: 'number', minLength: 2, maxLength: 2 },
        { type: 'word', minLength: 4, maxLength: 8, capitalization: 'lowercase' },
        { type: 'symbol', minLength: 1, maxLength: 1 },
    ];
    renderSegments();
    updateStrength();
    generatePassphrase();
}

function addSegment() {
    segments.push({ type: 'word', minLength: 4, maxLength: 8, capitalization: 'lowercase' });
    renderSegments();
    updateStrength();
    generatePassphrase();
}

function copyToClipboard() {
    const text = passphraseDisplay.textContent;
    if (text && text !== 'Add at least one segment' && text !== 'Click generate to create your passphrase') {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        }).catch(() => {
            const range = document.createRange();
            range.selectNode(passphraseDisplay);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
        });
    }
}

async function generatePassphrase() {
    if (!passphraseDisplay) return;
    
    if (segments.length === 0) {
        passphraseDisplay.textContent = 'Add at least one segment';
        if (copyBtn) copyBtn.style.display = 'none';
        return;
    }
    
    passphraseDisplay.textContent = 'Generating...';
    
    const separator = settings.separator;
    
    try {
        const passphraseParts = await Promise.all(
            segments.map(async (seg) => {
                if (seg.type === 'word') {
                    return await generateSegment(seg.type, seg.minLength, seg.maxLength, seg.capitalization);
                } else {
                    return generateSegment(seg.type, seg.minLength, seg.maxLength);
                }
            })
        );
        
        const passphrase = passphraseParts.join(separator);
        
        passphraseDisplay.textContent = passphrase;
        if (copyBtn) copyBtn.style.display = 'inline-block';
        
        passphraseDisplay.style.animation = 'none';
        setTimeout(() => {
            passphraseDisplay.style.animation = 'fadeIn 0.3s ease';
        }, 10);
        
        updateStrength();
        
        if (settings.autoCopy) {
            copyToClipboard();
        }
    } catch (error) {
        console.error('Error generating passphrase:', error);
        passphraseDisplay.textContent = 'Error generating passphrase. Please try again.';
    }
}

function updateStrength() {
    if (!strengthFill) return;
    
    let complexity = 0;
    segments.forEach(seg => {
        const avgLength = (seg.minLength + seg.maxLength) / 2;
        if (seg.type === 'word') complexity += 5 * avgLength;
        else if (seg.type === 'number') complexity += 2 * avgLength;
        else if (seg.type === 'symbol') complexity += 3 * avgLength;
    });
    
    const types = new Set(segments.map(s => s.type));
    complexity += types.size * 10;
    
    const strength = Math.min(100, complexity);
    strengthFill.style.width = strength + '%';
}

document.addEventListener('DOMContentLoaded', () => {
    addDefaultSegments();
    initializeWordCache();
    if (filterProfanityCheck && filterProfanityCheck.checked) {
        loadProfanityList();
    } else {
        loadProfanityList();
    }
    
    if (settingsToggle) {
        settingsToggle.addEventListener('click', toggleSettings);
    }
    
    if (separatorInput) {
        separatorInput.addEventListener('input', (e) => {
            settings.separator = e.target.value || '';
            generatePassphrase();
        });
    }
    
    if (filterProfanityCheck) {
        filterProfanityCheck.addEventListener('change', (e) => {
            settings.filterProfanity = e.target.checked;
            generatePassphrase();
        });
    }
    
    if (autoCopyCheck) {
        autoCopyCheck.addEventListener('change', (e) => {
            settings.autoCopy = e.target.checked;
            if (settings.autoCopy && passphraseDisplay.textContent && 
                passphraseDisplay.textContent !== 'Add at least one segment' &&
                passphraseDisplay.textContent !== 'Click generate to create your passphrase') {
                copyToClipboard();
            }
        });
    }
    
    if (addSegmentBtn) {
        addSegmentBtn.addEventListener('click', addSegment);
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generatePassphrase);
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
            generatePassphrase();
        }
    });
});
