url = 'https://api.coincap.io/v2/assets';
newsUrl = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=f765105d033d75bf98e339c6a007f9df7044f770d08efe106e6df4398926740a&sortOrder=popular';
const req = new XMLHttpRequest();

let dataset = [];
let values = [];
let icons = [];
let news;
let articles = [];

const container = document.getElementById('content');

const formatNum = new Intl.NumberFormat(undefined, { minimumFractionDigits: 3 });

//Error Handling
function reloadAPI() {
    location.reload();
    return false;
}

function handleLoadError() {
    let errorMsg = document.createElement('div');
    errorMsg.classList.add('error-box');
    errorMsg.innerHTML = 
        `<span class="error-text">Failed to load</span><br />
        <button class="error-btn" onclick="reloadAPI()">Reload <i class="fas fa-redo"></i></button>
        `;
    container.appendChild(errorMsg);
}

//Content
function drawBoxes() {
    clearContainer();
    values.forEach(val => createCard(val));
}

function drawNews() {
    clearContainer();
    let targetArticles = articles.slice(0, 9);
    targetArticles.forEach(article => {
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
    })
}

function createCard(coin) {
    let coinBox = document.createElement('div');
    let iconUrl = `https://api.coinicons.net/icon/` + coin.symbol.toLowerCase() + `/64x64`;
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

function clearContainer() {
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }
}


//API Calls
req.open('GET', url);
req.onerror = () => {
    handleLoadError();
};
req.onload = () => {
    dataset = JSON.parse(req.responseText);
    values = dataset.data;
    drawBoxes();
};
req.send();

function getNews() {
    req.open('GET', newsUrl);
    req.onload = () => {
        news = JSON.parse(req.responseText);
        articles = news.Data;
        drawNews();
    };
    req.send();
}