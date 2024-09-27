<?php
include 'config.php';
session_start();

// Check if the user is logged in
if(!isset($_SESSION['user_id'])){
    header('location:login.php');
    exit();
}

$user_id = $_SESSION['user_id'];
$query = "SELECT name, email, image FROM user_form WHERE id = '$user_id'";
$result = mysqli_query($conn, $query);
$user = mysqli_fetch_assoc($result);

// Fetch recent chats query
$recent_chats_query = "
    SELECT DISTINCT 
        CASE 
            WHEN cm.user1_id = '$user_id' THEN cm.user2_id
            ELSE cm.user1_id
        END AS chat_user_id,
        u.name,
        u.image,
        MAX(cm.timestamp) as last_message_time
    FROM chat_messages cm
    JOIN user_form u ON (u.id = cm.user1_id OR u.id = cm.user2_id)
    WHERE (cm.user1_id = '$user_id' OR cm.user2_id = '$user_id')
      AND u.id != '$user_id'
    GROUP BY chat_user_id, u.name, u.image
    ORDER BY last_message_time DESC
    LIMIT 10
";
$recent_chats_result = mysqli_query($conn, $recent_chats_query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="chat-container">
        <!-- Profile Section -->
        <div class="profile-section">
            <div class="profile-icon">
                <a href="home.php">
                <?php
                    // Display user profile image or default avatar
                    if($user['image'] == '') {
                        echo '<img src="images/default-avatar.png" class="profile-pic">';
                    } else {
                        echo '<img src="uploaded_img/'.$user['image'].'" class="profile-pic">';
                    }
                ?>
                </a>
            </div>
            <h4>Welcome, <?php echo htmlspecialchars($user['name']); ?></h4>
        </div>

        <!-- Chat Area -->
        <div class="chat-area">
            <!-- Search Bar with Search History -->
            <div class="search-bar">
                <input type="text" id="searchUser" placeholder="Search for a user" onfocus="showSearchHistory()">
            </div>
            <div id="searchResults"></div>

            <!-- Recent Searches -->
            <div class="recent-search-history">
                <h3>Recent Searches</h3>
                <div class="searchHistoryList">
                <ul id="searchHistoryList"></ul>
                </div>
            </div>
            <button id="clearSearchHistory">Clear Search History</button>

            <!-- Recent Chats Section -->
            <div class="recent-chats">
                <h3>Recent Chats</h3>
                <?php while ($chat = mysqli_fetch_assoc($recent_chats_result)): ?>
                    <div class="recent-chat-item">
                        <a href="user_chat.php?user_id=<?php echo $chat['chat_user_id']; ?>">
                            <?php
                            // Display user chat image or default avatar
                            if($chat['image'] == '') {
                                echo '<img src="images/default-avatar.png" class="chat-avatar">';
                            } else {
                                echo '<img src="uploaded_img/'.$chat['image'].'" class="chat-avatar">';
                            }
                            ?>
                            <span class="chat-name"><?php echo htmlspecialchars($chat['name']); ?></span>
                            <span class="last-message-time"><?php echo date('M d, H:i', strtotime($chat['last_message_time'])); ?></span>
                        </a>
                        <button class="delete-chat" data-chat-id="<?php echo $chat['chat_user_id']; ?>">Delete</button>
                    </div>
                <?php endwhile; ?>
            </div>
        </div>
    </div>

    <!-- Include the chat JavaScript file -->
    <script src="assets/js/chat.js">
    setInterval(loadChat, 2000);
    </script>
</body>
</html>
