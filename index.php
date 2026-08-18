# Navigate to your project
cd ~/php-cloud-run

# Create a simple working PHP file
cat > src/index.php << 'EOF'
<?php
// Simple passphrase generator
$words = ['elephant', 'tiger', 'dolphin', 'eagle', 'panther', 'falcon', 'raven', 'wolf'];
$passphrase = '';

for ($i = 0; $i < 4; $i++) {
    $word = $words[array_rand($words)];
    $passphrase .= ucfirst($word) . '-';
}
$passphrase = rtrim($passphrase, '-');

echo '<!DOCTYPE html>
<html>
<head><title>Passphrase Generator</title></head>
<body style="font-family: Arial; text-align: center; padding: 50px;">
    <h1>🔐 Passphrase Generator</h1>
    <p style="font-size: 24px; background: #f0f0f0; padding: 20px; border-radius: 10px;">' . $passphrase . '</p>
    <p>No data stored • All generation happens on the server</p>
</body>
</html>';
?>
EOF
