// الإتصال بgithub api
const REPO_OWNER = "your-username";
const REPO_NAME = "your-repo";
const DISCUSSION_CATEGORY_ID = "DIC_kwDO..."; // يمكن الحصول عليه من GitHub API

async function fetchComments() {
    const response = await fetch(`https://api.github.com/graphql`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GITHUB_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: `
                query {
                    repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
                        discussions(first: 100, categoryId: "${DISCUSSION_CATEGORY_ID}") {
                            nodes {
                                title
                                body
                                createdAt
                                author {
                                    login
                                    avatarUrl
                                }
                                comments(first: 100) {
                                    nodes {
                                        body
                                        createdAt
                                        author {
                                            login
                                            avatarUrl
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `
        })
    });
// عرض التعليقات
    return await response.json();
}
function displayComments(data) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';

    data.data.repository.discussions.nodes.forEach(discussion => {
        // عرض المناقشة الرئيسية
        const discussionElement = createCommentElement(
            discussion.author,
            discussion.body,
            discussion.createdAt
        );
        commentsList.appendChild(discussionElement);

        // عرض الردود
        discussion.comments.nodes.forEach(comment => {
            const commentElement = createCommentElement(
                comment.author,
                comment.body,
                comment.createdAt
            );
            commentsList.appendChild(commentElement);
        });
    });
}

function createCommentElement(author, body, createdAt) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'comment-header';

    const avatarImg = document.createElement('img');
    avatarImg.src = author.avatarUrl;
    avatarImg.className = 'comment-avatar';
    avatarImg.alt = `${author.login}'s avatar`;

    const authorSpan = document.createElement('span');
    authorSpan.className = 'comment-author';
    authorSpan.textContent = author.login;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'comment-time';
    timeSpan.textContent = new Date(createdAt).toLocaleString();

    headerDiv.appendChild(avatarImg);
    headerDiv.appendChild(authorSpan);
    headerDiv.appendChild(timeSpan);

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'comment-body';
    bodyDiv.innerHTML = marked.parse(body); // استخدام marked.js لتحويل Markdown

    commentDiv.appendChild(headerDiv);
    commentDiv.appendChild(bodyDiv);

    return commentDiv;
}
// ارسال تعليق جديد
document.getElementById('submit-comment').addEventListener('click', async () => {
    const commentText = document.getElementById('comment-input').value;
    
    if (!commentText.trim()) return;

    // إنشاء مناقشة جديدة (أو الرد على موجودة)
    const response = await fetch(`https://api.github.com/graphql`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GITHUB_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: `
                mutation {
                    createDiscussion(input: {
                        repositoryId: "${REPO_ID}",
                        categoryId: "${DISCUSSION_CATEGORY_ID}",
                        title: "تعليق جديد",
                        body: "${commentText}"
                    }) {
                        discussion {
                            id
                        }
                    }
                }
            `
        })
    });

    if (response.ok) {
        document.getElementById('comment-input').value = '';
        fetchComments().then(displayComments);
    }
});
// التفاعلات
async function addReaction(commentId, content) {
    await fetch(`https://api.github.com/graphql`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.squirrel-girl-preview+json"
        },
        body: JSON.stringify({
            query: `
                mutation {
                    addReaction(input: {
                        subjectId: "${commentId}",
                        content: ${content}
                    }) {
                        reaction {
                            content
                        }
                    }
                }
            `
        })
    });
}
