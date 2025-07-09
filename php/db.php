<?php
$host = 'localhost';
$dbname = 'your_database_name';
$user = 'root';
$pass = ''; // パスワードはXAMPPの初期状態では空

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("DB接続失敗: " . $e->getMessage());
}
?>
