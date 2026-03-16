/**
 * 날씨 수집기 - 방콕/파타야 오늘의 날씨
 * 무료 API: Open-Meteo (API 키 불필요)
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const NEWSBOT_AUTHOR_ID = 'newsbot-system';

const SOCIAL_LINKS = {
  telegram: process.env.TELEGRAM_URL || '',
  line: process.env.LINE_URL || '',
  kakao: process.env.KAKAO_OPEN_URL || '',
  whatsapp: process.env.WHATSAPP_URL || ''
};

// 도시별 좌표
const CITIES = {
  '방콕': { lat: 13.7563, lon: 100.5018 },
  '파타야': { lat: 12.9236, lon: 100.8825 }
};

// 날씨 코드 → 한국어
const WEATHER_DESC = {
  0: '맑음 ☀️', 1: '대체로 맑음 🌤️', 2: '약간 흐림 ⛅', 3: '흐림 ☁️',
  45: '안개 🌫️', 48: '짙은 안개 🌫️',
  51: '가벼운 이슬비 🌦️', 53: '이슬비 🌦️', 55: '강한 이슬비 🌧️',
  61: '약한 비 🌧️', 63: '비 🌧️', 65: '강한 비 🌧️',
  71: '약한 눈 🌨️', 73: '눈 🌨️', 75: '강한 눈 ❄️',
  80: '소나기 🌦️', 81: '강한 소나기 ⛈️', 82: '폭우 ⛈️',
  95: '천둥번개 ⛈️', 96: '우박 동반 뇌우 ⛈️', 99: '강한 우박 뇌우 ⛈️'
};

async function fetchWeather(cityName, coords) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Bangkok&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`날씨 API 실패: ${res.status}`);

  const data = await res.json();
  const current = data.current;
  const daily = data.daily;

  return {
    city: cityName,
    temp: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    weatherDesc: WEATHER_DESC[current.weather_code] || '알 수 없음',
    maxTemp: daily.temperature_2m_max[0],
    minTemp: daily.temperature_2m_min[0],
    precipitation: daily.precipitation_sum[0],
    maxWind: daily.wind_speed_10m_max[0]
  };
}

function buildWeatherPost(weatherData) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    timeZone: 'Asia/Bangkok'
  });

  let title = `오늘의 태국 날씨 (${new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', timeZone: 'Asia/Bangkok' })})`;

  let content = `📅 ${today}\n\n`;

  for (const w of weatherData) {
    content += `🏙️ ${w.city}\n`;
    content += `${w.weatherDesc}\n`;
    content += `🌡️ 현재 ${w.temp}°C (최저 ${w.minTemp}°C / 최고 ${w.maxTemp}°C)\n`;
    content += `💧 습도 ${w.humidity}% | 💨 바람 ${w.windSpeed}km/h\n`;
    if (w.precipitation > 0) content += `🌧️ 강수량 ${w.precipitation}mm\n`;
    content += '\n';
  }

  content += '💡 외출 시 자외선 차단제와 우산을 챙기세요!\n';
  content += '\n---\n';
  content += '💬 제보 & 문의\n';
  if (SOCIAL_LINKS.kakao) content += `카카오톡: ${SOCIAL_LINKS.kakao}\n`;
  if (SOCIAL_LINKS.telegram) content += `텔레그램: ${SOCIAL_LINKS.telegram}\n`;
  if (SOCIAL_LINKS.line) content += `라인: ${SOCIAL_LINKS.line}\n`;
  if (SOCIAL_LINKS.whatsapp) content += `왓츠앱: ${SOCIAL_LINKS.whatsapp}\n`;

  return { title, content };
}

async function publishWeather() {
  console.log('=== 날씨 수집 시작 ===');

  const weatherData = [];
  for (const [city, coords] of Object.entries(CITIES)) {
    try {
      const data = await fetchWeather(city, coords);
      console.log(`[${city}] ${data.weatherDesc} ${data.temp}°C`);
      weatherData.push(data);
    } catch (err) {
      console.error(`[${city}] 수집 실패: ${err.message}`);
    }
  }

  if (weatherData.length === 0) {
    console.error('날씨 데이터 없음');
    return;
  }

  const { title, content } = buildWeatherPost(weatherData);
  const postId = `weather-${Date.now()}`;

  const { error } = await supabase
    .from('CommunityPost')
    .insert({
      id: postId,
      authorId: NEWSBOT_AUTHOR_ID,
      category: 'local_tip',
      title: title,
      content: content,
      isAnonymous: false,
      moderationStatus: 'SAFE',
      viewCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

  if (error) {
    console.error(`발행 실패: ${error.message}`);
    return;
  }

  console.log(`[발행 완료] ${title}`);
}

publishWeather().catch(err => {
  console.error('날씨 봇 실패:', err);
  process.exit(1);
});
