url = 'https://api.coincap.io/v2/assets';
newsUrl = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=f765105d033d75bf98e339c6a007f9df7044f770d08efe106e6df4398926740a&sortOrder=popular';
const req = new XMLHttpRequest();

let dataset = [];
let values = [];
let icons = [];
let news;
let articles = [];
let homeDataset = [];
let homeData = [];

let activePage = 'topCoins';

const container = document.getElementById('content');

const formatNum = new Intl.NumberFormat(undefined, { minimumFractionDigits: 3 });

//Search
const searchBar = document.getElementById('search-bar');

searchBar.addEventListener('keyup', (e) => {
    const searchString = e.target.value.toLowerCase();
    let filteredVals;

    if (activePage === 'topCoins' || activePage === 'home') {
        filteredVals = values.filter((val) => {
            return (
                val.id.toLowerCase().includes(searchString) ||
                val.name.toLowerCase().includes(searchString) ||
                val.symbol.toLowerCase().includes(searchString)
            );
        });      
        clearContainer();
        filteredVals.forEach(val => createCard(val));

    } else if (activePage === 'news') {
        filteredVals = articles.filter((article) => {
            return (
                article.title.toLowerCase().includes(searchString) ||
                article.categories.toLowerCase().includes(searchString)
            );
        })
        clearContainer();
        filteredVals.forEach(val => createNewsCard(val));
};


});


//Error Handling
function reloadPage() {
    if (activePage === 'topCoins') { getCoins(); }
    else if (activePage === 'news') { getNews(); }
}

function handleLoadError() {
    clearContainer();
    let errorMsg = document.createElement('div');
    errorMsg.classList.add('error-box');
    errorMsg.innerHTML = 
        `<span class="error-text">Failed to load</span><br />
        <button class="error-btn" onclick="reloadPage()">Reload <i class="fas fa-redo"></i></button>
        `;
    container.appendChild(errorMsg);
}

//Content
function loadHome() {
    clearContainer();
    activePage = 'home';
    req.open('GET', url);
    req.onload = () => {
        homeDataset = JSON.parse(req.responseText);
        homeData = homeDataset.data;
    };
    req.send();
    let sortedArr = homeData.sort((a, b) => b.changePercent24Hr - a.changePercent24Hr);
    let topThree = sortedArr.slice(0, 3);
    let bottomThree = sortedArr.slice(sortedArr.length - 3);
    topThree.forEach(coin => createSquareCard(coin));
    bottomThree.forEach(coin => createSquareCard(coin));

    let gainLossHead = document.createElement('div');
    gainLossHead.classList.add('gain-loss-header');
    gainLossHead.innerHTML = 
        `<div class="header-wrap">
        <h3 class="section-title">Top Movers</h3>
        </div>
        `;
    gainLossHead.style.order = 1;
    container.appendChild(gainLossHead);
}

function drawBoxes() {
    clearContainer();
    values.forEach(val => createCard(val));
}

function drawNews() {
    let targetArticles = articles.slice(0, 11);
    clearContainer();
    targetArticles.forEach(article => createNewsCard(article));
}

function createSquareCard(coin) {
    let coinBox = document.createElement('div');
    let iconUrl = `https://api.coinicons.net/icon/` + coin.symbol + `/64x64`;
    coinBox.id = coin.id;
    let formattedPrice = formatNum.format(coin.priceUsd);
    let formattedChange = formatNum.format(coin.changePercent24Hr);
    let adjustedColor;
        if (formattedChange > 0) { adjustedColor = '#27ae60' }
        else if (formattedChange < 0) { adjustedColor = '#e74c3c' }
        else { adjustedColor = '#2c3e50' };
    coinBox.classList.add('coin-box-square');
    coinBox.innerHTML = 
        `<div class="head-span-square"><i><img src="${iconUrl}" class="coin-icon"></i>
        <span class="symbol-square">${coin.symbol} <br />
            <span class="price-square">$${formattedPrice}</span>
        </span>
        </div>
        <span class="percent-change-square" style="color:${adjustedColor}">${formattedChange}%</span>
        `;
    coinBox.style.order = 2;
    container.appendChild(coinBox);

}

function createCard(coin) {
    let coinBox = document.createElement('div');
    let iconUrl = `https://api.coinicons.net/icon/` + coin.symbol + `/64x64`;
    coinBox.id = coin.id;
    let formattedPrice = formatNum.format(coin.priceUsd);
    let formattedChange = formatNum.format(coin.changePercent24Hr);
    let adjustedColor;
        if (formattedChange > 0) { adjustedColor = '#27ae60' }
        else if (formattedChange < 0) { adjustedColor = '#e74c3c' }
        else { adjustedColor = '#2c3e50' };
    coinBox.classList.add('coin-box');
    coinBox.innerHTML = 
        `<div class="head-span"><i><img src="${iconUrl}" class="coin-icon"></i>
            <span class="title-wrap"><span class="coin-title">${coin.name}</span><br />${coin.symbol}</span>
        </div>
        <div class="numbers-wrap">
        <span class="price">$${formattedPrice}</span>
        <span class="percent-change" style="color:${adjustedColor}">${formattedChange}%</span>
        </div>
        `;
    container.appendChild(coinBox);

}

function createNewsCard(article) {
    let articleCard = document.createElement('div');
    let articleDate = new Date(1000 * article.published_on);
    articleCard.classList.add('article-card');
    articleCard.innerHTML = 
        `<img class="article-img" src="${article.imageurl}"></img>
        <div class="article-text-box">
        <span class="article-title">${article.title}</span> <br />
        <div class="article-bottom">
        <span class="article-date">${articleDate.toLocaleDateString()}</span>
        <span class="article-source">Source: <a href="${article.url}" target="_blank">${article.source}</a></span>
        </div></div>
        `;
    container.appendChild(articleCard);
}

function clearContainer() {
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }
}

function clearField() {
    searchBar.value = '';
    if (activePage === 'topCoins') { drawBoxes(); }
    else if (activePage === 'news') { drawNews(); }
}

function loadingContent() {
    clearContainer();
    searchBar.value = '';
    let loadingBox = document.createElement('div');
    loadingBox.classList.add('loading-wrap');
    loadingBox.innerHTML = 
        `<p>Content loading</p>
        `;
    container.appendChild(loadingBox);
}


//API Calls
function getCoins() {
    activePage = 'topCoins';
    req.open('GET', url);
    /*
    req.onprogress = () => {
        loadingContent();
    }*/
    req.onerror = () => {
        handleLoadError();
    };
    req.onload = () => {
        dataset = JSON.parse(req.responseText);
        values = dataset.data;
        drawBoxes();
    };
    req.send();
}

function getNews() {
    activePage = 'news';
    req.open('GET', newsUrl);
    req.onload = () => {
        news = JSON.parse(req.responseText);
        articles = news.Data;
        drawNews();
    };
    req.send();
}