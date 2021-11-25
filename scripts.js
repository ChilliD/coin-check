url = 'https://api.coincap.io/v2/assets';
newsUrl = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=f765105d033d75bf98e339c6a007f9df7044f770d08efe106e6df4398926740a&sortOrder=popular';

let values = [];
let icons = [];
let articles = [];
let homeData = [];

const container = document.getElementById('content');

const formatNum = new Intl.NumberFormat(undefined, { minimumFractionDigits: 3 });
const formatBigNum = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 7 });
const formatVol = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const formatNumNoDec = new Intl.NumberFormat(undefined, { maximumFractionDigits:0 });

//Search
const searchBar = document.getElementById('search-bar');

searchBar.addEventListener('keyup', (e) => {
    const searchString = e.target.value.toLowerCase();
    let filteredVals;

    if (activePage === 'topCoins') {
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
        });
        clearContainer();
        filteredVals.forEach(val => createNewsCard(val));
    } else {
        filteredVals = homeData.filter((val) => {
            return (
                val.id.toLowerCase().includes(searchString) ||
                val.name.toLowerCase().includes(searchString) ||
                val.symbol.toLowerCase().includes(searchString)
            );
        });
        clearContainer();
        filteredVals.forEach(val => createCard(val));
    };

    let button = document.getElementById('x-button');
    if (searchString.length > 0) { button.style.opacity = .65 }
    else { button.style.opacity = .3 }
});

//Error Handling
function reloadPage() {
    clearContainer();
    if (activePage === 'topCoins') { getCoins(); }
    else if (activePage === 'news') { getNews(); }
    else if (activePage === 'home') { loadHome(); }
    else if (activePage === 'info') { showAppInfo(); }
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
    clearField();
    activePage = 'home';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!container.firstChild) { 
                homeData = data.data;
                values = data.data;
                let volumeArr = homeData.sort((a, b) => b.volumeUsd24Hr - a.volumeUsd24Hr);
                let topVolume = volumeArr.slice(0, 6);
                let sortedArr = homeData.sort((a, b) => b.changePercent24Hr - a.changePercent24Hr);
                let topThree = sortedArr.slice(0, 3);
                let bottomThree = sortedArr.slice(sortedArr.length - 3);
                topThree.forEach(coin => createSquareCard(coin));
                bottomThree.reverse().forEach(coin => createSquareCard(coin));
                topVolume.forEach(coin => createVolCard(coin));
            
                let gainLossHead = document.createElement('div');
                gainLossHead.classList.add('home-section-header');
                gainLossHead.innerHTML = 
                    `<div class="header-wrap">
                    <h3 class="section-title">Top Movers</h3>
                    </div>
                    `;
                gainLossHead.style.order = 1;
                container.appendChild(gainLossHead);
            
                let volumeHead = document.createElement('div');
                volumeHead.classList.add('home-section-header');
                volumeHead.innerHTML = 
                    `<div class="header-wrap">
                    <h3 class="section-title">Top Trading Volume 24hrs</h3>
                    </div>
                    `;
                volumeHead.style.order = 3;
                container.appendChild(volumeHead);
            }
        })
        .catch(error => {
            reloadPage();
        })
}

function drawBoxes() {
    clearContainer();
    clearField();
    values.forEach(val => createCard(val));
}

function drawNews() {
    let targetArticles = articles.slice(0, 20);
    clearContainer();
    clearField();
    targetArticles.forEach(article => createNewsCard(article));
}

function createSquareCard(coin) {
    let squareBox = document.createElement('div');
    //let iconUrl = `https://api.coinicons.net/icon/` + coin.symbol + `/64x64`;
    let iconUrl = `https://cryptoicon-api.vercel.app/api/icon/` + coin.symbol.toLowerCase();
    squareBox.id = coin.id + 'square';
    let formattedPrice = formatNum.format(coin.priceUsd);
    let formattedChange = formatNum.format(coin.changePercent24Hr);
    let adjustedColor;
        if (formattedChange > 0) { adjustedColor = '#27ae60' }
        else if (formattedChange < 0) { adjustedColor = '#e74c3c' }
        else { adjustedColor = '#2c3e50' };
    squareBox.classList.add('coin-box-square');
    squareBox.innerHTML = 
        `<div class="head-span-square"><i><img src="${iconUrl}" class="coin-icon"></i>
        <span class="symbol-square">${coin.symbol} <br />
            <span class="price-square">$${formattedPrice}</span>
        </span>
        </div>
        <span class="percent-change-square" style="color:${adjustedColor}">${formattedChange}%</span>
        `;
    squareBox.style.order = 2;
    squareBox.addEventListener('click', function(){ drawCoinPage(coin) });
    container.appendChild(squareBox);

}

function createVolCard(coin) {
    let volBox = document.createElement('div');
    //let iconUrl = `https://api.coinicons.net/icon/` + coin.symbol + `/64x64`;
    let iconUrl = `https://cryptoicon-api.vercel.app/api/icon/` + coin.symbol.toLowerCase();
    volBox.id = coin.id + 'vol';
    let formattedPrice = formatNum.format(coin.priceUsd);
    let formattedVol = formatVol.format(coin.volumeUsd24Hr);
    volBox.classList.add('volume-box');
    volBox.innerHTML = 
        `<div class="head-span-vol"><i><img src="${iconUrl}" class="coin-icon"></i>
        <span class="symbol-vol">${coin.symbol} <br />
            <span class="price-vol">$${formattedPrice}</span>
        </span>
        </div>
        <span class="volume-change">Trading Volume: <br /><span class="bold">${formattedVol}</span></span>
        `;
    volBox.style.order = 4;
    volBox.addEventListener('click', function(){ drawCoinPage(coin) });
    container.appendChild(volBox);

}

function createCard(coin) {
    let coinBox = document.createElement('div');
    //let iconUrl = `https://api.coinicons.net/icon/` + coin.symbol + `/64x64`;
    let iconUrl = `https://cryptoicon-api.vercel.app/api/icon/` + coin.symbol.toLowerCase();
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
    let coinId;
    if (activePage == 'topCoins') { coinId = values.find(val => (val.id === coin.id)); }
    else { coinId = homeData.find(val => (val.id === coin.id)); }
    coinBox.addEventListener('click', function(){ drawCoinPage(coinId) });
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

    articleCard.addEventListener('click', function(e) {
        if (e.target.tagName == 'A') {
            return true;
        } else {
            if (e.target.classList.contains('active-article')) {
                e.target.classList.remove('active-article');
                e.target.innerHTML = 
                `<img class="article-img" src="${article.imageurl}"></img>
                <div class="article-text-box">
                <span class="article-title">${article.title}</span> <br />
                <div class="article-bottom">
                <span class="article-date">${articleDate.toLocaleDateString()}</span>
                <span class="article-source">Source: <a href="${article.url}" target="_blank">${article.source}</a></span>
                </div></div>
                `;
            } else {
                e.target.classList.add('active-article');
                e.target.innerHTML = 
                `<img class="article-img" src="${article.imageurl}"></img>
                <div class="article-text-box">
                <span class="article-title">${article.title}</span> <br />
                <span class="article-body">${article.body}</span>
                <div class="article-bottom">
                <span class="article-date">${articleDate.toLocaleDateString()}</span>
                <span class="article-source">Full Article: <a href="${article.url}" target="_blank">${article.source}</a></span>
                </div></div>
                `;
            }
        }
    });
    container.appendChild(articleCard);
}

function drawCoinPage(coin) {
    clearContainer();
    let wrapper = document.createElement('div');
    let formattedPrice = formatBigNum.format(coin.priceUsd);
    let formattedChange = formatNum.format(coin.changePercent24Hr);
    let formattedSupply = formatNumNoDec.format(coin.supply);
    let formattedMaxSupply = formatNumNoDec.format(coin.maxSupply);
    let formattedCap = formatNumNoDec.format(coin.marketCapUsd);
    let formattedVol = formatVol.format(coin.volumeUsd24Hr);
    //let iconUrl = `https://api.coinicons.net/icon/` + coin.symbol + `/64x64`;
    let iconUrl = 'https://cryptoicon-api.vercel.app/api/icon/' + coin.symbol.toLowerCase();
    wrapper.classList.add('coin-wrap');
    wrapper.innerHTML = 
        `
        <div class="top-bar">
        <i id="close-page" class="far fa-times-circle close-page" onclick="reloadPage()"></i>
        </div>
        <div class="head-span-big">
            <div class="title-span">
            <span class="page-title">${coin.name}</span><br />
            <span class="coin-symbol">${coin.symbol}</span>
            </div>
            <span class="coin-icon-big"><img src="${iconUrl}"></img></span>
        </div>
        <div class="stats-wrap">
            <div class="coin-stats">
                <p>Price:</p> <p>$${formattedPrice}</p>
            </div>
            <div class="coin-stats">
                <p>Market Cap:</p> <p>${formattedCap} (#${coin.rank})</p>
            </div>
            <div class="coin-stats">
                <p>Price Change (24hrs):</p> <p>${formattedChange}%</p>
            </div>
            <div class="coin-stats">
                <p>Volume (24 hrs):</p> <p>${formattedVol}</p>
            </div>
            <div class="coin-stats">
                <p>Available Supply:</p> <p>${formattedSupply}</p>
            </div>
            <div class="coin-stats">
                <p>Max Supply:</p> <p>${formattedMaxSupply}</p>
            </div>
        </div>
        `;
    let coinArticles = [];
    let coinNewsUrl = newsUrl;
    fetch(coinNewsUrl)
        .then(response => response.json())
        .then(data => {
            coinArticles = data.Data;
            let thisArticles = coinArticles.filter(article => {
                return (
                    article.title.includes(coin.symbol) ||
                    article.title.toLowerCase().includes(coin.id) ||
                    article.categories.includes(coin.symbol) ||
                    article.categories.toLowerCase().includes(coin.id)
                )});
            thisArticles.forEach(article => createNewsCard(article));
        })
    container.appendChild(wrapper);
}

function clearContainer() {
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    container.scrollTo(0 ,0);
}

function clearField() {
    if (searchBar.value) {
        searchBar.value = '';
        reloadPage();
    };

    let button = document.getElementById('x-button');
    button.style.opacity = .3;
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

function showAppInfo() {
    activePage = 'info';
    clearContainer();
    clearField();
    let infoBox = document.createElement('div');
    infoBox.classList.add('info-wrap');
    infoBox.innerHTML = 
        `<p class="info-title">CoinCheck by Dan Chilla</p>
        <p>CoinCheck uses:<br />
        <span class="info-text"><a href="https://docs.coincap.io/" target="_blank">CoinCap API</a> to retrieve the top 100 cryptocurrencies by 
        market cap, and their pricing/trading information </span><br />
        <span class="info-text"><a href="https://min-api.cryptocompare.com/" target="_blank">CryptoCompare API</a> to retrieve top crypto news articles </span> <br />
        <span class="info-text" style="text-decoration: line-through"><a href="https://coinicons.net/" target="_blank">CoinIcons API</a> to populate icons for each cryptocurrency </span></p>
        <p>Coin Icons isn't working for the time being, so <a href="https://cryptoicon-api.vercel.app/">https://cryptoicon-api.vercel.app/</a> is currently being utilized, though several icons are missing.</p>
        
        `;
    container.appendChild(infoBox);
}


//Initialize
loadHome();


//API Calls
function getCoins() {
    container.scrollTo(0 ,0);
    activePage = 'topCoins';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            values = data.data;
            drawBoxes();
        })
        .catch(error => {
            getCoins();
            console.log(error);
        })
}

function getNews() {
    container.scrollTo(0 ,0);
    activePage = 'news';
    fetch(newsUrl)
        .then(response => response.json())
        .then(data => {
            articles = data.Data;
            drawNews();
        })
        .catch(error => {
            getNews();
            console.log(error);
        })
}