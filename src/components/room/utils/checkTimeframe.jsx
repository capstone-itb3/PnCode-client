export default async function checkTimeframe(open_time, close_time) {
    try {
        const response = await fetch('https://timeapi.io/api/time/current/zone?timeZone=Asia%2FManila', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        const phtTime = new Date(data.dateTime);
        const currentTime = phtTime.getHours() * 60 + phtTime.getMinutes();

        const [openHours, openMinutes] = open_time.split(':').map(Number);
        const [closeHours, closeMinutes] = close_time.split(':').map(Number);

        const openTimeMinutes = openHours * 60 + openMinutes;
        const closeTimeMinutes = closeHours * 60 + closeMinutes;
      
        return currentTime >= openTimeMinutes && currentTime <= closeTimeMinutes;    
    } catch (error) {
        console.error('Failed to fetch server time:', error);
    }
}