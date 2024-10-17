async function updateEventFile() {
    const eventFileUrl = `https://raw.githubusercontent.com/valentinhere1/OverMaster/main/event_file.json`;
  
    try {
      const response = await fetch(eventFileUrl);
      if (response.ok) {
        const eventData = await response.json();
        // Asigna el contenido actualizado del event_file a donde lo necesites
        console.log("Event file actualizado:", eventData);
  
        // Aquí puedes hacer lo que necesites con los datos del event_file
        // Por ejemplo, almacenarlos en localStorage o actualizar la interfaz
        localStorage.setItem('eventData', JSON.stringify(eventData));
        
        alert("Archivo de eventos actualizado.");
      } else {
        console.error("Error al descargar el event_file:", response.statusText);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  }
  
  // Llama a esta función cuando se inicie el launcher
  document.addEventListener("DOMContentLoaded", updateEventFile);
  

  async function checkForLauncherUpdates() {
    const repoUrl = "https://api.github.com/repos/valentinhere1/OverMaster/commits?sha=main";
    
    try {
      const response = await fetch(repoUrl);
      if (response.ok) {
        const commits = await response.json();
        const latestCommitHash = commits[0].sha;
  
        const lastLauncherVersion = localStorage.getItem('lastLauncherVersion');
        
        if (lastLauncherVersion !== latestCommitHash) {
          alert("Hay una nueva versión del launcher disponible. Actualiza para obtener las últimas correcciones.");
          localStorage.setItem('lastLauncherVersion', latestCommitHash);
        }
      } else {
        console.error("Error al verificar actualizaciones del launcher:", response.statusText);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  }
  
  // Llama a esta función también cuando se inicie el launcher
  document.addEventListener("DOMContentLoaded", checkForLauncherUpdates);
  