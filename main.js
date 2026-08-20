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

// Generate a segment based on type and length
function generateSegment(type, length) {
    switch (type) {
        case 'word':
            const allWords = Object.values(wordLists).flat();
            const word = getRandomItem(allWords);
            return word.charAt(0).toUpperCase() + word.slice(1);
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
                segment.length = 1;
            } else if (segment.type === 'number') {
                segment.length = 4;
            } else if (segment.type === 'symbol') {
                segment.length = 2;
            }
            renderSegments();
            updateStrength();
        });
        div.appendChild(select);
        
        const lengthDiv = document.createElement('div');
        lengthDiv.className = 'length-control';
        
        const lengthLabel = document.createElement('label');
        lengthLabel.textContent = 'Length:';
        lengthDiv.appendChild(lengthLabel);
        
        const range = document.createElement('input');
        range.type = 'range';
        range.min = 1;
        range.max = 20;
        range.value = segment.length;
        range.addEventListener('input', (e) => {
            segment.length = parseInt(e.target.value);
            lengthDisplay.textContent = segment.length;
            updateStrength();
        });
        lengthDiv.appendChild(range);
        
        const lengthDisplay = document.createElement('span');
        lengthDisplay.textContent = segment.length;
        lengthDiv.appendChild(lengthDisplay);
        
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
