// Keeps Render free instance awake by pinging every 14 minutes
setInterval(() => {
  fetch('https://cinemax-api-2maf.onrender.com/api/genres')
    .catch(() => {});
}, 14 * 60 * 1000);
