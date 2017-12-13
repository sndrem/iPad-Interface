const buttons = Array.from(document.querySelectorAll('.timeTableBtn'));
const soundBtn = document.getElementById('soundBtnOnOff');
const clockStatus = document.querySelector('.clock-status');
const statusMessageElement = document.querySelector('.status');

let dataFetchInterval = null;

const config = {
	SKYSS_DATA_FETCH_RATE: 20000,
	YR_DATA_FETCH_RATE: 60000,
};


let silentTTS = false;
if (window.localStorage.getItem('sound')) {
	silentTTS = JSON.parse(window.localStorage.getItem('sound'));
}

function SkyssTimeTableException(message) {
	this.toString = function toString() {
		return message;
	};
}

function getSkyssTimeTable(params) {
	if (!params || !params.from || !params.to) {
		throw new SkyssTimeTableException('The params object needs a field for from, to, and silent');
	}

	const timeTable = document.querySelector('.time-table');

	fetch('/skyss', {
		method: 'POST',
		body: JSON.stringify(params),
		headers: new Headers({
			'Content-Type': 'application/json'
		})
	}).then(data => data.json())
		.then((timeTableData) => {
			const data = timeTableData;
			statusMessageElement.innerHTML = `Neste avganger<br>fra: <span class="destination">${params.from}</span><br>til: <span class="destination">${params.to}</span>`;
			timeTable.innerHTML = `<table class="table table-striped">
																	<thead>
																		<tr><th>Start</th><th>Slutt</th></tr>
																	</thead>

																	<tbody>

																		${data.map(d => `<tr><td>${d.start}</td><td>${d.end}</td></tr>`).join('')}
																	</tbody>
																	</table>`;
		}).catch(() => {
			timeTable.innerHTML = 'Kunne ikke hente neste avganger. Prøv igjen, eller vent en stund.';
		});
}

function buttonClicked(btn) {
	const { to, from } = btn.dataset;

	const params = {
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
	const thisBtn = btn;
	const statusIcon = document.createElement('i');
	statusIcon.classList.add('fa');
	if (silentTTS) {
		statusIcon.classList.add('fa-volume-up', 'fa-green');
		statusIcon.classList.remove('fa-volume-off', 'fa-red');
		thisBtn.innerHTML = 'Lyd på';
		thisBtn.appendChild(statusIcon);
		silentTTS = false;
	} else {
		statusIcon.classList.add('fa-volume-off', 'fa-red');
		statusIcon.classList.remove('fa-volume-up', 'fa-green');
		thisBtn.innerHTML = 'Lyd av';
		thisBtn.appendChild(statusIcon);
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


function formatTimeOfDay(rainDate) {
	const date = moment.tz(rainDate, moment.ISO_8601, 'Europe/Oslo');
	return [date.hour() - 1, date.minute(), date.second()];
}

function formatRainData(data) {
	if (data.length === 0) {
		throw new Error('No rain data present to format');
	}

	return data.map(r => [formatTimeOfDay(r.from), parseFloat(r.location.precipitation.value)]);
}

function removeLoading() {
	document.querySelector('.loading').remove();
}

function drawWeatherChart(rainData) {
	google.charts.load('current', { packages: ['bar'] });
	function drawChart() {
		const data = new google.visualization.DataTable();
		data.addColumn('timeofday', 'Tid på dagen');
		data.addColumn('number', 'MM/H');


		data.addRows(rainData);

		const textOptions = {
			color: 'white',
			fontSize: 14,
			bold: true,
		};

		const options = {
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
		const chart = new google.charts.Bar(document.getElementById('weatherChart'));
		chart.draw(data, google.charts.Bar.convertOptions(options));
	}
	google.charts.setOnLoadCallback(drawChart);
}

function itWillRain(data) {
	return data.product.time.every(r => parseFloat(r.location.precipitation.value) !== 0.0);
}

function itWontRain() {
	removeLoading();
	const h2 = document.querySelector('h2.status');
	h2.textContent = 'Det skal ikke regne neste 1,5 time!';
}


function fetchRainData() {
	fetch('/rainData')
		.then(data => data.json())
		.then((data) => {
			if (itWillRain(data)) {
				const dataArray = formatRainData(data.product.time);
				drawWeatherChart(dataArray);
			} else {
				itWontRain();
			}
		});
}

function fetchForecast() {
	fetch('/forecast')
		.then(data => data.json())
		.then((data) => {
			const nextWeather = data.weatherdata.forecast.tabular.time[0];
			document.querySelector('#forecast').innerHTML = data.weatherdata.forecast.text.location.time[0].body;
			document.querySelector('#symbol').innerHTML = `<img src="../images/sym/b100/${nextWeather.symbol.var}.png">`;
			document.querySelector('#temperature').innerHTML = `${nextWeather.temperature.value} &#8451;`;
			document.querySelector('#precipitation').innerHTML = `${nextWeather.precipitation.value} mm nedbør`;
			document.querySelector('#wind').innerHTML = `${nextWeather.windSpeed.mps} m/s - ${nextWeather.windSpeed.name.toLowerCase()} fra ${nextWeather.windDirection.name.toLowerCase()}`;
			document.querySelector('#lastUpdated').innerHTML = `Sist oppdatert: ${data.weatherdata.meta.lastupdate}`;
		});
}

fetchRainData();
fetchForecast();
