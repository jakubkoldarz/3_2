document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("tbody");
    const searchBtn = document.querySelector("#searchBtn");
    const stateInput = document.querySelector("#stateInput");
    const errorDiv = document.querySelector("#error");

    const token = `UhPZSvlDOVgpnKRuRZwAJETGaUhCiRGO`;
    const baseUrl = `https://cors-anywhere.herokuapp.com/https://www.ncei.noaa.gov/cdo-web/api/v2/stations`;

    // Mapowanie kodów stanów na kody FIPS
    const stateFipsMap = {
        AL: "01",
        AK: "02",
        AZ: "04",
        AR: "05",
        CA: "06",
        CO: "08",
        CT: "09",
        DE: "10",
        FL: "12",
        GA: "13",
        HI: "15",
        ID: "16",
        IL: "17",
        IN: "18",
        IA: "19",
        KS: "20",
        KY: "21",
        LA: "22",
        ME: "23",
        MD: "24",
        MA: "25",
        MI: "26",
        MN: "27",
        MS: "28",
        MO: "29",
        MT: "30",
        NE: "31",
        NV: "32",
        NH: "33",
        NJ: "34",
        NM: "35",
        NY: "36",
        NC: "37",
        ND: "38",
        OH: "39",
        OK: "40",
        OR: "41",
        PA: "42",
        RI: "44",
        SC: "45",
        SD: "46",
        TN: "47",
        TX: "48",
        UT: "49",
        VT: "50",
        VA: "51",
        WA: "53",
        WV: "54",
        WI: "55",
        WY: "56",
    };

    // Funkcja do wyczyszczenia tabeli
    function clearTable() {
        tbody.innerHTML = "";
    }

    // Funkcja do wyświetlenia błędu
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
    }

    // Funkcja do ukrycia błędu
    function hideError() {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
    }

    // Funkcja do pobierania i filtrowania stacji
    function searchStations() {
        const stateCode = stateInput.value.trim().toUpperCase();

        if (!stateCode) {
            showError("Proszę wpisać kod stanu");
            return;
        }

        // Sprawdź czy kod stanu jest poprawny
        const fipsCode = stateFipsMap[stateCode];
        if (!fipsCode) {
            showError(`Nieprawidłowy kod stanu: ${stateCode}. Użyj dwuliterowego kodu (np. NY, CA, TX)`);
            return;
        }

        hideError();
        clearTable();

        // Użyj parametru locationid z kodem FIPS
        const url = `${baseUrl}?locationid=FIPS:${fipsCode}&limit=1000`;

        fetch(url, { headers: { token } })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log(data);

                if (!data.results || data.results.length === 0) {
                    showError(`Nie znaleziono stacji dla stanu: ${stateCode}`);
                    return;
                }

                // Wyświetl stacje
                data.results.forEach((station) => {
                    const row = document.createElement("tr");

                    const idCell = document.createElement("td");
                    idCell.textContent = station.id || "N/A";

                    const nameCell = document.createElement("td");
                    nameCell.textContent = station.name || "N/A";

                    const stateCell = document.createElement("td");
                    stateCell.textContent = stateCode;

                    row.appendChild(idCell);
                    row.appendChild(nameCell);
                    row.appendChild(stateCell);

                    tbody.appendChild(row);
                });
            })
            .catch((error) => {
                console.error("Błąd:", error);
                showError(`Błąd podczas pobierania danych: ${error.message}`);
            });
    }

    // Obsługa kliknięcia przycisku
    searchBtn.addEventListener("click", searchStations);

    // Obsługa naciśnięcia Enter w polu tekstowym
    stateInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchStations();
        }
    });
});
