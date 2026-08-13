<?php
// No data storage - generates passphrases on-the-fly
class PassphraseGenerator {
	private $wordLists = [
		'animals' => ['elephant', 'tiger', 'dolphin', 'eagle', 'panther', 'falcon', 'raven', 'wolf', 'bear', 'fox'],
		'colors' => ['crimson', 'azure', 'golden', 'emerald', 'ruby', 'sapphire', 'amber', 'violet', 'coral', 'indigo'],
		'actions' => ['soaring', 'dancing', 'flowing', 'shining', 'glowing', 'racing', 'flying', 'swimming', 'leaping', 'roaring'],
		'nouns' => ['mountain', 'ocean', 'forest', 'crystal', 'thunder', 'lightning', 'shadow', 'flame', 'storm', 'garden'],
		'adjectives' => ['brave', 'calm', 'swift', 'bright', 'deep', 'wild', 'wise', 'kind', 'strong', 'pure']
	];
	
	 public function generate($words = 4, $separator = '-', $capitalize = true) {
		$selectedWords = [];
		$allWords = [];
		
		// Flatten all word lists
		 foreach ($this->wordLists as $list) {
			$allWords = array_merge($allWords, $list);
		}
		
		// Select random words
		 for ($i = 0; $i < $words; $i++) {
			$randomIndex = rand(0, count($allWords) - 1);
			$word = $allWords[$randomIndex];
			$selectedWords[] = $capitalize ? ucfirst($word) : $word;
		}
		
		 return implode($separator, $selectedWords);
	}
	
	 public function generateWithNumbers($words = 3, $numbers = 2) {
		$passphrase = $this->generate($words, '-', true);
		$randomNumbers = '';
		 for ($i = 0; $i < $numbers; $i++) {
			$randomNumbers .= rand(0, 9);
		}
		 return $passphrase . '-' . $randomNumbers;
	}
}

// Initialize generator
$generator = new PassphraseGenerator();

// Handle AJAX requests
if (isset($_GET['action']) && $_GET['action'] === 'generate') {
	 header('Content-Type: application/json');
	$words = isset($_GET['words']) ? intval($_GET['words']) : 4;
	$withNumbers = isset($_GET['withNumbers']) ? filter_var($_GET['withNumbers'], FILTER_VALIDATE_BOOLEAN) : false;
	
	 if ($withNumbers) {
		$passphrase = $generator->generateWithNumbers($words);
	} else {
		$passphrase = $generator->generate($words);
	}
	
	 echo json_encode(['passphrase' => $passphrase]);
	 exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Secure Passphrase Generator</title>
	<style>
		* {
			 margin: 0;
			 padding: 0;
			 box-sizing: border-box;
		}
		
		 body {
			 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
			 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			 min-height: 100vh;
			 display: flex;
			 justify-content: center;
			 align-items: center;
			 padding: 20px;
		}
		
		.container {
			 background: white;
			 border-radius: 20px;
			 box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
			 padding: 40px;
			 max-width: 600px;
			 width: 100%;
		}
		
		 h1 {
			 color: #333;
			 font-size: 28px;
			 margin-bottom: 10px;
			 text-align: center;
		}
		
		.subtitle {
			 color: #666;
			 text-align: center;
			 margin-bottom: 30px;
			 font-size: 14px;
		}
		
		.passphrase-display {
			 background: #f8f9fa;
			 border: 2px solid #e9ecef;
			 border-radius: 12px;
			 padding: 20px;
			 margin-bottom: 25px;
			 text-align: center;
			 min-height: 80px;
			 display: flex;
			 align-items: center;
			 justify-content: center;
			 font-size: 24px;
			 font-weight: 600;
			 color: #333;
			 word-break: break-all;
			 transition: all 0.3s ease;
		}
		
		.passphrase-display:hover {
			 border-color: #667eea;
			 background: #f0f2ff;
		}
		
		.controls {
			 display: grid;
			 gap: 15px;
			 margin-bottom: 25px;
		}
		
		.control-group {
			 display: flex;
			 align-items: center;
			 justify-content: space-between;
			 flex-wrap: wrap;
			 gap: 10px;
		}
		
		.control-group label {
			 color: #555;
			 font-weight: 500;
			 font-size: 14px;
		}
		
		.control-group input[type="range"] {
			 flex: 1;
			 min-width: 100px;
			 accent-color: #667eea;
		}
		
		.control-group input[type="number"] {
			 width: 60px;
			 padding: 5px 8px;
			 border: 2px solid #e9ecef;
			 border-radius: 8px;
			 text-align: center;
			 font-size: 14px;
		}
		
		.checkbox-group {
			 display: flex;
			 align-items: center;
			 gap: 10px;
		}
		
		.checkbox-group input[type="checkbox"] {
			 width: 18px;
			 height: 18px;
			 accent-color: #667eea;
		}
		
		.btn-generate {
			 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			 color: white;
			 border: none;
			 border-radius: 12px;
			 padding: 15px 30px;
			 font-size: 18px;
			 font-weight: 600;
			 cursor: pointer;
			 width: 100%;
			 transition: transform 0.2s ease, box-shadow 0.2s ease;
		}
		
		.btn-generate:hover {
			 transform: translateY(-2px);
			 box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
		}
		
		.btn-generate:active {
			 transform: translateY(0);
		}
		
		.btn-copy {
			 background: #28a745;
			 color: white;
			 border: none;
			 border-radius: 8px;
			 padding: 8px 16px;
			 font-size: 14px;
			 cursor: pointer;
			 margin-top: 10px;
			 transition: background 0.2s ease;
		}
		
		.btn-copy:hover {
			 background: #218838;
		}
		
		.strength-indicator {
			 margin-top: 20px;
			 padding: 15px;
			 background: #f8f9fa;
			 border-radius: 10px;
			 text-align: center;
			 font-size: 14px;
			 color: #666;
		}
		
		.strength-bar {
			 height: 4px;
			 background: #e9ecef;
			 border-radius: 2px;
			 margin-top: 8px;
			 overflow: hidden;
		}
		
		.strength-fill {
			 height: 100%;
			 background: linear-gradient(90deg, #28a745, #667eea);
			 width: 100%;
			 border-radius: 2px;
			 transition: width 0.3s ease;
		}
		
		.footer {
			 text-align: center;
			 margin-top: 20px;
			 color: #999;
			 font-size: 12px;
		}
		
		@media (max-width: 480px) {
			.container {
				 padding: 20px;
			}
			
			.passphrase-display {
				 font-size: 18px;
				 min-height: 60px;
			}
			
			.control-group {
				 flex-direction: column;
				 align-items: stretch;
			}
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>🔐 Passphrase Generator</h1>
		<p class="subtitle">Generate secure, memorable passphrases - no data stored</p>
		
		<div class="passphrase-display" id="passphraseDisplay">
			 Click generate to create your passphrase
		</div>
		
		<button class="btn-copy" id="copyBtn" style="display: none;">📋 Copy to Clipboard</button>
		
		<div class="controls">
			<div class="control-group">
				<label for="wordCount">Words: <span id="wordCountDisplay">4</span></label>
				<input type="range" id="wordCount" min="2" max="8" value="4" step="1">
				<input type="number" id="wordCountNumber" min="2" max="8" value="4">
			</div>
			
			<div class="control-group">
				<div class="checkbox-group">
					<input type="checkbox" id="withNumbers">
					<label for="withNumbers">Include numbers</label>
				</div>
			</div>
		</div>
		
		<button class="btn-generate" id="generateBtn">✨ Generate Passphrase</button>
		
		<div class="strength-indicator">
			<div>Passphrase Strength</div>
			<div class="strength-bar">
				<div class="strength-fill" id="strengthFill" style="width: 100%;"></div>
			</div>
		</div>
		
		<div class="footer">
			🚀 No data stored • All generation happens client-side
		</div>
	</div>

	<script>
		 const passphraseDisplay = document.getElementById('passphraseDisplay');
		 const generateBtn = document.getElementById('generateBtn');
		 const copyBtn = document.getElementById('copyBtn');
		 const wordCount = document.getElementById('wordCount');
		 const wordCountNumber = document.getElementById('wordCountNumber');
		 const wordCountDisplay = document.getElementById('wordCountDisplay');
		 const withNumbers = document.getElementById('withNumbers');
		 const strengthFill = document.getElementById('strengthFill');
		
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
		
		 async function generatePassphrase() {
			 const words = wordCount.value;
			 const includeNumbers = withNumbers.checked;
			
			 try {
				 const response = await fetch(`?action=generate&words=${words}&withNumbers=${includeNumbers}`);
				 const data = await response.json();
				
				 if (data.passphrase) {
					 passphraseDisplay.textContent = data.passphrase;
					 copyBtn.style.display = 'inline-block';
					
					// Update strength indicator
					 const strength = Math.min(100, words * 25);
					 strengthFill.style.width = strength + '%';
					
					// Add subtle animation
					 passphraseDisplay.style.animation = 'none';
					 setTimeout(() => {
						 passphraseDisplay.style.animation = 'fadeIn 0.3s ease';
					}, 10);
				}
			} catch (error) {
				 console.error('Error generating passphrase:', error);
				 passphraseDisplay.textContent = 'Error generating passphrase. Please try again.';
			}
		}
		
		// Copy to clipboard
		 copyBtn.addEventListener('click', () => {
			 const text = passphraseDisplay.textContent;
			 if (text && text !== 'Click generate to create your passphrase') {
				 navigator.clipboard.writeText(text).then(() => {
					 const originalText = copyBtn.textContent;
					 copyBtn.textContent = '✅ Copied!';
					 setTimeout(() => {
						 copyBtn.textContent = originalText;
					}, 2000);
				}).catch(err => {
					 console.error('Failed to copy:', err);
					// Fallback
					 const range = document.createRange();
					 range.selectNode(passphraseDisplay);
					 window.getSelection().removeAllRanges();
					 window.getSelection().addRange(range);
					 document.execCommand('copy');
					 window.getSelection().removeAllRanges();
				});
			}
		});
		
		// Generate on load
		 window.addEventListener('load', generatePassphrase);
		
		// Generate on button click
		 generateBtn.addEventListener('click', generatePassphrase);
		
		// Enter key support
		 document.addEventListener('keydown', (e) => {
			 if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
				 generatePassphrase();
			}
		});
		
		// Add CSS animation
		 const style = document.createElement('style');
		 style.textContent = `
			@keyframes fadeIn {
				 from { opacity: 0.5; transform: scale(0.98); }
				 to { opacity: 1; transform: scale(1); }
			}
		`;
		 document.head.appendChild(style);
	</script>
</body>
</html>
