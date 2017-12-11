var buttons = Array.from(document.querySelectorAll('.timeTableBtn'));
var soundBtn = document.getElementById('soundBtnOnOff');
var clockStatus = document.querySelector('.clock-status');
var statusMessageElement = document.querySelector('.status');

let dataFetchInterval = null;

var config = {
	SKYSS_DATA_FETCH_RATE: 20000,
	YR_DATA_FETCH_RATE: 60000,
};

let silentTTS = false;
if (window.localStorage.getItem('sound')) {
	silentTTS = JSON.parse(window.localStorage.getItem('sound'));
}

function buttonClicked(btn) {
	var from = btn.dataset.from;
	var to = btn.dataset.to;

	var params = {
		from,
		to,
		silent: silentTTS,
	};

	statusMessageElement.innerHTML = `Henter data for Bybanen<br>fra: <span class="destination">${from}</span><br>til: <span class="destination">${to}</span>`;
	getSkyssTimeTable(params);

	return setInterval(() => {
		params.silent = true;
		getSkyssTimeTable(params);
	}, config.SKYSS_DATA_FETCH_RATE);
}

function startGettingData() {
	if (dataFetchInterval) {
		clearInterval(dataFetchInterval);
	}

	dataFetchInterval = buttonClicked(this);
}

function saveToLocalStorage(key, value) {
	if (!key) {
		throw new Error('Key cannot be empty');
	} else if (!value) {
		throw new Error('Value cannot be empty');
	}

	window.localStorage.setItem(key, value);
}


function updateSoundButton(btn) {
	var statusIcon = document.createElement('i');
	statusIcon.classList.add('fa');
	if (silentTTS) {
		statusIcon.classList.add('fa-volume-up', 'fa-green');
		statusIcon.classList.remove('fa-volume-off', 'fa-red');
		btn.innerHTML = 'Lyd på';
		btn.appendChild(statusIcon);
		silentTTS = false;
	} else {
		statusIcon.classList.add('fa-volume-off', 'fa-red');
		statusIcon.classList.remove('fa-volume-up', 'fa-green');
		btn.innerHTML = 'Lyd av';
		btn.appendChild(statusIcon);
		silentTTS = true;
	}
}

function toggleSound() {
	saveToLocalStorage('sound', silentTTS.toString());
	updateSoundButton(this);
}

updateSoundButton(soundBtn);

buttons.forEach((btn) => {
	btn.addEventListener('click', startGettingData);
});

buttons.forEach((btn) => {
	btn.addEventListener('touchstart', startGettingData);
});

soundBtn.addEventListener('click', toggleSound);

moment.locale('nb');

setInterval(() => {
	clockStatus.innerHTML = moment().format('LLLL');
}, 1000);


function SkyssTimeTableException(message) {
	this.toString = function () {
		return message;
	};
}


function getSkyssTimeTable(params) {
	if (!params || !params.from || !params.to) {
		throw new SkyssTimeTableException('The params object needs a field for from, to, and silent');
	}

	var skyssRequest = new XMLHttpRequest();
	skyssRequest.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			var data = JSON.parse(this.response);
			statusMessageElement.innerHTML = `Neste avganger<br>fra: <span class="destination">${params.from}</span><br>til: <span class="destination">${params.to}</span>`;
			document.querySelector('.time-table').innerHTML = `<table class="table table-striped">
																	<thead>
																		<tr><th>Start</th><th>Slutt</th></tr>
																	</thead>

																	<tbody>

																		${data.map(d => `<tr><td>${d.start}</td><td>${d.end}</td></tr>`).join('')}
																	</tbody>
																	</table>`;
		}
	};
	skyssRequest.open('POST', '/skyss', true);
	skyssRequest.setRequestHeader('Content-type', 'application/json');
	skyssRequest.send(JSON.stringify(params));
}

function formatTimeOfDay(rainDate) {
	var date = moment.tz(rainDate, moment.ISO_8601, 'Europe/Oslo');
	return [date.hour() - 1, date.minute(), date.second()];
}

function formatRainData(data) {
	if (data.length === 0) {
		throw new Error('No rain data present to format');
	}

	return data.map(function(r) {
		return [formatTimeOfDay(r.from), parseFloat(r.location.precipitation.value)]
	});
}

function removeLoading() {
	document.querySelector(".loading").remove();
}

function drawWeatherChart(rainData) {
	google.charts.load('current', { packages: ['bar'] });
	function drawChart() {
		var data = new google.visualization.DataTable();
		data.addColumn('timeofday', 'Tid på dagen');
		data.addColumn('number', 'MM/H');


		data.addRows(rainData);


		var textOptions = {
			color: 'white',
			fontSize: 14,
			bold: true,
		};

		var options = {
			backgroundColor: '#d2492a',
			chart: {
				title: 'Blir det regn neste 1,5 time?',
				subtitle: 'Data fra Yr.no',
			},
			vAxis: {
				title: 'mm nedbør',
				textStyle: {
					color: 'white',
					fontSize: 14,
					bold: true,
				},
			},
			hAxis: {
				titleTextStyle: textOptions,
				textStyle: textOptions,
				gridLines: {
					color: '#fff',
				},
			},
			titleTextStyle: {
				color: 'white',
				fontSize: 20,
				bold: true,
			},
			legend: {
				textStyle: {
					color: 'white',
					fontSize: 18
				},
			},
		};

		removeLoading();
		var chart = new google.charts.Bar(document.getElementById('weatherChart'));
		chart.draw(data, google.charts.Bar.convertOptions(options));
	}
	google.charts.setOnLoadCallback(drawChart);
}

function itWillRain(data) {
	return data.product.time.every(function(r) {
		return parseFloat(r.location.precipitation.value) !== 0.0;
	});
}

function itWontRain() {
	removeLoading();
	var h2 = document.querySelector('h2.status');
	h2.textContent = 'Det skal ikke regne neste 1,5 time!';
}


function fetchRainData() {
	var xhr = new XMLHttpRequest();
	xhr.addEventListener('load', function () {
		var data = JSON.parse(this.responseText);
		if(itWillRain(data)) {
			var dataArray = formatRainData(data.product.time);
			drawWeatherChart(dataArray);	
		} else {
			itWontRain();
		}
	});
	xhr.open('GET', '/rainData');
	xhr.send();
}

fetchRainData();

// setInterval(fetchRainData, 5000);
