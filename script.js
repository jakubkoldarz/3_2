document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("tbody");
    const searchBtn = document.querySelector("#searchBtn");
    const stateInput = document.querySelector("#stateInput");
    const errorDiv = document.querySelector("#error");

    const token = `UhPZSvlDOVgpnKRuRZwAJETGaUhCiRGO`;
    const baseUrl = `https://cors-anywhere.herokuapp.com/https://www.ncei.noaa.gov/cdo-web/api/v2/stations`;

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

    function clearTable() {
        tbody.innerHTML = "";
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
    }

    function hideError() {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
    }

    function searchStations() {
        const stateCode = stateInput.value.trim().toUpperCase();

        if (!stateCode) {
            showError("Proszę wpisać kod stanu");
            return;
        }

        const fipsCode = stateFipsMap[stateCode];
        if (!fipsCode) {
            showError(`Nieprawidłowy kod stanu: ${stateCode}. Użyj dwuliterowego kodu (np. NY, CA, TX)`);
            return;
        }

        hideError();
        clearTable();

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

    searchBtn.addEventListener("click", searchStations);

    stateInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchStations();
        }
    });

    // ===== SEKCJA 2: DATASETY I WYKRES =====
    const loadDatasetsBtn = document.querySelector("#loadDatasetsBtn");
    const datasetErrorDiv = document.querySelector("#datasetError");
    const datasetTableContainer = document.querySelector("#datasetTableContainer");
    const datasetsTableBody = document.querySelector("#datasetsTable tbody");
    const chartContainer = document.querySelector("#chartContainer");
    let datasetsChart = null;

    function showDatasetError(message) {
        datasetErrorDiv.textContent = message;
        datasetErrorDiv.style.display = "block";
        datasetErrorDiv.className = "error-message";
    }

    function hideDatasetError() {
        datasetErrorDiv.textContent = "";
        datasetErrorDiv.style.display = "none";
    }

    function getDecade(dateString) {
        if (!dateString) return "Nieznana";
        const year = new Date(dateString).getFullYear();
        const decade = Math.floor(year / 10) * 10;
        return `${decade}s`;
    }

    function loadDatasets() {
        hideDatasetError();
        datasetsTableBody.innerHTML = "";

        const datasetsUrl = `https://cors-anywhere.herokuapp.com/https://www.ncei.noaa.gov/cdo-web/api/v2/datasets`;

        fetch(datasetsUrl, { headers: { token } })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Datasets:", data);

                if (!data.results || data.results.length === 0) {
                    showDatasetError("Nie znaleziono datasetów");
                    return;
                }

                const decadeCounts = {};

                data.results.forEach((dataset) => {
                    const decade = getDecade(dataset.mindate);

                    if (decade !== "Nieznana") {
                        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
                    }

                    const row = document.createElement("tr");

                    const idCell = document.createElement("td");
                    idCell.textContent = dataset.id || "N/A";

                    const nameCell = document.createElement("td");
                    nameCell.textContent = dataset.name || "N/A";

                    const mindateCell = document.createElement("td");
                    mindateCell.textContent = dataset.mindate || "N/A";

                    const maxdateCell = document.createElement("td");
                    maxdateCell.textContent = dataset.maxdate || "N/A";

                    const decadeCell = document.createElement("td");
                    decadeCell.textContent = decade;

                    row.appendChild(idCell);
                    row.appendChild(nameCell);
                    row.appendChild(mindateCell);
                    row.appendChild(maxdateCell);
                    row.appendChild(decadeCell);

                    datasetsTableBody.appendChild(row);
                });

                datasetTableContainer.style.display = "block";

                const sortedDecades = Object.keys(decadeCounts).sort();
                const counts = sortedDecades.map((decade) => decadeCounts[decade]);

                chartContainer.style.display = "block";
                createChart(sortedDecades, counts);
            })
            .catch((error) => {
                console.error("Błąd:", error);
                showDatasetError(`Błąd podczas pobierania danych: ${error.message}`);
            });
    }

    function createChart(labels, data) {
        const ctx = document.querySelector("#datasetsChart");

        if (datasetsChart) {
            datasetsChart.destroy();
        }

        datasetsChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Liczba datasetów",
                        data: data,
                        backgroundColor: "rgba(74, 144, 226, 0.8)",
                        borderColor: "rgba(74, 144, 226, 1)",
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                        },
                        title: {
                            display: true,
                            text: "Liczba datasetów",
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Dekada rozpoczęcia",
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                    },
                    title: {
                        display: true,
                        text: "Rozkład datasetów według dekady rozpoczęcia",
                        font: {
                            size: 16,
                        },
                    },
                },
            },
        });
    }

    loadDatasetsBtn.addEventListener("click", loadDatasets);

    // ===== SEKCJA 3: WYSZUKIWANIE DANYCH DLA KILKU DAT =====
    const searchDataBtn = document.querySelector("#searchDataBtn");
    const datasetIdInput = document.querySelector("#datasetIdInput");
    const locationIdInput = document.querySelector("#locationIdInput");
    const date1Input = document.querySelector("#date1Input");
    const date2Input = document.querySelector("#date2Input");
    const date3Input = document.querySelector("#date3Input");
    const dataErrorDiv = document.querySelector("#dataError");
    const dataResultContainer = document.querySelector("#dataResultContainer");
    const dataTableBody = document.querySelector("#dataTable tbody");

    // Funkcja do wyświetlenia błędu danych
    function showDataError(message) {
        dataErrorDiv.textContent = message;
        dataErrorDiv.style.display = "block";
        dataErrorDiv.className = "error-message";
    }

    // Funkcja do ukrycia błędu danych
    function hideDataError() {
        dataErrorDiv.textContent = "";
        dataErrorDiv.style.display = "none";
    }

    // Funkcja do pobierania danych dla jednej daty
    async function fetchDataForDate(datasetId, locationId, date) {
        const dataUrl = `https://cors-anywhere.herokuapp.com/https://www.ncei.noaa.gov/cdo-web/api/v2/data?datasetid=${datasetId}&locationid=${locationId}&startdate=${date}&enddate=${date}&limit=1000`;

        try {
            const response = await fetch(dataUrl, { headers: { token } });

            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error(`Błąd dla daty ${date}:`, error);
            return [];
        }
    }

    // Funkcja do wyszukiwania danych dla wszystkich dat
    async function searchData() {
        const datasetId = datasetIdInput.value.trim();
        const locationId = locationIdInput.value.trim();
        const dates = [date1Input.value, date2Input.value, date3Input.value].filter((date) => date); // Usuń puste daty

        // Walidacja
        if (!datasetId) {
            showDataError("Proszę podać Dataset ID");
            return;
        }

        if (!locationId) {
            showDataError("Proszę podać Location ID");
            return;
        }

        if (dates.length === 0) {
            showDataError("Proszę podać przynajmniej jedną datę");
            return;
        }

        hideDataError();
        dataTableBody.innerHTML = "";
        dataResultContainer.style.display = "none";

        // Pokaż komunikat ładowania
        showDataError("Pobieranie danych...");
        dataErrorDiv.style.backgroundColor = "#e3f2fd";
        dataErrorDiv.style.color = "#1976d2";
        dataErrorDiv.style.borderLeftColor = "#1976d2";

        try {
            // Pobierz dane dla wszystkich dat równolegle
            const allDataPromises = dates.map((date) => fetchDataForDate(datasetId, locationId, date));

            const allDataArrays = await Promise.all(allDataPromises);

            // Połącz wszystkie wyniki w jedną tablicę
            const allData = allDataArrays.flat();

            hideDataError();

            if (allData.length === 0) {
                showDataError("Nie znaleziono danych dla podanych parametrów");
                return;
            }

            // Sortuj dane według daty
            allData.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Wypełnij tabelę
            allData.forEach((item) => {
                const row = document.createElement("tr");

                const dateCell = document.createElement("td");
                dateCell.textContent = item.date ? new Date(item.date).toLocaleDateString("pl-PL") : "N/A";

                const datatypeCell = document.createElement("td");
                datatypeCell.textContent = item.datatype || "N/A";

                const valueCell = document.createElement("td");
                valueCell.textContent = item.value !== undefined ? item.value : "N/A";

                row.appendChild(dateCell);
                row.appendChild(datatypeCell);
                row.appendChild(valueCell);

                dataTableBody.appendChild(row);
            });

            // Pokaż tabelę
            dataResultContainer.style.display = "block";
        } catch (error) {
            console.error("Błąd:", error);
            showDataError(`Błąd podczas pobierania danych: ${error.message}`);
        }
    }

    // Obsługa przycisku wyszukiwania danych
    searchDataBtn.addEventListener("click", searchData);
});
