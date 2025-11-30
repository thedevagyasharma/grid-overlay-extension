const toggleButton = document.getElementById('toggleGrid');
const status = document.getElementById('status');

chrome.storage.local.get(['gridEnabled'], (result) => {
  updateButton(result.gridEnabled || false);
});

toggleButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleGrid' }, (response) => {
      if (chrome.runtime.lastError) {
        status.textContent = 'Please refresh the page first';
        status.style.color = '#dc3545';
        return;
      }
      updateButton(response.enabled);
      status.textContent = response.enabled ? 'Grid enabled' : 'Grid disabled';
      status.style.color = response.enabled ? '#28a745' : '#888';
      
      setTimeout(() => {
        status.textContent = 'Ready';
        status.style.color = '#888';
      }, 2000);
    });
  });
});

function updateButton(enabled) {
  if (enabled) {
    toggleButton.textContent = 'Disable Grid';
    toggleButton.classList.add('active');
  } else {
    toggleButton.textContent = 'Enable Grid';
    toggleButton.classList.remove('active');
  }
}
