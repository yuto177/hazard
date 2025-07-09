<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $file = 'users.json';
    $username = $_POST['username'];
    $password = $_POST['password'];

    if (!file_exists($file)) {
        echo "ユーザー情報がありません。";
        exit;
    }

    $users = json_decode(file_get_contents($file), true);

    if (isset($users[$username]) && password_verify($password, $users[$username])) {
        $_SESSION['username'] = $username;
        header("Location: map.html");
        exit;
    } else {
        echo "ユーザー名またはパスワードが正しくありません。";
    }
}
?>
