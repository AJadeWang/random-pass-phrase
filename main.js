// Word lists for different types
const wordLists = {
    animals: ['elephant', 'tiger', 'dolphin', 'eagle', 'panther', 'falcon', 'raven', 'wolf', 'bear', 'fox', 'lion', 'turtle', 'shark', 'whale', 'eagle'],
    colors: ['crimson', 'azure', 'golden', 'emerald', 'ruby', 'sapphire', 'amber', 'violet', 'coral', 'indigo', 'scarlet', 'jade', 'onyx', 'pearl'],
    actions: ['soaring', 'dancing', 'flowing', 'shining', 'glowing', 'racing', 'flying', 'swimming', 'leaping', 'roaring', 'blazing', 'rushing'],
    nouns: ['mountain', 'ocean', 'forest', 'crystal', 'thunder', 'lightning', 'shadow', 'flame', 'storm', 'garden', 'valley', 'river', 'star', 'moon'],
    adjectives: ['brave', 'calm', 'swift', 'bright', 'deep', 'wild', 'wise', 'kind', 'strong', 'pure', 'bold', 'fierce', 'gentle', 'mighty']
};

// Symbols list
const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '?', '+', '='];

// DOM Elements
const passphraseDisplay = document.getElementById('passphraseDisplay');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const segmentsList = document.getElementById('segmentsList');
const addSegmentBtn = document.getElementById('addSegmentBtn');
const strengthFill = document.getElementById('strengthFill');

let segments = [];

// Default segment types
const segmentTypes = [
    { value: 'word', label: 'Word' },
    { value: 'number', label: 'Number' },
    { value: 'symbol', label: 'Symbol' }
];

// Get random item from array
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate a segment based on type and random length within min-max range
function generateSegment(type, minLength, maxLength) {
    // Random length between min and max
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    
    switch (type) {
        case 'word':
            const allWords = Object.values(wordLists).flat();
            let wordResult = '';
            for (let i = 0; i < length; i++) {
                const word = getRandomItem(allWords);
                wordResult += word.charAt(0).toUpperCase() + word.slice(1);
                if (i < length - 1) wordResult += '';
            }
            return wordResult;
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
            if (segment.type === 'word') {
                segment.minLength = 1;
                segment.maxLength = 5;
            } else if (segment.type === 'number') {
                segment.minLength = 3;
                segment.maxLength = 6;
            } else if (segment.type === 'symbol') {
                segment.minLength = 1;
                segment.maxLength = 3;
            }
            renderSegments();
            updateStrength();
        });
        div.appendChild(select);
        
        // Length control with min-max sliders
        const lengthDiv = document.createElement('div');
        lengthDiv.className = 'length-control';
        
        const label = document.createElement('label');
        label.textContent = `Length: ${segment.minLength} - ${segment.maxLength}`;
        lengthDiv.appendChild(label);
        
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'range-slider-container';
        
        // Min slider
        const minRange = document.createElement('input');
        minRange.type = 'range';
        minRange.className = 'min-range';
        minRange.min = 1;
        minRange.max = 20;
        minRange.value = segment.minLength;
        
        // Max slider
        const maxRange = document.createElement('input');
        maxRange.type = 'range';
        maxRange.className = 'max-range';
        maxRange.min = 1;
        maxRange.max = 20;
        maxRange.value = segment.maxLength;
        
        // Track fill
        const trackFill = document.createElement('div');
        trackFill.className = 'track-fill';
        
        sliderContainer.appendChild(trackFill);
        sliderContainer.appendChild(minRange);
        sliderContainer.appendChild(maxRange);
        lengthDiv.appendChild(sliderContainer);
        
        // Update track fill and labels
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
            
            // Update label
            label.textContent = `Length: ${finalMin} - ${finalMax}`;
            
            // Update track fill
            const percentMin = ((finalMin - 1) / 19) * 100;
            const percentMax = ((finalMax - 1) / 19) * 100;
            trackFill.style.left = percentMin + '%';
            trackFill.style.width = (percentMax - percentMin) + '%';
            
            updateStrength();
        }
        
        minRange.addEventListener('input', updateRange);
        maxRange.addEventListener('input', updateRange);
        
        // Initial track fill
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
        { type: 'word', length: 1 },
        { type: 'word', length: 1 },
        { type: 'number', length: 4 },
        { type: 'word', length: 1 }
    ];
    renderSegments();
    updateStrength();
    generatePassphrase();
}

// Add new segment
function addSegment() {
    segments.push({ type: 'word', length: 1 });
    renderSegments();
    updateStrength();
    generatePassphrase();
}

// Generate full passphrase
function generatePassphrase() {
    if (segments.length === 0) {
        passphraseDisplay.textContent = 'Add at least one segment';
        copyBtn.style.display = 'none';
        return;
    }
    
    const passphraseParts = segments.map(seg => generateSegment(seg.type, seg.length));
    const passphrase = passphraseParts.join('-');
    
    passphraseDisplay.textContent = passphrase;
    copyBtn.style.display = 'inline-block';
    
    passphraseDisplay.style.animation = 'none';
    setTimeout(() => {
        passphraseDisplay.style.animation = 'fadeIn 0.3s ease';
    }, 10);
    
    updateStrength();
}

// Update strength indicator
function updateStrength() {
    let complexity = 0;
    segments.forEach(seg => {
        if (seg.type === 'word') complexity += 5 * seg.length;
        else if (seg.type === 'number') complexity += 2 * seg.length;
        else if (seg.type === 'symbol') complexity += 3 * seg.length;
    });
    
    const types = new Set(segments.map(s => s.type));
    complexity += types.size * 10;
    
    const strength = Math.min(100, complexity);
    strengthFill.style.width = strength + '%';
}

// Copy to clipboard
copyBtn.addEventListener('click', () => {
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
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    addDefaultSegments();
    
    // Event listeners
    addSegmentBtn.addEventListener('click', addSegment);
    generateBtn.addEventListener('click', generatePassphrase);
    copyBtn.addEventListener('click', () => {
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
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
            generatePassphrase();
        }
    });
});
