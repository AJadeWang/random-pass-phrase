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
const WORD_CACHE_SIZE = 20; // Number of words to fetch at once

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
        // Fallback to local word list if API fails
        return getFallbackWords(count);
    }
}

async function loadProfanityList() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/naughty-words/en.json');
        const profanityArray = await response.json();
        
        // Store the raw array (if needed elsewhere)
        profanityList = profanityArray;
        
        // Filter out words with spaces AND convert to lowercase
        const filteredList = profanityArray
            .filter(word => !word.includes(' '))  // Remove multi-word phrases
            .map(word => word.toLowerCase());     // Convert to lowercase
        
        // Convert to Set for fast lookups
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

// Check if a word is profane
function isWordProfane(word) {
    if (!settings.filterProfanity || profanitySet.size === 0) {
        return false;
    }
    
    const wordLower = word.toLowerCase();
    
    // Exact match check
    if (profanitySet.has(wordLower)) {
        return true;
    }
    
    // Substring check (catches words like "assassin" containing "ass")
    for (const badWord of profanitySet) {
        if (wordLower.includes(badWord)) {
            return true;
        }
    }
    
    return false;
}

// Get fallback words from local list
function getFallbackWords(count) {
    const allWords = Object.values(wordLists).flat();
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(getRandomItem(allWords));
    }
    return result;
}

// Refill word cache
async function refillWordCache() {
    if (isFetchingWords) return;
    isFetchingWords = true;
    
    try {
        const newWords = await fetchWordsFromAPI(WORD_CACHE_SIZE);
        newWords.map
        wordCache = newWords;
        console.log(`Word cache refilled with ${wordCache.length} words`);
    } catch (error) {
        console.error('Failed to refill word cache:', error);
    } finally {
        isFetchingWords = false;
    }
}

// Get a word from cache (refills if needed)
async function getWordFromCache() {
    // If cache is empty or low, refill
    if (wordCache.length === 0) {
        await refillWordCache();
    }
    
    // If still empty after refill, use fallback
    if (wordCache.length === 0) {
        const allWords = Object.values(wordLists).flat();
        return getRandomItem(allWords);
    }
    
    // Remove and return a word from the cache
    return wordCache.pop();
}

// Initialize word cache on page load
function initializeWordCache() {
    refillWordCache();
}

// A secure, unbiased random integer generator
function secureRandomInt(min, max) {
    const range = max - min + 1;
    // The maximum value we can use without introducing bias
    const maxValid = Math.floor(0xFFFFFFFF / range) * range - 1;

    let value;
    do {
        // Get a cryptographically secure random 32-bit integer
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        value = array[0];
    } while (value > maxValid); // Reject and retry if the value is in the biased range [citation:9]

    return min + (value % range);
}

// Get random item from array
function getRandomItem(arr) {
    const randomIndex = secureRandomInt(0, arr.length - 1);
    return arr[randomIndex];
}

// Generate a segment based on type and random length within min-max range
async function generateSegment(type, minLength, maxLength, capitalization) {
    // Random length between min and max
    const effectiveMax = maxLength >= maxSegSize ? 20 : maxLength; // 20 is used as a practical max size
    const length = Math.floor(Math.random() * (effectiveMax - minLength + 1)) + minLength;
    
    switch (type) {
        case 'word':
            let wordResult = '';
            let attempts = 0;
            const maxAttempts = 60;
            let isClean = false;
            
            // Try to get a word that matches the length requirements and is not profane
            while (!isClean && attempts < maxAttempts) {
                attempts++;
                let word = await getWordFromCache();
                
                // If cache is running low, trigger refill in background
                if (wordCache.length < 5) {
                    refillWordCache();
                }
                
                // Check if word matches length criteria
                if (word.length >= minLength && word.length <= effectiveMax) {
                    // Check if word contains profanity (if filter is enabled)
                    if (settings.filterProfanity && profanitySet.size > 0) {
                        const wordLower = word.toLowerCase();
                        // Check exact match and substring match
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
                        // If profane, continue to next attempt (discard this word)
                    } else {
                        // No profanity filter, accept immediately
                        wordResult = word;
                        isClean = true;
                    }
                }
                
                // If we've tried too many times, use fallback
                if (!isClean && attempts >= maxAttempts) {
                    const allWords = Object.values(wordLists).flat();
                    // Try to find a clean word from local list
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
            
            // If no word found, use fallback
            if (!wordResult) {
                const allWords = Object.values(wordLists).flat();
                wordResult = getRandomItem(allWords);
            }
    
            // Apply capitalization
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

// Apply capitalization to a word
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

// Render all segments
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
        
        // Index
        const indexSpan = document.createElement('span');
        indexSpan.className = 'segment-index';
        indexSpan.textContent = index + 1;
        div.appendChild(indexSpan);
        
        // Type selector
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
            // Add default capitalization for new word segments
            if (segment.type === 'word' && !segment.capitalization) {
                segment.capitalization = 'capitalize';
            }
            renderSegments();
            updateStrength();
        });
        div.appendChild(select);
        
        // Capitalization dropdown (ONLY for Word type)
        if (segment.type === 'word') {
            const capDiv = document.createElement('div');
            capDiv.className = 'capitalization-control';
            
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
            
            capDiv.appendChild(capSelect);
            div.appendChild(capDiv);
        }
        
        // Min-Max slider for ALL types
        const lengthDiv = document.createElement('div');
        lengthDiv.className = 'length-control';
        
        const label = document.createElement('label');
        label.textContent = `Length: ${segment.minLength} - ${segment.effectiveMax}`;
        lengthDiv.appendChild(label);
        
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'range-slider-container';
        
        // Min slider
        const minRange = document.createElement('input');
        minRange.type = 'range';
        minRange.className = 'min-range';
        minRange.min = 1;
        minRange.max = maxSegSize;
        minRange.value = segment.minLength || 4;
        
        // Max slider
        const maxRange = document.createElement('input');
        maxRange.type = 'range';
        maxRange.className = 'max-range';
        maxRange.min = 1;
        maxRange.max = maxSegSize;
        maxRange.value = segment.maxLength || 4;
        
        // Track fill
        const trackFill = document.createElement('div');
        trackFill.className = 'track-fill';
        
        sliderContainer.appendChild(trackFill);
        sliderContainer.appendChild(minRange);
        sliderContainer.appendChild(maxRange);
        lengthDiv.appendChild(sliderContainer);
        
        // Update range function
        function updateRange() {
            const minVal = parseInt(minRange.value);
            const maxVal = parseInt(maxRange.value);
            
            // Ensure min <= max
            if (minVal > maxVal) {
                if (minRange === document.activeElement) {
                    maxRange.value = minVal;
                } else {
                    minRange.value = maxVal;
                }
            }
            
            const finalMin = parseInt(minRange.value);
            const finalMax = parseInt(maxRange.value);
            
            segment.minLength = finalMin;
            segment.maxLength = finalMax;

            // Update label - show "No Limit" if max is 11+
            let minDisplay = finalMin;
            let maxDisplay = finalMax >= 11 ? '∞' : finalMax;
            label.textContent = `Length: ${minDisplay} - ${maxDisplay}`;
            
            // Update track fill
            const range = maxSegSize - 1;
            const percentMin = ((finalMin - 1) / range) * 100;
            const percentMax = ((finalMax - 1) / range) * 100;
            trackFill.style.left = percentMin + '%';
            trackFill.style.width = (percentMax - percentMin) + '%';
            
            updateStrength();
        }
        
        minRange.addEventListener('input', updateRange);
        maxRange.addEventListener('input', updateRange);
        
        // Initialize track fill
        setTimeout(updateRange, 10);
        
        div.appendChild(lengthDiv);
        
        // Remove button
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

// Add default segments
function addDefaultSegments() {
    segments = [
        { type: 'word', minLength: 4, maxLength: 8, capitalization: 'capitalize' },
        { type: 'number', minLength: 2, maxLength:2},
        { type: 'word', minLength: 4, maxLength: 8, capitalization: 'lowercase' },
        { type: 'symbol', minLength: 1, maxLength:1 },
    ];
    renderSegments();
    updateStrength();
    generatePassphrase();
}

// Add new segment
function addSegment() {
    segments.push({ type: 'word', minLength: 4,  maxLength: 8, capitalization: 'lowercase' });
    renderSegments();
    updateStrength();
    generatePassphrase();
}

// Copy to clipboard function
function copyToClipboard() {
    const text = passphraseDisplay.textContent;
    if (text && text !== 'Add at least one segment' && text !== 'Click generate to create your passphrase') {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        }).catch(() => {
            // Fallback method
            const range = document.createRange();
            range.selectNode(passphraseDisplay);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
        });
    }
}

// Generate full passphrase
async function generatePassphrase() {
    if (!passphraseDisplay) return;
    
    if (segments.length === 0) {
        passphraseDisplay.textContent = 'Add at least one segment';
        if (copyBtn) copyBtn.style.display = 'none';
        return;
    }
    
    // Show loading state
    passphraseDisplay.textContent = 'Generating...';
    
    // Get the separator from settings
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
        
        // Automatic copy on generate
        if (settings.autoCopy) {
            copyToClipboard();
        }
    } catch (error) {
        console.error('Error generating passphrase:', error);
        passphraseDisplay.textContent = 'Error generating passphrase. Please try again.';
    }
}

// Update strength indicator
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    addDefaultSegments();
    initializeWordCache();
    if (filterProfanityCheck && filterProfanityCheck.checked) {
        loadProfanityList();
    } else {
        // Preload in background anyway
        loadProfanityList();
    }
    
    // Settings toggle
    if (settingsToggle) {
        settingsToggle.addEventListener('click', toggleSettings);
    }
    
    // Separator input
    if (separatorInput) {
        separatorInput.addEventListener('input', (e) => {
            settings.separator = e.target.value || '-';
            if (settings.separator.length === 0) {
                settings.separator = '-';
                e.target.value = '-';
            }
            generatePassphrase();
        });
    }
    
    // Profanity filter
    if (filterProfanityCheck) {
        filterProfanityCheck.addEventListener('change', (e) => {
            settings.filterProfanity = e.target.checked;
            generatePassphrase();
        });
    }
    
    if (autoCopyCheck) {
        autoCopyCheck.addEventListener('change', (e) => {
            settings.autoCopy = e.target.checked;
            // If enabled, automatically copy the current phrase
            if (settings.autoCopy && passphraseDisplay.textContent && 
                passphraseDisplay.textContent !== 'Add at least one segment' &&
                passphraseDisplay.textContent !== 'Click generate to create your passphrase') {
                copyToClipboard();
            }
        });
    }
    
    // Add segment button
    if (addSegmentBtn) {
        addSegmentBtn.addEventListener('click', addSegment);
    }
    
   // Generate button
    if (generateBtn) {
        generateBtn.addEventListener('click', generatePassphrase);
    }
    
    // Copy button
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }
    
    // Enter key support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
            generatePassphrase();
        }
    });
});
