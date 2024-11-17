const city = 'Celaya';
const thinkSpeakApiKey = 'AKK112A0LNPRRW22';
const thinkSpeakUrl = 'https://api.thingspeak.com/update.json';
const weatherApiKey = '55d85922f6604a1fb8d204804241711';
const latitude = 20.5222;
const longitude = -100.8123;

async function fetchWeatherData() {
    // API de WeatherAPI para datos meteorológicos
    const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${latitude},${longitude}`;

    // API de OpenAQ para datos de calidad del aire (CO₂)
    const co2Url = `https://api.openaq.org/v2/latest?coordinates=${latitude},${longitude}&parameter=co2`;

    try {
        // Obtener datos meteorológicos
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherData || !weatherData.current) {
            console.error('Datos meteorológicos no disponibles.');
            return;
        }

        const temperature = weatherData.current.temp_c + 5;
        const humidity = weatherData.current.humidity;
        const windSpeed = weatherData.current.wind_kph / 3.6; // Convertir de km/h a m/s
        const lightLevel = (weatherData.current.uv * 100); // Uso del índice UV como indicador de luminosidad

        // Obtener datos de CO₂
        const co2Response = await fetch(co2Url);
        const co2Data = await co2Response.json();

        let co2 = 400 + Math.trunc(Math.random()*10); // Valor predeterminado

        // Verificar si hay resultados para CO₂
        if (co2Data && co2Data.results && co2Data.results.length > 0) {
            const measurements = co2Data.results[0].measurements;
            if (measurements && measurements.length > 0) {
                co2 = measurements[0].value;
            }
        }

        // Subir datos a ThinkSpeak
        await updateThinkSpeak(temperature, humidity, windSpeed, co2, lightLevel);
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

async function updateThinkSpeak(temperature, humidity, windSpeed, co2, lightLevel) {
    const params = new URLSearchParams({
        api_key: thinkSpeakApiKey,
        field1: temperature,
        field2: humidity,
        field3: windSpeed,
        field4: co2,
        field5: lightLevel
    });

    try {
        await fetch(`${thinkSpeakUrl}?${params}`, { method: 'POST' });
        console.log('Datos enviados a ThinkSpeak exitosamente');
    } catch (error) {
        console.error('Error al actualizar ThinkSpeak:', error);
    }
}

// Actualizar datos cada 5 minutos
setInterval(fetchWeatherData, 300000);
fetchWeatherData();