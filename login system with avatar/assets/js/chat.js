document.getElementById('searchUser').addEventListener('input', function() {
    let query = this.value.trim();

    // Basic sanitization
    query = query.replace(/[<>]/g, ''); // Strip out < and > to avoid potential XSS

    if (query.length > 0) {
        fetch(`search.php?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                let usersHtml = '';
                data.forEach(user => {
                    usersHtml += `<div class="user" data-user-id="${user.id}">${user.name}</div>`;
                });
                document.getElementById('searchResults').innerHTML = usersHtml;

                // Add click event for each user in search results
                document.querySelectorAll('.user').forEach(userDiv => {
                    userDiv.addEventListener('click', function() {
                        const userId = this.getAttribute('data-user-id');
                        window.location.href = `user_chat.php?user_id=${userId}`;
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
            });
    } else {
        document.getElementById('searchResults').innerHTML = '';
    }
});
function deleteSearchHistory() {
    console.log('Attempting to delete search history');
    
    fetch('delete_search_history.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('searchUser').value = ''; // Clear input
            document.getElementById('searchResults').innerHTML = ''; // Clear results
            console.log('Search history deleted successfully');
            alert('Search history has been cleared.');
        } else {
            console.error('Failed to delete search history:', data.message);
            alert('Failed to clear search history. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while clearing search history. Please try again.');
    });
}

document.getElementById('clearSearchHistory').addEventListener('click', deleteSearchHistory);
// Function to delete search history and recent chats
function deleteSearchHistory() {
    console.log('Attempting to delete search history and recent chats');

    fetch('delete_search_history.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Clear search input and results
            document.getElementById('searchUser').value = ''; 
            document.getElementById('searchResults').innerHTML = '';

            // Clear recent chats (assuming they are displayed in an element with id 'recentChats')
            document.getElementById('recentChats').innerHTML = ''; 

            console.log('Search history and recent chats deleted successfully');
            alert('Search history and recent chats have been cleared.');
        } else {
            console.error('Failed to delete search history and recent chats:', data.message);
            alert('Failed to clear search history and recent chats. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error occurred:', error);
        alert('An error occurred while clearing search history and recent chats. Please try again.');
    });
}

// Add click event listener to the button
document.getElementById('clearSearchHistory').addEventListener('click', deleteSearchHistory);
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchUser');
    const searchHistoryList = document.getElementById('searchHistoryList');
    const clearSearchHistoryButton = document.getElementById('clearSearchHistory');

    // Function to save the search term to local storage
    function saveSearchTerm(searchTerm) {
        let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        if (!searchHistory.includes(searchTerm)) {
            searchHistory.unshift(searchTerm); // Add to the beginning of the array
            if (searchHistory.length > 5) searchHistory.pop(); // Limit to 5 entries
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        }
    }

    // Function to show recent search history
    function showSearchHistory() {
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        searchHistoryList.innerHTML = ''; // Clear the list first
        if (searchHistory.length > 0) {
            searchHistory.forEach(term => {
                const li = document.createElement('li');
                li.textContent = term;
                li.addEventListener('click', () => {
                    searchInput.value = term; // Autofill search term
                    performSearch(term); // Perform the search
                });
                searchHistoryList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No recent searches';
            searchHistoryList.appendChild(li);
        }
    }

    // Function to perform search (dummy function for now)
    function performSearch(term) {
        // Perform search logic here, you can implement the AJAX search feature
        console.log('Searching for:', term);
    }

    // Event listener to save search term when the user searches
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm !== '') {
            saveSearchTerm(searchTerm); // Save to history
        }
    });

    // Event listener to clear search history
    clearSearchHistoryButton.addEventListener('click', () => {
        localStorage.removeItem('searchHistory');
        searchHistoryList.innerHTML = ''; // Clear the list visually
        showSearchHistory(); // Refresh history display
    });

    // Call to initially load the search history
    showSearchHistory();
});
document.addEventListener('DOMContentLoaded', function () {
    const deleteButtons = document.querySelectorAll('.delete-chat');

    // Function to delete a chat
    function deleteChat(chatUserId, chatItem) {
        fetch('delete_chat.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `chat_user_id=${chatUserId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                chatItem.remove(); // Remove the chat from the UI
                alert('Chat deleted successfully');
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Add event listener to all delete buttons
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const chatUserId = this.getAttribute('data-chat-id');
            const chatItem = this.closest('.recent-chat-item');
            
            if (confirm('Are you sure you want to delete this chat?')) {
                deleteChat(chatUserId, chatItem); // Call the function to delete the chat
            }
        });
    });
});

const floatButton = document.getElementById('floatButton');

// Scroll to the message input section when the button is clicked
floatButton.addEventListener('click', function() {
    const chatArea = document.querySelector('.chat-area7'); // Chat area container
    const messageInput = document.getElementById('messageInput'); // Input field
    
    // Ensure the chat area scrolls to the bottom (message input is near the bottom)
    chatArea.scrollTo({
        top: chatArea.scrollHeight, // Scroll to the bottom of the chat area
        behavior: 'smooth' // Smooth scrolling for a better user experience
    });

    // Focus on the message input after the scroll finishes
    setTimeout(() => {
        messageInput.focus();
    }, 500); // Add delay to ensure smooth scrolling completes before focusing
});

// Function to load recent chats
function loadChat() {
    // Send an AJAX request to a PHP file to get the updated chat list
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'load_recent_chats.php', true);
    
    xhr.onload = function () {
        if (this.status === 200) {
            // Replace the recent chat section with the updated content
            document.querySelector('.recent-chats').innerHTML = this.responseText;
        }
    };
    
    xhr.send();
}

// Call loadChat every 2 seconds
setInterval(loadChat, 2000);
