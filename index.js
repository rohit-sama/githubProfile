

const APIURL = "https://api.github.com/users/";
const main = document.querySelector("#main");
const searchBox = document.querySelector("#search");
let currentPage = 1;
let reposPerPage = 10;
const MAX_VISIBLE_PAGES = 8;

const reposPerPageInput = document.querySelector("#reposPerPage");

reposPerPageInput.addEventListener("change", function () {
    reposPerPage = parseInt(reposPerPageInput.value);
    getRepos(username, currentPage);
});


const getUser = async (username) => {
    const response = await fetch(APIURL + username , {
        headers: {
            Authorization: `Bearer <API_KEY>`,
        }
    }
        );
    const data = await response.json();
    const card = `
    <div class="card">
    <div>
        <img class="avatar" src="${data.avatar_url}" alt="Florin Pop">
        
    </div>
    <div class="user-info">
        <h2>${data.name}</h2>
        <p>${data.bio}</p>

        <ul class="info">
            <li>${data.followers}<strong>Followers</strong></li>
            <li>${data.following}<strong>Following</strong></li>
            <li>${data.public_repos}<strong>Repositories</strong></li>
        </ul>
        <p>${data.location}</p>
        <a href="${data.blog}" target="_blank">${data.blog}</a>
        <p>${data.twitter_username?  data.twitter_username : ""}</p>
    </div>
    
</div>
<div id="repos">
          
</div>
        <div id="pagination"></div> 
    `;
    main.innerHTML = card;
    getRepos(username);
};

const getRepos = async (username, page = 1) => {
    const repos = document.querySelector("#repos");
    const paginationContainer = document.querySelector("#pagination");

    // Clear existing content
    repos.innerHTML = "";
    paginationContainer.innerHTML = "";

    const response = await fetch(`${APIURL}${username}/repos?page=${page}&per_page=${reposPerPage}`, {
        headers: {
            Authorization: `Bearer <API_KEY>`,
        },
    });
    const data = await response.json();
    console.log(data)

    // Check if data is an array
    if (!Array.isArray(data)) {
        console.error("Invalid data format. Expected an array.");
        return;
    }

    data.forEach((item) => {
        const repoContainer = document.createElement("div");
        repoContainer.classList.add("repo-container");
    
        const repoName = document.createElement("a");
        repoName.classList.add("repo-name");
        repoName.href = item.html_url;
        repoName.innerText = item.name;
        repoName.target = "_blank";
    
        const repoDescription = document.createElement("p");
        repoDescription.classList.add("repo-description");
        repoDescription.innerText = item.description || "No description available.";
    
        const repoTags = document.createElement("ul");
        repoTags.classList.add("repo-tags");
        item.topics.forEach((tag) => {
            const tagItem = document.createElement("li");
            tagItem.innerText = tag;
            repoTags.appendChild(tagItem);
        });
    
        repoContainer.appendChild(repoName);
        repoContainer.appendChild(repoDescription);
        repoContainer.appendChild(repoTags);
    
        repos.appendChild(repoContainer);
    });

    // Pagination logic
    const totalRepos = await getTotalRepos(username);
    const totalPages = Math.ceil(totalRepos / reposPerPage);

    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > MAX_VISIBLE_PAGES) {
        const halfMaxPages = Math.floor(MAX_VISIBLE_PAGES / 2);
        startPage = Math.max(1, currentPage - halfMaxPages);
        endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

        if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
            startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement("a");
        pageLink.classList.add("pagination-link");
        if (i === currentPage) {
            pageLink.classList.add("active");
        }
        pageLink.href = "#";
        pageLink.innerText = i;
        pageLink.addEventListener("click", () => handlePageClick(username, i));
        paginationContainer.appendChild(pageLink);
    }
    if (currentPage > 1) {
        const prevButton = document.createElement("a");
        prevButton.classList.add("pagination-link");
        prevButton.href = "#";
        prevButton.innerText = "Previous";
        prevButton.addEventListener("click", () => handlePageClick(username, currentPage - 1));
        paginationContainer.appendChild(prevButton);
    }

    // Next button
    if (currentPage < totalPages) {
        const nextButton = document.createElement("a");
        nextButton.classList.add("pagination-link");
        nextButton.href = "#";
        nextButton.innerText = "Next";
        nextButton.addEventListener("click", () => handlePageClick(username, currentPage + 1));
        paginationContainer.appendChild(nextButton);
    }
};

const getTotalRepos = async (username) => {
    const response = await fetch(`${APIURL}${username}`);
    const data = await response.json();
    return data.public_repos;
};


const handlePageClick = (username, page) => {
    currentPage = page;
    getRepos(username, page);
};

const formSubmit = () => {
    if (searchBox.value !== "") {
        getUser(searchBox.value);
        searchBox.value = "";
    }
    return false;
};

// init call
getUser("rohit-sama");
