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

    return await response.json();
}
