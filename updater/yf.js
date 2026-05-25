const YahooFinance = require('yahoo-finance2').default;

async function getPriceVolumes(dateStart, dateEnd, _accessToken) {
  // targetDate 형식: 'YYYY-MM-DD'
  const symbol = '005930.KS'; // 삼성전자 티커
  
  // 특정일의 데이터를 포함하기 위해 종료일은 다음날로 설정하는 것이 안전합니다.
  // const startDate = new Date(targetDate);
  // const endDate = new Date(startDate);
  // endDate.setDate(startDate.getDate() + 1);

  try {
    const queryOptions = { 
      period1: dateStart, // startDate.toISOString().split('T')[0], 
      period2: dateEnd, // endDate.toISOString().split('T')[0],
      interval: '1d' // 일봉 기준
    };
    
    const yahooFinance = new YahooFinance();
    const result = (await yahooFinance.chart(symbol, queryOptions)).quotes;
    console.log(result);

    if (!result.length) return {};
    result.sort((a, b) => a.date - b.date);
    const data = result[0]; // 해당 날짜의 데이터
    const keyname = data.date.toISOString().split('T')[0];
    return {
      [keyname]: {
        price: data.close,
        volume: data.volume,
      }
    };
  } catch (error) {
    console.error(error);
    return {};
  }
}

module.exports = {
  getPriceVolumes,
};

if (require.main === module) {
  // 실행 예시: 2024년 3월 25일 데이터 조회
  getSamsungData('2026-03-31');
}

