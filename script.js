let immobilienDaten = []; // Speichert die Daten aus der JSON-Datei

// --------------------------------------------------------------------------
// 1. DATEN LADEN beim Start
// --------------------------------------------------------------------------
async function ladeImmobilien() {
    try {
        // Fetch-Aufruf, der die JSON-Datei liest
        const response = await fetch('immobilien.json');

        // Überprüfung auf HTTP-Fehler (z.B. 404 Not Found)
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }

        immobilienDaten = await response.json();

        // Beim Laden alle Immobilien anzeigen (mit leeren Filtern)
        immobilienFiltern();

    } catch (error) {
        console.error("Fehler beim Laden der Immobilien-Daten:", error);
        // Anzeige eines deutlichen Fehlers auf der Seite
        document.getElementById('ergebnisse-container').innerHTML =
            '<div class="col-12"><p class="alert alert-danger mt-3">Fehler: Die Datei immobilien.json konnte nicht geladen werden oder ist fehlerhaft. (Prüfen Sie den Dateipfad und den lokalen Server.)</p></div>';
    }
}

// --------------------------------------------------------------------------
// 2. FILTERN UND ANZEIGEN
// --------------------------------------------------------------------------
function immobilienFiltern() {
    // Werte der Filterelemente abrufen
    const stadtFilter = document.getElementById('stadt-filter').value;
    // || 0 sorgt dafür, dass bei leerem Feld der Wert 0 statt NaN genommen wird
    const minZimmer = parseInt(document.getElementById('zimmer-filter').value) || 0;
    // || Infinity sorgt dafür, dass bei leerem Feld kein Preislimit existiert
    const maxPreis = parseInt(document.getElementById('max-preis-filter').value) || Infinity;

    // Daten filtern
    const gefilterteDaten = immobilienDaten.filter(immobilie => {

        // Filter 1: Stadt ("" bedeutet "Alle Städte")
        const stadtPasst = stadtFilter === "" || immobilie.stadt === stadtFilter;

        // Filter 2: Mindest-Zimmer (>= dem eingegebenen Wert)
        const zimmerPasst = immobilie.zimmer >= minZimmer;

        // Filter 3: Maximal-Preis (<= dem eingegebenen Wert)
        const preisPasst = immobilie.kaufpreis <= maxPreis;

        // Alle Bedingungen müssen erfüllt sein (AND-Verknüpfung)
        return stadtPasst && zimmerPasst && preisPasst;
    });

    // Ergebnisse anzeigen
    zeigeErgebnisse(gefilterteDaten);
}


// --------------------------------------------------------------------------
// 3. HTML FÜR ERGEBNISSE ERSTELLEN (mit Bootstrap Card Struktur)
// --------------------------------------------------------------------------
function zeigeErgebnisse(daten) {
    const container = document.getElementById('ergebnisse-container');
    container.innerHTML = ''; // Alten Inhalt leeren

    // Anzahl der gefundenen Objekte aktualisieren
    document.getElementById('anzahl-ergebnisse').textContent = daten.length;

    if (daten.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="alert alert-warning mt-3">Leider keine Immobilien gefunden, die den Kriterien entsprechen.</p></div>';
        return;
    }

    daten.forEach(immobilie => {
        // 💥 WICHTIG: Erstellen Sie einen Grid-Wrapper (col) für jede Karte 
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-4 mb-4'; // Eine Karte nimmt 4 von 12 Bootstrap-Spalten ein

        // Erstellen Sie die Bootstrap Card
        const karte = document.createElement('div');
        karte.className = 'card h-100 shadow-sm'; // h-100 sorgt für gleiche Höhe

        // Preis in deutsches Format formatieren (ohne Dezimalstellen)
        const formatierterPreis = immobilie.kaufpreis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });

        karte.innerHTML = `
            <img src="${immobilie.bild_url}" class="card-img-top" alt="Bild von ${immobilie.titel}" 
                 style="height: 200px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title text-primary">${immobilie.titel}</h5>
                <p class="card-text mb-1">
                    <span class="fw-bold fs-5">${formatierterPreis}</span>
                </p>
                <ul class="list-unstyled small text-muted">
                    <li><i class="bi bi-geo-alt-fill"></i> ${immobilie.stadt}</li>
                    <li><i class="bi bi-key-fill"></i> ${immobilie.zimmer} Zimmer</li>
                    <li><i class="bi bi-aspect-ratio"></i> ${immobilie.groesse_qm} m²</li>
                </ul>
            </div>
            <div class="card-footer bg-light">
                <p class="card-text small m-0 text-truncate">${immobilie.key_facts.join(' | ')}</p>
            </div>
        `;

        colDiv.appendChild(karte);
        container.appendChild(colDiv);
    });
}

// --------------------------------------------------------------------------
// SEITENSTART
// --------------------------------------------------------------------------
// Startet den Prozess, sobald das Skript geladen ist
document.addEventListener('DOMContentLoaded', ladeImmobilien);