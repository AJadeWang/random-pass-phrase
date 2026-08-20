// temprary word list
const wordLists = {
		animals: ['elephant', 'tiger', 'dolphin', 'eagle', 'panther', 'falcon', 'raven', 'wolf', 'bear', 'fox'],
		colors: ['crimson', 'azure', 'golden', 'emerald', 'ruby', 'sapphire', 'amber', 'violet', 'coral', 'indigo'],
		actions: ['soaring', 'dancing', 'flowing', 'shining', 'glowing', 'racing', 'flying', 'swimming', 'leaping', 'roaring'],
		nouns: ['mountain', 'ocean', 'forest', 'crystal', 'thunder', 'lightning', 'shadow', 'flame', 'storm', 'garden'],
		adjectives: ['brave', 'calm', 'swift', 'bright', 'deep', 'wild', 'wise', 'kind', 'strong', 'pure']
	};

// -- main event handlers -- \\
document.addEventListener('DOMContentLoaded', () => {
	const passphraseDisplay = document.getElementById('passphraseDisplay');
	const generateBtn = document.getElementById('generateBtn');
	const copyBtn = document.getElementById('copyBtn');
	const wordCount = document.getElementById('wordCount');
	const wordCountNumber = document.getElementById('wordCountNumber');
	const wordCountDisplay = document.getElementById('wordCountDisplay');
	const withNumbers = document.getElementById('withNumbers');
	const strengthFill = document.getElementById('strengthFill');

	function generatePassphrase() {
		const words = parseInt(wordCount.value);
		const includeNumbers = withNumbers.checked;
            
		// Flatten all word lists
		const allWords = Object.values(wordLists).flat();
            
		// Select random words
		const selectedWords = [];
		for (let i = 0; i < words; i++) {
			const randomIndex = Math.floor(Math.random() * allWords.length);
			const word = allWords[randomIndex];
			selectedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
		}
            
		let passphrase = selectedWords.join('-');
            
		// Add numbers if checked
		if (includeNumbers) {
			let numbers = '';
			for (let i = 0; i < 2; i++) {
				numbers += Math.floor(Math.random() * 10);
			}
			passphrase += '-' + numbers;
		}
            
		passphraseDisplay.textContent = passphrase;
		copyBtn.style.display = 'inline-block';
            
		// Update strength
		const strength = Math.min(100, words * 25);
		strengthFill.style.width = strength + '%';
            
		// Animation
		passphraseDisplay.style.animation = 'none';
		setTimeout(() => {
			passphraseDisplay.style.animation = 'fadeIn 0.3s ease';
		}, 10);
	}

	// Sync range and number input
	wordCount.addEventListener('input', () => {
		wordCountNumber.value = wordCount.value;
		wordCountDisplay.textContent = wordCount.value;
	});

	wordCountNumber.addEventListener('input', () => {
		let val = parseInt(wordCountNumber.value);
		if (val < 2) val = 2;
		if (val > 8) val = 8;
		wordCount.value = val;
		wordCountDisplay.textContent = val;
	});

	// Copy to clipboard
	copyBtn.addEventListener('click', () => {
	const text = passphraseDisplay.textContent;
		if (text && text !== 'Click generate to create your passphrase') {
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

	// Generate on load and button click
	window.addEventListener('load', generatePassphrase);
	generateBtn.addEventListener('click', generatePassphrase);

	// Enter key support
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
			generatePassphrase();
		}
	});
});
