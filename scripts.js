url = 'https://api.coincap.io/v2/assets';
newsUrl = '';
newsAPIKEY = '613f716142734cab90eb32e2dd57692f';
const req = new XMLHttpRequest();

let dataset = [];
let values = [];
let icons = [];

const container = document.getElementById('content');

const formatNum = new Intl.NumberFormat(undefined, { minimumFractionDigits: 3 });



function drawBoxes() {
values.forEach(val => createCard(val));
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
        `<div class="head-span"><i><img src="${iconUrl}" class="coin-icon"></i>${coin.symbol}</div>
        <div class="numbers-wrap">
        <span class="price">$${formattedPrice}</span>
        <span class="percent-change" style="color:${adjustedColor}">${formattedChange}%</span>
        </div>
        `;
    container.appendChild(coinBox);

}

req.open('GET', url);
req.onload = () => {
  dataset = JSON.parse(req.responseText);
  values = dataset.data;
  drawBoxes();
};
req.send();
