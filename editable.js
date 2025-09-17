// Adds double-click editing for descriptions and updates insomnia.json in memory
(function () {
    function loadJson() {
        if (!window.INSOMNIA_URL) return Promise.resolve(null);
        return fetch(window.INSOMNIA_URL).then(function (r) { return r.json(); });
    }

    function updateJson(oldText, newText) {
        if (!window.__insomniaData) return;
        var changed = false;
        var resources = window.__insomniaData.resources || [];
        for (var i = 0; i < resources.length; i++) {
            if (resources[i].description === oldText) {
                resources[i].description = newText;
                changed = true;
                break;
            }
        }
        if (changed) {
            localStorage.setItem('insomniaDocEdited', JSON.stringify(window.__insomniaData));
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadJson().then(function (data) {
            window.__insomniaData = data;
        });

        // Create download button in the top-right corner
        var downloadBtn = document.createElement('button');
        downloadBtn.id = 'download-json-btn';
        downloadBtn.textContent = 'Download JSON';
        downloadBtn.style.position = 'fixed';
        downloadBtn.style.top = '10px';
        downloadBtn.style.right = '10px';
        downloadBtn.style.zIndex = 1000;
        document.body.appendChild(downloadBtn);

        downloadBtn.addEventListener('click', function () {
            var data = localStorage.getItem('insomniaDocEdited') || JSON.stringify(window.__insomniaData || {});
            var blob = new Blob([data], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'insomnia.json';
            a.click();
            URL.revokeObjectURL(url);
        });

        document.body.addEventListener('dblclick', function (ev) {
            var el = ev.target.closest('.description');
            if (!el) return;
            el.setAttribute('contenteditable', 'true');
            el.focus();
            var original = el.innerText;
            function finish() {
                el.removeEventListener('blur', finish);
                el.setAttribute('contenteditable', 'false');
                var newText = el.innerText;
                if (newText !== original) {
                    updateJson(original, newText);
                }
            }
            el.addEventListener('blur', finish);
        });
    });
})();