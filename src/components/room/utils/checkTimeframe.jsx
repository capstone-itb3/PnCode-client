export default function checkTimeframe(open_time, close_time) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
  
    const [openHours, openMinutes] = open_time.split(':').map(Number);
    const [closeHours, closeMinutes] = close_time.split(':').map(Number);
  
    const openTimeMinutes = openHours * 60 + openMinutes;
    const closeTimeMinutes = closeHours * 60 + closeMinutes;
  
    return currentTime >= openTimeMinutes && currentTime <= closeTimeMinutes;
}